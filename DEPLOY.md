# 🚀 HR CORE — Guía de Despliegue a Producción (Vercel)

Esta guía te lleva **paso a paso** desde `git init` hasta tener HR CORE
corriendo en `https://hrcore.app` (o tu dominio) en menos de 30 minutos.

---

## 📋 Pre-requisitos

| Servicio | URL | Plan mínimo |
|---|---|---|
| GitHub | https://github.com | Free |
| Vercel | https://vercel.com | Free (Hobby) |
| Supabase | https://supabase.com | Free (500MB) |
| Stripe (opcional) | https://stripe.com | Free test mode |
| Resend (opcional) | https://resend.com | Free 3K/mes |

---

## 🔧 PASO 1 — Preparar el proyecto localmente

### 1.1 Verificar que el build pasa

```bash
cd C:\Users\elias\talent-ats-platform
npm install
npm run build
```

Debes ver al final:
```
✓ Compiled successfully
✓ Generating static pages (13/13)
```

### 1.2 (Opcional) Probar la app en local

```bash
npm run dev
# Abre http://localhost:3000
```

---

## 🔧 PASO 2 — Subir a GitHub

### 2.1 Crear el repositorio en GitHub

1. Ve a https://github.com/new
2. **Repository name:** `hr-core-platform`
3. **Description:** "HR CORE — SaaS B2B de evaluaciones psicométricas"
4. Visibilidad: **Private** (recomendado)
5. **NO inicialices con README** (ya tenemos uno)
6. Click **Create repository**

### 2.2 Conectar y subir

En la terminal de tu proyecto:

```bash
cd C:\Users\elias\talent-ats-platform

# Inicializar Git (solo la primera vez)
git init
git branch -M main

# Verificar .gitignore incluye .env.local y .next
type .gitignore | findstr /C:".env.local"
type .gitignore | findstr /C:".next"
# Si no están, agregarlos:
# echo .env.local >> .gitignore
# echo .next >> .gitignore

# Primer commit
git add .
git commit -m "feat: HR CORE v1.0 — landing, dashboards, motor de evaluaciones, portal cliente y facturacion"

# Conectar con GitHub (reemplaza TU-USUARIO por tu usuario)
git remote add origin https://github.com/TU-USUARIO/hr-core-platform.git

# Subir
git push -u origin main
```

> 💡 **Si usas GitHub CLI** (más rápido):
> ```bash
> gh repo create hr-core-platform --private --source=. --remote=origin --push
> ```

---

## 🔧 PASO 3 — Desplegar en Vercel

### 3.1 Conectar Vercel con GitHub

1. Ve a https://vercel.com → **Sign Up** con GitHub
2. Click **"Add New Project"**
3. Click **"Import"** junto a tu repo `hr-core-platform`
4. Configura el proyecto:

| Campo | Valor |
|---|---|
| **Project Name** | `hr-core-platform` (o el que prefieras) |
| **Framework Preset** | Next.js (auto-detectado) |
| **Root Directory** | `./` (dejar por defecto) |
| **Build Command** | `npm run build` (auto) |
| **Output Directory** | `.next` (auto) |
| **Install Command** | `npm install` (auto) |
| **Node.js Version** | 20.x o 22.x (recomendado) |

### 3.2 Variables de Entorno ⚠️ **CRÍTICO**

Click **"Environment Variables"** y agrega las siguientes
(usa el archivo `.env.example` como guía — copia los nombres
exactos de cada variable):

#### 🌍 Aplicación
| Variable | Valor (Production) | Entornos |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://hr-core.app` (o tu dominio) | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | (mismo valor) | Production, Preview, Development |
| `NEXT_PUBLIC_APP_NAME` | `HR CORE` | Production, Preview, Development |

