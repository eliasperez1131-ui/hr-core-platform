# 🚀 HR CORE — Roadmap de Migración a VPS (PostgreSQL Self-Hosted)

**Estado:** En construcción · **Branch:** `feat/vps-migration` · **Target:** Hostinger VPS o similar (Hetzner, OVH, DigitalOcean)

---

## 🎯 Objetivo final

HR CORE corriendo **100% self-hosted** en un VPS con:
- **PostgreSQL 16** nativo (sin Supabase, sin servicios externos)
- **NextAuth (Auth.js v5)** para autenticación local
- **Nodemailer + SMTP** para emails
- **MercadoPago** (LATAM-friendly) o **Stripe** opcional para pagos
- **Docker Compose** para deploy en un solo comando
- **Cero dependencia de Supabase, Vercel o servicios de terceros**

**Las 14 migraciones SQL ya están escritas en PostgreSQL puro** — se pueden correr directamente con `psql` o `node scripts/apply-migrations.js`.

---

## 📊 Estado actual del proyecto (antes de migrar)

| Componente | Stack actual | Stack destino (VPS) | Esfuerzo |
|---|---|---|---|
| Base de datos | Supabase (externo) | **PostgreSQL 16 local** | 🟢 Bajo (SQL ya compatible) |
| Auth | Supabase Auth | **NextAuth (Auth.js v5)** con credentials | 🟡 Medio (1-2 días) |
| Email | Resend (externo) | **Nodemailer + SMTP** (Gmail/Postmark/local) | 🟢 Bajo (1-2 horas) |
| Storage CVs | Supabase Storage | **Disco local** del VPS (`/var/uploads`) | 🟢 Bajo (2-3 horas) |
| Pagos | Stripe | **MercadoPago** (LATAM) o mantener Stripe | 🟡 Medio (opcional) |
| Deploy | Vercel (serverless) | **Docker + PM2 + Caddy** (VPS Linux) | 🟢 Bajo (4-6 horas) |
| Realtime | (no usado) | (opcional) Socket.io o SSE | 🟢 No necesario |

---

## 🗺️ Plan de migración paso a paso (orden recomendado)

### **Fase 1 — Infraestructura (4-6 horas)**

1. ✅ Snapshot del estado actual → tag `v1.0-supabase-vercel`, branch `backup-pre-vps` **(HECHO)**
2. ⏳ Crear branch `feat/vps-migration` **(HECHO)**
3. ⏳ **`docker-compose.yml`** con PostgreSQL 16 + Redis opcional
4. ⏳ **`Dockerfile`** multi-stage para Next.js
5. ⏳ **`DEPLOY-VPS.md`** con instrucciones específicas para Hostinger
6. ⏳ **`.dockerignore`** + script `scripts/init-db.sh`

### **Fase 2 — Base de datos (1-2 días)**

1. ⏳ Crear `src/lib/db.js` con `pg.Pool` (cliente nativo)
2. ⏳ Reemplazar `createAdminClient` en `src/lib/supabase-admin.js` → wrapper que delega a `db.js`
3. ⏳ **Mantener compatibilidad**: reexportar misma API para que los route.js NO cambien
4. ⏳ Crear tabla `users` propia (reemplaza `auth.users` de Supabase):

   ```sql
   CREATE TABLE public.users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(150) UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,    -- bcrypt
     nombre_completo VARCHAR(150),
     rol user_role NOT NULL DEFAULT 'Cliente_Invitado',
     workspace_id UUID REFERENCES workspaces_empresas(id),
     activo BOOLEAN NOT NULL DEFAULT true,
     email_verified_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```

5. ⏳ Reemplazar trigger `handle_new_user` (de `auth.users`) → trigger en `public.users` que crea `user_profiles` automático
6. ⏳ Aplicar las 14 migraciones SQL ya escritas con `node scripts/apply-migrations.js`

### **Fase 3 — Autenticación con NextAuth (1-2 días)**

1. ⏳ `npm install next-auth@beta bcryptjs @auth/pg-adapter`
2. ⏳ Crear `src/lib/auth.js` con configuración NextAuth (Credentials provider)
3. ⏳ Crear `src/app/api/auth/[...nextauth]/route.js`
4. ⏳ Actualizar middleware (`src/middleware.js`) para usar NextAuth en lugar de Supabase
5. ⏳ Reescribir `src/lib/supabase-server.js`, `supabase-browser.js`, `supabase-middleware.js` para que:
   - **Opción A**: Deleguen a `db.js` con `pg` (recomendado)
   - **Opción B**: Sean eliminados
6. ⏳ Reescribir `/api/auth/login` con `bcrypt.compare()` y generación de JWT
7. ⏳ Reescribir `/api/auth/register` con hashing bcrypt
8. ⏳ Reescribir `/api/auth/logout` para invalidar sesión

### **Fase 4 — Storage de archivos (2-3 horas)**

1. ⏳ Crear `src/lib/storage.js` con funciones `saveFile()`, `getFile()`
2. ⏳ Usar `process.cwd() + '/uploads'` (configurable con `UPLOADS_DIR` env var)
3. ⏳ Actualizar `src/app/api/vacantes/route.js` para usar storage local en lugar de Supabase Storage
4. ⏳ Servir archivos vía `src/app/api/files/[...path]/route.js` (con verificación de auth)

### **Fase 5 — Email con Nodemailer (1-2 horas)**

1. ⏳ `npm install nodemailer`
2. ⏳ Crear `src/lib/email.js` con transporter SMTP
3. ⏳ Reemplazar `src/lib/resend.js` (o crearlo desde cero)
4. ⏳ Configurar templates: recuperación de contraseña, magic link, confirmación de pago
5. ⏳ Variables de entorno: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### **Fase 6 — Deploy con Docker (4-6 horas)**

