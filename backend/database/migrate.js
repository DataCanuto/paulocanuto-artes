// Aplica, em ordem, as migrations de database/migrations que ainda não rodaram.
// Cada arquivo aplicado fica registrado na tabela `migrations`, então rodar de novo não repete nada.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { config } from '../src/config/env.js';

const PASTA = path.join(import.meta.dirname, 'migrations');

async function main() {
  const { database, ...servidor } = config.db;
  const conn = await mysql.createConnection({ ...servidor, multipleStatements: true });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.changeUser({ database });
  await conn.query(`CREATE TABLE IF NOT EXISTS migrations (
    nome VARCHAR(255) PRIMARY KEY,
    aplicada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const [linhas] = await conn.query('SELECT nome FROM migrations');
  const aplicadas = new Set(linhas.map((l) => l.nome));
  const arquivos = (await readdir(PASTA)).filter((f) => f.endsWith('.sql')).sort();

  for (const arquivo of arquivos) {
    if (aplicadas.has(arquivo)) continue;
    await conn.query(await readFile(path.join(PASTA, arquivo), 'utf8'));
    await conn.execute('INSERT INTO migrations (nome) VALUES (?)', [arquivo]);
    console.log(`aplicada: ${arquivo}`);
  }
  console.log(`banco "${database}" atualizado`);
  await conn.end();
}

main().catch((erro) => { console.error(erro.message); process.exit(1); });
