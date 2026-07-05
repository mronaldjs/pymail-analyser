# Launch kit — PyMail Analyser

Ready-to-paste copy for the launch, plus a GIF recording guide and a pre-launch
checklist. Positioning: **open-source, self-hosted inbox cleanup where your
password never leaves your machine.**

The one-liner to reuse everywhere:

> Find your noisiest low-engagement email senders and bulk archive/delete them —
> self-hosted, credentials never leave your machine, no database.

---

## Hacker News (Show HN)

**Title** (keep it plain, no hype — HN strips marketing):

```
Show HN: PyMail Analyser – self-hosted inbox cleanup, your password stays local
```

**Body:**

```
I kept declaring "inbox bankruptcy" and hated that every cleanup tool wanted me
to hand my email password to their servers. So I built a self-hosted one.

PyMail Analyser connects to your mailbox over IMAP, scores "low-quality" senders
(high volume + low open rate), and lets you bulk archive/delete or unsubscribe.
It also does a lightweight domain-reputation pass (MX/SPF/DMARC, optionally
VirusTotal) to flag suspicious senders.

Design decisions:
- No database. Everything is computed in-memory per request; credentials are
  never persisted — when you disconnect, they're gone.
- Single IMAP pass, headers-only, never marks mail as read.
- Runs locally via Docker (FastAPI backend + Next.js frontend). Nothing leaves
  your machine except the DNS/VirusTotal lookups (and VT is opt-in).

It's early and the "spam score" is a heuristic (email_count * (1 - open_rate)),
so I'd love feedback on the scoring and the domain-reputation signals.

Repo: https://github.com/mronaldjs/pymail-analyser
```

---

## Product Hunt

**Tagline** (60 chars max):

```
Self-hosted inbox cleanup — your password never leaves you
```

**Description:**

```
PyMail Analyser finds the senders flooding your inbox with mail you never open,
and lets you bulk archive, delete, or unsubscribe in a couple of clicks.

The difference: it's open-source and self-hosted. It connects over IMAP, does
everything in memory, and never stores your credentials — no accounts, no
database, no SaaS reading your inbox. It even checks sender domain reputation
(SPF/DMARC/MX, optional VirusTotal) so you can spot phishing while you clean up.

Spin it up with Docker Compose in a minute. FastAPI + Next.js.
```

**Maker's first comment:**

```
Hey PH 👋 I built this because I wanted to declutter my inbox without giving my
email password to yet another cloud service. It runs entirely on your machine.
The scan is shown as a live terminal log, which I think turned out fun. Feedback
on the sender-scoring heuristic especially welcome!
```

---

## r/selfhosted

**Title:**

```
PyMail Analyser – self-hosted IMAP inbox cleanup (Docker), no DB, credentials never stored
```

**Body:**

```
Sharing a weekend-turned-bigger project: a self-hosted tool to clean up a messy
inbox without trusting a third-party SaaS with your email password.

What it does
- Connects over IMAP, groups senders, and scores the noisy low-engagement ones
- Bulk archive / delete / unsubscribe
- Domain reputation per sender (MX/SPF/DMARC, VirusTotal optional)

Why you might care (r/selfhosted checklist)
- Docker Compose, one command
- No database — in-memory per request; credentials never persisted or logged
- No telemetry; only outbound traffic is DNS + (opt-in) VirusTotal
- MIT licensed

Stack: FastAPI + Next.js. Repo + screenshots: https://github.com/mronaldjs/pymail-analyser

It's early — happy to hear what signals you'd want for the "is this sender junk?"
scoring.
```

---

## BR — r/brdev / Twitter/X / LinkedIn

**Post (PT):**

```
Cansei de "falência de inbox" e não confiava minha senha de e-mail a nenhum SaaS
de limpeza. Então fiz um open-source e self-hosted.

O PyMail Analyser conecta via IMAP, pontua os remetentes que mais te enchem com
e-mail que você nunca abre, e deixa você arquivar/deletar/descadastrar em massa.
Ainda checa reputação de domínio (SPF/DMARC/MX) pra sinalizar phishing.

O pulo do gato: roda 100% na sua máquina (Docker), sem banco de dados, sem
guardar nada — sua credencial nunca sai do seu computador.

FastAPI + Next.js. Feedback é super bem-vindo 🙏
https://github.com/mronaldjs/pymail-analyser
```

---

## Demo GIF — recording guide

The signature moment is the **scan shown as a live terminal log**. Capture the
full flow: login → the terminal log filling in → dashboard.

1. Run the app: `docker compose up` (or `npm run dev` in `pymail-webapp`).
2. Recorder (Windows): **ScreenToGif** (free) — records a region straight to GIF.
   macOS: **Kap**. Linux: **Peek**.
3. Record a ~10-15s clip at ~1280×800:
   - Start on the login terminal panel, type an email, hit Continue.
   - Enter an App Password, hit **Analyze Inbox**.
   - Let the terminal log fill (fetch → scan → reputation), then land on the dashboard.
4. Trim to the good part; keep it under ~5 MB so GitHub/PH render it inline.
5. Save as `.github/demo.gif` and reference it near the top of the README:
   `![PyMail Analyser demo](.github/demo.gif)`

Tip: pick an inbox (or a throwaway Gmail with App Password) that has enough
senders to make the scan visibly count up.

---

## Pre-launch checklist

- [ ] Repo is **public** with a clear README (done) + demo GIF (above)
- [ ] Enable **GitHub Sponsors** and create the **Buy Me a Coffee** page, then fix
      the usernames in `.github/FUNDING.yml` and the README Support section
- [ ] Add real **screenshots** (light + dark) to the README
- [ ] Confirm `docker compose up` works from a clean clone (fresh machine test)
- [ ] LICENSE present (MIT ✓) and `NEXT_PUBLIC_API_URL` documented
- [ ] Post to **one** channel first (r/selfhosted or Show HN), iterate on feedback,
      then the others a day or two apart
- [ ] Be around for the first few hours to answer comments
```
