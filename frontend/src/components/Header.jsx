import { Link, NavLink } from 'react-router-dom';

const ITENS = [
  { para: '/', rotulo: 'Início', fim: true },
  { para: '/galeria', rotulo: 'Galeria' },
  { rotulo: 'Biografia' },
  { rotulo: 'Contato' },
];

export default function Header() {
  return (
    <header className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-10 gap-y-3 px-4 pt-6 pb-4 sm:px-8 md:pt-8">
      <Link to="/" className="flex items-center gap-3 text-[15px] font-bold tracking-tight">
        <img src="/marca.svg" alt="" width="22" height="22" />
        Paulo Canuto
      </Link>
      <nav aria-label="Principal">
        <ul className="flex gap-6 text-[15px]">
          {ITENS.map((item) =>
            item.para ? (
              <li key={item.rotulo}>
                <NavLink
                  to={item.para}
                  end={item.fim}
                  className={({ isActive }) =>
                    `border-b-2 pb-1 transition-colors ${isActive ? 'border-caneta text-grafite' : 'border-transparent text-suave hover:text-grafite'}`
                  }
                >
                  {item.rotulo}
                </NavLink>
              </li>
            ) : (
              // Seções futuras: visíveis para mostrar que existem, mas ainda sem destino
              <li key={item.rotulo}>
                <span aria-disabled="true" title="Em breve" className="cursor-default border-b-2 border-transparent pb-1 text-suave/55">
                  {item.rotulo}
                  <span className="sr-only"> (em breve)</span>
                </span>
              </li>
            ),
          )}
        </ul>
      </nav>
    </header>
  );
}
