# HR CORE — Plataforma SaaS B2B

Plataforma de **evaluaciones psicométricas** + **ATS** para agencias de reclutamiento y departamentos de RR.HH. con alto volumen de contratación.

## Stack

| Capa               | Tecnología                                |
| ------------------ | ----------------------------------------- |
| Frontend / Backend | Next.js 14 (App Router) + Node.js         |
| Estilos            | Tailwind CSS 3                            |
| Base de datos      | PostgreSQL (vía Supabase)                 |
| Auth + RLS         | Supabase Auth + Row Level Security        |
| Server-side        | API Routes de Next.js (`/api/*`)          |
| Middleware         | `src/middleware.js` (protección de rutas) |

## Estructura

```
hr-core-platform/
├── .env.example
├── .env.local               (no se commitea)
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── ecosystem.config.js                        (PM2)
├── logs/                                       (out.log / error.log de PM2)
├── scripts/
│   ├── free-port.js         (libera el puerto 3000 antes de dev/start)
│   ├── seed-admin.js        (crea Super_Admin semilla)
│   ├── pm2-start.js         (npm run daemon)
│   ├── pm2-stop.js          (npm run daemon:stop)
│   ├── pm2-status.js        (npm run daemon:status)
│   └── pm2-install.js       (npm run daemon:install — startup al boot)
├── sql/                                       (Supabase SQL Editor)
│   ├── 00_run_all.sql
│   ├── 01_enums.sql
│   ├── 02_user_profiles.sql
│   ├── 03_workspaces.sql
│   ├── 04_candidatos.sql
│   ├── 05_vacantes.sql
│   ├── 06_prospectos.sql
│   ├── 07_catalogo_pruebas.sql
│   ├── 08_rls_policies.sql
│   ├── 09_triggers.sql
│   ├── 10_seed_catalogo.sql
│   ├── 11_share_links.sql                    (Magic Links + visible_cliente)
│   └── 12_seed_share_demo.sql
└── src/
    ├── middleware.js                          (protección de rutas privadas)
    ├── app/
    │   ├── layout.js
    │   ├── page.js                            (Landing /)
    │   ├── globals.css
    │   ├── login/page.js                      (Inicio de sesión)
    │   ├── registro/page.js                   (Registro Cliente SaaS)
    │   ├── contacto/page.js
    │   ├── dashboard-saas/page.js              (protegido)
    │   ├── dashboard-freelance/page.js        (protegido)
    │   ├── crear-vacante/page.js              (protegido)
    │   ├── registrar-candidato/page.js        (protegido · demo dedupe)
    │   ├── compartir/[token]/page.js          (PÚBLICO · Magic Link)
    │   └── api/
    │       ├── auth/login/route.js
    │       ├── auth/register/route.js
    │       ├── auth/logout/route.js
    │       ├── auth/reset-password/route.js
    │       ├── prospectos/route.js
    │       ├── vacantes/route.js
    │       ├── vacantes/[id]/share-link/route.js
    │       ├── share/[token]/route.js
    │       ├── candidatos/route.js
    │       ├── candidatos/buscar/route.js
    │       └── vacante-candidatos/route.js
    ├── components/
    │   ├── Navbar.js
    │   ├── Hero.js
    │   ├── HowItWorks.js
    │   ├── TestCatalog.js
    │   ├── Plans.js
    │   ├── ContactForm.js
    │   ├── Footer.js
    │   ├── auth/                              (AuthLayout, Branding, Forms)
    │   ├── dashboard/                         (Layout, Sidebar, Topbar, etc.)
    │   ├── freelance/                         (Earnings, AssignedTable)
    │   ├── vacante/                           (VacanteForm con turnos)
    │   ├── share/                             (ShareLinkButton, CandidateCard)
    │   └── candidatos/                        (VincularCandidatoModal, RegistrarCandidatoFlow)
    └── lib/
        ├── data.js
        ├── turnos.js
        ├── dashboard-data.js
        ├── format.js
        ├── routes.js                         (mapeo rol→ruta, RUTAS_PROTEGIDAS)
        ├── share-helpers.js                  (token generator, maskEmail/Phone)
        ├── share-mock.js
        ├── candidatos-mock.js
        ├── supabase-browser.js
        ├── supabase-server.js
        ├── supabase-middleware.js
        └── supabase-admin.js
```

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# editar .env.local con tus claves reales de Supabase
```

Necesitas 3 valores desde `https://app.supabase.com/project/_/settings/api`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Ejecutar el schema SQL en Supabase

En el **SQL Editor** de Supabase, ejecuta en orden:

