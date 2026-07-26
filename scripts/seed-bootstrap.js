#!/usr/bin/env node
/**
 * scripts/seed-bootstrap.js
 * ============================================================
 *  HR CORE · Seed de Bootstrap (MySQL)
 * ============================================================
 *  Crea el usuario Super Admin raiz si no existe.
 *  Este admin puede luego crear empresas y coordinadores.
 *
 *  EJECUTAR UNA SOLA VEZ en el VPS:
 *    cd /var/www/html
 *    node scripts/seed-bootstrap.js
 *
 *  CREDENCIALES INICIALES (cambia después del primer login):
 *    Email:     admin@hrcore.com.mx
 *    Password:  318088330
 *    Rol:       Super_Admin
 *
 *  Si el admin ya existe, el script NO sobreescribe (es idempotente).
 * ============================================================
 */

const path = require('path');
const fs = require('fs');

// Cargar .env.production manualmente (ya que PM2 no inyecta al ejecutar node)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.production');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/i);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
}
loadEnv();

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DEFAULT_DB_CONFIG = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD || '123456',
  database: 'hrcore_db',
  multipleStatements: true,
};

const SUPER_ADMIN = {
  id:           '00000000-0000-0000-0000-000000000001',  // UUID fijo
  email:        'admin@hrcore.com.mx',
  password:     '318088330',
  nombre:       'Super Administrador HR CORE',
  rol:          'Super_Admin',
  workspace_id: null,  // NULL porque es global
};

const LOGO = `
╔════════════════════════════════════════════╗
║  HR CORE · Seed de Bootstrap (MySQL)        ║
╚════════════════════════════════════════════╝`;

async function main() {
  console.log(LOGO);
  console.log('');

  // 1. Verificar que mysql2 está disponible
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch (err) {
    console.error('✗ Falta mysql2. Ejecuta: npm install mysql2');
    process.exit(1);
  }
  let bcryptLib;
  try {
    bcryptLib = require('bcryptjs');
  } catch (err) {
    console.error('✗ Falta bcryptjs. Ejecuta: npm install bcryptjs');
    process.exit(1);
  }

  // 2. Conectar a MySQL
  const config = { ...DEFAULT_DB_CONFIG };
  if (process.env.DATABASE_URL) {
    // Parsear DATABASE_URL si está presente
    const url = new URL(process.env.DATABASE_URL);
    config.host = url.hostname || config.host;
    config.port = Number(url.port) || config.port;
    config.user = url.username || config.user;
    config.password = url.password || config.password;
    config.database = (url.pathname || '/').slice(1) || config.database;
  }

  console.log('Conectando a MySQL...');
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('  ✓ Conectado a', `${config.host}:${config.port}/${config.database}`);
  } catch (err) {
    console.error('  ✗ Error de conexión:', err.message);
    console.error('  Verifica que MySQL está corriendo y las credenciales son correctas');
    process.exit(1);
  }

  // 3. Verificar si existe la BD
  console.log('');
  console.log('Verificando esquema...');

  // Verificar que la tabla user_profiles existe
  let tablaExiste = false;
  try {
    const [rows] = await conn.query(`
      SELECT COUNT(*) AS cnt
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name = 'user_profiles'
    `, [config.database]);
    tablaExiste = rows[0].cnt > 0;
  } catch (err) {
    console.error('  ✗ Error al verificar tabla:', err.message);
  }

  if (!tablaExiste) {
    console.log('  ⚠ La tabla user_profiles NO existe. Creando esquema mínimo...');
    await crearEsquemaMinimo(conn);
    console.log('  ✓ Esquema mínimo creado');
  } else {
    console.log('  ✓ Tabla user_profits existe');
  }

  // 4. Verificar si el admin ya existe
  console.log('');
  console.log('Verificando si el Super Admin ya existe...');
  const [existing] = await conn.query(
    'SELECT id, email, rol, nombre_completo FROM user_profiles WHERE email = ? OR id = ?',
    [SUPER_ADMIN.email, SUPER_ADMIN.id]
  );

  if (existing.length > 0) {
    console.log('  ℹ Ya existe un Super Admin:');
    console.log(`     - ID: ${existing[0].id}`);
    console.log(`     - Email: ${existing[0].email}`);
    console.log(`     - Nombre: ${existing[0].nombre_completo}`);
    console.log('');
    console.log('  El seed es idempotente: NO sobreescribe.');
    await conn.end();
    return;
  }

  // 5. Hashear password
  console.log('Hasheando password...');
  const passwordHash = await bcryptLib.hash(SUPER_ADMIN.password, 12);
  console.log('  ✓ Password hasheado con bcrypt (cost 12)');

  // 6. Insertar admin
  console.log('');
  console.log('Insertando Super Admin en user_profiles...');
  try {
    await conn.query(
      `INSERT INTO user_profiles
         (id, email, password_hash, nombre_completo, rol, workspace_id, activo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NULL, 1, NOW(), NOW())`,
      [SUPER_ADMIN.id, SUPER_ADMIN.email, passwordHash, SUPER_ADMIN.nombre, SUPER_ADMIN.rol]
    );
    console.log('  ✓ Super Admin creado');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('  ⚠ Email o ID ya existe (otra entrada). Saltando.');
    } else {
      throw err;
    }
  }

  // 7. Resumen
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  ✓ BOOTSTRAP COMPLETADO                    ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log('  Credenciales del Super Admin:');
  console.log('  ─────────────────────────────────────────');
  console.log('   Email:     ' + SUPER_ADMIN.email);
  console.log('   Password:  ' + SUPER_ADMIN.password);
  console.log('   Rol:       ' + SUPER_ADMIN.rol);
  console.log('   ID:        ' + SUPER_ADMIN.id);
  console.log('');
  console.log('  IMPORTANTE:');
  console.log('   1. Cambia la password después del primer login');
  console.log('   2. Ve a https://hrcore.com.mx/login');
  console.log('   3. Login con estas credenciales');
  console.log('   4. Crea tu primera empresa y su coordinador');
  console.log('');

  await conn.end();
}

