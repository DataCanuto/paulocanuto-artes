// Pool de conexões MySQL. Um "pool" mantém algumas conexões abertas e as reaproveita,
// em vez de abrir uma nova a cada requisição.
import mysql from 'mysql2/promise';
import { config } from './env.js';

let pool;

export function getPool() {
  pool ??= mysql.createPool({
    ...config.db,
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
  });
  return pool;
}

export async function closePool() {
  if (pool) await pool.end();
  pool = undefined;
}
