// Implementação alternativa dos models, lendo database/catalogo.json em vez do MySQL.
// Mesmas funções e mesmo formato de retorno dos models MySQL: o resto da API não percebe a diferença.
// Serve para rodar o site sem MySQL instalado e para os testes automatizados.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ARQUIVO = path.resolve(import.meta.dirname, '../../../database/catalogo.json');
let dados;

function carregar() {
  if (dados) return dados;
  const c = JSON.parse(readFileSync(ARQUIVO, 'utf8'));
  const temas = c.temas.map((t, i) => ({ ...t, id: i + 1 }));
  const idPorSlug = new Map(temas.map((t) => [t.slug, t.id]));
  const obras = c.obras.map((o, i) => ({ ...o, id: i + 1 }));
  for (const t of temas) {
    t.tema_pai_id = t.pai ? idPorSlug.get(t.pai) : null;
    t.descricao = t.descricao ?? null;
    const anos = obras.filter((o) => o.temas.some((x) => x.slug === t.slug) && o.ano).map((o) => o.ano);
    t.ano_inicial = anos.length ? Math.min(...anos) : null;
    t.ano_final = anos.length ? Math.max(...anos) : null;
  }
  dados = { temas, obras };
  return dados;
}

const camposTema = ({ id, tema_pai_id, titulo, descricao, slug, imagem_capa, ordem, total_obras, ano_inicial, ano_final }) =>
  ({ id, tema_pai_id, titulo, descricao, slug, imagem_capa, ordem, total_obras, ano_inicial, ano_final });

const camposObra = ({ id, nome, url, url_miniatura, url_indice, largura, altura, tecnica, suporte, dimensoes_cm, ano, descricao_alt }) =>
  ({ id, nome, url, url_miniatura, url_indice: url_indice ?? null, largura, altura, tecnica, suporte, dimensoes_cm, ano, descricao_alt });

export const temaModel = {
  async listar() { return carregar().temas.map(camposTema); },
  async buscarPorId(id) { const t = carregar().temas.find((x) => x.id === id); return t ? camposTema(t) : null; },
  async buscarPorSlug(slug) { const t = carregar().temas.find((x) => x.slug === slug); return t ? camposTema(t) : null; },
};

export const obraModel = {
  async listar({ limite, offset }) {
    const { obras } = carregar();
    return { itens: obras.slice(offset, offset + limite).map(camposObra), total: obras.length };
  },
  async buscarPorId(id) {
    const { obras, temas } = carregar();
    const o = obras.find((x) => x.id === id);
    if (!o) return null;
    const vinculos = temas.filter((t) => o.temas.some((x) => x.slug === t.slug)).map(({ id: i, slug, titulo }) => ({ id: i, slug, titulo }));
    return { ...camposObra(o), temas: vinculos };
  },
  async listarCandidatasDestaque(ladoMinimoPx) {
    const { obras, temas } = carregar();
    return temas
      .filter((t) => !t.pai)
      .flatMap((t) => obras
        .filter((o) => o.dimensoes_cm && Math.max(o.largura, o.altura) >= ladoMinimoPx && o.temas.some((x) => x.slug === t.slug))
        .map((o) => ({ ...camposObra(o), tema_slug: t.slug, tema_titulo: t.titulo, tema_ordem: t.ordem })));
  },
  async listarPorTema(temaId) {
    const { obras, temas } = carregar();
    const slug = temas.find((t) => t.id === temaId)?.slug;
    return obras
      .map((o) => ({ o, v: o.temas.find((x) => x.slug === slug) }))
      .filter(({ v }) => v)
      .sort((a, b) => a.v.ordem - b.v.ordem)
      .map(({ o }) => camposObra(o));
  },
};
