import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import TemaCard from './TemaCard.jsx';
import { Carregando, Erro } from './Aviso.jsx';

export default function Galeria({ nivelTitulo: Titulo = 'h2' }) {
  const { dados: temas, erro, carregando, recarregar } = useApi(() => api.temas(), []);

  return (
    <section id="galeria" aria-labelledby="titulo-galeria" className="mx-auto max-w-[1400px] px-4 pt-12 pb-28 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-linha pt-8">
        <Titulo id="titulo-galeria" className="text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
          Galeria
        </Titulo>
        {temas && <p className="text-[15px] text-suave">Escolha um tema para abrir a exposição.</p>}
      </div>

      {carregando && <Carregando texto="Carregando temas" />}
      {erro && <Erro erro={erro} aoTentar={recarregar} />}
      {temas && (
        <div className="mt-14 grid gap-x-12 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-16">
          {temas.map((t) => <TemaCard key={t.slug} tema={t} />)}
        </div>
      )}
    </section>
  );
}
