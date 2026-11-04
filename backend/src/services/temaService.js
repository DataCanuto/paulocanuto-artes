// Regras de negócio dos temas: montar a hierarquia tema → subtemas, completar URLs,
// e transformar "não encontrado" num erro que o middleware converte em 404.
import { temaModel, obraModel } from '../models/index.js';
import { HttpError } from '../middlewares/errorHandler.js';
import { urlMidia, formatarObra } from './obraService.js';

const formatarTema = (t) => ({
  id: t.id,
  slug: t.slug,
  titulo: t.titulo,
  descricao: t.descricao,
  imagem_capa: urlMidia(t.imagem_capa),
  ordem: t.ordem,
  tema_pai_id: t.tema_pai_id,
  total_obras: Number(t.total_obras),
  ano_inicial: t.ano_inicial,
  ano_final: t.ano_final,
});

export async function listarTemas() {
  const todos = (await temaModel.listar()).map(formatarTema);
  // Devolve só os temas principais; os subtemas vêm dentro do tema pai
  return todos
    .filter((t) => !t.tema_pai_id)
    .map((t) => ({ ...t, subtemas: todos.filter((s) => s.tema_pai_id === t.id) }));
}

// Aceita o id numérico ou o slug ("carros")
export async function buscarTema(chave) {
  const tema = /^\d+$/.test(chave) ? await temaModel.buscarPorId(Number(chave)) : await temaModel.buscarPorSlug(chave);
  if (!tema) throw new HttpError(404, `Tema "${chave}" não encontrado.`);
  const formatado = formatarTema(tema);
  const todos = (await temaModel.listar()).map(formatarTema);
  return {
    ...formatado,
    pai: todos.find((t) => t.id === formatado.tema_pai_id) ?? null,
    subtemas: todos.filter((t) => t.tema_pai_id === formatado.id),
  };
}

export async function listarObrasDoTema(chave) {
  const tema = await buscarTema(chave);
  const obras = await obraModel.listarPorTema(tema.id);
  return { tema, obras: obras.map(formatarObra) };
}
