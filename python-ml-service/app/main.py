from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import MoodAnalysisRequest, MoodAnalysisResponse
from app.mood_analyzer import mood_analyzer
from app.config import settings

app = FastAPI(
    title="Mood Analyzer",
    description="Analyzes emotions in journal entries",
    version="1.0.0"
)

# CORS - allow NestJS backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",  # Local dev
        "https://*.onrender.com",  # All Render subdomains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", response_model=MoodAnalysisResponse)
async def analyze_mood(request: MoodAnalysisRequest):
    """
    Analyze emotions in text
    
    - **text**: Journal entry (3-5000 characters)
    - **threshold**: Confidence threshold (0-1), default 0.3
    """
    try:
        result = mood_analyzer.analyze(request.text, request.threshold)
        return MoodAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}