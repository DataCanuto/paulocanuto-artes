import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Galeria from './components/Galeria.jsx';
import Exposicao from './components/Exposicao.jsx';

// A exposição abre como modal por cima da página em que o visitante estava.
// O link guarda essa página em `state.fundo`; num endereço aberto diretamente
// (ex.: /galeria/carros compartilhado), o fundo é a galeria.
export default function App() {
  const local = useLocation();
  const fundo = local.state?.fundo;
  const abrindoExposicao = /^\/galeria\/[^/]+/.test(local.pathname);
  const paginaDeFundo = fundo ?? (abrindoExposicao ? { ...local, pathname: '/galeria' } : local);

  return (
    <>
      {/* inert: com a exposição aberta, o fundo não recebe foco nem cliques */}
      <div inert={abrindoExposicao}>
        <Header />
        <main>
          <Routes location={paginaDeFundo}>
            <Route path="/" element={<><Hero /><Galeria /></>} />
            <Route path="/galeria" element={<Galeria nivelTitulo="h1" />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Routes>
        </main>
      </div>
      {abrindoExposicao && (
        <Routes>
          <Route path="/galeria/:slug" element={<Exposicao />} />
        </Routes>
      )}
    </>
  );
}

function NaoEncontrada() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Página não encontrada</h1>
      <p className="mt-2 text-suave">O endereço não corresponde a nenhuma página da galeria.</p>
    </section>
  );
}
