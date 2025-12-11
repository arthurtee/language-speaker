import { Song, NextLineResponse, ExplainResponse } from '@/data/songData';

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
    const extension = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
    formData.append('file', audioBlob, `audio.${extension}`);

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

// --- Song Lyrics Practice API ---

export async function getSongs(): Promise<Song[]> {
    const response = await fetch(`${API_BASE_URL}/api/lyrics/songs`);
    if (!response.ok) throw new Error('Failed to fetch songs');
    return await response.json();
}

export async function startLyricsPractice(songId: string): Promise<{ song_id: string }> {
    const response = await fetch(`${API_BASE_URL}/api/lyrics/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_id: songId }),
    });
    if (!response.ok) throw new Error('Failed to start practice');
    return await response.json();
}

export async function getNextLine(sungLyrics: string): Promise<NextLineResponse> {
    const response = await fetch(`${API_BASE_URL}/api/lyrics/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sung_lyrics: sungLyrics
        }),
    });
    if (!response.ok) throw new Error('Failed to get next line');
    return await response.json();
}

export async function explainLyrics(lyrics: string): Promise<ExplainResponse> {
    const response = await fetch(`${API_BASE_URL}/api/lyrics/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics }),
    });
    if (!response.ok) throw new Error('Failed to explain lyrics');
    return await response.json();
}
