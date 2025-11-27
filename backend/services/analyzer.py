from datetime import date, timedelta
from typing import List, Dict, Any
from imap_tools import MailBox, A
import pandas as pd
from backend.models.schemas import IMAPCredentials, SenderStats, AnalysisResponse

class EmailAnalyzer:
    def __init__(self, credentials: IMAPCredentials):
        self.credentials = credentials

    def analyze(self) -> AnalysisResponse:
        # 1. Connect to IMAP
        with MailBox(self.credentials.host).login(self.credentials.email, self.credentials.password) as mailbox:
            # 2. Fetch headers from last X days
            # We only need specific headers to save bandwidth
            days = self.credentials.days_limit if self.credentials.days_limit else 30
            criteria = A(date_gte=date.today() - timedelta(days=days))
            
            # Fetching messages
            messages = []
            for msg in mailbox.fetch(criteria, bulk=True):
                messages.append({
                    "sender_email": msg.from_values.email if msg.from_values else "unknown@unknown.com",
                    "sender_name": msg.from_values.name if msg.from_values else "Unknown Sender",
                    "is_read": 1 if 'SEEN' in msg.flags else 0,
                    "list_unsubscribe": msg.headers.get('list-unsubscribe', [None])[0] if msg.headers.get('list-unsubscribe') else None
                })

        if not messages:
            return AnalysisResponse(total_emails_scanned=0, ignored_senders=[], health_score=100)

        # 3. Process with Pandas
        df = pd.DataFrame(messages)
        
        # Group by sender
        stats = df.groupby('sender_email').agg({
            'sender_name': 'first', # Take the first name found
            'is_read': ['count', 'mean'], # count = volume, mean = open rate (0-1)
            'list_unsubscribe': 'first'
        }).reset_index()

        # Flatten MultiIndex columns
        stats.columns = ['sender_email', 'sender_name', 'email_count', 'open_rate', 'unsubscribe_link']

        # 4. Calculate Spam Score
        # Logic: High volume + Low open rate = High Spam Score
        # Formula: (Volume * (1 - Open Rate)) normalized? 
        # Simple heuristic: Volume * (1 - Open Rate) * 10
        stats['spam_score'] = stats['email_count'] * (1 - stats['open_rate']) * 10
        
        # Sort by spam score descending
        stats = stats.sort_values('spam_score', ascending=False)

        # 5. Format Response
        ignored_senders = []
        for _, row in stats.iterrows():
            # Clean up unsubscribe link if present (often comes in brackets <...>)
            unsub = row['unsubscribe_link']
            if unsub and isinstance(unsub, str):
                # Try to find http link first
                import re
                http_links = re.findall(r'<(https?://[^>]+)>', unsub)
                if http_links:
                    unsub = http_links[0]
                else:
                    # Fallback to mailto or raw clean
                    unsub = unsub.strip('<>').split(',')[0].strip()

            ignored_senders.append(SenderStats(
                sender_name=row['sender_name'] if row['sender_name'] else row['sender_email'],
                sender_email=row['sender_email'],
                email_count=int(row['email_count']),
                open_rate=round(row['open_rate'] * 100, 1), # Convert to percentage
                spam_score=round(row['spam_score'], 1),
                unsubscribe_link=unsub
            ))

        # Calculate overall health score (inverse of total spam score, normalized roughly)
        total_spam_score = stats['spam_score'].sum()
        health_score = max(0, min(100, 100 - int(total_spam_score / 5))) # Arbitrary scaling for demo

        return AnalysisResponse(
            total_emails_scanned=len(df),
            ignored_senders=ignored_senders,
            health_score=health_score
        )

    def delete_emails(self, sender_emails: List[str]) -> Dict[str, int]:
        deleted_count = 0
        with MailBox(self.credentials.host).login(self.credentials.email, self.credentials.password) as mailbox:
            # Try to find the Trash folder
            trash_folder = None
            possible_trash_names = ['[Gmail]/Trash', '[Gmail]/Lixeira', 'Trash', 'Deleted Items', 'Deleted', 'Itens Excluídos', 'INBOX.Trash']
            
            # Get list of folders
            folders = [f.name for f in mailbox.folder.list()]
            
            for name in possible_trash_names:
                if name in folders:
                    trash_folder = name
                    break
            
            # If we can't find a standard trash folder, maybe we just use delete() which flags as \Deleted
            # But for Gmail, delete() often archives.
            
            for sender in sender_emails:
                # Find messages from this sender
                criteria = A(from_=sender)
                
                # Fetch uids to delete
                uids = [msg.uid for msg in mailbox.fetch(criteria, headers_only=True)]
                
                if uids:
                    if trash_folder:
                        # Move to Trash is the most reliable "Delete" for Gmail
                        mailbox.move(uids, trash_folder)
                    else:
                        # Fallback to standard delete (flag \Deleted)
                        mailbox.delete(uids)
                    
                    deleted_count += len(uids)
        
        return {"deleted": deleted_count}
