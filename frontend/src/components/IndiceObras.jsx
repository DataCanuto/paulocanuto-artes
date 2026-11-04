import { useEffect, useRef } from 'react';

// Índice de miniaturas da exposição.
// Em telas largas é uma coluna lateral que empurra o livro (a altura, que é o que limita o livro,
// continua inteira). No celular, em pé ou deitado, vira uma camada sobre o livro e fecha ao escolher.
export default function IndiceObras({ obras, visiveis, aberto, aoEscolher, aoFechar }) {
  const lista = useRef(null);
  const [de, ate] = visiveis;

  // Mantém a obra atual à vista dentro do índice enquanto o visitante folheia
  useEffect(() => {
    if (!aberto) return;
    lista.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [aberto, de]);

  return (
    <aside
      id="indice-obras"
      aria-label="Índice de obras"
      hidden={!aberto}
      className="absolute inset-0 z-20 flex min-h-0 flex-col bg-sala larga:static larga:z-auto larga:w-[19rem] larga:shrink-0 larga:border-r larga:border-white/10 lg:larga:w-[21rem]"
    >
      <div className="flex items-center justify-between px-4 pt-2 pb-3 text-[13px] text-white/55">
        <span>{obras.length} obras</span>
        <button type="button" onClick={aoFechar} className="min-h-11 rounded-full px-3 hover:bg-white/10 hover:text-white larga:hidden">
          Voltar ao livro
        </button>
      </div>
      <ol ref={lista} className="grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-2 overflow-y-auto overscroll-contain px-4 pb-4 baixa:grid-cols-6 sm:baixa:grid-cols-8">
        {obras.map((o, i) => {
          const pagina = i + 1; // a página 0 é a folha de rosto
          const atual = pagina === de || pagina === ate;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => aoEscolher(pagina)}
                aria-current={atual ? 'true' : undefined}
                aria-label={`${i + 1}. ${o.nome}${o.ano ? `, ${o.ano}` : ''}`}
                title={o.nome}
                className={`group relative block aspect-square w-full rounded-sm bg-white/[0.04] p-1.5 transition-colors hover:bg-white/10 ${atual ? 'outline-2 outline-offset-1 outline-[#8ea2ff]' : ''}`}
              >
                {/* Miniatura inteira (contain), nunca recortada, como no livro */}
                <img
                  src={o.url_indice}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={o.largura}
                  height={o.altura}
                  className="h-full w-full object-contain opacity-80 transition-opacity group-hover:opacity-100"
                />
                <span className="absolute right-1 bottom-0.5 text-[10px] text-white/45 tabular-nums">{i + 1}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
