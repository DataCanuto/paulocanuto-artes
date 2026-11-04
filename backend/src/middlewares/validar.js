// Executa as regras do express-validator declaradas na rota e responde 400 se alguma falhar.
import { validationResult } from 'express-validator';

export function validar(req, res, next) {
  const erros = validationResult(req);
  if (erros.isEmpty()) return next();
  res.status(400).json({
    erro: 'Parâmetros inválidos.',
    detalhes: erros.array().map((e) => ({ campo: e.path, mensagem: e.msg })),
  });
}
