export const EMAIL_PROVIDERS: Record<string, string> = {
  'gmail.com': 'imap.gmail.com',
  'googlemail.com': 'imap.gmail.com',
  'outlook.com': 'imap-mail.outlook.com',
  'hotmail.com': 'imap-mail.outlook.com',
  'yahoo.com': 'imap.mail.yahoo.com',
  'yahoo.com.br': 'imap.mail.yahoo.com',
  'protonmail.com': 'imap.protonmail.com',
  'pm.me': 'imap.protonmail.com',
  'ufg.br': 'imap.gmail.com', // Seu domínio corporativo
};

export function inferIMAPHost(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? EMAIL_PROVIDERS[domain] || null : null;
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
  };
  
  return providerMap[domain] || domain;
}