async function crearEsquemaMinimo(conn) {
  // Tabla workspaces
  await conn.query(`
    CREATE TABLE IF NOT EXISTS workspaces_empresas (
      id            CHAR(36) PRIMARY KEY,
      nombre_empresa VARCHAR(200) NOT NULL,
      giro_industrial VARCHAR(50) DEFAULT 'Otro',
      plan_activo     VARCHAR(20) DEFAULT 'Trial',
      activo          TINYINT(1) DEFAULT 1,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Tabla user_profiles
  await conn.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id              CHAR(36) PRIMARY KEY,
      email           VARCHAR(150) UNIQUE NOT NULL,
      password_hash   VARCHAR(255) NOT NULL,
      nombre_completo VARCHAR(150),
      rol             VARCHAR(30) NOT NULL,
      workspace_id    CHAR(36) NULL,
      activo          TINYINT(1) DEFAULT 1,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces_empresas(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Tabla candidatos
  await conn.query(`
    CREATE TABLE IF NOT EXISTS candidatos (
      id            CHAR(36) PRIMARY KEY,
      nombre_completo VARCHAR(200) NOT NULL,
      correo         VARCHAR(150) UNIQUE,
      telefono       VARCHAR(20) UNIQUE,
      edad           INT,
      escolaridad    VARCHAR(100),
      estado         VARCHAR(50),
      municipio      VARCHAR(100),
      url_cv_pdf     TEXT,
      workspace_id   CHAR(36) NULL,
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Tabla vacantes
  await conn.query(`
    CREATE TABLE IF NOT EXISTS vacantes (
      id           CHAR(36) PRIMARY KEY,
      titulo_puesto VARCHAR(150) NOT NULL,
      descripcion  TEXT,
      workspace_id CHAR(36) NULL,
      estatus      VARCHAR(20) DEFAULT 'Abierta',
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Tabla facturas
  await conn.query(`
    CREATE TABLE IF NOT EXISTS facturas (
      id           CHAR(36) PRIMARY KEY,
      workspace_id CHAR(36) NULL,
      vacante_id   CHAR(36) NULL,
      monto        DECIMAL(12,2) NOT NULL,
      moneda       VARCHAR(3) DEFAULT 'MXN',
      metodo_pago  VARCHAR(20) NULL,
      estatus      VARCHAR(20) DEFAULT 'Pendiente',
      descripcion  TEXT,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

main().catch((err) => {
  console.error('✗ Error fatal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
