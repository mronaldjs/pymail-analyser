# PyMail Webapp

Interface web do projeto PyMail Analyser, construída com Next.js e TypeScript. Ela permite autenticar em uma conta IMAP, analisar remetentes de baixa relevância e executar ações em lote como arquivar ou excluir e-mails.

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Axios
- Vitest + Testing Library

## Pré-requisitos

- Node.js 20+
- npm 10+
- API do backend rodando em http://localhost:8000 (ou URL configurada via ambiente)

## Configuração

Crie um arquivo .env.local na pasta do frontend com:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Executando em desenvolvimento

```bash
npm install
npm run dev
```

Aplicação disponível em http://localhost:3000.

## Scripts

```bash
npm run dev      # modo desenvolvimento
npm run build    # build de produção
npm run start    # executa build em produção
npm run lint     # lint com ESLint
npm run test     # testes em watch mode
npm run test:run # testes uma vez (CI/local)
```

## Testes

```bash
npm run test:run
```

## Estrutura resumida

```text
pymail-webapp/
├── app/                  # rota principal e layout
├── components/           # componentes de UI
├── types/                # contratos de tipos com a API
├── utils/                # utilitários e regras de seleção
└── vitest.config.ts      # configuração de testes
```
