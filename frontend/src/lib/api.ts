const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface TranscriptionResponse {
    text: string;
}

export interface TTSRequest {
    text: string;
}

/**
 * Transcribe audio file to text using Whisper API
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');

    const response = await fetch(`${API_BASE_URL}/api/stt/transcribe`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data: TranscriptionResponse = await response.json();
    return data.text;
}

/**
 * Synthesize speech from text using TTS API
 */
export async function synthesizeSpeech(text: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/tts/synthesize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        throw new Error(`Speech synthesis failed: ${response.statusText}`);
    }

    return await response.blob();
}