1. ⏳ Crear `Dockerfile` multi-stage:
   ```dockerfile
   FROM node:20-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   FROM node:20-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. ⏳ Crear `docker-compose.yml`:
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:16-alpine
       environment:
         POSTGRES_DB: hrcore
         POSTGRES_USER: hrcore
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - pgdata:/var/lib/postgresql/data
         - ./sql:/docker-entrypoint-initdb.d
       ports:
         - "5432:5432"
     app:
       build: .
       depends_on:
         - db
       environment:
         DATABASE_URL: postgresql://hrcore:${DB_PASSWORD}@db:5432/hrcore
         NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
         SMTP_HOST: ${SMTP_HOST}
       ports:
         - "3000:3000"
   volumes:
     pgdata:
   ```

3. ⏳ `scripts/init-db.sh` que crea DB, usuario y aplica las 14 migraciones automáticamente

### **Fase 7 — Reverse proxy con Caddy (2-3 horas)**

1. ⏳ Configurar Caddy para HTTPS automático con Let's Encrypt
2. ⏳ Configurar PM2 con `ecosystem.config.js` (ya existe)
3. ⏳ Configurar backups automáticos de PostgreSQL

---

## 📁 Archivos que se crearán/modificarán (estimación)

### Nuevos
- `src/lib/db.js` (cliente PostgreSQL con `pg`)
- `src/lib/auth.js` (NextAuth config)
- `src/lib/storage.js` (storage local de archivos)
- `src/lib/email.js` (Nodemailer SMTP)
- `src/app/api/auth/[...nextauth]/route.js` (handler de NextAuth)
- `src/app/api/files/[...path]/route.js` (servir archivos)
- `sql/15_users_local.sql` (tabla `users` propia + trigger)
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `scripts/init-db.sh`
- `Caddyfile`
- `DEPLOY-VPS.md`

### Modificados
- `package.json` (agregar `next-auth`, `bcryptjs`, `pg`, `nodemailer`)
- `src/middleware.js` (NextAuth en vez de Supabase)
- `src/lib/supabase-*.js` (deprecados o wrappers de compatibilidad)
- `src/app/api/auth/login/route.js`
- `src/app/api/auth/register/route.js`
- `src/app/api/auth/logout/route.js`
- `src/app/api/auth/candidato/route.js`
- `src/app/api/auth/reset-password/route.js`
- `src/app/api/evaluacion/submit/route.js` (cargar candidato desde `users` o tabla `candidatos`)
- `src/lib/facturas-data.js` (cargar desde PostgreSQL directo)
- `src/lib/share-mock.js` → `src/lib/share-data.js` (real, no mock)
- `src/lib/candidato-data.js` (cargar desde BD)
- `scripts/seed-admin.js` (hashear password con bcrypt)
- `scripts/apply-migrations.js` (apuntar a `DATABASE_URL` en vez de Supabase)
- `scripts/check-supabase.js` → `scripts/check-db.js`
- `.env.example` (cambiar a formato self-hosted)
- `.env.local` (placeholder de DATABASE_URL en vez de Supabase)
- `README.md` (actualizar instrucciones)
- `DEPLOY.md` → fusionar con `DEPLOY-VPS.md`

---

## 🔄 Plan de rollback

Si algo sale mal durante la migración:

1. `git checkout main` (vuelve al estado Supabase + Vercel)
2. `git checkout v1.0-supabase-vercel` (tag de seguridad)
3. `git checkout backup-pre-vps` (branch de respaldo)

**Ningún cambio de la rama `feat/vps-migration` se mergea a `main` hasta que esté validado.**

---

## 💰 Costos estimados del VPS (Hostinger)

| Plan | vCPU | RAM | Almacenamiento | Precio/mes |
|---|---|---|---|---|
| KVM 1 | 1 | 4 GB | 50 GB SSD | ~$5 USD |
| KVM 2 | 2 | 8 GB | 100 GB SSD | ~$10 USD |
| KVM 4 | 4 | 16 GB | 200 GB SSD | ~$20 USD |

**Recomendado:** KVM 2 (8 GB RAM) para ~50 candidatos simultáneos. Suficiente para 500+ usuarios.

---

## ⏱️ Estimación total

| Fase | Horas |
|---|---|
| Fase 1: Infraestructura | 4-6 h |
| Fase 2: Base de datos | 8-12 h |
| Fase 3: Autenticación | 8-16 h |
| Fase 4: Storage | 2-3 h |
| Fase 5: Email | 1-2 h |
| Fase 6: Deploy Docker | 4-6 h |
| Fase 7: Caddy + HTTPS | 2-3 h |
| **TOTAL** | **29-48 h (3-6 días)** |

---

## 📋 Checklist para retomar este trabajo

Cuando vuelvas a abrir este proyecto:

- [ ] Verificar que estás en `feat/vps-migration`: `git branch --show-current`
- [ ] Si no, cambiar: `git checkout feat/vps-migration`
- [ ] Leer este ROADMAP-VPS.md completamente
- [ ] Empezar con Fase 1 (Infraestructura) → `docker-compose.yml` y `Dockerfile`
- [ ] Continuar secuencialmente hasta Fase 7
- [ ] Probar todo localmente con `docker compose up -d`
- [ ] Cuando esté estable, mergear a `main` y deployar a Hostinger

---

**Cuando termines la migración**, tu proyecto HR CORE será:
- 🔒 100% privado (datos en tu VPS)
- 💰 Costos predecibles (~$10/mes)
- 🚀 Más rápido (sin latencia de red a Supabase)
- 🇲🇽 Hecho para LATAM (puedes integrar MercadoPago, facturación CFDI mexicana, etc.)
- 🛠️ Total control del stack

¡Éxito con la migración cuando la hagas! 🚀