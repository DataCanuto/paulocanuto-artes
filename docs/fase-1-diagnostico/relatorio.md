# Fase 1: diagnóstico do acervo de Paulo Canuto

Data: 01/11/2026. Nenhum arquivo do acervo foi alterado, movido, renomeado ou excluído. A auditoria só leu as imagens.

Arquivos desta entrega:

| Arquivo | Conteúdo |
|---|---|
| `inventario.csv` | Uma linha por imagem: tema, nome, caminho completo, formato, bytes, largura, altura, orientação EXIF, SHA-256 e hash perceptual |
| `duplicatas.csv` | Grupos de cópias, com tipo (exata ou visual), caminho completo e recomendação de qual cópia preservar |
| `revisao-visual/pares-similares-*.png` | Folhas de contato com os pares visualmente parecidos, usadas para calibrar a detecção |
| `../../scripts/artwork-audit/*.ps1` | Scripts da auditoria (PowerShell, sem dependências), para repetir a análise quando o acervo mudar |

---

## 1. Estrutura do repositório

```
paulo-canuto-artes/
└── TEMAS/                         ← todas as obras ficam aqui
    ├── ABSTRAÇÕES....................OK
    ├── ARQUITETURA...................OK
    ├── ARTE INDÍGENA-AFRO-BRASILEIRA...OK
    ├── BICICLETAS....................OK
    ├── CARROS                     ← sem o sufixo "OK"
    │   ├── FUSCA                  ← subtema
    │   └── KOMBI                  ← subtema
    ├── CENAS URBANAS.........................OK
    ├── DANÇA.......................OK
    ├── DOBRADURAS...................OK
    ├── ESPORTE....................OK
    ├── HISTÓRIAS EM QUADRINHOS....OK
    ├── MERGULHOS-NATAÇÃO...............OK
    ├── NATUREZA........................OK
    ├── PAISAGENS RURAIS...............OK
    ├── PESSOAS..........OK
    └── PORTAS E JANELAS...................OK
```

Observações:

- **O diretório `CARROS` fica em `TEMAS/CARROS`**, não na raiz. É o único sem o sufixo `....OK`, o que sugere que a curadoria dele ainda não foi concluída. Os números confirmam: é onde está a maior parte das cópias (veja a seção 4).
- O sufixo `....OK` parece ser uma marca de revisão de quem organizou as pastas, não parte do nome do tema. Proponho guardar o título limpo no banco ("Abstrações") e gerar o slug a partir dele (`abstracoes`). Os nomes das pastas continuam como estão.
- **Git:** esta pasta não tem repositório próprio. Ela está dentro do repositório `C:\Users\pedro\Documents\repositorio-local`, junto com outros projetos, e ainda não foi adicionada a ele (aparece como `??`). Tem 508 MB de imagens. Isso pede uma decisão antes da Fase 3 (seção 8, item 1).

## 2. Números do acervo

| Indicador | Valor |
|---|---|
| Arquivos de imagem | **739** (508 MB) |
| Outros arquivos | 1 PDF de 58 MB: `PORTAS E JANELAS/BANNER PORTAS E JANELAS 1.pdf` |
| Diretórios temáticos | **15** temas + 2 subtemas (Fusca e Kombi, dentro de Carros) |
| Imagens únicas estimadas, sem as cópias | **627** |
| Arquivos ilegíveis ou corrompidos | 0 |

### Imagens por tema

| Tema | Arquivos | Únicas | Retrato | Paisagem |
|---|---:|---:|---:|---:|
| Abstrações | 44 | 44 | 15 | 29 |
| Arquitetura | 22 | 21 | 3 | 19 |
| Arte indígena e afro-brasileira | 21 | 20 | 18 | 3 |
| Bicicletas | 30 | 29 | 13 | 17 |
| Carros (pasta principal) | 168 | 96 | 35 | 130 |
| Carros › Fusca | 24 | 10 | 10 | 14 |
| Carros › Kombi | 25 | 13 | 18 | 6 |
| Cenas urbanas | 41 | 38 | 11 | 30 |
| Dança | 40 | 40 | 18 | 22 |
| Dobraduras | 22 | 22 | 6 | 16 |
| Esporte | 8 | 8 | 7 | 0 |
| Histórias em quadrinhos | 14 | 11 | 0 | 13 |
| Mergulhos e natação | 28 | 28 | 2 | 26 |
| Natureza | 83 | 82 | 50 | 32 |
| Paisagens rurais | 26 | 26 | 3 | 21 |
| Pessoas | 116 | 113 | 60 | 55 |
| Portas e janelas | 27 | 26 | 18 | 9 |
| **Total** | **739** | **627** | | |