#### 🗄️ Supabase (obligatorias)
| Variable | Valor | Entornos |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` (de Supabase Dashboard) | Todos |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (clave ANON, pública) | Todos |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (clave SERVICE, 🔒 privada) | **Solo Production + Preview** |

> ⚠️ **NO** pongas `SUPABASE_SERVICE_ROLE_KEY` en Development
> (Vercel usa la de tu `.env.local` automáticamente).

#### 💳 Stripe (cuando estés listo para cobrar)
| Variable | Valor | Entornos |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_xxx` | Production, Preview |
| `STRIPE_SECRET_KEY` | `sk_live_xxx` 🔒 | Production, Preview |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxx` 🔒 | Production, Preview |

> 💡 Mientras estés en pruebas, usa las claves `pk_test_` / `sk_test_`.

#### 📧 Email (opcional pero recomendado)
| Variable | Valor | Entornos |
|---|---|---|
| `RESEND_API_KEY` | `re_xxx` 🔒 | Production, Preview |
| `FROM_EMAIL` | `hola@tudominio.com` | Todos |
| `SUPPORT_EMAIL` | `soporte@tudominio.com` | Todos |

> ⚠️ **Importante:** el dominio en `FROM_EMAIL` debe estar verificado
> en Resend (Dashboard → Domains → Add).

### 3.3 Deploy

1. Click **Deploy**
2. Espera 2-3 minutos mientras Vercel compila
3. Al terminar, verás 🎉 con una URL temporal: `https://hr-core-platform.vercel.app`

---

## 🔧 PASO 4 — Configurar el dominio personalizado

### 4.1 Agregar dominio en Vercel

1. Vercel → Tu proyecto → **Settings** → **Domains**
2. Escribe tu dominio (ej. `hrcore.app` o `app.tuempresa.com`)
3. Click **Add**
4. Vercel te mostrará los registros DNS que debes agregar en tu proveedor

### 4.2 Configurar DNS

En tu proveedor (Cloudflare, Namecheap, GoDaddy, etc.) agrega:

**Si usas apex (`hrcore.app`):**
```
Tipo   Nombre  Valor
A      @       76.76.21.21
```

**Si usas subdominio (`app.tuempresa.com`):**
```
Tipo   Nombre  Valor
CNAME app     cname.vercel-dns.com
```

> 💡 Vercel detecta automáticamente y emite un certificado SSL gratis.

### 4.3 Actualizar variables

Una vez que el dominio funcione, actualiza:
- `NEXT_PUBLIC_SITE_URL` → `https://tudominio.com`
- `NEXT_PUBLIC_APP_URL` → `https://tudominio.com`

Y redespliega (Vercel → Deployments → ⋯ → Redeploy).

---

## 🔧 PASO 5 — Configurar el Webhook de Stripe

> ⚠️ Solo cuando ya tengas las claves de Stripe configuradas en Vercel.

1. Ve a https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://tudominio.com/api/webhooks/stripe`
4. **Description:** "HR CORE — pagos y facturas"
5. **Events to send:** marca estos 4:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
6. Click **Add endpoint**
7. En la página del webhook, click **"Reveal"** en "Signing secret"
8. Copia el `whsec_xxx` y pégalo en Vercel como `STRIPE_WEBHOOK_SECRET`
9. Redespliega el proyecto en Vercel

### Probar el webhook

En Stripe Dashboard → Webhooks → tu endpoint → **Send test event**:
- Selecciona `checkout.session.completed`
- Click **Send test event**
- Debe responder `200 OK` con `{"received": true, "type": "checkout.session.completed"}`

Si responde **400 "Firma inválida"**, revisa que `STRIPE_WEBHOOK_SECRET` en Vercel coincida exactamente con el del dashboard.

---

## 🔧 PASO 6 — Crear el primer Super Admin

Una vez deployed, necesitas poblar Supabase con el primer usuario:

