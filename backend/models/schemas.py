from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class IMAPCredentials(BaseModel):
    host: str = Field(..., description="IMAP Server Host (e.g., imap.gmail.com)")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="App Password or User Password")
    days_limit: int = Field(30, description="Number of days to look back for analysis")

class SenderStats(BaseModel):
    sender_name: str
    sender_email: str
    email_count: int
    open_rate: float
    spam_score: float
    unsubscribe_link: Optional[str] = None

class AnalysisResponse(BaseModel):
    total_emails_scanned: int
    ignored_senders: List[SenderStats]
    health_score: int

class DeleteRequest(BaseModel):
    credentials: IMAPCredentials
    sender_emails: List[str]
