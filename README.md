# Galeria digital Paulo Canuto

Galeria das obras de Paulo Canuto, organizadas por tema e apresentadas como um livro que se folheia.

- **backend/**: API REST em Node.js + Express + MySQL
- **frontend/**: site em React + Vite + Tailwind CSS, com folheamento pela biblioteca `page-flip`
- **TEMAS/**: o acervo original. É **somente leitura** para o sistema e fica fora do Git (ver [docs/armazenamento.md](docs/armazenamento.md))
- **curadoria/**: registro das decisões sobre o acervo (por exemplo, as duplicatas removidas)
- **scripts/**: auditoria do acervo e remoção/restauração de duplicatas (PowerShell)

## Como rodar

Requisitos: Node.js 22+ e, para o modo completo, MySQL 8.

```bash
cp .env.example .env          # ajuste usuário e senha do MySQL
cd backend
npm install
npm run catalogar             # lê TEMAS/, gera media/ e database/catalogo.json
npm run db:setup              # cria o banco galeria_paulo_canuto e importa o catálogo
npm run dev                   # API em http://localhost:3001
```

Em outro terminal:

```bash
cd frontend
npm install
npm run dev                   # site em http://localhost:5173
```

**Sem MySQL instalado?** Use `npm run dev:json` no backend. A API lê o `catalogo.json` direto, com as mesmas rotas e as mesmas respostas.

## Como o sistema funciona

```
TEMAS/ ──(npm run catalogar)──► media/obras/*.webp   versões web: 800 px e 1600 px
                              └► database/catalogo.json ──(npm run db:seed)──► MySQL
Navegador ──► Vite (5173) ──/api, /media──► Express (3001) ──► MySQL
```

### Camadas do backend

Cada pasta tem uma única responsabilidade. Uma requisição atravessa as camadas sempre na mesma ordem:

| Camada | Pasta | Responsabilidade |
|---|---|---|
| Rotas | `src/routes` | Associa URL e método a um controller e declara as validações (`express-validator`) |
| Middlewares | `src/middlewares` | Código que roda entre a requisição e a resposta: validação e tratamento de erros |
| Controllers | `src/controllers` | Lê os parâmetros da requisição, chama o service e devolve JSON |
| Services | `src/services` | Regras de negócio: hierarquia tema/subtema, URLs das imagens, orientação, 404 |
| Models | `src/models` | Acesso a dados. Só SQL parametrizado, sem regra de negócio |
| Config | `src/config` | Variáveis de ambiente e pool de conexões |

Os models existem em duas versões com as mesmas funções: `mysql/` e `json/`. O `models/index.js` escolhe uma delas, e o resto do código não sabe qual está em uso. Esse padrão se chama **repositório**. É o que permite rodar os testes sem banco de dados.

### Banco de dados

- `temas`: inclui `tema_pai_id`, porque Fusca e Kombi são subtemas de Carros
- `obras`: cada imagem única, identificada por `sha256`
- `obras_temas`: liga obras a temas. Uma obra pode estar em vários temas, com uma ordem própria em cada um

Migrations numeradas ficam em `backend/database/migrations`; `npm run db:migrate` aplica as que faltam. O seed usa `INSERT … ON DUPLICATE KEY UPDATE` e pode rodar várias vezes sem duplicar registros.

### API

| Rota | Retorno |
|---|---|
| `GET /api/temas` | Temas principais, cada um com seus subtemas |
| `GET /api/temas/:slug` (ou `:id`) | Um tema |
| `GET /api/temas/:slug/obras` | Obras do tema, na ordem de exibição |
| `GET /api/obras?limite=50&offset=0` | Lista paginada de obras |
| `GET /api/obras/destaques` | Uma obra com dimensões por tema (usada na abertura do site) |
| `GET /api/obras/:id` | Uma obra e os temas a que pertence |

### O livro (flipbook)

`frontend/src/hooks/useFlipbook.js` integra a `page-flip` ao React:

- **Páginas fora do React.** A biblioteca move os elementos do DOM por conta própria, então o React entrega um contêiner vazio e as páginas são criadas com JavaScript puro.
- **Uma ou duas páginas.** Quando cabe, o livro abre com duas páginas; em telas estreitas, mostra uma por vez.
- **Proporção preservada.** Cada obra usa `object-fit: contain`: aparece inteira, centralizada, sem corte e sem distorção.
- **Carregamento sob demanda.** Só as imagens próximas da página atual são baixadas.
- **Controles.** Setas do teclado viram as páginas e Esc fecha. No celular, arraste para virar. O foco fica preso no modal e volta ao cartão de origem quando ele fecha.

## Testes

```bash
cd backend && npm test        # testes das rotas (node:test, usa o catálogo JSON)
npm run test:mysql            # os mesmos testes contra o MySQL configurado no .env
```

## Duplicatas

Os 72 arquivos redundantes foram movidos para `_duplicatas/`, com a mesma estrutura de pastas. A lista completa está em `curadoria/duplicatas-removidas.csv`. Para desfazer a remoção, a partir da raiz do projeto:

```powershell
.\scripts\curadoria\restaurar-duplicatas.ps1
```

Outros 40 pares (a mesma foto com duas técnicas diferentes no nome) **continuam em TEMAS/** até a decisão curatorial. No site, cada par aparece uma vez só, porque a imagem é idêntica. Os nomes alternativos ficam registrados em `outros_nomes` no `catalogo.json`.
