# PyMail Analyser Documentation

This directory contains the official documentation content for the project. It complements the main README and organizes information into clear topics for backend, frontend, and contributions.

## Purpose

The main goal of `docs/` is to serve as the entry point for anyone who wants to understand:

- how the system works internally;
- how the backend analyzes and scores senders;
- how the frontend displays results and enables bulk actions;
- how to contribute to the project.

## Main structure

- `index.md`
  - the documentation home page.
  - provides an overview of the project and links to the main sections.
- `backend/`
  - `index.md`: introduction to the backend architecture and services.
  - `analyzer.md`: details of email and sender analysis flow.
  - `reputation.md`: explanation of domain reputation, DNS, and VirusTotal.
  - `api_spec.md`: API specification (endpoints, schemas, and responses).
- `frontend/`
  - `index.md`: overview of the web application and main components.
  - `components.md`: documentation for UI components.
  - `utils.md`: utilities and support logic for the frontend.
  - `reference/`: function and utility reference documentation.
- `CONTRIBUTING.md`
  - contribution guide for developers.
  - explains how to open issues, run tests, and submit PRs.

## How to use this documentation

1. Open `docs/index.md` to begin.
2. Browse `backend/` if you want to understand the analysis logic and API.
3. Browse `frontend/` if you want to see how the interface is built.
4. Read `CONTRIBUTING.md` before submitting changes or new contributions.

## Why this README exists

This file was created so the `docs/` folder is self-explanatory and helps new contributors find content without having to inspect the structure manually.

If you are contributing documentation, also update this README when you add new guides or sections.