Retrato e paisagem não somam o total porque as imagens quadradas ficam de fora das duas colunas.

### Formatos

| Formato | Quantidade |
|---|---:|
| JPG (`.jpg` e `.JPG`) | 696 |
| PNG | 41 |
| JPEG | 2 |

Nenhuma imagem tem rotação EXIF. A orientação dos pixels é a orientação real, então largura e altura podem ser lidas diretamente.

### Dimensões e proporções

Este é o dado mais importante para o livro digital (requisitos 7.1 a 7.4):

| Proporção (largura ÷ altura) | Quantidade |
|---|---:|
| Retrato estreito (< 0,6) | 43 |
| Retrato (0,6 a 0,95) | 240 |
| Quadrada (0,95 a 1,05) | 26 |
| Paisagem (1,05 a 1,9) | 420 |
| Panorâmica (> 1,9) | 10 |

| Lado maior da imagem | Quantidade |
|---|---:|
| Menos de 800 px | **235** |
| 800 a 1.599 px | 427 |
| 1.600 a 2.999 px | 53 |
| 3.000 px ou mais (até 5.616 px e 16 MB) | 24 |

Consequências para o projeto:

- **Os quatro casos do critério de aceitação 7.4 existem no acervo.** Sugiro estas obras para os testes:
  - Retrato: `PESSOAS/HOMEM DA MALA 3 - ACRÍLICA S FÓRMICA-2014.jpg` (312×984, proporção 0,32, o caso mais estreito)
  - Paisagem: `CARROS/PROJEÇÃO 21- CANETA +AEROGRAFIA EM PAPEL- 2013 76X96 .jpg` (1500×997)
  - Quadrada: `PAISAGENS RURAIS/CHAPADA-ACRÍLICA S TELA-2007.jpg` (481×481)
  - Panorâmica: `ARQUITETURA/ARQUITETURAS 2015 30X40.png` (1643×345, proporção 4,76, o caso mais extremo)
- **Um terço do acervo é pequeno.** São 235 imagens com menos de 800 px; a menor é `NATUREZA/ABSTRATO 7-ACRÍLICA S TECIDO-2020.jpg`, com 133×252. Numa página de livro em tela grande, ampliar essas imagens vai deixá-las borradas. Proposta: nunca ampliar acima de 100% do tamanho real e deixar respiro em volta (o tamanho original vira o limite de exibição).
- **Algumas imagens são grandes demais para a web.** São 24 com mais de 3.000 px, por exemplo `AGITAÇÃO-2025-80X100-ACRÍLICA S TELA.jpg` (16 MB). Abertas direto, travariam o folheamento no celular. Daí a proposta de gerar versões para web (seção 6.3).

## 3. Como as duplicatas foram identificadas

**Nível 1, duplicatas exatas (SHA-256).** O SHA-256 transforma o conteúdo binário de um arquivo numa "impressão digital" de 64 caracteres. Se dois arquivos têm a mesma impressão, os bytes são idênticos, qualquer que seja o nome. Não há falso positivo.

**Nível 2, duplicatas visuais (hash perceptual dHash).** A imagem é reduzida a 9×8 pixels em tons de cinza. Para cada pixel, o algoritmo anota se ele é mais claro que o vizinho da direita, o que gera 64 bits. Uma cópia redimensionada ou recomprimida produz quase os mesmos bits. A "distância" entre duas imagens é o número de bits diferentes (distância de Hamming).

**Calibração.** O limite de distância foi decidido olhando as imagens, não por suposição. Revisei os 37 pares com distância até 8 nas folhas de `revisao-visual/`:

- **Distância 0 a 6:** sempre a mesma obra. Às vezes é o mesmo arquivo reexportado, às vezes outra foto ou outro recorte da mesma obra.
- **Distância 7 ou mais:** sempre obras diferentes com composição parecida. Exemplos: `DIÁLOGO 1` e `DIÁLOGO 2` (esculturas de arame diferentes), `BASE 8` e `BASE 11` (desenhos de nado diferentes), e uma camiseta com grafismo indígena comparada a outra com helicônia.

