// Ponto único de tratamento de erros. Erros previstos (HttpError) viram a resposta indicada;
// qualquer outro vira 500 com mensagem genérica, sem expor detalhes internos ao visitante.

export class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export function naoEncontrado(req, res) {
  res.status(404).json({ erro: `Rota ${req.method} ${req.originalUrl} não existe.` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(erro, req, res, next) {
  if (erro instanceof HttpError) return res.status(erro.status).json({ erro: erro.message });
  console.error(erro);
  const semBanco = ['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'].includes(erro.code);
  res.status(semBanco ? 503 : 500).json({
    erro: semBanco ? 'Banco de dados indisponível.' : 'Erro interno do servidor.',
  });
}
