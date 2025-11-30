from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stt, tts
import uvicorn

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

# Include routers
app.include_router(stt.router, prefix="/api/stt", tags=["Speech-to-Text"])
app.include_router(tts.router, prefix="/api/tts", tags=["Text-to-Speech"])

@app.get("/")
async def root():
    return {
        "message": "Language Speaker API",
        "status": "running",
        "endpoints": {
            "stt": "/api/stt/transcribe",
            "tts": "/api/tts/synthesize"
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
            "tts": tts_status
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