```
sql/01_enums.sql
sql/02_user_profiles.sql
sql/03_workspaces.sql
sql/04_candidatos.sql
sql/05_vacantes.sql
sql/06_prospectos.sql
sql/07_catalogo_pruebas.sql
sql/08_rls_policies.sql
sql/09_triggers.sql
sql/10_seed_catalogo.sql
sql/11_share_links.sql       # Magic Links
sql/12_seed_share_demo.sql   # opcional
```

### 4. Crear el usuario semilla (Super_Admin)

```bash
npm run seed
```

Crea (o actualiza si ya existe) el usuario:

- **Correo:** `admin@apprys.com`
- **Contraseña:** `Admin123!`
- **Rol:** `Super_Admin`

El script es **idempotente**: ejecutarlo varias veces no duplica al usuario; solo actualiza su contraseña, metadata y rol.

### 5. Levantar el servidor

```bash
npm run dev
```

El script `predev` libera el puerto 3000 antes de iniciar Next.js (multiplataforma).

### 6. Build / Producción

```bash
npm run build   # compila
npm run start   # sirve en :3000 (también libera el puerto primero)
```

## Servidor "siempre activo" con PM2 (background daemon)

Para no depender de una terminal abierta, el proyecto incluye configuración de **PM2**:

```bash
# Una sola vez: levantar el daemon (libera puerto + inicia pm2 + pm2 save)
npm run daemon

# Comandos útiles
npm run daemon:logs    # tail -f de logs
npm run daemon:status  # estado del proceso
npm run daemon:stop    # detener

# Activar inicio automático al boot del sistema (ejecutar UNA sola vez)
npm run daemon:install
```

### Activación de inicio al boot

**Linux/macOS:**
```bash
npm run daemon:install
# → Imprime un comando "sudo env PATH=... pm2 startup ..."
# → Cópialo y ejecútalo UNA vez. Luego pm2 resurrect en cada reboot.
```

**Windows (con pm2-windows-startup):**
```bash
npm install -g pm2-windows-startup
pm2-startup install
pm2 save
```

Una vez activado, el servidor arrancará con el sistema. `pm2` se encarga de:
- Reiniciar automáticamente ante crash (`autorestart: true`, hasta 10 restarts).
- Rotar logs en `logs/out.log` y `logs/error.log`.
- Watch opcional (configurado en `ecosystem.config.js`, comentado por defecto para producción).

## Magic Links (Portal VIP de finalistas)

Cuando un cliente contrata headhunting, el Admin/Reclutador puede generar un **enlace único** que muestra solo los finalistas de la vacante — sin necesidad de crear cuenta.

| Componente / Ruta                              | Función                                                       |
| ---------------------------------------------- | ------------------------------------------------------------- |
| `src/lib/share-helpers.js`                     | `generateShareToken()` (32 bytes hex), `maskEmail/Phone`      |
| `POST /api/vacantes/[id]/share-link`           | Genera token nuevo + expira (default 7 días)                  |
| `GET  /api/share/[token]`                      | Devuelve data pública (anon, sin sesión)                      |
| `src/app/compartir/[token]/page.js`            | Página pública de finalistas                                  |
| `src/components/share/ShareLinkButton.js`      | Modal "Generar Enlace Mágico" con copia al portapapeles      |
| `src/components/share/CandidateCard.js`        | Tarjeta de candidato (nombre, edad, escolaridad, CV)          |

El modal está integrado en `AssignedVacanciesTable` (botón "Generar Enlace Mágico" por vacante).

**Para probar:** entra a `/dashboard-freelance` y haz clic en "Generar Enlace Mágico" en cualquier vacante. La URL tiene esta forma:
```
http://localhost:3000/compartir/demo-secure-token-7f3a8b9c2d1e
```

El token `demo-*` siempre devuelve datos de muestra para previsualización.

## Deduplicación de Candidatos

Al registrar un candidato, el sistema busca coincidencias exactas de **correo** o **teléfono**. Si existe, abre un modal con el historial completo (vacantes previas, inasistencias, abandonos) para que el reclutador decida si vincularlo.

| Componente / Ruta                                       | Función                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| `GET  /api/candidatos/buscar?email=&telefono=`          | Busca por correo o teléfono y devuelve historial             |
| `POST /api/candidatos`                                  | Crea nuevo candidato (valida duplicados)                     |
| `POST /api/vacante-candidatos`                          | Vincula candidato a vacante (soporta vacantes `es_delicada`) |
| `src/components/candidatos/RegistrarCandidatoFlow.js`   | Flujo completo con búsqueda onBlur                           |
| `src/components/candidatos/VincularCandidatoModal.js`   | Modal de historial con KPIs y timeline                       |

