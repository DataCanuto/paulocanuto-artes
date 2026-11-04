CREATE TABLE IF NOT EXISTS obras (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(200) NOT NULL,
  url             VARCHAR(255) NOT NULL,
  url_miniatura   VARCHAR(255) NOT NULL,
  largura         SMALLINT UNSIGNED NOT NULL,
  altura          SMALLINT UNSIGNED NOT NULL,
  sha256          CHAR(64) NOT NULL,
  arquivo_origem  VARCHAR(500) NOT NULL,
  tecnica         VARCHAR(150) NULL,
  suporte         VARCHAR(100) NULL,
  dimensoes_cm    VARCHAR(30) NULL,
  ano             SMALLINT UNSIGNED NULL,
  descricao_alt   VARCHAR(300) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_obras_sha256 (sha256)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
