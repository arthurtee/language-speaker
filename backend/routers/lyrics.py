from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from models.lyrics_rag import lyrics_rag
from models.llm_service import llm_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Models
class Song(BaseModel):
    id: str
    title: str
    artist: str
    language: str
    difficulty: str

class StartPracticeRequest(BaseModel):
    song_id: str

class NextLineRequest(BaseModel):
    sung_lyrics: str

class NextLineResponse(BaseModel):
    song_id: Optional[str] = None
    title: Optional[str] = None
    artist: Optional[str] = None
    next_lines: List[str] = []
    matched_line: Optional[str] = None
    found: bool
    confidence: float

class ExplainRequest(BaseModel):
    lyrics: str

class ExplainResponse(BaseModel):
    explanation: str

@router.get("/songs", response_model=List[Song])
async def get_songs():
    """List available songs"""
    try:
        with open("data/songs.json", 'r') as f:
            songs_data = json.load(f)
            return [
                Song(
                    id=s['id'],
                    title=s['title'],
                    artist=s['artist'],
                    language=s['language'],
                    difficulty=s['difficulty'],
                    lyrics=s['lyrics']
                ) for s in songs_data
            ]
    except Exception as e:
        logger.error(f"Error loading songs: {e}")
        raise HTTPException(status_code=500, detail="Could not load songs")

@router.post("/start")
async def start_practice(request: StartPracticeRequest):
    """Start practice for a song, returns first line"""
    # Simply validating the song exists could be enough
    # For now we'll just acknowledge start
    return {"message": "Practice started", "song_id": request.song_id}

@router.post("/next", response_model=NextLineResponse)
async def get_next_line(request: NextLineRequest):
    """Identify song and get next lines based on sung input using RAG"""
    result = lyrics_rag.get_next_line(request.sung_lyrics)
    
    if not result:
        return NextLineResponse(
            found=False,
            confidence=0.0
        )
    
    return NextLineResponse(
        song_id=result['song_id'],
        title=result['title'],
        artist=result['artist'],
        next_lines=result['next_lines'],
        matched_line=result['matched_line'],
        confidence=result['confidence'],
        found=True
    )

@router.post("/explain", response_model=ExplainResponse)
async def explain_lyrics(request: ExplainRequest):
    """Get concise explanation of lyrics"""
    explanation = llm_service.explain_lyrics(request.lyrics, max_words=10)
    return ExplainResponse(explanation=explanation)
