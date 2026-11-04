import { obraModel } from '../models/index.js';
import { HttpError } from '../middlewares/errorHandler.js';
import { config } from '../config/env.js';

// O banco guarda caminhos relativos ("obras/abc-1600.webp"); o endereço base muda entre ambientes
export const urlMidia = (caminho) => (caminho ? `${config.mediaBaseUrl}/${caminho}` : null);

const orientacao = (l, a) => {
  const r = l / a;
  if (r > 1.9) return 'panoramica';
  if (r > 1.05) return 'paisagem';
  if (r >= 0.95) return 'quadrada';
  return 'retrato';
};

export const formatarObra = (o) => ({
  ...o,
  url: urlMidia(o.url),
  url_miniatura: urlMidia(o.url_miniatura),
  url_indice: urlMidia(o.url_indice ?? o.url_miniatura),
  orientacao: orientacao(o.largura, o.altura),
});

// ---------- Destaques da abertura ----------
// Critério: qualidade primeiro (imagem com pelo menos 1400 px no lado maior),
// depois tamanho físico (as maiores obras). Uma por tema, para mostrar a variedade do acervo.
const LADO_MINIMO_PX = 1400;
const MAXIMO_DESTAQUES = 8;
const PAPEL_CM = { A3: [29.7, 42], A4: [21, 29.7], A5: [14.8, 21] };

const ladosCm = (d) => PAPEL_CM[d] ?? d?.match(/[\d,]+/g)?.map((n) => Number(n.replace(',', '.')));

// Medidas reais em cm, orientadas pela proporção da imagem ("70 × 90 cm" ou "A3")
export function medidasCm({ dimensoes_cm: d, largura, altura }) {
  const lados = ladosCm(d);
  if (!lados || lados.length < 2) return null;
  const maior = Math.max(...lados);
  const proporcao = largura / altura;
  return proporcao >= 1
    ? { largura: maior, altura: +(maior / proporcao).toFixed(1) }
    : { largura: +(maior * proporcao).toFixed(1), altura: maior };
}

export async function listarDestaques() {
  const candidatas = (await obraModel.listarCandidatasDestaque(LADO_MINIMO_PX))
    .map((o) => ({ ...o, medidas_cm: medidasCm(o) }))
    .filter((o) => o.medidas_cm);
  // Área declarada na ficha (ex.: 80 × 100 cm); em empate, vence a imagem de maior resolução
  const area = (o) => ladosCm(o.dimensoes_cm).slice(0, 2).reduce((a, b) => a * b, 1);
  const melhorPorTema = new Map();
  for (const o of candidatas.sort((a, b) => area(b) - area(a) || b.largura * b.altura - a.largura * a.altura)) {
    if (!melhorPorTema.has(o.tema_slug)) melhorPorTema.set(o.tema_slug, o);
  }
  return [...melhorPorTema.values()]
    .slice(0, MAXIMO_DESTAQUES)
    .sort((a, b) => a.tema_ordem - b.tema_ordem)
    .map(({ tema_ordem, ...o }) => formatarObra(o));
}

export async function listarObras({ limite, offset }) {
  const { itens, total } = await obraModel.listar({ limite, offset });
  return { itens: itens.map(formatarObra), total: Number(total), limite, offset };
}

export async function buscarObra(id) {
  const obra = await obraModel.buscarPorId(id);
  if (!obra) throw new HttpError(404, `Obra ${id} não encontrada.`);
  return formatarObra(obra);
}
