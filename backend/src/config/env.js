// Configuração central: lê o .env da raiz do projeto e expõe valores já convertidos.
// Nenhum outro arquivo acessa process.env diretamente.
import path from 'node:path';
import dotenv from 'dotenv';

const RAIZ = path.resolve(import.meta.dirname, '../../..');
dotenv.config({ path: path.join(RAIZ, '.env'), quiet: true });

const env = process.env;

export const config = {
  port: Number(env.PORT ?? 3001),
  // "mysql" em uso normal; "json" lê database/catalogo.json (útil sem MySQL instalado e nos testes)
  dataSource: process.argv.includes('--dados=json') ? 'json' : (env.DATA_SOURCE ?? 'mysql'),
  corsOrigin: env.CORS_ORIGIN ?? 'http://localhost:5173',
  mediaDir: path.resolve(RAIZ, env.MEDIA_DIR ?? 'media'),
  // Em produção, endereço público das imagens (ex.: bucket do Cloudflare R2). Vazio = servidas pela própria API.
  mediaBaseUrl: (env.MEDIA_BASE_URL ?? '/media').replace(/\/$/, ''),
  db: {
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT ?? 3306),
    user: env.DB_USER ?? 'root',
    password: env.DB_PASSWORD ?? '',
    database: env.DB_NAME ?? 'galeria_paulo_canuto',
  },
};
