CREATE TABLE IF NOT EXISTS temas (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tema_pai_id   INT UNSIGNED NULL,
  titulo        VARCHAR(120) NOT NULL,
  descricao     TEXT NULL,
  slug          VARCHAR(140) NOT NULL,
  pasta_origem  VARCHAR(255) NOT NULL,
  imagem_capa   VARCHAR(255) NULL,
  ordem         SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_temas_slug (slug),
  UNIQUE KEY uk_temas_pasta (pasta_origem),
  CONSTRAINT fk_temas_pai FOREIGN KEY (tema_pai_id) REFERENCES temas (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
