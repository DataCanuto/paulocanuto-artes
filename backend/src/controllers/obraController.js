import { matchedData } from 'express-validator';
import * as obraService from '../services/obraService.js';

export async function listar(req, res) {
  const { limite = 50, offset = 0 } = matchedData(req, { locations: ['query'] });
  res.json(await obraService.listarObras({ limite, offset }));
}

export async function destaques(req, res) {
  res.json(await obraService.listarDestaques());
}

export async function detalhar(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  res.json(await obraService.buscarObra(id));
}
