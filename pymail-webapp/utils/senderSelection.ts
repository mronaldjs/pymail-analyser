import { SenderStats } from '@/types/api';

export function getSenderKey(sender: SenderStats): string {
  return sender.source_key || sender.sender_email;
}

export function getSenderEmails(sender: SenderStats): string[] {
  return sender.sender_emails && sender.sender_emails.length > 0
    ? sender.sender_emails
    : [sender.sender_email];
}

export function buildBulkSenderEmails(senders: SenderStats[]): string[] {
  return Array.from(new Set(senders.flatMap((sender) => getSenderEmails(sender))));
}

export function filterBySources(senders: SenderStats[], sources: string[]): SenderStats[] {
  if (sources.length === 0) {
    return senders;
  }
  return senders.filter((sender) => sources.includes(getSenderKey(sender)));
}