```bash
# 1. Aplicar las migraciones SQL (en orden) en Supabase SQL Editor
#    https://app.supabase.com → SQL Editor → New query
#    Pega y ejecuta el contenido de cada archivo:
#      sql/01_enums.sql
#      sql/02_user_profiles.sql
#      sql/03_workspaces.sql
#      ... (hasta sql/14_facturas.sql)

# 2. Localmente, ejecuta el seed con tus claves reales:
#    Edita .env.local con las claves de Supabase en PRODUCCIÓN
cp .env.example .env.local
# Edita .env.local y pega tus claves de Supabase

npm run seed
# Salida esperada:
#   ✅ Usuario semilla listo.
#     Correo:      admin@hrcore.com
#     Contraseña:  318088330
#     Rol:         Super_Admin
```

Ahora puedes entrar a `https://tudominio.com/login` con:
- **Usuario:** `ADMIN` (se transforma automáticamente a `admin@hrcore.com`)
- **Contraseña:** `318088330`

---

## 🔄 Flujo de trabajo continuo (Git → Vercel)

Una vez configurado, el flujo de deploy continuo es:

```bash
# 1. Hacer cambios localmente
# 2. Probar en local
npm run dev

# 3. Cuando todo funciona, hacer commit + push
git add .
git commit -m "feat: nueva funcionalidad X"
git push

# 4. Vercel detecta el push y redespliega automáticamente en ~60s
#    Cada PR genera un Preview URL único (ej. https://hr-core-git-feature-xyz.vercel.app)
```

Para ver los logs de un deploy:
- Vercel → Proyecto → **Deployments** → Click en el commit → **Building** o **Function Logs**

Para hacer rollback:
- Vercel → Deployments → Click en los **⋯** de un deploy anterior → **Promote to Production**

---

## 🆘 Troubleshooting

### Build falla en Vercel pero pasa local
- Verifica que `NEXT_PUBLIC_*` y `SUPABASE_*` están configuradas en Vercel
- Revisa los logs de Vercel: Settings → Logs

### Error "Falta NEXT_PUBLIC_SUPABASE_URL"
- Ve a Vercel → Project → Settings → Environment Variables
- Asegúrate de que las variables existen para el entorno **Production**

### Webhook de Stripe devuelve 401
- Verifica que `STRIPE_WEBHOOK_SECRET` en Vercel coincide con el Signing Secret del webhook en Stripe Dashboard
- Redespliega después de cambiar variables

### El login con "ADMIN" no funciona
- Ejecuta `npm run seed` con las claves de Supabase **de producción** en tu `.env.local`
- Verifica que el usuario `admin@hrcore.com` existe en Supabase → Authentication → Users

### Errores 500 al cargar el dashboard
- Revisa Vercel → Functions → Logs
- Probablemente falta `SUPABASE_SERVICE_ROLE_KEY`

---

## 📊 Resumen de costos mensuales (estimado)

| Servicio | Plan | Costo |
|---|---|---|
| Vercel | Hobby | $0 (hasta 100GB bandwidth) |
| Supabase | Free | $0 (hasta 500MB BD) |
| Stripe | Standard | 2.9% + $3 MXN por transacción exitosa |
| Resend | Free | $0 (hasta 3,000 emails/mes) |
| **Total tráfico bajo** | | **~$0-10 USD/mes** |

---

## 🎯 Checklist final de lanzamiento

- [ ] Repositorio GitHub creado y pusheado
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas (Production)
- [ ] Primer deploy exitoso (URL temporal de Vercel)
- [ ] Dominio personalizado agregado y propagado
- [ ] Certificado SSL emitido (automático)
- [ ] SQL migrations ejecutadas en Supabase
- [ ] `npm run seed` ejecutado (admin creado)
- [ ] Login funciona con `ADMIN` / `318088330`
- [ ] Webhook de Stripe configurado (cuando cobres)
- [ ] Email de Resend verificado (cuando envies emails)
- [ ] Resend dominio verificado (SPF/DKIM/DMARC)
- [ ] Respaldo automático de Supabase activado

**¡Listo para producción! 🚀**
