from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models.schemas import IMAPCredentials, AnalysisResponse, DeleteRequest
from backend.services.analyzer import EmailAnalyzer
import uvicorn

app = FastAPI(title="Email Analysis API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Frontend URL
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
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
