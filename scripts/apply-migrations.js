/**
 * ============================================================
 *  apply-migrations.js · HR CORE
 * ============================================================
 *
 *  Aplica TODAS las migraciones SQL al proyecto de Supabase
 *  de producción con un solo comando.
 *
 *  USO:
 *    1. Asegúrate de tener SUPABASE_DB_URL en tu .env.local
 *       (Settings → Database → Connection string → "Direct connection")
 *    2. node scripts/apply-migrations.js
 *
 *  Idempotente: ejecuta los CREATE TABLE / CREATE POLICY con
 *  IF NOT EXISTS, así que puedes correrlo varias veces sin miedo.
 * ============================================================
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const DB_URL = process.env.SUPABASE_DB_URL;
if (!DB_URL) {
  console.error('\x1b[31m%s\x1b[0m', '✗ Falta SUPABASE_DB_URL en .env.local');
  console.log('  Obtenerlo: Supabase Dashboard → Project Settings → Database');
  console.log('  → Connection string → "Direct connection" (puerto 5432)');
  console.log('  → Cópialo a .env.local:');
  console.log('    SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres');
  process.exit(1);
}

const SQL_DIR = path.join(__dirname, '..', 'sql');

async function run() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  console.log('\n\x1b[36m%s\x1b[0m', '→ Conectando a Supabase...');
  try {
    await client.connect();
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', `✗ No se pudo conectar: ${err.message}`);
    process.exit(1);
  }
  console.log('  \x1b[32m✓\x1b[0m Conectado.');

  const files = fs.readdirSync(SQL_DIR)
    .filter((f) => /^\d+.*\.sql$/.test(f))
    .sort();

  console.log(`\n\x1b[36m%s\x1b[0m`, `→ Aplicando ${files.length} archivos SQL en orden...`);

  let ok = 0, fail = 0;
  for (const f of files) {
    const full = path.join(SQL_DIR, f);
    const sql = fs.readFileSync(full, 'utf8');
    process.stdout.write(`  ${f} ... `);
    try {
      // Strip BOM
      const clean = sql.replace(/^\uFEFF/, '');
      await client.query(clean);
      console.log('\x1b[32m✓\x1b[0m');
      ok++;
    } catch (err) {
      console.log('\x1b[31m✗\x1b[0m');
      console.error('    \x1b[31m%s\x1b[0m', `Error: ${err.message}`);
      fail++;
    }
  }

  await client.end();

  console.log('\n\x1b[36m%s\x1b[0m', '═'.repeat(60));
  if (fail === 0) {
    console.log('\x1b[32m%s\x1b[0m', `✅ ${ok} archivos aplicados correctamente.`);
    console.log('\n  Siguiente paso:');
    console.log('  1. Ve a https://app.supabase.com → SQL Editor');
    console.log('  2. Ejecuta: SELECT id FROM user_profiles;');
    console.log('  3. Si los queries pasan, las migraciones están aplicadas.');
    console.log('  4. Tu próximo deploy en Vercel debería funcionar.\n');
  } else {
    console.log('\x1b[31m%s\x1b[0m', `✗ ${fail} archivos fallaron.`);
    console.log('  Revisa los errores arriba y vuélvelos a correr después de fix.\n');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('\x1b[31m%s\x1b[0m', `✗ Error fatal: ${err.message}`);
  process.exit(1);
});