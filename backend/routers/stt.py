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
    """
    temp_path = None
    wav_path = None
    try:
        # Check if ffmpeg is available
        from pydub.utils import which
        if not which("ffmpeg"):
           logger.error("ffmpeg not found in PATH")
           raise HTTPException(status_code=500, detail="Server configuration error: ffmpeg not found")

        # Save uploaded file temporarily
        suffix = os.path.splitext(file.filename)[1]
        # Ensure we have a suffix default if missing
        if not suffix:
            suffix = ".webm"
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Convert to WAV if needed (Whisper/Soundfile often struggle with WebM)
        wav_path = temp_path
        if suffix.lower() == '.webm':
            try:
                from pydub import AudioSegment
                logger.info(f"Converting WebM to WAV: {temp_path}")
                audio = AudioSegment.from_file(temp_path, format="webm")
                wav_path = temp_path + ".wav"
                audio.export(wav_path, format="wav")
            except Exception as e:
                logger.error(f"WebM conversion failed: {e}")
                # Do NOT proceed with the original file if conversion failed, it will likely crash whisper
                raise HTTPException(status_code=400, detail=f"Audio conversion failed: {str(e)}")

        # Transcribe
        logger.info(f"Transcribing audio file: {wav_path}")
        if not os.path.exists(wav_path):
             raise HTTPException(status_code=500, detail="Audio file lost during processing")

        text = whisper_model.transcribe(wav_path)
        
        logger.info(f"Transcription result: {text}")
        return JSONResponse(content={"text": text})
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        # Clean up
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass
        if wav_path and wav_path != temp_path and os.path.exists(wav_path):
            try:
                os.unlink(wav_path)
            except:
                pass