O limite adotado foi **6**. Com isso, duas obras não são marcadas como cópia só porque têm o mesmo tema ou composição semelhante, como o brief pede.

## 4. Duplicatas encontradas

| | Grupos | Arquivos redundantes |
|---|---:|---:|
| Duplicatas exatas (bytes idênticos) | 94 | 96 |
| Exatas e visuais juntas | 106 | **112** |

Todos os caminhos completos e a recomendação de cada arquivo estão em `duplicatas.csv`.

**Critério para escolher a cópia a preservar** (nesta ordem):

1. a maior resolução;
2. um nome com título curatorial em vez de nome genérico (`Imagem51.jpg`, `IMG_2021...`, `Quadros (191).JPG`);
3. PNG em vez de JPG quando o resto empata (o PNG não perde qualidade na compressão);
4. o nome mais descritivo.

Quando as cópias estão em pastas diferentes, a recomendação automática precisa da sua revisão. Por exemplo, o algoritmo escolheu manter `LINCOLN-SUBLIMAÇÃO S TECIDO-2017.jpg` em **Natureza**, mas o lugar dele é provavelmente **Carros**.

### 4.1 Padrões que encontrei

**A. Nome genérico e nome curatorial para o mesmo arquivo** (principalmente em Carros). Exemplos:

- `CARROS/Imagem51.jpg` = `brush car-2014.jpg` = `PROJEÇÃO 05- AEROGRAFIA EM PAPEL 2014.jpg` = `PROJEÇÃO 16- CANETA +AEROGRAFIA EM PAPEL- 2013 76X96 .jpg` (quatro nomes para um arquivo, e com anos diferentes)
- de `Imagem50.jpg` a `Imagem59.jpg`, cada uma igual a uma `PROJEÇÃO 13` a `PROJEÇÃO 24`
- `Quadros (191).JPG` = `OLDSMOBILE  AEROGRAFIA 1988.JPG`

Recomendação: preservar o nome curatorial. O nome genérico vira redundante.

**B. A mesma foto com dois títulos de técnica diferentes: 40 grupos.** É o padrão mais frequente e o que mais precisa da sua decisão. Exemplos:

- `KOMBI 33-ACRÍLICA S TECIDO-2021.jpg` = `KOMBI 33-SERIGRAFIA + PINCEL S TECIDO -2021.jpg`
- `FUSCA 4 - CAMISA ALGODÃO - 2024.jpg` = `FUSCA 4 - SERIGRAFIA + PINCEL S TECIDO 2024.jpg`

Os arquivos são idênticos byte a byte, então é uma única fotografia. A dúvida é curatorial: são **duas peças físicas** (uma pintada à mão, outra serigrafada) fotografadas uma vez só? Ou é **uma peça** com a técnica descrita de dois jeitos? No primeiro caso, o catálogo teria uma imagem e duas técnicas; no segundo, uma obra só.

**C. A mesma obra em dois temas: 4 grupos.**

- `CONTORÇÕES` aparece em Pessoas (2005, 40×50) e em Histórias em quadrinhos (2004, 50×70)
- `COLAGEM NY` (Cenas urbanas) e `MONTAGEM URBANA` (Histórias em quadrinhos)
- `CENA URBANA 9` (Cenas urbanas) e `ENGARRAFAMENTO` (Carros)
- `LINCOLN` em Carros e em Natureza

Isso levanta uma questão de modelagem: uma obra pode pertencer a mais de um tema? (Seção 8, item 3.)

**D. Cópias visuais com metadados que se contradizem.** É a mesma imagem, mas o nome do arquivo informa ano, título ou dimensão diferentes:

