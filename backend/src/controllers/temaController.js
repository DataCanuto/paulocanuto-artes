// Controllers traduzem HTTP ⇄ services: leem parâmetros da requisição e enviam a resposta.
// Erros lançados aqui chegam ao errorHandler automaticamente (o Express 5 captura promessas rejeitadas).
import * as temaService from '../services/temaService.js';

export async function listar(req, res) {
  res.json(await temaService.listarTemas());
}

export async function detalhar(req, res) {
  res.json(await temaService.buscarTema(req.params.chave));
}

export async function obras(req, res) {
  res.json(await temaService.listarObrasDoTema(req.params.chave));
}
