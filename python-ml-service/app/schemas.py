from pydantic import BaseModel, Field
from typing import List

class MoodDetection(BaseModel):
    emotion: str
    confidence: float

class MoodAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=5000)
    threshold: float = Field(0.3, ge=0, le=1)

class MoodAnalysisResponse(BaseModel):
    detected_moods: List[MoodDetection]
    primary_mood: str