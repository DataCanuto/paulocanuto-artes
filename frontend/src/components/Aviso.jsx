// Estados de carregamento e erro compartilhados pelas páginas
export function Carregando({ texto, claro = false }) {
  return (
    <div role="status" className={`flex items-center gap-3 py-16 text-[15px] ${claro ? 'text-white/70' : 'text-suave'}`}>
      <span className={`size-5 animate-spin rounded-full border-2 ${claro ? 'border-white/20 border-t-white/70' : 'border-linha border-t-suave'}`} />
      {texto}
    </div>
  );
}

export function Erro({ erro, aoTentar, claro = false }) {
  return (
    <div role="alert" className={`max-w-prose py-16 text-[15px] ${claro ? 'text-white/80' : ''}`}>
      <p className="font-bold">{erro.message}</p>
      <p className={claro ? 'text-white/60' : 'text-suave'}>
        Confira se a API está rodando (<code>npm run dev</code> na pasta backend) e tente de novo.
      </p>
      <button type="button" onClick={aoTentar} className="mt-4 border-b-2 border-caneta pb-0.5 font-bold">
        Tentar de novo
      </button>
    </div>
  );
}
