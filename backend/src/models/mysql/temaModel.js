// Acesso à tabela `temas` no MySQL. Só SQL aqui: nenhuma regra de negócio.
// Os "?" são parâmetros: o mysql2 escapa os valores, o que impede injeção de SQL.
import { getPool } from '../../config/db.js';

const CAMPOS = `
  t.id, t.tema_pai_id, t.titulo, t.descricao, t.slug, t.imagem_capa, t.ordem,
  COUNT(ot.obra_id) AS total_obras, MIN(o.ano) AS ano_inicial, MAX(o.ano) AS ano_final`;
const JUNCOES = `
  FROM temas t
  LEFT JOIN obras_temas ot ON ot.tema_id = t.id
  LEFT JOIN obras o ON o.id = ot.obra_id`;

export async function listar() {
  const [linhas] = await getPool().query(`SELECT ${CAMPOS} ${JUNCOES} GROUP BY t.id ORDER BY t.ordem`);
  return linhas;
}

export async function buscarPorId(id) {
  const [[linha]] = await getPool().execute(`SELECT ${CAMPOS} ${JUNCOES} WHERE t.id = ? GROUP BY t.id`, [id]);
  return linha ?? null;
}

export async function buscarPorSlug(slug) {
  const [[linha]] = await getPool().execute(`SELECT ${CAMPOS} ${JUNCOES} WHERE t.slug = ? GROUP BY t.id`, [slug]);
  return linha ?? null;
}
