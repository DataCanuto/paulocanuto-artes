// Camada de acesso à API. Componentes chamam estas funções e não montam URLs nem tratam HTTP.

async function get(caminho) {
  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`);
  } catch {
    throw new Error('Sem conexão com o servidor da galeria.');
  }
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(corpo.erro ?? `Erro ${resposta.status} ao carregar ${caminho}.`);
  return corpo;
}

export const api = {
  temas: () => get('/temas'),
  tema: (slug) => get(`/temas/${encodeURIComponent(slug)}`),
  obrasDoTema: (slug) => get(`/temas/${encodeURIComponent(slug)}/obras`),
  destaques: () => get('/obras/destaques'),
  totalObras: () => get('/obras?limite=1').then((r) => r.total),
};
