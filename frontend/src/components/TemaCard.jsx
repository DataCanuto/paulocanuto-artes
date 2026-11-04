import { Link, useLocation } from 'react-router-dom';
import { periodo, quantidade } from '../utils/formatar.js';

export default function TemaCard({ tema }) {
  const local = useLocation();
  const meta = [quantidade(tema.total_obras, 'obra', 'obras'), periodo(tema.ano_inicial, tema.ano_final)].filter(Boolean).join(', ');

  return (
    <article className="group relative">
      {/* A capa é mostrada na proporção da obra, centralizada numa área fixa: como obras de
          formatos diferentes penduradas na mesma linha. */}
      <div className="flex h-64 items-center justify-center md:h-72">
        {tema.imagem_capa && (
          <img
            src={tema.imagem_capa}
            alt=""
            loading="lazy"
            className="pendurada max-h-full max-w-full object-contain transition-transform duration-300 group-hover:-translate-y-1.5"
          />
        )}
      </div>
      <h3 className="mt-6 text-xl font-bold tracking-tight">
        {/* O link cobre o cartão inteiro (::after), mas o texto acessível é só o título */}
        <Link
          to={`/galeria/${tema.slug}`}
          state={{ fundo: local }}
          className="decoration-caneta decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
        >
          {tema.titulo}
        </Link>
      </h3>
      <p className="mt-1 text-[15px] text-suave">{meta}</p>
      {tema.subtemas?.length > 0 && (
        <p className="relative z-10 mt-2 text-[15px]">
          <span className="text-suave">Subtemas: </span>
          {tema.subtemas.map((s, i) => (
            <span key={s.slug}>
              {i > 0 && ', '}
              <Link to={`/galeria/${s.slug}`} state={{ fundo: local }} className="border-b border-caneta/40 hover:border-caneta">
                {s.titulo}
              </Link>
              <span className="text-suave"> ({s.total_obras})</span>
            </span>
          ))}
        </p>
      )}
    </article>
  );
}
