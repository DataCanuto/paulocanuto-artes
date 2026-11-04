import { Router } from 'express';
import { param, query } from 'express-validator';
import { validar } from '../middlewares/validar.js';
import * as controller from '../controllers/obraController.js';

const router = Router();

router.get(
  '/',
  query('limite').optional().isInt({ min: 1, max: 200 }).withMessage('Entre 1 e 200.').toInt(),
  query('offset').optional().isInt({ min: 0 }).withMessage('Número inteiro a partir de 0.').toInt(),
  validar,
  controller.listar,
);
// Antes de "/:id", senão "destaques" seria interpretado como um id
router.get('/destaques', controller.destaques);
router.get('/:id',param('id').isInt({ min: 1 }).withMessage('Id inválido.').toInt(), validar, controller.detalhar);

// Futuro painel administrativo: POST, PUT e DELETE entram aqui, protegidos por um middleware de autenticação.

export default router;
