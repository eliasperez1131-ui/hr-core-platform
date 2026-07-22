/**
 * Script de Inicialización — HR CORE
 *
 * Crea el usuario Super_Admin semilla con las credenciales oficiales.
 *
 * Uso:
 *   npm run seed
 *
 * Variables de entorno requeridas:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Es idempotente:
 *   - Si el usuario ya existe en auth.users, solo actualiza su
 *     rol, contraseña y metadata.
 *   - Si no existe, lo crea con email confirmado automáticamente.
 *
 * Credenciales semilla (HR CORE v1):
 *   Usuario (login):  ADMIN  (se transforma a admin@hrcore.com)
 *   Correo real:      admin@hrcore.com
 *   Contraseña:       318088330
 *   Rol:              Super_Admin
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const SEED = {
  email:     'admin@hrcore.com',
  password:  '318088330',
  fullName:  'Super Administrador HR CORE',
  rol:       'Super_Admin',
};

function log(tag, msg, color = '36') {
  const reset = '\x1b[0m';
  const c     = (text) => `\x1b[${color}m${text}${reset}`;
  console.log(`${c(`[${tag}]`)} ${msg}`);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    log('seed', '❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local', '31');
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  log('seed', `URL: ${url}`, '90');
  log('seed', `Creando/verificando usuario ${SEED.email}…`, '36');

  // 1) Buscar si el usuario ya existe.
  // Usamos listUsers y filtramos (no hay getUserByEmail directo en todas las versiones).
  let existingUser = null;
  let page = 1;
  while (!existingUser) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      log('seed', `❌ Error listando usuarios: ${error.message}`, '31');
      process.exit(1);
    }
    existingUser = data.users.find((u) => u.email?.toLowerCase() === SEED.email.toLowerCase());
    if (!existingUser && data.users.length < 200) break;
    if (data.users.length < 200) break;
    page++;
  }

  let userId;

  if (existingUser) {
    log('seed', `✓ Usuario ya existe (id=${existingUser.id}). Actualizando…`, '33');
    userId = existingUser.id;

    // Reforzar email confirmado y password.
    const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
      password: SEED.password,
      email_confirm: true,
      user_metadata: { nombre_completo: SEED.fullName, rol: SEED.rol },
    });
    if (updErr) {
      log('seed', `⚠️  No se pudo actualizar contraseña/metadata: ${updErr.message}`, '33');
    } else {
      log('seed', '✓ Contraseña y metadata actualizadas.', '32');
    }
  } else {
    log('seed', '→ Usuario no existe. Creando…', '36');

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: SEED.email,
      password: SEED.password,
      email_confirm: true,
      user_metadata: { nombre_completo: SEED.fullName, rol: SEED.rol },
    });

    if (createErr || !created.user) {
      log('seed', `❌ Error creando usuario: ${createErr?.message || 'desconocido'}`, '31');
      process.exit(1);
    }

    userId = created.user.id;
    log('seed', `✓ Usuario creado (id=${userId}).`, '32');
  }

  // 2) Asegurar que el user_profile tenga rol Super_Admin.
  //    (El trigger handle_new_user crea el perfil con rol 'Cliente_Invitado'
  //     por default; aquí lo promovemos.)
  log('seed', '→ Verificando user_profile…', '36');

  const { data: profile, error: profileSelErr } = await supabase
    .from('user_profiles')
    .select('id, rol, nombre_completo, workspace_id, activo')
    .eq('id', userId)
    .maybeSingle();

  if (profileSelErr) {
    log('seed', `⚠️  Error leyendo perfil: ${profileSelErr.message}`, '33');
  }

  if (!profile) {
    log('seed', '→ Perfil no existe. Insertando manualmente…', '36');
    const { error: insertErr } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        nombre_completo: SEED.fullName,
        rol: SEED.rol,
        activo: true,
        // workspace_id queda null — Super_Admin no pertenece a un workspace
      });

    if (insertErr) {
      log('seed', `❌ Error insertando perfil: ${insertErr.message}`, '31');
      process.exit(1);
    }
    log('seed', '✓ Perfil creado con rol Super_Admin.', '32');
  } else if (profile.rol !== SEED.rol) {
    log('seed', `→ Promoviendo rol de "${profile.rol}" a "${SEED.rol}"…`, '36');
    const { error: updProfileErr } = await supabase
      .from('user_profiles')
      .update({
        rol: SEED.rol,
        nombre_completo: SEED.fullName,
        activo: true,
      })
      .eq('id', userId);

    if (updProfileErr) {
      log('seed', `❌ Error actualizando perfil: ${updProfileErr.message}`, '31');
      process.exit(1);
    }
    log('seed', '✓ Rol promovido a Super_Admin.', '32');
  } else {
    log('seed', `✓ Perfil ya tiene rol ${SEED.rol}.`, '32');
  }

  // 3) Resumen final
  console.log('\n' + '='.repeat(60));
  log('seed', '✅ Usuario semilla listo.', '32');
  console.log('='.repeat(60));
  console.log(`  Correo:      ${SEED.email}`);
  console.log(`  Contraseña:  ${SEED.password}`);
  console.log(`  Rol:         ${SEED.rol}`);
  console.log(`  User ID:     ${userId}`);
  console.log(`  Login URL:   ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`);
  console.log('='.repeat(60));
  console.log('\n  ⚠️  Cambia la contraseña después del primer login en producción.\n');
}

main().catch((err) => {
  console.error('[seed] ❌ Error fatal:', err);
  process.exit(1);
});