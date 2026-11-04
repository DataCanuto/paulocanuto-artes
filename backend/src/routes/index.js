import { Router } from 'express';
import temas from './temas.js';
import obras from './obras.js';

const router = Router();
router.use('/temas', temas);
router.use('/obras', obras);

export default router;
