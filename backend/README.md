# Language Speaker - Backend

This directory contains the Python FastAPI backend for the Language Speaker application.


## Setup

### 1. Prerequisites
*   **Python 3.11+**
*   **ffmpeg**: Required for audio processing.
    ```bash
    brew install ffmpeg
    ```

### 2. Installation
Create a virtual environment and install dependencies:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Running the Server
```bash
python3 main.py
```
The server will start on `http://localhost:8000`.

## Endpoints

For full details on parameters and responses, please check the **Swagger UI** (`/docs`).

*   **`GET /health`**: Checks if the server and models are ready.
*   **`POST /api/stt/transcribe`**: Transcribes an uploaded audio file using OpenAI Whisper.
*   **`POST /api/tts/synthesize`**: Converts text to speech using Microsoft SpeechT5.

## Dependencies

Here is a breakdown of the key backend dependencies and their roles:

### Core Framework
*   **`fastapi`**: The main web framework used to build the API. It handles routing, request validation, and automatic documentation (Swagger UI).
*   **`uvicorn[standard]`**: The ASGI server that runs the FastAPI application.
*   **`python-multipart`**: Required by FastAPI to handle form data, specifically for file uploads.
*   **`python-dotenv`**: Loads environment variables from a `.env` file.

### AI & Machine Learning
*   **`transformers`**: Hugging Face library providing pre-trained models for **Whisper** (STT) and **SpeechT5** (TTS).
*   **`torch` (PyTorch)**: The underlying deep learning framework that runs the models.
*   **`torchaudio`**: PyTorch extension for audio processing, handling audio tensors.
*   **`accelerate`**: Optimizes model loading and inference for efficiency.
*   **`sentencepiece`**: Tokenizer library required by some Transformer models (like SpeechT5).

### Audio Processing & Data
*   **`numpy`**: Fundamental library for numerical computing, used for raw audio data arrays.
*   **`scipy`**: Used for scientific computing and signal processing operations.
*   **`soundfile`**: Reads and writes audio files (e.g., WAV), essential for TTS output.
*   **`pydub`**: High-level audio library for manipulating audio files (relies on `ffmpeg`).
*   **`pyarrow`**: Efficient data handling library, often required by `datasets` and `transformers`.

### Utilities
*   **`urllib3`**: Powerful HTTP client used internally by many libraries for downloading models.

## API Documentation 📚

Once the server is running, visit:
*   **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs) - Interactive exploration and testing of endpoints.
*   **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc) - Alternative documentation view.

