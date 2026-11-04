import { criarApp } from './app.js';
import { config } from './config/env.js';

criarApp().listen(config.port, () => {
  console.log(`API em http://localhost:${config.port} (dados: ${config.dataSource})`);
});
