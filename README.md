# PyMail Analyser

[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![CI](https://github.com/mronaldjs/pymail-analyser/actions/workflows/ci.yml/badge.svg)](https://github.com/mronaldjs/pymail-analyser/actions/workflows/ci.yml)

**PyMail Analyser** is an open-source tool designed to help you clean up and manage your email inbox. Through an intuitive interface, it analyzes your emails via IMAP, identifies "low-quality" senders (with high volume and low open rates), and allows you to take quick actions like archiving or bulk deleting messages.

## Features

- **Inbox Analysis**: Connect via IMAP (Gmail, Outlook, Yahoo, etc.) to scan your recent emails.
- **Health Score**: Automatic calculation of a "Spam Score" based on email frequency and your interaction with them.
- **Unsubscribe Detection**: Automatically identifies `Unsubscribe` links in email headers.
- **Bulk Actions**: Delete or archive all emails from selected senders with a single click.
- **Privacy**: Local processing via Docker, ensuring your credentials are never stored on external servers.

## Tech Stack

### Backend (Python/FastAPI)
- **FastAPI**: High-performance API.
- **imap-tools**: Robust handling of IMAP connections.
- **In-memory heuristics**: Fast sender scoring and grouping without heavy dataframe dependencies.
- **Pydantic**: Schema and type validation.

### Frontend (Next.js/TypeScript)
- **Next.js 15+**: React framework with App Router.
- **Tailwind CSS**: Modern and responsive styling.
- **Shadcn/UI**: Polished UI components.
- **React Query**: Async state management and API caching.

## Screenshots

> 📸 Coming soon! Add a screenshot of the inbox dashboard here.

## Getting Started

The easiest way to run the project is using **Docker Compose**.

### Prerequisites
- Docker and Docker Compose installed.
- Node.js 20+ and npm 10+ (for running frontend tests and E2E outside Docker).
- An email account with IMAP access enabled.
    - For **Gmail/Google Workspace** (including **UFG**), you MUST use [App Passwords](https://support.google.com/accounts/answer/185833).

### Step by Step

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mronaldjs/pymail-analyser.git
   cd pymail-analyser
   ```

2. **Start the containers**:
   ```bash
   docker-compose up --build
   ```

3. **Access the applications**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend (API)**: [http://localhost:8000](http://localhost:8000)
   - **API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Healthcheck**: [http://localhost:8000/health](http://localhost:8000/health)
   - **Readiness**: [http://localhost:8000/ready](http://localhost:8000/ready)
### Observability & Request Tracing

#### Readiness Endpoint

O backend expõe o endpoint `/ready` para checagem de prontidão operacional (útil para orquestradores e healthchecks avançados):

```
GET /ready
{
   "status": "ready",
   "source_grouping_mode": "provider" | "tenant"
}
```

#### Propagação de request_id

Todas as requisições HTTP aceitam o header `x-request-id` (opcional). Se enviado, o backend propaga esse valor em respostas de erro estruturadas (`error_code`). Caso não seja enviado, um UUID é gerado automaticamente. Isso facilita rastreamento de requisições e correlação de logs.

Exemplo de resposta de erro:

```
{
   "detail": "Falha de autenticação IMAP. Verifique e-mail e senha de app.",
   "error_code": "IMAP_AUTH_FAILED",
   "request_id": "seu-uuid-ou-header"
}
```

### Running Tests

From the repository root, run all tests with a single command:

```bash
make test
```

You can also run each suite separately:

```bash
make test-backend
make test-frontend
```

Run the minimal end-to-end flow test (mocked API):

```bash
cd pymail-webapp
npm run test:e2e
```

Or from root:

```bash
make test-e2e
```

If this is your first E2E run, install Playwright browser binaries:

```bash
cd pymail-webapp
npx playwright install chromium
```

### Optional Backend Configuration

You can control sender grouping behavior for domains under private suffixes (for example: `github.io`, `blogspot.com`):

- `NORMALIZE_SOURCE_INCLUDE_PRIVATE_DOMAINS=false` (default): groups by provider (`myblog.github.io` -> `github`)
- `NORMALIZE_SOURCE_INCLUDE_PRIVATE_DOMAINS=true`: groups by tenant (`myblog.github.io` -> `myblog`)

This setting changes how `source_key` is generated and may affect how senders appear in bulk actions.

Additional backend environment variables:

- `ALLOWED_ORIGINS`: comma-separated CORS origins (default: `http://localhost:3000,http://localhost:8008`)
- `VIRUSTOTAL_API_KEY`: enables optional VirusTotal enrichment
- `DOMAIN_REPUTATION_CACHE_FILE`: custom cache file path for domain reputation data
- `DOMAIN_REPUTATION_DNS_TTL_SECONDS`: TTL in seconds for DNS reputation cache
- `DOMAIN_REPUTATION_VT_TTL_SECONDS`: TTL in seconds for VirusTotal cache

Use [pymail-api/.env.example](pymail-api/.env.example) as a starting point for local configuration.

## Project Structure

```text
pymail-analyser/
├── pymail-api/       # FastAPI API and IMAP analysis logic
│   ├── models/       # Data schemas (Pydantic)
│   ├── services/     # Business logic (analyzer.py)
│   ├── tests/        # Unit tests
│   ├── Dockerfile    # Backend container configuration
│   └── main.py       # API entry point
├── pymail-webapp/    # Next.js application
│   ├── app/          # Pages and routes (App Router)
│   ├── components/   # React components and Shadcn/UI
│   ├── utils/        # Helpers and provider configurations
│   ├── Dockerfile    # Frontend container configuration
│   └── package.json  # Dependencies
└── docker-compose.yml # Service orchestration
```

## Security

PyMail Analyser **does not store** your passwords. Credentials are only sent during the analysis session and deletion/archiving operations. We always recommend using "App Passwords" instead of your primary password, especially for Google-based accounts (like Gmail or Institutional emails).

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests. Please ensure that:
- Code follows the project's style guidelines
- Tests pass and cover new functionality
- Documentation is updated accordingly

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

For release validation, follow [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
**Developed to make your digital life more organized!**

📧 Questions? Open an [issue](https://github.com/mronaldjs/pymail-analyser/issues) or reach out on [LinkedIn](https://linkedin.com/in/mronaldjs)
