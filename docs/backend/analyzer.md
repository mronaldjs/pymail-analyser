# Analysis Engine (EmailAnalyzer)

The `EmailAnalyzer` is the backend core. It processes inbox messages in a single pass (single-pass aggregation) to maximize performance.

## 🧠 Risk Calculation Logic

The system calculates two main values for each sender: `spam_score` (numeric) and `spam_risk` (category).

### 1. Base Spam Score
Calculated as:
`spam_score = email_count * (1 - open_rate) * 10`

### 2. Ranking Multipliers
The system applies bonuses or penalties based on the email origin:

- **Official Domains**: If the domain is recognized (e.g. `google.com`, `paypal.com`), the score is reduced by **82%** (trusted).
- **Suspicious Domains**: TLDs like `.xyz` and `.top` receive a **28%** penalty.
- **Unsubscribe Signal**: Senders with `List-Unsubscribe` links and high unsubscribe rates are considered safer (legitimate marketing).

## 🛠️ Main Methods

### `analyze()`
Connects to the IMAP server, fetches message headers for the requested period, and aggregates data by `source_key` (simplified origin).

### `source_key` Grouping (PSL)
Grouping uses the Public Suffix List (PSL) via `tldextract`.

- Default (`NORMALIZE_SOURCE_INCLUDE_PRIVATE_DOMAINS=false`): groups by provider for private suffixes (`myblog.github.io` -> `github`).
- Optional (`NORMALIZE_SOURCE_INCLUDE_PRIVATE_DOMAINS=true`): groups by tenant for private suffixes (`myblog.github.io` -> `myblog`).

The API includes `source_grouping_mode` to indicate the active grouping granularity (`provider` or `tenant`).

### `delete_emails()`
Fetches all UIDs for the selected sender emails and attempts to move them to the **Trash** folder. If not found, it marks them as deleted on the server.

### `archive_emails()`
Attempts to move emails to the **All Mail** folder (Gmail) or **Archive** folder. If no compatible folder is found, the operation is aborted to avoid data loss.

## 📂 Auto-generated Source Documentation

Below is documentation generated directly from code comments:

::: services.analyzer
