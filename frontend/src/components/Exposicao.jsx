import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import { useFlipbook } from '../hooks/useFlipbook.js';
import { Carregando, Erro } from './Aviso.jsx';
import IndiceObras from './IndiceObras.jsx';
import { periodo, quantidade } from '../utils/formatar.js';

const Icone = ({ d }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const SETA_ESQ = 'M15 18l-6-6 6-6';
const SETA_DIR = 'M9 18l6-6-6-6';
const FECHAR = 'M6 6l12 12M18 6L6 18';
const GRADE = 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z';

// Lembra se o visitante deixou o índice aberto (preferência só deste navegador)
const CHAVE_INDICE = 'pc-galeria:indice-aberto';
const lerPreferencia = () => { try { return localStorage.getItem(CHAVE_INDICE) === '1'; } catch { return false; } };
const salvarPreferencia = (v) => { try { localStorage.setItem(CHAVE_INDICE, v ? '1' : '0'); } catch { /* sem armazenamento */ } };
// Mesmo critério da variante "larga" do CSS: com espaço, o índice é coluna; sem espaço, é camada
const indiceEmColuna = () => window.matchMedia('(min-width: 640px) and (min-height: 501px)').matches;

const botao = 'inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] text-white/85 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30';

export default function Exposicao() {
  const { slug } = useParams();
  const [busca] = useSearchParams();
  const local = useLocation();
  const navegar = useNavigate();
  const dialogo = useRef(null);
  const { dados, erro, carregando, recarregar } = useApi(() => api.obrasDoTema(slug), [slug]);
  // Onde o índice cobre o livro (celular), ele sempre começa fechado
  const [indiceAberto, setIndiceAberto] = useState(() => lerPreferencia() && indiceEmColuna());
  const alternarIndice = useCallback((valor) => {
    setIndiceAberto((atual) => {
      const novo = typeof valor === 'boolean' ? valor : !atual;
      if (indiceEmColuna()) salvarPreferencia(novo);
      return novo;
    });
  }, []);

  // Volta para onde o visitante estava (início ou galeria); num link aberto direto, vai para a galeria
  const fechar = useCallback(() => {
    if (local.state?.fundo) navegar(-1);
    else navegar('/galeria', { replace: true });
  }, [local.state, navegar]);

  // Elemento que abriu a exposição. Lido na primeira renderização: logo depois o fundo
  // vira "inert" e o navegador tira o foco dele.
  const [origem] = useState(() => document.activeElement);

  // Trava a rolagem da página de fundo e devolve o foco a quem abriu a exposição
  useEffect(() => {
    const anterior = origem;
    document.body.style.overflow = 'hidden';
    dialogo.current?.focus();
    return () => {
      document.body.style.overflow = '';
      // Espera o fundo deixar de ser "inert" antes de devolver o foco
      requestAnimationFrame(() => anterior?.focus?.());
    };
  }, [origem]);

  const titulo = dados?.tema.titulo ?? '';

  return (
    <div
      ref={dialogo}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-exposicao"
      tabIndex={-1}
      className="na-sala fixed inset-0 z-50 flex flex-col bg-sala text-white outline-none"
      onKeyDown={(e) => prenderFoco(e, dialogo.current)}
    >
      <header className="flex items-center justify-between gap-4 px-2 py-2 sm:px-5 sm:py-3 baixa:py-0.5">
        <button type="button" onClick={fechar} className={botao}>
          <Icone d={SETA_ESQ} />
          Galeria
        </button>
        <div className="min-w-0 text-center">
          <h2 id="titulo-exposicao" className="truncate text-[17px] font-bold tracking-tight">
            {dados?.tema.pai && <span className="font-normal text-white/55">{dados.tema.pai.titulo} / </span>}
            {titulo}
          </h2>
          {dados && (
            <p className="hidden text-[13px] text-white/55 sm:block baixa:hidden">
              {[quantidade(dados.obras.length, 'obra', 'obras'), periodo(dados.tema.ano_inicial, dados.tema.ano_final)].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center">
          {/* No celular o índice abre por aqui; em telas largas, pela seta na lateral do livro */}
          {dados && (
            <button
              type="button"
              onClick={() => alternarIndice()}
              aria-expanded={indiceAberto}
              aria-controls="indice-obras"
              aria-label="Todas as obras"
              className={`${botao} px-3 larga:hidden`}
            >
              <Icone d={GRADE} />
            </button>
          )}
          <button type="button" onClick={fechar} className={`${botao} px-3`} aria-label="Fechar exposição">
            <Icone d={FECHAR} />
          </button>
        </div>
      </header>

      {carregando && <div className="flex flex-1 justify-center"><Carregando texto="Carregando exposição" claro /></div>}
      {erro && <div className="flex flex-1 justify-center px-6"><Erro erro={erro} aoTentar={recarregar} claro /></div>}
      {dados && (
        <Livro
          key={slug}
          obras={dados.obras}
          tema={dados.tema}
          obraInicial={Number(busca.get('obra')) || null}
          aoFechar={fechar}
          indiceAberto={indiceAberto}
          alternarIndice={alternarIndice}
        />
      )}
    </div>
  );
}

function Livro({ obras, tema, obraInicial, aoFechar, indiceAberto, alternarIndice }) {
  const indiceObra = obraInicial ? obras.findIndex((o) => o.id === obraInicial) : -1;
  const livro = useFlipbook({ obras, tema, paginaInicial: indiceObra >= 0 ? indiceObra + 1 : 0 });
  const { proxima, anterior, irPara, visiveis, total, noInicio, noFim } = livro;

  // Teclado: setas viram as páginas; Esc fecha o índice (no celular) ou a exposição
  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); proxima(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
      else if (e.key === 'Escape') {
        e.preventDefault();
        if (indiceAberto && !indiceEmColuna()) alternarIndice(false);
        else aoFechar();
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [proxima, anterior, aoFechar, indiceAberto, alternarIndice]);

  // Escolher uma miniatura: no celular o índice fecha primeiro, para o visitante ver a página virar
  const escolher = (pagina) => {
    if (!indiceEmColuna()) {
      alternarIndice(false);
      setTimeout(() => irPara(pagina), 80);
    } else {
      irPara(pagina);
    }
  };

  // O contador usa o número da obra, o mesmo impresso no canto de cada página
  const [de, ate] = visiveis;
  const numeros = [de, ate].filter((i, n, arr) => i > 0 && arr.indexOf(i) === n);
  const contador = numeros.length === 0
    ? 'Folha de rosto'
    : `${numeros.length === 1 ? 'Obra' : 'Obras'} ${numeros.join(' e ')} de ${obras.length}`;
  const obrasVisiveis = numeros.map((i) => obras[i - 1].nome);

  return (
    <div className="relative flex min-h-0 flex-1">
      <IndiceObras
        obras={obras}
        visiveis={visiveis}
        aberto={indiceAberto}
        aoEscolher={escolher}
        aoFechar={() => alternarIndice(false)}
      />

      {/* Seta discreta na borda esquerda: abre e fecha o índice em telas largas */}
      <button
        type="button"
        onClick={() => alternarIndice()}
        aria-expanded={indiceAberto}
        aria-controls="indice-obras"
        aria-label={indiceAberto ? 'Esconder índice de obras' : 'Mostrar índice de obras'}
        title={indiceAberto ? 'Esconder índice' : 'Índice de obras'}
        className="hidden w-8 shrink-0 items-center justify-center text-white/40 transition-colors hover:bg-white/5 hover:text-white larga:flex"
      >
        <Icone d={indiceAberto ? SETA_ESQ : SETA_DIR} />
      </button>

      {/* Em telas baixas o rodapé "se desfaz" (display: contents) e seus itens entram numa grade:
          botões nas laterais do livro e contador numa linha fina embaixo. Os mesmos elementos,
          só reposicionados, então o leitor de tela e o teclado continuam iguais. */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col baixa:grid baixa:grid-cols-[auto_minmax(0,1fr)_auto] baixa:grid-rows-[minmax(0,1fr)_auto]">
      <div ref={livro.palcoRef} className="relative min-h-0 flex-1 px-3 py-2 sm:px-8 sm:py-4 baixa:col-start-2 baixa:row-start-1 baixa:px-1 baixa:py-1">
        <div ref={livro.hostRef} className="flex h-full w-full items-center justify-center" />
      </div>
      <footer className="flex items-center justify-between gap-2 px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:justify-center sm:gap-10 sm:px-5 sm:pb-5 baixa:contents">
        <button type="button" onClick={anterior} disabled={noInicio} className={`${botao} baixa:col-start-1 baixa:row-start-1 baixa:self-center baixa:px-3`}>
          <Icone d={SETA_ESQ} />
          <span className="baixa:sr-only">Anterior</span>
        </button>
        <p className="text-[14px] text-white/70 tabular-nums baixa:col-span-3 baixa:row-start-2 baixa:pb-1 baixa:text-center baixa:text-[12px]" aria-live="polite">
          {contador}
          <span className="sr-only">{obrasVisiveis.length ? `: ${obrasVisiveis.join(' e ')}` : ': folha de rosto'}</span>
        </p>
        <button type="button" onClick={proxima} disabled={noFim} className={`${botao} baixa:col-start-3 baixa:row-start-1 baixa:self-center baixa:px-3`}>
          <span className="baixa:sr-only">Próxima</span>
          <Icone d={SETA_DIR} />
        </button>
      </footer>
      </div>
    </div>
  );
}

// Mantém o Tab dentro do diálogo enquanto ele estiver aberto
function prenderFoco(e, raiz) {
  if (e.key !== 'Tab' || !raiz) return;
  const focaveis = [...raiz.querySelectorAll('button:not([disabled]), a[href]')];
  if (!focaveis.length) return;
  const primeiro = focaveis[0];
  const ultimo = focaveis.at(-1);
  if (e.shiftKey && (document.activeElement === primeiro || document.activeElement === raiz)) { e.preventDefault(); ultimo.focus(); }
  else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
}
