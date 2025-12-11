'use client';

import { useState, useRef } from 'react';
import { ActionIcon, Text, Stack } from '@mantine/core';
import { transcribeAudio } from '@/lib/api';

interface SpeechInputProps {
    language: string;
    expectedAnswers: string[];
    onCorrect: () => void;
    onIncorrect: (transcript: string) => void;
    onStateChange?: (isListening: boolean) => void;
}

export default function SpeechInput({ language, expectedAnswers, onCorrect, onIncorrect, onStateChange }: SpeechInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const startListening = async () => {
        if (isListening) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Detect supported mime type
            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            }

            console.log("Using MIME type:", mimeType);

            mediaRecorder.current = new MediaRecorder(stream, { mimeType });
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.current.onstop = async () => {
                const mimeType = mediaRecorder.current?.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunks.current, { type: mimeType });
                console.log('Audio blob created:', audioBlob.size, 'bytes', 'type:', mimeType);

                try {
                    setStatus('processing');

                    // Send to API for transcription
                    const text = await transcribeAudio(audioBlob);
                    console.log('Transcribed text:', text);

                    const trimmedText = text.trim().toLowerCase();
                    setTranscript(trimmedText);

                    const isMatch = expectedAnswers
                        .filter(answer => typeof answer === 'string')
                        .some(answer =>
                            trimmedText.includes(answer.toLowerCase())
                        );

                    if (isMatch) {
                        setStatus('success');
                        onCorrect();
                    } else {
                        setStatus('error');
                        onIncorrect(trimmedText);
                    }
                    setIsListening(false);
                    onStateChange?.(false);

                } catch (error) {
                    console.error('Error transcribing audio:', error);
                    setStatus('error');
                    setTranscript('Error: ' + (error as Error).message);
                    setIsListening(false);
                    onStateChange?.(false);
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.current.start(100); // Capture data every 100ms
            setIsListening(true);
            onStateChange?.(true);
            setStatus('listening');
            setTranscript('');

            // Auto-stop after 3 seconds
            setTimeout(() => {
                if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
                    mediaRecorder.current.stop();
                    setIsListening(false);
                    onStateChange?.(false);
                }
            }, 3000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setStatus('error');
        }
    };

    return (
        <Stack align="center" mt="xl">
            <ActionIcon
                onClick={startListening}
                loading={status === 'processing'}
                variant="filled"
                color={isListening ? 'red' : 'blue'}
                size={80}
                radius="xl"
            >
                {!isListening && status !== 'processing' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}
            </ActionIcon>

            <div style={{ height: 30, textAlign: 'center' }}>
                {status === 'listening' && <Text c="blue.4" className="animate-pulse">Listening...</Text>}
                {status === 'processing' && <Text c="yellow">Processing...</Text>}
                {status === 'success' && <Text c="green.8" fw={700}>Correct! "{transcript}"</Text>}
                {status === 'error' && <Text c="red.4">Try again. Heard: "{transcript}"</Text>}
            </div>
        </Stack>
    );
}