| Arquivos | Conflito |
|---|---|
| `PROJEÇÃO 02 … 1988` / `PROJEÇÃO 26 … 2005` / `poster taxi driver-1988` | ano: 1988 ou 2005 |
| `brush MG-1988` / `PROJEÇÃO 09 … 1988` / `PROJEÇÃO 25 … 2013` | ano: 1988 ou 2013 |
| `PROJEÇÃO 01 … 1986.png` / `MAGDA FUSCA 1988` | ano e título; além disso, existe outra `PROJEÇÃO 01` (1988) que é uma obra diferente |
| `ORQUÍDEAS-ACRÍLICA S TECIDO 2024` / `FLORES 5 - CAMISA ALGODÃO - 2024` | título e técnica |
| `FASHION WOMEN 2015` / `2 MODELOS … 2016` | título e ano |
| `AUTO RETRATO 2 … 1988` / `DESENHO 16 … 1988` | título |
| `CENA URBANA 1 … 2006` / `CENAS EM QUADRINHOS … 2005` | título e ano |
| `ARQ POP 8` / `ARQ POP 9` | mesma obra em resoluções diferentes, com números diferentes |
| `PORTAS E JANELAS 1 … 2020` / `PORTAS E JANELAS 14 … 2021` | mesma foto em outro recorte, com número e ano diferentes |
| `TICKETS & STAMPS 2015` / `COLAGEM URBANA 5 - 2015` | título |
| `MÚSICOS-CANETA E CERA … 2017` / `MÚSICOS 1-CANETA E .jpg` | o segundo nome está incompleto |
| `COLAGEM 1 … 1985` / `IMG_20211221_223522_136.jpg` | outra foto da mesma obra |
| `Penas tropicais - 30x45-2013` / `IMG_20210702_231600_379.jpg` | nome genérico |

## 5. Arquivos que precisam de identificação manual

| Situação | Arquivos |
|---|---|
| Sem título (nome genérico, sem cópia nomeada) | `CARROS/Imagem118.jpg`, `Imagem162.jpg`, `Imagem163.jpg`, `PESSOAS/Quadros (205).JPG` |
| Sem técnica nem ano | `BASE 1` e `BASE 2` (Bicicletas), `BASE 7` a `BASE 11` (Mergulhos), `BASE 7` (Portas e janelas), `CASA CURITIBA 1` e `2`, `TRIBAL`, `DIÁLOGO 1` a `4`, `CADEIRAS 1` e `2`, `TELA 40X50 ABSTRATO BLACK 1`, `DESENHO VISTA AÉREA MSP` |
| Ano no futuro, provável erro de digitação | `FIAT 500-PINTURA LIVRE S TECIDO-2028`, `FLORES 17` e `FLORES 18 … 2029`, `DESENHOS ERÓTICOS 15 … 2027` |
| Extensão estranha | `PESSOAS/CARREGADORA-LÁPIS S PAPEL-2014.pg.jpg` |
| Nomes quase iguais que **não** são cópias (os hashes, exato e perceptual, mostram imagens diferentes) | `DESENHO 1  CANETA S PAPEL 2017.jpg` e `… 2017 .jpg`; `DESENHOS ERÓTICOS 13-LÁPIS S PAPEL` e `13-LÁPIS E CANETA S PAPEL`. Precisam de números diferentes |
| Sem nenhum ano de 4 dígitos no nome | 81 arquivos (lista completa em `inventario.csv`) |
| Fora da galeria | `BANNER PORTAS E JANELAS 1.pdf`: proponho não importar como obra |
| Conteúdo adulto | 16 arquivos `DESENHOS ERÓTICOS` em Pessoas. Você decide se aparecem na versão pública, e se com aviso |

**Os nomes dos arquivos já trazem a ficha técnica**, no padrão `TÍTULO - TÉCNICA S SUPORTE - DIMENSÕES - ANO`, por exemplo `GRAFISMO 5- ACRÍLICA S TELA 70X90 -2015.jpg`. Um extrator consegue preencher automaticamente técnica, suporte, dimensões e ano na maioria dos casos. Os casos ambíguos iriam para uma lista de revisão, sem adivinhação.

---

## 6. Proposta de arquitetura

### 6.1 Visão geral

```
 Navegador (React + Vite + Tailwind)
   │  GET /api/temas, /api/temas/:slug/obras …
   ▼
 API Node.js + Express ──► MySQL (galeria_paulo_canuto)
   │
   └── /media/…  ← versões web das imagens (geradas a partir de TEMAS/, que nunca é alterada)

 scripts/artwork-audit  → auditoria (feita)
 scripts/catalog        → Fase 3: lê TEMAS/, extrai metadados, gera versões web e alimenta o banco
```

**Por que separar assim.** O frontend só sabe mostrar e o backend só sabe servir dados. O script de catalogação é o único que lê a pasta `TEMAS/`. Assim, as obras originais ficam isoladas: nenhuma rota da API tem permissão de escrever nelas.

### 6.2 Estrutura de diretórios

Segue a do brief, com três ajustes:

