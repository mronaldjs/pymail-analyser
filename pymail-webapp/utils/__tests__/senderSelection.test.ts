import { describe, it, expect } from 'vitest'
import { buildBulkSenderEmails, filterBySources, getSenderKey } from '../senderSelection'
import { SenderStats } from '@/types/api'

const senderA: SenderStats = {
  sender_name: 'LinkedIn Jobs',
  sender_email: 'jobs-noreply@linkedinmail.com',
  source_key: 'linkedin',
  sender_emails: ['jobs-noreply@linkedinmail.com', 'messages-noreply@linkedin.com'],
  email_count: 12,
  open_rate: 10,
  spam_score: 108.0
}

const senderB: SenderStats = {
  sender_name: 'Promo',
  sender_email: 'newsletter@promo.com',
  source_key: 'promo',
  sender_emails: ['newsletter@promo.com'],
  email_count: 6,
  open_rate: 0,
  spam_score: 60.0
}

describe('senderSelection utils', () => {
  it('prioriza source_key ao criar chave de seleção', () => {
    expect(getSenderKey(senderA)).toBe('linkedin')
  })

  it('filtra por múltiplas fontes selecionadas', () => {
    const filtered = filterBySources([senderA, senderB], ['linkedin'])
    expect(filtered).toEqual([senderA])
  })

  it('monta payload de ação em lote sem duplicar remetentes', () => {
    const emails = buildBulkSenderEmails([senderA, senderA, senderB])
    expect(emails).toEqual([
      'jobs-noreply@linkedinmail.com',
      'messages-noreply@linkedin.com',
      'newsletter@promo.com'
    ])
  })
})
