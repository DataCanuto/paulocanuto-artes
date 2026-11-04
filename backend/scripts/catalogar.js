// Catalogação do acervo (Fase 3).
// Lê TEMAS/ (somente leitura), identifica cada imagem pelo SHA-256, extrai a ficha técnica do nome,
// gera as versões web em media/obras e escreve database/catalogo.json, que alimenta o banco (npm run db:seed).
// Pode ser executado quantas vezes quiser: imagens já convertidas não são refeitas.
import { readdir, readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { analisarNome, slugify, fraseCase, textoAlternativo } from './lib/nomes.js';
import { config } from '../src/config/env.js';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const ACERVO = path.join(RAIZ, 'TEMAS');
const MIDIA = path.join(config.mediaDir, 'obras');
const MANIFESTO = path.join(RAIZ, 'curadoria', 'duplicatas-removidas.csv');
const SAIDA = path.resolve(import.meta.dirname, '../database/catalogo.json');
const EXTENSOES = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const TAMANHOS = { pagina: 1600, miniatura: 800, indice: 320 };

// Títulos que a conversão automática do nome da pasta não acerta
const TITULOS_TEMAS = {
  'arte-indigena-afro-brasileira': 'Arte indígena e afro-brasileira',
  'mergulhos-natacao': 'Mergulhos e natação',
};

const tituloDaPasta = (pasta) => {
  const limpo = pasta.replace(/\.+\s*OK$/i, '').replace(/\.+$/, '').trim();
  return { slug: slugify(limpo), titulo: TITULOS_TEMAS[slugify(limpo)] ?? fraseCase(limpo) };
};

const existe = (p) => access(p).then(() => true, () => false);
const comparar = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' }).compare;

// Lê o CSV gerado pelo PowerShell (todos os campos entre aspas)
async function lerManifesto() {
  if (!(await existe(MANIFESTO))) return [];
  const linhas = (await readFile(MANIFESTO, 'utf8')).replace(/^﻿/, '').trim().split(/\r?\n/);
  const cab = linhas.shift().slice(1, -1).split('","');
  return linhas.map((l) => Object.fromEntries(l.slice(1, -1).split('","').map((v, i) => [cab[i], v])));
}

async function listarTemas() {
  const temas = [];
  for (const d of await readdir(ACERVO, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const pai = { ...tituloDaPasta(d.name), pasta: d.name, pai: null };
    temas.push(pai);
    for (const s of await readdir(path.join(ACERVO, d.name), { withFileTypes: true })) {
      if (s.isDirectory()) temas.push({ ...tituloDaPasta(s.name), pasta: path.join(d.name, s.name), pai: pai.slug });
    }
  }
  return temas;
}

async function gerarVersao(buffer, destino, tamanho) {
  if (await existe(destino)) return;
  await sharp(buffer)
    .rotate() // respeita a orientação EXIF, se houver
    .resize({ width: tamanho, height: tamanho, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: tamanho > 1000 ? 82 : tamanho > 400 ? 78 : 72 })
    .toFile(destino);
}

async function main() {
  await mkdir(MIDIA, { recursive: true });
  const temas = await listarTemas();
  const temaPorPasta = new Map(temas.map((t) => [t.pasta, t]));
  const obras = new Map(); // sha256 → obra
  const shaPorCaminho = new Map();
  const avisos = [];

  for (const tema of temas) {
    const arquivos = (await readdir(path.join(ACERVO, tema.pasta), { withFileTypes: true }))
      .filter((f) => f.isFile() && EXTENSOES.has(path.extname(f.name).toLowerCase()));
    for (const f of arquivos) {
      const relativo = path.join(tema.pasta, f.name);
      const buffer = await readFile(path.join(ACERVO, relativo));
      const sha = createHash('sha256').update(buffer).digest('hex');
      shaPorCaminho.set(relativo, sha);

      let obra = obras.get(sha);
      if (!obra) {
        const meta = await sharp(buffer).metadata();
        const girada = (meta.orientation ?? 1) >= 5;
        const ficha = analisarNome(f.name);
        const base = sha.slice(0, 16);
        await gerarVersao(buffer, path.join(MIDIA, `${base}-${TAMANHOS.pagina}.webp`), TAMANHOS.pagina);
        await gerarVersao(buffer, path.join(MIDIA, `${base}-${TAMANHOS.miniatura}.webp`), TAMANHOS.miniatura);
        await gerarVersao(buffer, path.join(MIDIA, `${base}-${TAMANHOS.indice}.webp`), TAMANHOS.indice);
        obra = {
          sha256: sha,
          nome: ficha.nome,
          url: `obras/${base}-${TAMANHOS.pagina}.webp`,
          url_miniatura: `obras/${base}-${TAMANHOS.miniatura}.webp`,
          url_indice: `obras/${base}-${TAMANHOS.indice}.webp`,
          largura: girada ? meta.height : meta.width,
          altura: girada ? meta.width : meta.height,
          tecnica: ficha.tecnica,
          suporte: ficha.suporte,
          dimensoes_cm: ficha.dimensoes_cm,
          ano: ficha.ano,
          arquivo_origem: `TEMAS/${relativo.replaceAll('\\', '/')}`,
          descricao_alt: textoAlternativo(ficha),
          outros_nomes: [],
          temas: new Set(),
        };
        obras.set(sha, obra);
        for (const a of ficha.avisos) avisos.push(`${relativo}: ${a}`);
      } else {
        // Mesmo arquivo com outro nome (casos aguardando decisão curatorial)
        obra.outros_nomes.push(`TEMAS/${relativo.replaceAll('\\', '/')}`);
      }
      obra.temas.add(tema.slug);
    }
  }

  // Cópias removidas continuam valendo como vínculo de tema da cópia preservada
  for (const linha of await lerManifesto()) {
    const sha = shaPorCaminho.get(linha.preservado.replace(/^TEMAS\\/, ''));
    const tema = temaPorPasta.get(path.dirname(linha.original.replace(/^TEMAS\\/, '')));
    if (sha && tema) obras.get(sha).temas.add(tema.slug);
  }

  // Subtema implica o tema pai: uma obra em "Fusca" não é repetida na raiz de "Carros"
  const paiDe = new Map(temas.map((t) => [t.slug, t.pai]));
  for (const obra of obras.values()) {
    for (const slug of obra.temas) if (paiDe.get(slug)) obra.temas.delete(paiDe.get(slug));
  }

  // Ordem dentro de cada tema: cronológica, obras sem ano ao final
  const listaObras = [...obras.values()];
  const temasSaida = temas
    .sort((a, b) => comparar(a.pai ?? a.slug, b.pai ?? b.slug) || (a.pai ? 1 : 0) - (b.pai ? 1 : 0) || comparar(a.titulo, b.titulo))
    .map((t, i) => {
      const daqui = listaObras
        .filter((o) => o.temas.has(t.slug))
        .sort((a, b) => (a.ano ?? 9999) - (b.ano ?? 9999) || comparar(a.nome, b.nome));
      daqui.forEach((o, ordem) => { (o.ordens ??= {})[t.slug] = ordem + 1; });
      const capa = [...daqui].sort((a, b) => b.largura * b.altura - a.largura * a.altura)[0];
      return {
        slug: t.slug, titulo: t.titulo, pai: t.pai, pasta_origem: `TEMAS/${t.pasta.replaceAll('\\', '/')}`,
        ordem: i + 1, imagem_capa: capa?.url_miniatura ?? null, total_obras: daqui.length,
      };
    });

  const catalogo = {
    gerado_em: new Date().toISOString(),
    temas: temasSaida,
    obras: listaObras
      .sort((a, b) => comparar(a.arquivo_origem, b.arquivo_origem))
      .map(({ temas: ts, ordens, ...o }) => ({ ...o, temas: [...ts].map((slug) => ({ slug, ordem: ordens[slug] })) })),
    avisos,
  };
  await mkdir(path.dirname(SAIDA), { recursive: true });
  await writeFile(SAIDA,JSON.stringify(catalogo, null, 2) + '\n');
  console.log(`${temasSaida.length} temas, ${catalogo.obras.length} obras, ${avisos.length} avisos → ${path.relative(RAIZ, SAIDA)}`);
}

main().catch((erro) => { console.error(erro); process.exit(1); });
