import { expect, test } from '@playwright/test';

test('fluxo principal: analisar e arquivar selecionados', async ({ page }) => {
  let archivePayload: unknown = null;

  await page.route('**/analyze', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_emails_scanned: 3,
        health_score: 82,
        source_grouping_mode: 'provider',
        ignored_senders: [
          {
            sender_name: 'Promoções Diárias',
            sender_email: 'promo@news.example.com',
            source_key: 'example',
            sender_emails: ['promo@news.example.com'],
            email_count: 2,
            open_rate: 10,
            spam_score: 18.5,
            spam_risk: 'high',
          },
          {
            sender_name: 'Alertas Oficiais',
            sender_email: 'alerts@google.com',
            source_key: 'google',
            sender_emails: ['alerts@google.com'],
            email_count: 1,
            open_rate: 100,
            spam_score: 1.2,
            spam_risk: 'low',
          },
        ],
      }),
    });
  });

  await page.route('**/archive', async (route) => {
    archivePayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ archived: 1, not_archived: 0 }),
    });
  });

  await page.goto('/');

  await page.getByPlaceholder('seu.email@gmail.com').fill('user@gmail.com');
  await page.getByRole('button', { name: 'Continuar' }).click();

  await page.getByPlaceholder('••••••••').fill('fake-app-password');
  await page.getByRole('button', { name: 'Analisar Inbox' }).click();

  await expect(page.getByRole('heading', { name: 'Painel da Caixa de Entrada' })).toBeVisible();

  await page.getByLabel('Selecionar Promoções Diárias').check();
  await page.getByRole('button', { name: 'Arquivar selecionados' }).click();
  await page.getByRole('button', { name: 'Confirmar Arquivamento' }).click();

  await expect(page.getByText('Arquivamento concluído!')).toBeVisible();

  expect(archivePayload).toEqual(
    expect.objectContaining({
      sender_emails: ['promo@news.example.com'],
    }),
  );
});