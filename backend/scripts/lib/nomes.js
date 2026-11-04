// Extrai a ficha técnica do nome do arquivo.
// Padrão mais comum no acervo: "TÍTULO - TÉCNICA S SUPORTE - DIMENSÕES - ANO.jpg"
// ("S" é abreviação de "sobre"). O que não for reconhecido fica nulo, nunca adivinhado.

const SIGLAS = new Set(['NY', 'MG', 'VW', 'DKW', 'MSP', 'U2', 'MDF', 'D19', 'HQ', 'II', 'III', 'IV', 'RJ', 'SP', 'USA', 'MDF', 'TV']);
const MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'com', 'a', 'o', 'the', 'of', 'and']);

// Palavras que marcam o início da técnica. Comparadas sem acento e em maiúsculas.
const MARCAS_TECNICA = [
  'ACRILIC', 'AEROGRAF', 'AIRBRUSH', 'AQUARELA', 'CANETA', 'DESENHO LAPIS', 'LAPIS', 'NANQUIM',
  'SERIGRAFIA', 'ESMALTE', 'TINTA', 'ECOLINE', 'SUBLIMACAO', 'GRAFITE', 'HIDROCOR', 'TEC MISTA',
  'TECNICA MISTA', 'CAMISA', 'PINTURA', 'DESENHO E ', 'DESENHO S ', 'DESENHOS E ', 'DESENHO BIKE',
  'DESENHOS E FOTOS', 'DESENHO +', 'PROJETOR', 'PROJECAO COM', 'PROJECAO E', 'PINCEL', 'CERA', 'GIZ',
  'DOBRADURA',
];

export const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

export const slugify = (s) =>
  semAcento(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const limparBordas = (s) => s.replace(/^[\s\-–_.,+]+|[\s\-–_.,+]+$/g, '').replace(/\s{2,}/g, ' ');

function caixa(palavra, primeira, modo) {
  const alto = palavra.toUpperCase();
  if (SIGLAS.has(semAcento(alto))) return alto;
  const baixo = palavra.toLowerCase();
  if (modo === 'titulo' && !primeira && MINUSCULAS.has(baixo)) return baixo;
  if (modo === 'frase' && !primeira) return baixo;
  return baixo.charAt(0).toUpperCase() + baixo.slice(1);
}

export const tituloCase = (s) =>
  s.split(/(\s+|-)/).map((p, i) => (/^\s+$|^-$/.test(p) ? p : caixa(p, i === 0, 'titulo'))).join('');

export const fraseCase = (s) =>
  s.split(/(\s+)/).map((p, i) => (/^\s+$/.test(p) ? p : caixa(p, i === 0, 'frase'))).join('');

export function analisarNome(arquivo, anoAtual = new Date().getFullYear()) {
  let s = arquivo.replace(/\.(jpe?g|png|webp)$/i, '').replace(/\.pg$/i, '');
  s = s.replace(/–/g, '-').replace(/_/g, ' ').replace(/\s+/g, ' ');
  const avisos = [];

  // Nome genérico de câmera ou exportação: não há título a extrair
  if (/^(Imagem\d+|IMG \d|Quadros \(\d+\))/i.test(s)) {
    return { nome: 'Sem título', tecnica: null, suporte: null, dimensoes_cm: null, ano: null, avisos: ['nome genérico'] };
  }

  // Ano: o último número de 4 dígitos é o ano da obra ("FUSCA 1960 … 2023" → 2023).
  // Os anteriores fazem parte do título.
  let ano = null;
  const anos = [...s.matchAll(/(?<!\d)(19\d\d|2\d\d\d)(?!\d)/g)];
  if (anos.length) {
    const ultimo = anos.at(-1);
    const valor = Number(ultimo[1]);
    if (valor >= 1940 && valor <= anoAtual) ano = valor;
    else avisos.push(`ano inválido (${valor})`);
    s = s.slice(0, ultimo.index) + ' ' + s.slice(ultimo.index + ultimo[0].length);
  }

  // Dimensões em cm ("70X90", "29,7X42") ou formato de papel (A3, A4)
  let dimensoes = null;
  const dim = s.match(/(?<![\d,])(\d{2,3}(?:,\d+)?)\s*[xX]\s*(\d{2,3}(?:,\d+)?)(?!\d)/);
  if (dim) {
    dimensoes = `${dim[1]} × ${dim[2]} cm`;
    s = s.replace(dim[0], ' ');
  } else {
    const papel = s.match(/\bA([345])\b/);
    if (papel) { dimensoes = `A${papel[1]}`; s = s.replace(papel[0], ' '); }
  }

  // Técnica: a partir da primeira palavra-marca encontrada
  const busca = semAcento(s).toUpperCase();
  let corte = -1;
  for (const marca of MARCAS_TECNICA) {
    const i = busca.indexOf(marca);
    if (i > 0 && (corte === -1 || i < corte)) corte = i;
  }
  let titulo = corte === -1 ? s : s.slice(0, corte);
  let resto = corte === -1 ? '' : s.slice(corte);
  titulo = limparBordas(titulo).replace(/\s*-\s*/g, ' – ');
  resto = limparBordas(resto);

  let tecnica = null;
  let suporte = null;
  if (resto) {
    if (/^CAMISA/i.test(resto)) {
      suporte = resto;
    } else {
      const partes = resto.split(/\s(?:S|SOBRE|EM)\s/i);
      tecnica = limparBordas(partes[0]);
      suporte = partes.length > 1 ? limparBordas(partes.slice(1).join(' ')) : null;
    }
  }
  if (!titulo) { titulo = limparBordas(s); avisos.push('título não identificado'); }

  return {
    nome: tituloCase(titulo.replace(/\s*–\s*$/, '')),
    tecnica: tecnica ? fraseCase(tecnica.replace(/\s*\+\s*/g, ' + ').replace(/\s*-\s*/g, ', ')) : null,
    suporte: suporte ? fraseCase(suporte.replace(/\s*-\s*/g, ' ')) : null,
    dimensoes_cm: dimensoes,
    ano,
    avisos,
  };
}

export function textoAlternativo({ nome, tecnica, suporte, ano }) {
  const material = [tecnica, suporte && (tecnica ? `sobre ${suporte.toLowerCase()}` : suporte)].filter(Boolean).join(' ');
  return [nome, material, ano].filter(Boolean).join(', ') + '. Obra de Paulo Canuto.';
}
