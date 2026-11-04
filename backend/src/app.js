// Monta a aplicação Express sem iniciar o servidor. Separar app de server permite
// que os testes usem a aplicação numa porta qualquer.
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import rotas from './routes/index.js';
import { errorHandler, naoEncontrado } from './middlewares/errorHandler.js';

export function criarApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  // Versões web das imagens. Os nomes contêm o hash do arquivo, então nunca mudam:
  // o navegador pode guardá-las em cache por um ano.
  app.use('/media', express.static(config.mediaDir, { immutable: true, maxAge: '365d', fallthrough: false }));

  app.get('/api/saude', (req, res) => res.json({ ok: true, dados: config.dataSource }));
  app.use('/api', rotas);
  app.use(naoEncontrado);
  app.use(errorHandler);
  return app;
}
