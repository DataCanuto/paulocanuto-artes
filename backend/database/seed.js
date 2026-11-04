// Importa database/catalogo.json (gerado por `npm run catalogar`) para o MySQL.
// Usa INSERT … ON DUPLICATE KEY UPDATE sobre chaves únicas (slug, sha256):
// rodar uma ou dez vezes produz o mesmo resultado, sem registros duplicados.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getPool, closePool } from '../src/config/db.js';

const catalogo = JSON.parse(await readFile(path.join(import.meta.dirname, 'catalogo.json'), 'utf8'));

async function main() {
  const conn = await getPool().getConnection();
  try {
    // Transação: ou tudo é gravado, ou nada (evita banco pela metade se algo falhar)
    await conn.beginTransaction();

    const idTema = new Map();
    for (const t of catalogo.temas) {
      await conn.execute(
        `INSERT INTO temas (titulo, slug, pasta_origem, imagem_capa, ordem, tema_pai_id)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE pasta_origem = VALUES(pasta_origem), imagem_capa = VALUES(imagem_capa),
           ordem = VALUES(ordem), tema_pai_id = VALUES(tema_pai_id)`,
        [t.titulo, t.slug, t.pasta_origem, t.imagem_capa, t.ordem, t.pai ? idTema.get(t.pai) : null],
      );
      const [[linha]] = await conn.execute('SELECT id FROM temas WHERE slug = ?', [t.slug]);
      idTema.set(t.slug, linha.id);
    }

    for (const o of catalogo.obras) {
      // O título e a descrição já editados no banco são preservados; dados técnicos do arquivo são atualizados
      await conn.execute(
        `INSERT INTO obras (nome, url, url_miniatura, url_indice, largura, altura, sha256, arquivo_origem,
           tecnica, suporte, dimensoes_cm, ano, descricao_alt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE url = VALUES(url), url_miniatura = VALUES(url_miniatura),
           url_indice = VALUES(url_indice), largura = VALUES(largura), altura = VALUES(altura),
           arquivo_origem = VALUES(arquivo_origem)`,
        [o.nome, o.url, o.url_miniatura, o.url_indice, o.largura, o.altura, o.sha256, o.arquivo_origem,
          o.tecnica, o.suporte, o.dimensoes_cm, o.ano, o.descricao_alt],
      );
      const [[linha]] = await conn.execute('SELECT id FROM obras WHERE sha256 = ?', [o.sha256]);
      for (const { slug, ordem } of o.temas) {
        await conn.execute(
          `INSERT INTO obras_temas (obra_id, tema_id, ordem) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE ordem = VALUES(ordem)`,
          [linha.id, idTema.get(slug), ordem],
        );
      }
    }

    await conn.commit();
    console.log(`importados: ${catalogo.temas.length} temas, ${catalogo.obras.length} obras`);
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
    await closePool();
  }
}

main().catch((erro) => { console.error(erro.message); process.exit(1); });
