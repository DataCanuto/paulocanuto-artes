// Testes das rotas da API. Por padrão usam o catálogo JSON (não exigem MySQL).
// Executar: npm test  |  contra o MySQL configurado no .env: npm run test:mysql
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

if (!process.argv.includes('--mysql')) process.argv.push('--dados=json');
const { criarApp } = await import('../src/app.js');

let servidor;
let base;

before(async () => {
  servidor = criarApp().listen(0);
  await new Promise((ok) => servidor.once('listening', ok));
  base = `http://localhost:${servidor.address().port}`;
});
after(async () => {
  servidor.close();
  const { closePool } = await import('../src/config/db.js');
  await closePool();
});

const get = async (caminho) => {
  const r = await fetch(base + caminho);
  return { status: r.status, corpo: await r.json() };
};

test('GET /api/temas lista temas principais com subtemas aninhados', async () => {
  const { status, corpo } = await get('/api/temas');
  assert.equal(status, 200);
  assert.ok(corpo.length >= 15);
  const carros = corpo.find((t) => t.slug === 'carros');
  assert.deepEqual(carros.subtemas.map((s) => s.slug).sort(), ['fusca', 'kombi']);
  assert.ok(!corpo.some((t) => t.slug === 'fusca'), 'subtema não aparece na raiz');
  assert.match(carros.imagem_capa, /^\/media\/obras\/.+\.webp$/);
});

test('GET /api/temas/:slug e /:id devolvem o mesmo tema', async () => {
  const porSlug = await get('/api/temas/kombi');
  assert.equal(porSlug.status, 200);
  assert.equal(porSlug.corpo.pai.slug, 'carros');
  const porId = await get(`/api/temas/${porSlug.corpo.id}`);
  assert.equal(porId.corpo.slug, 'kombi');
});

test('GET /api/temas/:slug/obras devolve obras ordenadas com proporções', async () => {
  const { status, corpo } = await get('/api/temas/dobraduras/obras');
  assert.equal(status, 200);
  assert.equal(corpo.obras.length, corpo.tema.total_obras);
  for (const o of corpo.obras) {
    assert.ok(o.largura > 0 && o.altura > 0);
    assert.ok(['retrato', 'paisagem', 'quadrada', 'panoramica'].includes(o.orientacao));
    assert.ok(o.descricao_alt);
  }
});

test('obra em mais de um tema aparece nos dois', async () => {
  const pessoas = await get('/api/temas/pessoas/obras');
  const hq = await get('/api/temas/historias-em-quadrinhos/obras');
  const comuns = pessoas.corpo.obras.filter((o) => hq.corpo.obras.some((x) => x.id === o.id));
  assert.ok(comuns.length >= 1);
  const detalhe = await get(`/api/obras/${comuns[0].id}`);
  assert.ok(detalhe.corpo.temas.length >= 2);
});

test('GET /api/obras pagina e valida parâmetros', async () => {
  const pagina = await get('/api/obras?limite=5&offset=10');
  assert.equal(pagina.status, 200);
  assert.equal(pagina.corpo.itens.length, 5);
  assert.equal(pagina.corpo.offset, 10);
  const invalido = await get('/api/obras?limite=0');
  assert.equal(invalido.status, 400);
  assert.equal(invalido.corpo.detalhes[0].campo, 'limite');
});

test('GET /api/obras/destaques: boa resolução, tamanho físico conhecido, um por tema', async () => {
  const { status, corpo } = await get('/api/obras/destaques');
  assert.equal(status, 200);
  assert.ok(corpo.length >= 5 && corpo.length <= 8);
  assert.equal(new Set(corpo.map((o) => o.tema_slug)).size, corpo.length);
  for (const o of corpo) {
    assert.ok(Math.max(o.largura, o.altura) >= 1400, `${o.nome} tem resolução baixa`);
    assert.ok(o.medidas_cm.largura > 0 && o.medidas_cm.altura > 0);
    // a proporção em cm acompanha a da imagem
    assert.ok(Math.abs(o.medidas_cm.largura / o.medidas_cm.altura - o.largura / o.altura) < 0.02);
  }
});

test('obras trazem miniatura para o índice', async () => {
  const { corpo } = await get('/api/temas/kombi/obras');
  for (const o of corpo.obras) assert.match(o.url_indice, /^\/media\/obras\/.+\.webp$/);
});

test('erros: 404 para tema/obra inexistente, 400 para id inválido', async () => {
  assert.equal((await get('/api/temas/nao-existe')).status, 404);
  assert.equal((await get('/api/obras/999999')).status, 404);
  assert.equal((await get('/api/obras/abc')).status, 400);
  assert.equal((await get('/api/temas/DROP%20TABLE')).status, 400);
});
