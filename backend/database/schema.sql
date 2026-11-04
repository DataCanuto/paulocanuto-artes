-- Esquema consolidado (referência). A forma recomendada de criar o banco é `npm run db:migrate`,
-- que aplica database/migrations/ em ordem e registra o que já foi aplicado.
CREATE DATABASE IF NOT EXISTS galeria_paulo_canuto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE galeria_paulo_canuto;

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

CREATE TABLE IF NOT EXISTS obras (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(200) NOT NULL,
  url             VARCHAR(255) NOT NULL,
  url_miniatura   VARCHAR(255) NOT NULL,
  url_indice      VARCHAR(255) NULL,
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

CREATE TABLE IF NOT EXISTS obras_temas (
  obra_id   INT UNSIGNED NOT NULL,
  tema_id   INT UNSIGNED NOT NULL,
  ordem     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (obra_id, tema_id),
  KEY idx_obras_temas_ordem (tema_id, ordem),
  CONSTRAINT fk_ot_obra FOREIGN KEY (obra_id) REFERENCES obras (id) ON DELETE CASCADE,
  CONSTRAINT fk_ot_tema FOREIGN KEY (tema_id) REFERENCES temas (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
