import pytest
from models.llm_service import llm_service

def test_explanation_length():
    lyrics = "Up above the world so high"
    explanation = llm_service.explain_lyrics(lyrics, max_words=10)
    
    assert explanation is not None
    assert isinstance(explanation, str)
    assert len(explanation) > 0
    # Check word count is reasonably close to limit (allow for "...")
    assert len(explanation.split()) <= 15 

def test_explanation_caching():
    lyrics = "Like a diamond in the sky"
    # First call
    exp1 = llm_service.explain_lyrics(lyrics, max_words=10)
    # Second call
    exp2 = llm_service.explain_lyrics(lyrics, max_words=10)
    
    assert exp1 == exp2