**Para probar:** ve a `/registrar-candidato` y usa uno de estos correos/teléfonos para ver el modal de historial en acción:
- `roberto.quintero@gmail.com`
- `+52 55 1234 5678`
- `javier.cordero@outlook.com`
- `+52 55 4422 8831`

## Autenticación y autorización

| Componente                          | Función                                                              |
| ----------------------------------- | -------------------------------------------------------------------- |
| `src/middleware.js`                 | Bloquea rutas privadas sin sesión y redirige por rol                 |
| `src/lib/routes.js`                 | `HOME_POR_ROL` y `RUTAS_PROTEGIDAS` (mapeo central)                  |
| `/api/auth/login`                   | signInWithPassword + lee `user_profiles.rol` + devuelve redirect     |
| `/api/auth/register`                | Crea auth.user + workspace + actualiza perfil (rol Cliente_SaaS)    |
| `/api/auth/logout`                  | signOut + limpia cookies                                             |
| `/api/auth/reset-password`          | Envía email de recuperación vía admin API                            |

### Rutas protegidas (definidas en `src/lib/routes.js`)

| Ruta                    | Roles permitidos                                                  |
| ----------------------- | ----------------------------------------------------------------- |
| `/dashboard-saas`       | Super_Admin, Administrador_Agencia, Coordinador, Cliente_SaaS     |
| `/dashboard-freelance`  | Super_Admin, Administrador_Agencia, Coordinador, Reclutador_Freelance |
| `/crear-vacante`        | Super_Admin, Administrador_Agencia, Coordinador                   |
| `/admin/**`             | Super_Admin                                                       |

Si un usuario sin sesión intenta entrar → redirige a `/login?next=<ruta>`.
Si un usuario autenticado entra a una ruta que no corresponde a su rol → redirige al dashboard correcto.
Si ya hay sesión y entra a `/login` o `/registro` → redirige a su home según rol.

## Endpoints

| Método | Ruta                                  | Descripción                                          |
| ------ | ------------------------------------- | ---------------------------------------------------- |
| POST   | `/api/auth/login`                     | Inicia sesión                                        |
| POST   | `/api/auth/register`                  | Registra Cliente SaaS + crea workspace               |
| POST   | `/api/auth/logout`                    | Cierra sesión                                        |
| POST   | `/api/auth/reset-password`            | Envía enlace de recuperación                         |
| POST   | `/api/prospectos`                     | Captura lead desde `/contacto`                       |
| POST   | `/api/vacantes`                       | Crea vacante (validación + RLS de Supabase)          |
| POST   | `/api/vacantes/[id]/share-link`       | Genera Magic Link para una vacante                   |
| GET    | `/api/vacantes/[id]/share-link`       | Lista los Magic Links de una vacante                 |
| GET    | `/api/share/[token]`                  | Devuelve data pública de finalistas (anónimo)        |
| GET    | `/api/candidatos/buscar`              | Busca candidato por correo o teléfono                |
| POST   | `/api/candidatos`                     | Crea candidato (valida duplicados)                   |
| POST   | `/api/vacante-candidatos`             | Vincula candidato a vacante                          |

## Modelo de datos y RBAC

Ver `sql/08_rls_policies.sql` para todas las políticas. Resumen:

| Rol                    | Alcance                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `Super_Admin`          | Acceso total multi-workspace                                  |
| `Administrador_Agencia`| Gestiona su workspace, ve info financiera                    |
| `Coordinador`          | Gestiona vacantes asignadas, ve info financiera               |
| `Reclutador_Freelance` | Solo lectura operativa, sin info financiera                   |
| `Cliente_SaaS`         | Lectura de candidatos y vacantes de su workspace              |
| `Cliente_Invitado`     | Acceso puntual                                                |

## Privacidad financiera

La tabla `vacantes` contiene `cobro_cliente` y `comision_freelance`. Para evitar exponerlos:

1. La vista **`vacantes_public_view`** los oculta físicamente.
2. Las políticas RLS restringen el acceso a la tabla base solo a roles autorizados.

## Despliegue futuro en VPS

```bash
git clone …
npm ci --production
npm run build
npm run seed       # solo la primera vez
pm2 start npm --name HR CORE -- run start
```

Variables de entorno en `/etc/HR CORE.env` o en el panel del proveedor. Nginx como reverse proxy recomendado.

---

© HR CORE · Next.js + Supabase + Tailwind CSS