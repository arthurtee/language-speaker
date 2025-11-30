from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from models.tts_model import tts_model
import tempfile
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class TTSRequest(BaseModel):
    text: str

@router.post("/synthesize")
async def synthesize_speech(request: TTSRequest):
    """
    Synthesize speech from text using SpeechT5
    
    Args:
        request: JSON with text to synthesize
    
    Returns:
        Audio file (WAV)
    """
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Create temporary file for output
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_path = temp_file.name
        temp_file.close()
        
        # Synthesize
        logger.info(f"Synthesizing speech for text: {request.text[:50]}...")
        tts_model.synthesize(request.text, temp_path)
        
        logger.info("Speech synthesis completed")
        
        # Return audio file
        return FileResponse(
            temp_path,
            media_type="audio/wav",
            filename="speech.wav",
            background=None  # File will be deleted after response
        )
        
    except Exception as e:
        logger.error(f"Error synthesizing speech: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {str(e)}")
