// Integra a biblioteca page-flip (StPageFlip) ao React.
//
// A page-flip manipula o DOM diretamente (move e transforma as páginas). Se o React também
// controlasse esses elementos, os dois brigariam. Por isso o React entrega apenas um elemento
// vazio (`hostRef`), e este hook cria as páginas com JavaScript puro dentro dele.
// Quando o tamanho da tela muda, o livro é destruído e recriado na mesma página.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageFlip } from 'page-flip';
import { material, medidaEAno, periodo, quantidade } from '../utils/formatar.js';

const CARREGAR_ANTES = 2;
const CARREGAR_DEPOIS = 4;

// Decide entre livro aberto (duas páginas) e uma página por vez, e o tamanho de cada página.
function calcularLayout(palco, aspectoDupla) {
  if (!palco) return null;
  const { w, h } = palco;
  const alturaDupla = Math.min(h, w / (2 * aspectoDupla));
  // Uma página por vez: a página ocupa o palco inteiro (dentro de limites razoáveis de proporção)
  const aspectoSimples = Math.min(Math.max(w / h, 0.6), 1.5);
  const alturaSimples = Math.min(h, w / aspectoSimples);
  const dupla = w >= 600 && alturaDupla >= alturaSimples * 0.8;
  return dupla
    ? { modo: 'dupla', largura: Math.floor(alturaDupla * aspectoDupla), altura: Math.floor(alturaDupla) }
    : { modo: 'simples', largura: Math.floor(alturaSimples * aspectoSimples), altura: Math.floor(alturaSimples) };
}

// Proporção da página no livro aberto: a mediana das obras do tema, limitada para não ficar extrema
function aspectoMediano(obras) {
  const r = obras.map((o) => o.largura / o.altura).sort((a, b) => a - b);
  const mediana = r.length ? r[Math.floor(r.length / 2)] : 0.75;
  return Math.min(Math.max(mediana, 0.7), 1.3);
}

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto) e.textContent = texto; // textContent, nunca innerHTML: nomes vindos do banco não viram HTML
  return e;
}

function criarFolhaDeRosto(tema, total) {
  const p = el('div', 'pagina pagina--rosto');
  const miolo = el('div', 'pagina__miolo');
  if (tema.pai) miolo.append(el('p', 'rosto__pai', tema.pai.titulo));
  miolo.append(el('p', 'rosto__tema', tema.titulo));
  miolo.append(el('p', 'rosto__info', [quantidade(total, 'obra', 'obras'), periodo(tema.ano_inicial, tema.ano_final)].filter(Boolean).join(', ')));
  miolo.append(el('p', 'rosto__artista', 'Paulo Canuto'));
  p.append(miolo);
  return p;
}

function criarPaginaObra(obra, numero) {
  const p = el('div', 'pagina');
  const miolo = el('div', 'pagina__miolo');
  p.dataset.density = 'soft';
  const area = el('div', 'pagina__obra');
  const img = el('img');
  img.alt = obra.descricao_alt ?? obra.nome;
  img.decoding = 'async';
  img.draggable = false;
  img.dataset.src = obra.url;
  img.addEventListener('load', () => area.classList.add('carregada'));
  img.addEventListener('error', () => area.classList.add('carregada'));
  area.append(img);
  const ficha = el('div', 'pagina__ficha');
  ficha.append(el('p', 'titulo', obra.nome));
  for (const linha of [material(obra), medidaEAno(obra)]) if (linha) ficha.append(el('p', 'detalhe', linha));
  miolo.append(area, ficha);
  p.append(miolo, el('span', 'pagina__folio', String(numero)));
  return p;
}

