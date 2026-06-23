-- ============================================================
-- schema.sql — Esquema completo de fitness_app
-- ============================================================
-- Reemplaza TODAS las migraciones individuales.
-- Ejecutar: mysql -u root -p fitness_app < docs/schema.sql
-- ============================================================

CREATE TABLE usuarios (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  nombre              VARCHAR(100) NOT NULL,
  email               VARCHAR(150) NOT NULL UNIQUE,
  password            VARCHAR(255) NOT NULL,
  activo              BOOLEAN DEFAULT TRUE,
  avatar_url          VARCHAR(255) DEFAULT NULL,
  nivel_experiencia   ENUM('Principiante','Intermedio','Avanzado') DEFAULT 'Principiante',
  peso_actual         DECIMAL(5,2) DEFAULT NULL,
  estatura_cm         INT DEFAULT NULL,
  onboarding_completado BOOLEAN DEFAULT FALSE,
  sexo                ENUM('Masculino','Femenino','Otro') DEFAULT 'Otro',
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rutinas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  nombre          VARCHAR(150) NOT NULL,
  descripcion     TEXT,
  activa          BOOLEAN DEFAULT TRUE,
  es_recomendada  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE ejercicios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  descripcion TEXT,
  categoria   VARCHAR(50),
  imagen_url  VARCHAR(255),
  gif_url     VARCHAR(500) DEFAULT NULL
);

CREATE TABLE grupos_musculares (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE ejercicios_grupos_musculares (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  ejercicio_id      INT NOT NULL,
  grupo_muscular_id INT NOT NULL,
  tipo              VARCHAR(20) NOT NULL DEFAULT 'principal',
  FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id),
  FOREIGN KEY (grupo_muscular_id) REFERENCES grupos_musculares(id)
);

CREATE TABLE ejercicios_rutinas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  rutina_id       INT NOT NULL,
  ejercicio_id    INT NOT NULL,
  orden           INT DEFAULT NULL,
  series          INT DEFAULT NULL,
  repeticiones    INT DEFAULT NULL,
  peso            DECIMAL(6,2) DEFAULT NULL,
  tiempo_descanso INT DEFAULT NULL,
  FOREIGN KEY (rutina_id) REFERENCES rutinas(id),
  FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id)
);

CREATE TABLE sesiones_entrenamiento (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT NOT NULL,
  rutina_id        INT NOT NULL,
  fecha            DATE NOT NULL,
  notas            TEXT,
  duracion_minutos INT DEFAULT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (rutina_id) REFERENCES rutinas(id)
);

CREATE TABLE sesion_ejercicios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  sesion_id     INT NOT NULL,
  ejercicio_id  INT NOT NULL,
  orden         INT DEFAULT NULL,
  notas         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sesion_id) REFERENCES sesiones_entrenamiento(id),
  FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id)
);

CREATE TABLE sesion_series (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  sesion_ejercicio_id INT NOT NULL,
  numero_serie        INT NOT NULL,
  repeticiones        INT DEFAULT NULL,
  peso                DECIMAL(6,2) DEFAULT NULL,
  completada          BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sesion_ejercicio_id) REFERENCES sesion_ejercicios(id)
);

CREATE TABLE password_resets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  token       VARCHAR(64) NOT NULL UNIQUE,
  expira_en   DATETIME NOT NULL,
  usado       BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
