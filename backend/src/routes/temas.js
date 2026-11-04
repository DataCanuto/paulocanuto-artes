import { Router } from 'express';
import { param } from 'express-validator';
import { validar } from '../middlewares/validar.js';
import * as controller from '../controllers/temaController.js';

const router = Router();
// A chave é um id numérico ou um slug (letras minúsculas, números e hífens)
const chave = param('chave').matches(/^(\d+|[a-z0-9]+(?:-[a-z0-9]+)*)$/).withMessage('Use o id ou o slug do tema.');

router.get('/', controller.listar);
router.get('/:chave', chave, validar, controller.detalhar);
router.get('/:chave/obras', chave, validar, controller.obras);

export default router;