// Só baixa as imagens próximas da página atual (carregamento sob demanda)
function carregarVizinhas(paginas, indice) {
  for (let i = Math.max(0, indice - CARREGAR_ANTES); i <= Math.min(paginas.length - 1, indice + CARREGAR_DEPOIS); i++) {
    const img = paginas[i].querySelector('img[data-src]');
    if (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
  }
}

export function useFlipbook({ obras, tema, paginaInicial = 0, aoMudarPagina }) {
  const palcoRef = useRef(null);
  const hostRef = useRef(null);
  const livro = useRef(null);
  const atual = useRef(paginaInicial);
  const [palco, setPalco] = useState(null);
  const [estado, setEstado] = useState({ pagina: paginaInicial, total: obras.length + 1, modo: 'simples' });
  const reduzirMovimento = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const aoMudar = useRef(aoMudarPagina);
  aoMudar.current = aoMudarPagina;

  // Mede o palco; espera o redimensionamento parar antes de recriar o livro
  useEffect(() => {
    let espera;
    const obs = new ResizeObserver(([entrada]) => {
      clearTimeout(espera);
      espera = setTimeout(() => {
        const { width, height } = entrada.contentRect;
        setPalco((p) => (p && Math.abs(p.w - width) < 8 && Math.abs(p.h - height) < 8 ? p : { w: width, h: height }));
      }, 120);
    });
    obs.observe(palcoRef.current);
    return () => { obs.disconnect(); clearTimeout(espera); };
  }, []);

  const layout = useMemo(() => calcularLayout(palco, aspectoMediano(obras)), [palco, obras]);

  useEffect(() => {
    if (!layout || !hostRef.current) return;
    const raiz = el('div');
    hostRef.current.append(raiz);
    const paginas = [criarFolhaDeRosto(tema, obras.length), ...obras.map((o, i) => criarPaginaObra(o, i + 1))];
    paginas.forEach((p, i) => {
      p.classList.add(layout.modo === 'simples' ? 'pagina--unica' : i % 2 === 0 ? 'pagina--esquerda' : 'pagina--direita');
      raiz.append(p);
    });
    // Na page-flip, o livro fica em modo "retrato" (uma página) quando a largura disponível é menor que duas páginas
    raiz.style.width = `${layout.modo === 'dupla' ? layout.largura * 2 : layout.largura}px`;

    const flip = new PageFlip(raiz, {
      width: layout.largura,
      height: layout.altura,
      size: 'fixed',
      usePortrait: true,
      showCover: false,
      autoSize: true,
      drawShadow: true,
      maxShadowOpacity: 0.35,
      flippingTime: reduzirMovimento ? 1 : 750,
      mobileScrollSupport: false,
      swipeDistance: 30,
      showPageCorners: !reduzirMovimento,
      startPage: Math.min(atual.current, paginas.length - 1),
    });
    flip.loadFromHTML(paginas);

    const sincronizar = (indice) => {
      atual.current = indice;
      carregarVizinhas(paginas, indice);
      setEstado({ pagina: indice, total: paginas.length, modo: layout.modo });
      aoMudar.current?.(indice);
    };
    flip.on('flip', (e) => sincronizar(e.data));
    sincronizar(flip.getCurrentPageIndex());
    livro.current = flip;

    return () => {
      livro.current = null;
      flip.destroy(); // remove também o elemento raiz criado acima
    };
  }, [layout, obras, tema, reduzirMovimento]);

  // Com "reduzir movimento" ativado no sistema, a página troca sem a animação de folhear
  const proxima = useCallback(() => {
    const f = livro.current;
    if (f) reduzirMovimento ? f.turnToNextPage() : f.flipNext();
  }, [reduzirMovimento]);

  const anterior = useCallback(() => {
    const f = livro.current;
    if (f) reduzirMovimento ? f.turnToPrevPage() : f.flipPrev();
  }, [reduzirMovimento]);

  // Vai direto a uma página com uma única virada animada (a page-flip pula as intermediárias)
  const irPara = useCallback((indice) => {
    const f = livro.current;
    if (!f) return;
    const passoAtual = f.getOrientation() === 'landscape' ? 2 : 1;
    const inicio = f.getCurrentPageIndex();
    if (indice >= inicio && indice < inicio + passoAtual) return; // já está à vista
    reduzirMovimento ? f.turnToPage(indice) : f.flip(indice);
  }, [reduzirMovimento]);

  // Índices das páginas visíveis agora (duas no livro aberto)
  const passo = estado.modo === 'dupla' ? 2 : 1;
  const visiveis = [estado.pagina, Math.min(estado.pagina + passo - 1, estado.total - 1)];

  return {
    palcoRef,
    hostRef,
    proxima,
    anterior,
    irPara,
    visiveis,
    total: estado.total,
    noInicio: estado.pagina <= 0,
    noFim: estado.pagina + passo >= estado.total,
  };
}
