-- Miniatura de 320 px para o índice de obras dentro da exposição.
-- Uma migration nova, em vez de editar a 002: bancos já criados recebem só esta alteração.
ALTER TABLE obras ADD COLUMN url_indice VARCHAR(255) NULL AFTER url_miniatura;
