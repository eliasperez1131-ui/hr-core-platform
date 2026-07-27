-- ============================================================
--  HR CORE · Esquema MySQL completo
--  Crea TODAS las tablas que la app necesita + datos seed.
-- ============================================================
--  USO (en el VPS, una sola vez):
--    mysql -uroot -p'123456' hrcore_db < hrcore_mysql_schema.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS=0;

-- ============================================================
--  1. WORKSPACES_EMPRESAS (cuentas corporativas)
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces_empresas (
  id            CHAR(36) PRIMARY KEY,
  nombre_empresa VARCHAR(200) NOT NULL,
  giro_industrial VARCHAR(50) DEFAULT 'Otro',
  plan_activo   VARCHAR(20) DEFAULT 'Trial',
  max_usuarios  INT DEFAULT 10,
  activo        TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  2. USER_PROFILES (extiende auth de Supabase — local para MySQL)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id              CHAR(36) PRIMARY KEY,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(150),
  rol             VARCHAR(30) NOT NULL DEFAULT 'Cliente_Invitado',
  workspace_id    CHAR(36) NULL,
  telefono        VARCHAR(20),
  avatar_url      TEXT,
  activo          TINYINT(1) DEFAULT 1,
  email_verified_at TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_user_workspace (workspace_id),
  KEY idx_user_rol (rol),
  CONSTRAINT fk_user_workspace FOREIGN KEY (workspace_id)
    REFERENCES workspaces_empresas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  3. CANDIDATOS (CRM de talento)
-- ============================================================
CREATE TABLE IF NOT EXISTS candidatos (
  id              CHAR(36) PRIMARY KEY,
  nombre_completo VARCHAR(200) NOT NULL,
  correo          VARCHAR(150) UNIQUE,
  telefono        VARCHAR(20) UNIQUE,
  edad            INT,
  escolaridad     VARCHAR(100),
  estado          VARCHAR(50),
  municipio       VARCHAR(100),
  url_cv_pdf       TEXT,
  vacantes_participadas INT DEFAULT 0,
  inasistencias   INT DEFAULT 0,
  abandonos       INT DEFAULT 0,
  estatus_reclutamiento VARCHAR(30) DEFAULT 'Pendiente',
  workspace_id    CHAR(36) NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_cand_correo   (correo),
  KEY idx_cand_telefono (telefono),
  KEY idx_cand_workspace (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  4. VACANTES (puestos publicados)
-- ============================================================
CREATE TABLE IF NOT EXISTS vacantes (
  id          CHAR(36) PRIMARY KEY,
  titulo_puesto VARCHAR(150) NOT NULL,
  descripcion  TEXT,
  requisitos   TEXT,
  beneficios   TEXT,
  tipo_jornada VARCHAR(20) DEFAULT 'Fijo',
  detalle_turno VARCHAR(150),
  modalidad    VARCHAR(50),
  ubicacion    VARCHAR(200),
  sueldo_candidato DECIMAL(12,2),
  cobro_cliente DECIMAL(12,2),
  comision_freelance DECIMAL(12,2),
  es_delicada  TINYINT(1) DEFAULT 0,
  estatus      VARCHAR(20) DEFAULT 'Abierta',
  vacantes_disponibles INT DEFAULT 1,
  workspace_id CHAR(36) NULL,
  creado_por   CHAR(36) NULL,
  fecha_publicacion TIMESTAMP NULL,
  fecha_cierre TIMESTAMP NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_vac_workspace (workspace_id),
  KEY idx_vac_estatus (estatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  5. VACANTE_CANDIDATOS (pipeline Kanban)
-- ============================================================
CREATE TABLE IF NOT EXISTS vacante_candidatos (
  id            CHAR(36) PRIMARY KEY,
  vacante_id    CHAR(36) NOT NULL,
  candidato_id  CHAR(36) NOT NULL,
  estatus       VARCHAR(30) DEFAULT 'Postulado',
  puntuacion    DECIMAL(5,2),
  notas         TEXT,
  asistido      TINYINT(1),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_vacante_candidato (vacante_id, candidato_id),
  KEY idx_vc_vacante (vacante_id),
  KEY idx_vc_candidato (candidato_id),
  CONSTRAINT fk_vc_vacante FOREIGN KEY (vacante_id)
    REFERENCES vacantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_vc_candidato FOREIGN KEY (candidato_id)
    REFERENCES candidatos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  6. FACTURAS (cobro a clientes por headhunting)
-- ============================================================
CREATE TABLE IF NOT EXISTS facturas (
  id            CHAR(36) PRIMARY KEY,
  workspace_id  CHAR(36) NULL,
  vacante_id    CHAR(36) NULL,
  monto         DECIMAL(12,2) NOT NULL,
  moneda       VARCHAR(3) DEFAULT 'MXN',
  metodo_pago   VARCHAR(20) NULL,
  estatus       VARCHAR(20) DEFAULT 'Pendiente',
  descripcion   TEXT,
  referencia_externa VARCHAR(100),
  notas_internas TEXT,
  fecha_pago    TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_fac_workspace (workspace_id),
  KEY idx_fac_vacante (vacante_id),
  KEY idx_fac_estatus (estatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  7. PROSPECTOS_PENDIENTES (leads del landing)
-- ============================================================
CREATE TABLE IF NOT EXISTS prospectos_pendientes (
  id            CHAR(36) PRIMARY KEY,
  nombre_empresa VARCHAR(200) NOT NULL,
  nombre_contacto VARCHAR(150) NOT NULL,
  correo_corporativo VARCHAR(150) NOT NULL,
  telefono       VARCHAR(20) NOT NULL,
  interes        VARCHAR(20) DEFAULT 'Ambos',
  mensaje        TEXT,
  estatus        VARCHAR(20) DEFAULT 'Nuevo',
  reviewed_by    CHAR(36) NULL,
  reviewed_at    TIMESTAMP NULL,
  notas_internas  TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_prosp_correo (correo_corporativo),
  KEY idx_prosp_estatus (estatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  8. SHARE_LINKS (Magic Links del headhunting)
-- ============================================================
CREATE TABLE IF NOT EXISTS share_links (
  id                CHAR(36) PRIMARY KEY,
  token             VARCHAR(64) UNIQUE NOT NULL,
  vacante_id        CHAR(36) NULL,
  created_by        CHAR(36) NULL,
  label             VARCHAR(100),
  expires_at        TIMESTAMP NULL,
  revoked_at        TIMESTAMP NULL,
  access_count      INT DEFAULT 0,
  last_accessed_at  TIMESTAMP NULL,
  metadata          JSON,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_share_token   (token),
  KEY idx_share_vacante (vacante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;

-- ============================================================
--  Mensaje de éxito
-- ============================================================
SELECT 'HR CORE · Esquema MySQL creado correctamente' AS status;
SELECT
  TABLE_NAME,
  TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;
