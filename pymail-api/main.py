from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import IMAPCredentials, AnalysisResponse, DeleteRequest
from services.analyzer import EmailAnalyzer
import uvicorn
import os

app = FastAPI(title="Email Analysis API")

# CORS Setup - use environment variable or default to localhost
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_inbox(credentials: IMAPCredentials):
    try:
        analyzer = EmailAnalyzer(credentials)
        result = analyzer.analyze()
        return result
    except Exception as e:
        # In production, log the error properly
        print(f"Error analyzing inbox: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/delete")
async def delete_emails(request: DeleteRequest):
    try:
        analyzer = EmailAnalyzer(request.credentials)
        result = analyzer.delete_emails(request.sender_emails)
        return result
    except Exception as e:
        print(f"Error deleting emails: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/archive")
async def archive_emails(request: DeleteRequest):
    try:
        analyzer = EmailAnalyzer(request.credentials)
        result = analyzer.archive_emails(request.sender_emails)
        return result
    except Exception as e:
        print(f"Error archiving emails: {e}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