- `TEMAS/` continua onde está e é tratada como **somente leitura**.
- Entra `scripts/catalog/`, para a importação.
- Entra `media/` (fora do Git), com as versões web.

```
paulo-canuto-artes/
├── TEMAS/                  (originais, intocados)
├── backend/src/{config,controllers,models,routes,services,middlewares}/app.js
├── backend/database/{schema.sql, migrations/, seeds/}
├── frontend/src/{components,pages,hooks,services,assets}/App.jsx
├── scripts/artwork-audit/  (já existe)
├── scripts/catalog/
├── media/                  (gerado, no .gitignore)
├── docs/
├── .env.example  .gitignore  README.md
```

### 6.3 Armazenamento das imagens

| Opção | Vantagem | Desvantagem |
|---|---|---|
| A. Servir os originais direto de `TEMAS/` | Simples, sem processamento | Arquivos de até 16 MB; folheamento lento no celular |
| **B. Gerar versões web em `media/` (recomendada)** | Carrega rápido; WebP com JPG de reserva; tamanhos de 800 e 1600 px; originais preservados | Precisa da biblioteca `sharp` e de um passo de geração |
| C. CDN ou armazenamento em nuvem | Escala bem | Custo e complexidade desnecessários agora |

Na opção B, nenhuma versão é maior que o original: uma imagem de 600 px continua com 600 px. Isso atende o "nunca distorcer nem ampliar artificialmente".

### 6.4 Bibliotecas de interface

Mínimas: React Router (Início, Galeria e a exposição com URL própria, por exemplo `/galeria/carros`, para que dê para compartilhar o link) e a biblioteca de folheamento (seção 7). Nenhuma biblioteca de componentes prontos: o visual de galeria pede componentes feitos sob medida.

## 7. Modelo inicial do banco de dados

As tabelas pedidas, mais alguns campos que o próprio acervo justifica. **Os campos marcados com ★ são sugestões e precisam da sua aprovação.**

```sql
CREATE TABLE temas (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tema_pai_id   INT UNSIGNED NULL,          -- ★ Fusca e Kombi dentro de Carros
  titulo        VARCHAR(120) NOT NULL,
  descricao     TEXT NULL,
  slug          VARCHAR(140) NOT NULL UNIQUE,
  pasta_origem  VARCHAR(255) NOT NULL UNIQUE, -- ★ liga o registro à pasta, evita importar duas vezes
  imagem_capa   VARCHAR(255) NULL,
  ordem         SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- ★ ordem dos cards na galeria
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tema_pai_id) REFERENCES temas(id) ON DELETE SET NULL
);

CREATE TABLE obras (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tema_id        INT UNSIGNED NOT NULL,
  nome           VARCHAR(200) NOT NULL,
  url            VARCHAR(255) NOT NULL,      -- caminho relativo da versão web
  largura        SMALLINT UNSIGNED NOT NULL, -- lidas do arquivo, nunca digitadas
  altura         SMALLINT UNSIGNED NOT NULL,
  ordem          SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  sha256         CHAR(64) NOT NULL UNIQUE,   -- ★ impede o mesmo arquivo entrar duas vezes
  arquivo_origem VARCHAR(500) NOT NULL,      -- ★ caminho do original em TEMAS/
  tecnica        VARCHAR(150) NULL,          -- ★ extraídos do nome do arquivo
  suporte        VARCHAR(100) NULL,          -- ★
  dimensoes_cm   VARCHAR(30)  NULL,          -- ★ ex.: "70x90"
  ano            SMALLINT UNSIGNED NULL,     -- ★
  descricao_alt  VARCHAR(300) NULL,          -- ★ texto alternativo para leitores de tela
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE RESTRICT,
  INDEX (tema_id, ordem)
);
```

**Relação:** um tema tem várias obras (1:N, por `obras.tema_id`). O `ON DELETE RESTRICT` impede apagar um tema que ainda tem obras, o que protege a integridade referencial.

**Orientação:** não precisa de coluna própria. Ela sai de `largura` e `altura` (retrato quando altura > largura). Guardar o mesmo dado duas vezes abriria espaço para os dois valores se contradizerem.

**Evitar duplicação:** a importação usa `INSERT … ON DUPLICATE KEY UPDATE` sobre `sha256` (obras) e `pasta_origem` (temas). Rodar o script de novo atualiza os registros em vez de duplicá-los. É o que se chama de importação **idempotente**: rodar uma ou dez vezes dá o mesmo resultado.

