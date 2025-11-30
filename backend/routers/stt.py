from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from models.whisper_model import whisper_model
import tempfile
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio file to text using Whisper
    
    Args:
        file: Audio file (WAV, MP3, etc.)
    
    Returns:
        JSON with transcribed text
    """
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Transcribe
        logger.info(f"Transcribing audio file: {file.filename}")
        text = whisper_model.transcribe(temp_path)
        
        # Clean up
        os.unlink(temp_path)
        
        logger.info(f"Transcription result: {text}")
        return JSONResponse(content={"text": text})
        
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
