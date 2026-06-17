USE fitness_app;
CREATE TABLE IF NOT EXISTS password_resets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  token       VARCHAR(64) NOT NULL UNIQUE,
  expira_en   DATETIME NOT NULL,
  usado       TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
