from transformers import pipeline
from app.config import settings
import os
import logging

logger = logging.getLogger(__name__)

class MoodAnalyzer:
    """
    Singleton mood analyzer that detects emotions in journal entries.
    Uses pretrained distilroberta model for emotion classification.
    """
    _instance = None
    _classifier = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _load_model(self):
        """Load emotion classification model on first use (lazy loading)"""
        if self._classifier is None:
            model_name = settings.MODEL_NAME
            logger.info(f"Loading emotion model: {model_name}")
            
            try:
                # Get HuggingFace token if available
                hf_token = settings.HF_TOKEN or os.getenv("HF_TOKEN")
                
                self._classifier = pipeline(
                    task="text-classification",
                    model=model_name,
                    top_k=None,  # Return all emotion scores
                    token=hf_token if hf_token else None,
                    device=-1  # Use CPU (GPU optional)
                )
                logger.info(f"✓ Model '{model_name}' loaded successfully!")
            except Exception as e:
                logger.error(f"✗ Failed to load model: {e}")
                raise RuntimeError(f"Failed to load emotion model: {e}")
    
    def analyze(self, text: str, threshold: float = 0.3) -> dict:
        """
        Analyze emotions in journal entry text.
        
        Args:
            text (str): Journal entry text (3-5000 characters)
            threshold (float): Confidence threshold (0.0-1.0), default 0.3
        
        Returns:
            dict: {
                "detected_moods": [{"emotion": str, "confidence": float}, ...],
                "primary_mood": str,
                "summary": str
            }
        
        Raises:
            ValueError: If text is invalid or empty
            RuntimeError: If model fails to process
        """
        # Validate input
        if not text or not isinstance(text, str):
            raise ValueError("Text must be a non-empty string")
        
        text = text.strip()
        if len(text) < 3:
            raise ValueError("Text must be at least 3 characters long")
        
        if len(text) > 5000:
            raise ValueError("Text must not exceed 5000 characters")
        
        if not (0.0 <= threshold <= 1.0):
            raise ValueError("Threshold must be between 0.0 and 1.0")
        
        # Load model if not already loaded
        self._load_model()
        
        try:
            # Get emotion predictions
            logger.debug(f"Classifying text: {text[:100]}...")
            emotions = self._classifier(text)
            
            # emotions[0] is a list of dicts: [{"label": "joy", "score": 0.95}, ...]
            detected_moods = [
                {
                    "emotion": e['label'],
                    "confidence": round(e['score'], 3)
                }
                for e in emotions[0]
                if e['score'] > threshold
            ]
            
            # Sort by confidence (highest first)
            detected_moods.sort(key=lambda x: x['confidence'], reverse=True)
            
            # Determine primary mood
            primary_mood = detected_moods[0]['emotion'] if detected_moods else "neutral"
            
            # Generate summary
            summary = self._generate_summary(primary_mood, detected_moods)
            
            return {
                "detected_moods": detected_moods,
                "primary_mood": primary_mood,
                "summary": summary
            }
        
        except Exception as e:
            logger.error(f"Classification failed: {e}", exc_info=True)
            raise RuntimeError(f"Failed to classify emotions: {e}")
    
    def _generate_summary(self, primary_mood: str, detected_moods: list) -> str:
        """
        Generate a human-readable summary of detected emotions.
        
        Args:
            primary_mood (str): The strongest detected emotion
            detected_moods (list): All emotions above threshold
        
        Returns:
            str: Human-readable summary
        """
        if not detected_moods:
            return "Your entry appears neutral in tone."
        
        if len(detected_moods) == 1:
            emoji_map = {
                "joy": "😊",
                "sadness": "😢",
                "anger": "😠",
                "fear": "😨",
                "surprise": "😲",
                "disgust": "😒",
                "neutral": "😐"
            }
            emoji = emoji_map.get(primary_mood, "✨")
            return f"Your entry expresses {primary_mood}. {emoji}"
        
        # Multiple emotions detected
        other_moods = ", ".join([m['emotion'] for m in detected_moods[1:]])
        emoji_map = {
            "joy": "😊",
            "sadness": "😢",
            "anger": "😠",
            "fear": "😨",
            "surprise": "😲",
            "disgust": "😒",
            "neutral": "😐"
        }
        emoji = emoji_map.get(primary_mood, "✨")
        
        return (
            f"Your entry expresses primarily {primary_mood} "
            f"with hints of {other_moods}. {emoji}"
        )

# Create singleton instance
mood_analyzer = MoodAnalyzer()