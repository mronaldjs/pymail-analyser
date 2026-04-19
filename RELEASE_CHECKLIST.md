# Release Checklist

## 1. Quality Gate

- [ ] `make test` executado com sucesso no root.
- [ ] `cd pymail-webapp && npm run test:e2e` executado com sucesso.
- [ ] Build local sem erros (backend e frontend).

## 2. Configuration and Runtime

- [ ] Variáveis obrigatórias revisadas com base em `pymail-api/.env.example`.
- [ ] `NORMALIZE_SOURCE_INCLUDE_PRIVATE_DOMAINS` validada para o ambiente alvo.
- [ ] `ALLOWED_ORIGINS` revisado para o domínio correto de produção.
- [ ] `GET /health` respondendo com status `ok` no ambiente de release.

## 3. Security and Operations

- [ ] Nenhum segredo em commits, logs ou diffs.
- [ ] Dependências atualizadas e pinadas no backend (`pymail-api/requirements.txt`).
- [ ] Mudanças de contrato de API verificadas no frontend.

## 4. Release Execution

- [ ] Changelog/descrição de release atualizados.
- [ ] Tag/versionamento preparado conforme política do projeto.
- [ ] Plano de rollback definido (commit/tag anterior conhecido).

## 5. Post-release Validation

- [ ] Fluxo principal validado: analisar -> selecionar -> arquivar/excluir.
- [ ] Logs de startup sem erros críticos após deploy.
- [ ] Monitoramento inicial de regressão nas primeiras horas.