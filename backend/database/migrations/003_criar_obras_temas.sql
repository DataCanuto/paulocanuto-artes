-- Uma obra pode estar em vários temas; a ordem de exibição é própria de cada tema.
CREATE TABLE IF NOT EXISTS obras_temas (
  obra_id   INT UNSIGNED NOT NULL,
  tema_id   INT UNSIGNED NOT NULL,
  ordem     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (obra_id, tema_id),
  KEY idx_obras_temas_ordem (tema_id, ordem),
  CONSTRAINT fk_ot_obra FOREIGN KEY (obra_id) REFERENCES obras (id) ON DELETE CASCADE,
  CONSTRAINT fk_ot_tema FOREIGN KEY (tema_id) REFERENCES temas (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
