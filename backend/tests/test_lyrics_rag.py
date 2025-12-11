import pytest
from models.lyrics_rag import lyrics_rag

def test_basic_retrieval():
    # Test with exact match from Twinkle Twinkle
    user_input = "Twinkle twinkle little star"
    result = lyrics_rag.get_next_line(user_input, "twinkle_star")
    
    assert result is not None
    assert result['next_line'] == "How I wonder what you are"
    assert result['is_correct'] is True

def test_retrieval_with_slight_mismatch():
    # Test with slight mismatch
    user_input = "twinkle twinkle little stars" # plural
    result = lyrics_rag.get_next_line(user_input, "twinkle_star")
    
    assert result is not None
    assert result['next_line'] == "How I wonder what you are"
    # Should still be correct due to semantic similarity
    assert result['is_correct'] is True

def test_wrong_song_id():
    user_input = "Twinkle twinkle little star"
    result = lyrics_rag.get_next_line(user_input, "christmas_you")
    
    # Should return a result (best match in wrong song) but marked as incorrect
    assert result is not None
    assert result['is_correct'] is False
    assert result['confidence'] < 0.6
