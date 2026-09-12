from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.schemas import MoodAnalysisRequest, MoodAnalysisResponse
from app.mood_analyzer import mood_analyzer
from app.config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, before accepting requests"""
    logger.info("🚀 Starting Eunoia Mood Analyzer...")
    try:
        logger.info(f"Loading emotion model: {settings.MODEL_NAME}")
        mood_analyzer._load_model()
        logger.info("✓ Model loaded successfully!")
    except Exception as e:
        logger.error(f"✗ Failed to load model on startup: {e}", exc_info=True)
        raise RuntimeError(f"Failed to initialize mood analyzer: {e}")
    
    yield
    
    logger.info("🛑 Shutting down Eunoia Mood Analyzer...")

app = FastAPI(
    title="Eunoia Mood Analyzer",
    description="Analyzes emotions in journal entries using emotion detection",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - allow NestJS backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",           # Local dev
        "http://localhost:8080",           # Alternative local dev
        "https://*.onrender.com",          # All Render subdomains
        "https://eunoia-*.onrender.com",   # Specific Render services
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    """Health check - verify service and model are ready"""
    try:
        if mood_analyzer._classifier is None:
            return {
                "status": "loading",
                "ready": False,
                "message": "Model is loading, please try again in a moment"
            }
        return {
            "status": "ok",
            "ready": True,
            "model": settings.MODEL_NAME,
            "message": "Mood analyzer is ready"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "ready": False,
            "message": str(e)
        }

@app.post("/analyze", response_model=MoodAnalysisResponse)
async def analyze_mood(request: MoodAnalysisRequest):
    """
    Analyze emotions in a journal entry
    
    **Parameters:**
    - **text**: Journal entry text (3-5000 characters)
    - **threshold**: Confidence threshold for emotion detection (0.0-1.0, default 0.3)
    
    **Returns:**
    - **detected_moods**: List of detected emotions with confidence scores
    - **primary_mood**: The strongest detected emotion
    - **summary**: Human-readable interpretation
    
    **Example:**
    ```json
    {
        "text": "I feel sad today but there's a little hope",
        "threshold": 0.3
    }
    ```
    """
    try:
        logger.info(f"Analyzing mood for text: {request.text[:50]}...")
        result = mood_analyzer.analyze(request.text, request.threshold)
        logger.info(f"Analysis complete. Primary mood: {result['primary_mood']}")
        return MoodAnalysisResponse(**result)
    except ValueError as e:
        logger.warning(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Mood analysis failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze mood: {str(e)}"
        )

@app.get("/")
async def root():
    """API info and documentation"""
    return {
        "name": "Eunoia Mood Analyzer API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "analyze": "/analyze (POST)",
        "model": settings.MODEL_NAME
    }

# Error handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return {
        "detail": "An unexpected error occurred",
        "type": "internal_server_error"
    }