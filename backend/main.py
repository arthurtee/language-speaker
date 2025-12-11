from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import stt, tts, lyrics
import uvicorn

from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Language Speaker API",
    description="Speech recognition and text-to-speech API for language learning",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging Middleware
import time
import logging

# Configure basic logging if not already configured
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("api")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Start Request: {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"End Request: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"Request Failed: {request.method} {request.url.path} - Error: {e} - Time: {process_time:.4f}s")
        raise

# Include routers
app.include_router(stt.router, prefix="/api/stt", tags=["Speech-to-Text"])
app.include_router(tts.router, prefix="/api/tts", tags=["Text-to-Speech"])
app.include_router(lyrics.router, prefix="/api/lyrics", tags=["Song Lyrics"])

@app.get("/")
async def root():
    return {
        "message": "Language Speaker API",
        "status": "running",
        "endpoints": {
            "stt": "/api/stt/transcribe",
            "tts": "/api/tts/synthesize",
            "lyrics": "/api/lyrics/songs"
        }
    }

@app.get("/health")
async def health_check():
    # Check if models are loaded
    stt_status = "loaded" if stt.whisper_model.pipe else "loading"
    tts_status = "loaded" if tts.tts_model.processor else "loading"
    
    return {
        "status": "healthy",
        "models": {
            "stt": stt_status,
            "tts": tts_status,
            "rag": "active", 
            "llm": "active"
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
