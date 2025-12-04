from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date

class IMAPCredentials(BaseModel):
    host: str = Field(..., description="IMAP Server Host (e.g., imap.gmail.com)")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="App Password or User Password")
    days_limit: Optional[int] = Field(None, description="Number of days to look back for analysis")
    start_date: Optional[date] = Field(None, description="Start date for custom range (YYYY-MM-DD)")
    end_date: Optional[date] = Field(None, description="End date for custom range (YYYY-MM-DD)")

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
