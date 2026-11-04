import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import { material, medidaEAno } from '../utils/formatar.js';

export default function Hero() {
  const local = useLocation();
  const destaques = useApi(() => api.destaques(), []);
  const temas = useApi(() => api.temas(), []);
  const total = useApi(() => api.totalObras(), []);

  const anos = (temas.dados ?? []).flatMap((t) => [t.ano_inicial, t.ano_final]).filter(Boolean);
  // A API já entrega as medidas reais em cm (medidas_cm), orientadas pela proporção da imagem
  const obras = (destaques.dados ?? []).map((o) => ({ ...o, cm: { l: o.medidas_cm.largura, a: o.medidas_cm.altura } }));
  const alturaMaxima = Math.max(0, ...obras.map((o) => o.cm.a));

  return (
    <section aria-labelledby="titulo-hero" className="pb-20">
      <div className="mx-auto max-w-[1400px] px-4 pt-14 sm:px-8 md:pt-24">
        <h1 id="titulo-hero" className="text-[clamp(3.4rem,12vw,10rem)] leading-[0.86] font-extrabold tracking-[-0.05em]">
          Paulo Canuto
        </h1>
        <div className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[34ch] text-lg leading-snug text-suave md:text-xl">
            Pintura, aerografia, desenho, serigrafia e dobradura.
            {total.dados && anos.length > 0 && (
              <> {total.dados} obras feitas entre {Math.min(...anos)} e {Math.max(...anos)}, reunidas em {temas.dados.length} temas.</>
            )}
          </p>
          <Link to="/galeria" className="self-start border-b-2 border-caneta pb-1 text-lg font-bold md:self-auto">
            Ver a galeria
          </Link>
        </div>
      </div>

      {/* A parede: uma obra de cada tema, em escala real relativa entre si,
          penduradas com o centro na mesma linha, como numa montagem de galeria. */}
      {obras.length > 0 && (
        <div className="mt-16 md:mt-24">
          <ul
            aria-label="Obras em destaque, em tamanho proporcional ao original"
            className="flex snap-x snap-mandatory scroll-px-4 sm:scroll-px-8 gap-[max(2.5rem,5vw)] overflow-x-auto px-4 pb-6 sm:px-8"
          >
            {obras.map((o) => (
              <li key={o.id} className="shrink-0 snap-start" style={{ width: `max(9rem, calc(var(--cm) * ${o.cm.l.toFixed(1)}))` }}>
                <Link
                  to={`/galeria/${o.tema_slug}?obra=${o.id}`}
                  state={{ fundo: local }}
                  className="group block"
                >
                  <div className="flex items-center" style={{ height: `calc(var(--cm) * ${alturaMaxima.toFixed(1)})` }}>
                    <img
                      src={o.url_miniatura}
                      alt={o.descricao_alt}
                      width={o.largura}
                      height={o.altura}
                      loading="lazy"
                      className="pendurada block h-auto transition-transform duration-300 group-hover:-translate-y-1"
                      style={{ width: `calc(var(--cm) * ${o.cm.l.toFixed(1)})` }}
                    />
                  </div>
                  <div className="mt-5 text-[13px] leading-snug">
                    <p className="font-bold group-hover:text-caneta">{o.nome}</p>
                    <p className="text-suave">{material(o)}</p>
                    <p className="text-suave">{medidaEAno(o)}</p>
                    <p className="mt-1 text-suave">{o.tema_titulo}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
