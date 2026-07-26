/**
 * check-supabase.js · HR CORE
 *
 * Verifica la conexión a Supabase y si las tablas existen.
 * Sirve para diagnosticar el deploy sin tener que esperar a Vercel.
 *
 * USO:
 *   node scripts/check-supabase.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY;

(async () => {
  console.log('\n\x1b[36m%s\x1b[0m', '→ Verificando configuración...');
  console.log('  NEXT_PUBLIC_SUPABASE_URL:    ', URL ? '\x1b[32m' + URL + '\x1b[0m' : '\x1b[31mNO\x1b[0m');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY: ', ANON ? '\x1b[32mconfigurada\x1b[0m' : '\x1b[31mNO\x1b[0m');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:     ', SVC  ? '\x1b[32mconfigurada\x1b[0m' : '\x1b[31mNO\x1b[0m');

  if (!URL || !ANON) {
    console.log('\n\x1b[31m%s\x1b[0m', '✗ Faltan variables de entorno. Revisa .env.local');
    process.exit(1);
  }

  // Usar service_role si está, sino anon
  const supabase = createClient(URL, SVC || ANON, {
    auth: { persistSession: false },
  });

  console.log('\n\x1b[36m%s\x1b[0m', '→ Conectando a Supabase...');
  const { error } = await supabase.from('candidatos').select('id', { count: 'exact', head: true });
  if (error) {
    console.log('\x1b[31m%s\x1b[0m', `  ✗ Error: ${error.message}`);
    console.log('  Posibles causas:');
    console.log('  - Las tablas no se han creado (ejecuta npm run db:migrate)');
    console.log('  - SUPABASE_URL está mal escrita');
    console.log('  - Las claves API no son válidas');
    process.exit(1);
  }
  console.log('  \x1b[32m✓\x1b[0m Conexión OK.');

  // Verificar tablas críticas
  const tablas = ['user_profiles', 'workspaces_empresas', 'candidatos', 'vacantes', 'facturas'];
  console.log('\n\x1b[36m%s\x1b[0m', '→ Verificando tablas críticas:');
  for (const t of tablas) {
    const { error: e, count } = await supabase.from(t).select('id', { count: 'exact', head: true });
    if (e) {
      console.log(`  \x1b[31m✗\x1b[0m ${t.padEnd(25)} no existe`);
    } else {
      console.log(`  \x1b[32m✓\x1b[0m ${t.padEnd(25)} OK (${count ?? 0} filas)`);
    }
  }

  // Verificar usuario admin
  console.log('\n\x1b[36m%s\x1b[0m', '→ Verificando Super Admin:');
  const { data: admins } = await supabase
    .from('user_profiles')
    .select('id, nombre_completo, activo')
    .eq('rol', 'Super_Admin')
    .limit(5);
  if (!admins || admins.length === 0) {
    console.log('  \x1b[33m⚠\x1b[0m No hay Super Admin. Ejecuta: npm run seed');
  } else {
    admins.forEach((a) => {
      console.log(`  \x1b[32m✓\x1b[0m ${a.nombre_completo} (${a.activo ? 'activo' : 'INACTIVO'})`);
    });
  }

  console.log('\n\x1b[32m%s\x1b[0m', '✅ Todo listo para producción.\n');
})();