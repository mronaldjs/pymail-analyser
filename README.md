# PyMail Analyser

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
   git clone https://github.com/your-username/pymail-analyser.git
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
├── backend/          # FastAPI API and IMAP analysis logic
│   ├── models/       # Data schemas (Pydantic)
│   ├── services/     # Business logic (analyzer.py)
│   └── main.py       # API entry point
├── frontend/         # Next.js application
│   ├── app/          # Pages and routes (App Router)
│   ├── components/   # React components and Shadcn/UI
│   └── utils/        # Helpers and provider configurations
└── docker-compose.yml # Service orchestration
```

## Security

PyMail Analyser **does not store** your passwords. Credentials are only sent during the analysis session and deletion/archiving operations. We always recommend using "App Passwords" instead of your primary password, especially for Google-based accounts (like Gmail or Institutional emails).

---
Developed to make your digital life more organized!
