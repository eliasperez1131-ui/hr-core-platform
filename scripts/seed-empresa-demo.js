#!/usr/bin/env node
/**
 * scripts/seed-empresa-demo.js
 * ============================================================
 *  Crea una empresa de prueba + su coordinador.
 *  Para usar después de seed-bootstrap.js.
 *
 *  CREDENCIALES QUE CREA:
 *    Empresa:    "Grupo Seguridad del Norte S.A. de C.V."
 *    Email coord: coordinador@gruposeguridad.mx
 *    Password:   12345678
 *    Rol:        Administrador_Agencia
 * ============================================================
 */

const path = require('path');
const fs = require('fs');

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
const crypto = require('crypto');

const EMPRESA_DEMO = {
  id:         crypto.randomUUID(),
  nombre:     'Grupo Seguridad del Norte S.A. de C.V.',
  giro:       'Seguridad_Privada',
  plan:       'Professional',
};

const COORDINADOR_DEMO = {
  id:        crypto.randomUUID(),
  email:     'coordinador@gruposeguridad.mx',
  password:  '12345678',
  nombre:    'María José Hernández',
  rol:       'Administrador_Agencia',
};

async function main() {
  console.log('\n  HR CORE · Crear empresa demo + coordinador\n');

  const mysqlLib = require('mysql2/promise');
  const bcryptLib = require('bcryptjs');
  const conn = await mysqlLib.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'hrcore_db',
  });

  // Verificar que existe el Super Admin
  const [admins] = await conn.query(
    `SELECT id FROM user_profiles WHERE rol = 'Super_Admin' LIMIT 1`
  );
  if (admins.length === 0) {
    console.error('  ✗ No hay Super Admin. Ejecuta primero seed-bootstrap.js');
    process.exit(1);
  }

  // Verificar si la empresa ya existe
  const [existing] = await conn.query(
    `SELECT id FROM workspaces_empresas WHERE nombre_empresa = ?`,
    [EMPRESA_DEMO.nombre]
  );

  let workspaceId;
  if (existing.length > 0) {
    console.log(`  ℹ Empresa "${EMPRESA_DEMO.nombre}" ya existe`);
    workspaceId = existing[0].id;
  } else {
    console.log(`  → Creando empresa "${EMPRESA_DEMO.nombre}"...`);
    await conn.query(
      `INSERT INTO workspaces_empresas (id, nombre_empresa, giro_industrial, plan_activo, activo)
       VALUES (?, ?, ?, ?, 1)`,
      [EMPRESA_DEMO.id, EMPRESA_DEMO.nombre, EMPRESA_DEMO.giro, EMPRESA_DEMO.plan]
    );
    workspaceId = EMPRESA_DEMO.id;
    console.log('  ✓ Empresa creada');
  }

  // Verificar si el coordinador ya existe
  const [existingCoord] = await conn.query(
    `SELECT id FROM user_profiles WHERE email = ?`,
    [COORDINADOR_DEMO.email]
  );

  if (existingCoord.length > 0) {
    console.log(`  ℹ Coordinador ${COORDINADOR_DEMO.email} ya existe`);
  } else {
    console.log(`  → Hasheando password del coordinador...`);
    const passwordHash = await bcryptLib.hash(COORDINADOR_DEMO.password, 12);

    console.log(`  → Creando coordinador ${COORDINADOR_DEMO.email}...`);
    await conn.query(
      `INSERT INTO user_profiles (id, email, password_hash, nombre_completo, rol, workspace_id, activo)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [COORDINADOR_DEMO.id, COORDINADOR_DEMO.email, passwordHash, COORDINADOR_DEMO.nombre, COORDINADOR_DEMO.rol, workspaceId]
    );
    console.log('  ✓ Coordinador creado');
  }

  console.log('');
  console.log('  ╔═══════════════════════════════════════╗');
  console.log('  ║  ✓ EMPRESA DEMO LISTA                ║');
  console.log('  ╚═══════════════════════════════════════╝');
  console.log('');
  console.log('  Empresa:    ' + EMPRESA_DEMO.nombre);
  console.log('  ID:         ' + workspaceId);
  console.log('');
  console.log('  Coordinador:');
  console.log('  ─ Email:    ' + COORDINADOR_DEMO.email);
  console.log('  ─ Password: ' + COORDINADOR_DEMO.password);
  console.log('  ─ Rol:      ' + COORDINADOR_DEMO.rol);
  console.log('  ─ ID:       ' + COORDINADOR_DEMO.id);
  console.log('');

  await conn.end();
}

main().catch((err) => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});
