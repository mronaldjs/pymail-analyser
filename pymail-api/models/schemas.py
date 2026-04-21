from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date

class DomainReputation(BaseModel):
    """Signals consulted for the sender's domain(s) (Public DNS; Optional VT)."""
    primary_domain: str = ""
    checked_domains: List[str] = Field(default_factory=list)
    mx: Optional[bool] = None
    spf: Optional[str] = None
    dmarc: Optional[str] = None
    dns_trust: Optional[float] = Field(
        None,
        ge=-1.0,
        le=1.0,
        description="Conservative aggregate (minimum among domain groups): -1 suspicious … +1 strong",
    )
    summary_pt: Optional[str] = None
    summary_en: Optional[str] = None
    virustotal_malicious: Optional[int] = None
    virustotal_suspicious: Optional[int] = None

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
    source_key: Optional[str] = None
    sender_emails: List[str] = Field(default_factory=list)
    email_count: int
    open_rate: float
    spam_score: float
    spam_risk: Optional[str] = Field(
        None,
        description="high | medium | low — estimated chance of being spam vs official sender",
    )
    domain_reputation: Optional[DomainReputation] = None
    unsubscribe_link: Optional[str] = None

class AnalysisResponse(BaseModel):
    total_emails_scanned: int
    ignored_senders: List[SenderStats]
    health_score: int
    source_grouping_mode: Optional[str] = Field(
        None,
        description="provider | tenant — granularity used to compute source_key",
    )

class DeleteRequest(BaseModel):
    credentials: IMAPCredentials
    sender_emails: List[str]


class HealthResponse(BaseModel):
    status: str = Field(..., description="API health status")
    source_grouping_mode: Optional[str] = Field(
        None,
        description="provider | tenant — active source grouping mode",
    )



class ReadyResponse(BaseModel):
    status: str = Field(..., description="API readiness status")
    source_grouping_mode: Optional[str] = Field(
        None,
        description="provider | tenant — active source grouping mode",
    )
    virustotal_enabled: bool = Field(
        False,
        description="True when VIRUSTOTAL_API_KEY is set and domain reputation will include VT signals",
    )

class ErrorResponse(BaseModel):
    detail: str
    error_code: str
