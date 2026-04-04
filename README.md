# PyMail Analyser

[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

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
- **Pandas**: Email data processing and analysis.
- **Pydantic**: Schema and type validation.

### Frontend (Next.js/TypeScript)
- **Next.js 15+**: React framework with App Router.
- **Tailwind CSS**: Modern and responsive styling.
- **Shadcn/UI**: Polished UI components.
- **React Query**: Async state management and API caching.

## Getting Started

The easiest way to run the project is using **Docker Compose**.

### Prerequisites
- Docker and Docker Compose installed.
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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
**Developed to make your digital life more organized!**

📧 Questions? Open an [issue](https://github.com/mronaldjs/pymail-analyser/issues) or reach out on [LinkedIn](https://linkedin.com/in/mronaldjs)
