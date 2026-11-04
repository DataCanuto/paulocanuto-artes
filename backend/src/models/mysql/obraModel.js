// Acesso às tabelas `obras` e `obras_temas` no MySQL.
import { getPool } from '../../config/db.js';

const CAMPOS = `o.id, o.nome, o.url, o.url_miniatura, o.url_indice, o.largura, o.altura,
  o.tecnica, o.suporte, o.dimensoes_cm, o.ano, o.descricao_alt`;

export async function listar({ limite, offset }) {
  const pool = getPool();
  const [itens] = await pool.execute(
    `SELECT ${CAMPOS} FROM obras o ORDER BY o.id LIMIT ? OFFSET ?`,
    [String(limite), String(offset)],
  );
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM obras');
  return { itens, total };
}

export async function buscarPorId(id) {
  const pool = getPool();
  const [[obra]] = await pool.execute(`SELECT ${CAMPOS} FROM obras o WHERE o.id = ?`, [id]);
  if (!obra) return null;
  const [temas] = await pool.execute(
    `SELECT t.id, t.slug, t.titulo FROM obras_temas ot JOIN temas t ON t.id = ot.tema_id
     WHERE ot.obra_id = ? ORDER BY t.ordem`,
    [id],
  );
  return { ...obra, temas };
}

// Candidatas à abertura do site: obras com tamanho físico conhecido e imagem de boa resolução,
// com o tema principal a que pertencem. A escolha final (critério curatorial) fica no service.
export async function listarCandidatasDestaque(ladoMinimoPx) {
  const [linhas] = await getPool().execute(
    `SELECT ${CAMPOS}, t.slug AS tema_slug, t.titulo AS tema_titulo, t.ordem AS tema_ordem
     FROM obras_temas ot
     JOIN obras o ON o.id = ot.obra_id
     JOIN temas t ON t.id = ot.tema_id
     WHERE t.tema_pai_id IS NULL AND o.dimensoes_cm IS NOT NULL AND GREATEST(o.largura, o.altura) >= ?`,
    [ladoMinimoPx],
  );
  return linhas;
}

export async function listarPorTema(temaId) {
  const [linhas] = await getPool().execute(
    `SELECT ${CAMPOS} FROM obras_temas ot JOIN obras o ON o.id = ot.obra_id
     WHERE ot.tema_id = ? ORDER BY ot.ordem`,
    [temaId],
  );
  return linhas;
}
