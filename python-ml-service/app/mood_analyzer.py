from transformers import pipeline
from app.config import settings

class MoodAnalyzer:
    """Singleton pattern - load model only once, lazily"""
    _instance = None
    _classifier = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _load_model(self):
        """Load model only on first use"""
        if self._classifier is None:
            print(f"Loading model: {settings.MODEL_NAME}...")
            self._classifier = pipeline(
                task="text-classification",
                model=settings.MODEL_NAME,
                top_k=None
            )
            print("Model loaded successfully!")
    
    def analyze(self, text: str, threshold: float):
        """Analyze emotions in text"""
        # Load model on first call
        self._load_model()
        
        emotions = self._classifier(text)
        
        detected_moods = [
            {"emotion": e['label'], "confidence": round(e['score'], 3)}
            for e in emotions[0]
            if e['score'] > threshold
        ]
        
        detected_moods.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {
            "detected_moods": detected_moods,
            "primary_mood": detected_moods[0]['emotion'] if detected_moods else "neutral"
        }

# Create singleton instance (but don't load model yet)
mood_analyzer = MoodAnalyzer()