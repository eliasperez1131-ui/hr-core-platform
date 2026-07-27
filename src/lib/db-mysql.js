/**
 * ============================================================
 *  HR CORE · Cliente MySQL (reemplaza supabase-admin.js)
 * ============================================================
 *  Conexión pool a MySQL local con mysql2/promise.
 *  Lee credenciales de process.env (definidas en .env.production).
 * ============================================================
 */

import mysql from 'mysql2/promise';

let _pool = null;

function getConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    // Parsear mysql://user:pass@host:port/db
    const m = url.match(/^mysql:\/\/([^:]+):([^@]*)@([^:/]+):(\d+)\/(.+)$/);
    if (m) {
      return {
        user:     m[1],
        password: m[2],
        host:     m[3],
        port:     Number(m[4]),
        database: m[5],
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit:       0,
        charset:          'utf8mb4',
      };
    }
  }
  // Fallback con variables individuales
  return {
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'hrcore_db',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    charset:            'utf8mb4',
  };
}

export async function getPool() {
  if (!_pool) {
    const cfg = getConfig();
    _pool = mysql.createPool(cfg);
    console.log(`[db-mysql] Pool creado: ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database}`);
  }
  return _pool;
}

export async function query(sql, params = []) {
  const pool = await getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function insert(table, data) {
  const keys = Object.keys(data);
  const cols = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map((k) => data[k]);
  const sql = `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`;
  const pool = await getPool();
  const [result] = await pool.execute(sql, values);
  return result.insertId;
}

export async function update(table, data, whereClause, whereParams = []) {
  const keys = Object.keys(data);
  const sets = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => data[k]);
  const sql = `UPDATE ${table} SET ${sets} WHERE ${whereClause}`;
  const allParams = [...values, ...whereParams];
  const pool = await getPool();
  const [result] = await pool.execute(sql, allParams);
  return result.affectedRows;
}

export async function closePool() {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
