import { useCallback, useEffect, useState } from 'react';

// Executa uma chamada à API e expõe { dados, erro, carregando, recarregar }.
// Se o componente mudar de parâmetros antes da resposta chegar, a resposta antiga é descartada.
export function useApi(chamada, deps) {
  const [estado, setEstado] = useState({ dados: null, erro: null, carregando: true });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setEstado((e) => ({ ...e, erro: null, carregando: true }));
    chamada()
      .then((dados) => ativo && setEstado({ dados, erro: null, carregando: false }))
      .catch((erro) => ativo && setEstado({ dados: null, erro, carregando: false }));
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tentativa]);

  const recarregar = useCallback(() => setTentativa((t) => t + 1), []);
  return { ...estado, recarregar };
}
