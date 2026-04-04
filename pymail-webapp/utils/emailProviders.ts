export const EMAIL_PROVIDERS: Record<string, string> = {
  'gmail.com': 'imap.gmail.com',
  'googlemail.com': 'imap.gmail.com',
  'outlook.com': 'imap-mail.outlook.com',
  'hotmail.com': 'imap-mail.outlook.com',
  'yahoo.com': 'imap.mail.yahoo.com',
  'yahoo.com.br': 'imap.mail.yahoo.com',
  'protonmail.com': 'imap.protonmail.com',
  'pm.me': 'imap.protonmail.com',
  'ufg.br': 'imap.gmail.com',
  'discente.ufg.br': 'imap.gmail.com',
};

export function inferIMAPHost(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  
  // Check exact domain
  if (EMAIL_PROVIDERS[domain]) return EMAIL_PROVIDERS[domain];

  // Fallback for some common patterns
  if (domain.endsWith('.ufg.br')) return 'imap.gmail.com';
  
  return null;
}

export function getProviderName(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return 'Desconhecido';
  
  const providerMap: Record<string, string> = {
    'gmail.com': 'Gmail',
    'googlemail.com': 'Gmail',
    'outlook.com': 'Outlook',
    'hotmail.com': 'Hotmail',
    'yahoo.com': 'Yahoo Mail',
    'yahoo.com.br': 'Yahoo Mail',
    'protonmail.com': 'ProtonMail',
    'pm.me': 'ProtonMail',
    'ufg.br': 'Gmail (UFG)',
    'discente.ufg.br': 'Gmail (UFG Discente)',
  };
  
  if (providerMap[domain]) return providerMap[domain];

  // Friendly name for generic institutional emails
  if (domain.endsWith('.br')) {
    if (domain.includes('ufg')) return `UFG (${domain})`;
    if (domain.includes('edu')) return `Institucional (${domain})`;
  }

  return domain;
}