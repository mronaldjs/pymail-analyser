# Motor de Análise (EmailAnalyzer)

O `EmailAnalyzer` é o coração do backend. Ele processa mensagens da caixa de entrada em uma única passagem (Single-pass aggregation) para maximizar a performance.

## 🧠 Lógica de Cálculo de Risco

O sistema calcula dois valores principais para cada remetente: `spam_score` (numérico) e `spam_risk` (categoria).

### 1. Spam Score Base
Calculado como:
`spam_score = quantidade_emails * (1 - taxa_abertura) * 10`

### 2. Multiplicadores de Ranking
O sistema aplica bônus ou penalidades baseadas na origem do e-mail:

- **Domínios Oficiais**: Se o domínio for reconhecido (ex: `google.com`, `paypal.com`), o rank é reduzido em **82%** (confiável).
- **Domínios Suspeitos**: TLDs como `.xyz`, `.top` recebem uma penalidade de **28%**.
- **Sinal de Desinscrição**: Remetentes com links de `List-Unsubscribe` e alta taxa de desinscrição são considerados mais seguros (marketing legítimo).

## 🛠️ Métodos Principais

### `analyze()`
Conecta ao servidor IMAP, busca os cabeçalhos (`fetch`) do período solicitado e agrupa os dados por `source_key` (origem simplificada).

### Agrupamento de `source_key` (PSL)
O agrupamento usa Public Suffix List (PSL) via `tldextract`.

- Padrão (`NORMALIZE_SOURCE_INCLUDE_PRIVATE_DOMAINS=false`): agrupa por provedor em sufixos privados (`myblog.github.io` -> `github`).
- Opcional (`NORMALIZE_SOURCE_INCLUDE_PRIVATE_DOMAINS=true`): agrupa por tenant em sufixos privados (`myblog.github.io` -> `myblog`).

A API inclui `source_grouping_mode` para indicar a granularidade ativa (`provider` ou `tenant`).

### `delete_emails()`
Busca todos os UIDs dos e-mails dos remetentes selecionados e tenta movê-los para a pasta **Lixeira** (Trash). Se não encontrar, marca como excluídos no servidor.

### `archive_emails()`
Tenta mover os e-mails para a pasta **Todos os E-mails** (Gmail) ou **Arquivo**. Caso não encontre uma pasta compatível, a operação é abortada para evitar perda de dados.

## 📂 Código-Fonte Automático

Abaixo, a documentação gerada diretamente dos comentários do código:

::: services.analyzer
