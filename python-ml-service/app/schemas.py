from pydantic import BaseModel, Field
from typing import List, Optional

class EmotionScore(BaseModel):
    """Individual emotion with confidence score"""
    emotion: str = Field(..., description="Emotion label (e.g., 'joy', 'sadness')")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0.0-1.0)")

class MoodAnalysisRequest(BaseModel):
    """Request body for mood analysis endpoint"""
    text: str = Field(
        ...,
        min_length=3,
        max_length=5000,
        description="Journal entry text to analyze"
    )
    threshold: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="Confidence threshold for emotion detection (0.0-1.0)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Today was overwhelming. I felt so much sadness but also a tiny bit of hope. I realized I need to take care of myself better.",
                "threshold": 0.3
            }
        }

class MoodAnalysisResponse(BaseModel):
    """Response body from mood analysis endpoint"""
    detected_moods: List[EmotionScore] = Field(
        ...,
        description="List of detected emotions sorted by confidence (highest first)"
    )
    primary_mood: str = Field(
        ...,
        description="The strongest detected emotion"
    )
    summary: str = Field(
        ...,
        description="Human-readable interpretation of detected emotions"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "detected_moods": [
                    {"emotion": "sadness", "confidence": 0.92},
                    {"emotion": "fear", "confidence": 0.45},
                    {"emotion": "joy", "confidence": 0.31}
                ],
                "primary_mood": "sadness",
                "summary": "Your entry expresses primarily sadness with hints of fear, joy. 😢"
            }
        }