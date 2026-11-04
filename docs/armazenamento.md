# Onde guardar as imagens

O acervo tem 508 MB de originais. A recomendação é **separar três coisas que hoje estão misturadas**: o arquivo-mestre, as imagens que o site exibe e o código.

| O quê | Tamanho | Onde fica | Vai para o Git? |
|---|---|---|---|
| Originais (`TEMAS/`) | ~500 MB, cresce com o acervo | Disco local + backup em nuvem | Não |
| Cópias removidas (`_duplicatas/`) | ~30 MB | Junto com o backup dos originais | Não |
| Versões web (`media/`) | ~70 MB, geradas pelo `npm run catalogar` | Local no desenvolvimento; armazenamento de objetos em produção | Não |
| Código, `curadoria/*.csv`, `catalogo.json` | < 2 MB | GitHub | Sim |

## Por que não colocar as imagens no Git

O Git guarda **todas as versões** de cada arquivo para sempre. Trocar uma foto por outra melhor dobra o espaço ocupado, e todo `git clone` baixa o histórico inteiro. Imagens são arquivos binários: o Git não consegue mostrar o que mudou nem compactar as diferenças entre versões, então perde as vantagens que tem com código.

Git LFS resolve parte disso guardando os binários num servidor à parte, mas a cota gratuita é pequena e qualquer `clone` de quem visita o repositório consome banda dessa cota.

## Recomendação

**1. Originais: regra 3-2-1** (3 cópias, em 2 mídias, 1 fora de casa)
- Cópia de trabalho no computador (`paulo-canuto-artes/TEMAS`).
- Backup em HD externo ou pendrive.
- Backup em nuvem: **Google Drive** (15 GB grátis na conta Google) ou OneDrive. Sincronize a pasta `TEMAS` e a `_duplicatas`.

**2. Versões web em produção: Cloudflare R2**
- 10 GB grátis e **nenhuma cobrança por tráfego** (o principal custo de um site de imagens).
- Compatível com a API do Amazon S3, então dá para trocar de provedor depois.
- Alternativa mais simples: Cloudinary (plano gratuito, com redimensionamento automático; tem limite de créditos mensais).
- Até o deploy, o próprio Express serve `media/` localmente. Nada muda no código: a coluna `obras.url` guarda um caminho relativo, e em produção basta definir o endereço base (`MEDIA_BASE_URL`).

**3. Código no GitHub**
- O `.gitignore` já exclui `TEMAS/`, `_duplicatas/` e `media/`.
- `backend/database/catalogo.json` e `curadoria/duplicatas-removidas.csv` são texto e pequenos: ficam no Git e documentam o acervo (nomes, dimensões, hashes) sem carregar as imagens.

## Como recriar tudo num computador novo

```bash
git clone <repositório>
# copie a pasta TEMAS do backup para dentro do projeto
cd backend
npm install
npm run catalogar
```