**Migrations:** proponho arquivos SQL numerados em `database/migrations/` (`001_criar_temas.sql`, `002_criar_obras.sql`…) e um script Node de cerca de 40 linhas que aplica, em ordem, os que ainda não rodaram, registrando cada um numa tabela `migrations`. A alternativa é a biblioteca Knex: mais recursos, mais uma dependência. Para duas tabelas, o script próprio é mais simples e mais didático.

## 8. Biblioteca de folheamento: recomendação

| Biblioteca | Situação | Avaliação |
|---|---|---|
| **`page-flip` (StPageFlip)** | MIT, sem dependências, cerca de 213 mil downloads por semana, última versão em 2021 | **Recomendada.** Curvatura e sombra realistas, gesto de arrastar com o dedo, modo retrato (uma página) automático em telas estreitas, modo HTML (páginas são elementos reais, então `alt` e foco funcionam) |
| `react-pageflip` | MIT, cerca de 132 mil downloads por semana, 2021 | É só um invólucro React da `page-flip`. Depende de `"page-flip": "latest"` (versão não fixada) e não acrescenta muito. Prefiro usar a `page-flip` direto com um hook próprio (`useFlipbook`) de umas 50 linhas, que eu explicaria passo a passo |
| `react-pageflip-enhanced` | Fork de 2026, cerca de 2,4 mil downloads por semana | Pouco uso e mantenedor único. Fica como alternativa, se a original der problema |
| `react-flip-page` | Exige React 16, parada desde 2020 | Descartada |
| `turn.js` | Depende de jQuery, parada desde 2017 | Descartada |
| Animação só com CSS | | Descartada, como o brief pede |

**Ponto de atenção honesto:** a `page-flip` não recebe atualização desde 2021. Ela é estável e muito usada, mas se aparecer um bug não haverá correção do autor. Escrever o hook próprio é justamente o que nos deixa trocar de biblioteca depois sem mexer no resto do site.

**Como ela atende os requisitos 7.1 a 7.4:** o livro tem páginas de tamanho fixo. Dentro de cada página, a obra fica centralizada com `object-fit: contain` e `max-width`/`max-height` limitados ao tamanho real da imagem. Retrato, paisagem, quadrada e panorâmica aparecem inteiras, sem corte e sem ampliação. As quatro obras de teste estão na seção 2.

---

## 9. Decisões que preciso de você

1. **Git:** criar um repositório próprio para `paulo-canuto-artes` (recomendado), em vez de usar o repositório `repositorio-local` que tem outros projetos. E as imagens: (a) fora do Git, com backup à parte; (b) com Git LFS; ou (c) no Git normal (508 MB pesa e torna o repositório lento).
2. **Subtemas:** Fusca e Kombi viram (a) subtemas de Carros (campo `tema_pai_id`) ou (b) temas independentes na galeria?
3. **Obras em mais de um tema** (seção 4.1 C): (a) cada obra tem um tema só e você escolhe qual; ou (b) uma obra pode aparecer em vários temas, o que pede uma tabela de ligação `obras_temas` no lugar de `tema_id`.
4. **Mesma foto com duas técnicas** (40 casos, seção 4.1 B): é uma obra ou são duas peças?
5. **Campos ★** do modelo: aprova incluir?
6. **Versões web com `sharp`** (seção 6.3, opção B): aprova a dependência?
7. **Conteúdo adulto e PDF** (seção 5): o que entra na galeria pública?
8. **Duplicatas:** depois que você revisar `duplicatas.csv`, proponho a estratégia de organização com backup. Nada será movido ou apagado antes disso.

## 10. Próximo passo

Com as respostas acima, sigo para a **Fase 2**: `docs/architecture.md`, `sketch.md`, `database-model.md`, `user-flow.md` e os wireframes de baixa fidelidade. Nenhum código de produção antes da sua aprovação expressa.

**Como repetir esta auditoria** (PowerShell, a partir da pasta do projeto):

```powershell
.\scripts\artwork-audit\inventario.ps1 -Root "$PWD\TEMAS" -OutCsv docs\fase-1-diagnostico\inventario.csv
.\scripts\artwork-audit\grupos.ps1 -Csv docs\fase-1-diagnostico\inventario.csv -MaxD 6 -OutCsv docs\fase-1-diagnostico\duplicatas.csv
```
