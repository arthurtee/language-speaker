'use client';

import { useState, useEffect, useRef } from 'react';
import { Stack, Text, Title, Button, Card, Alert, Group, Badge, Transition, Box, Loader } from '@mantine/core';
import { getNextLine, explainLyrics, synthesizeSpeech } from '@/lib/api';
import SpeechInput from '@/components/SpeechInput';

interface LyricsPracticeProps {
    onBack: () => void;
}

export default function LyricsPractice({ onBack }: LyricsPracticeProps) {
    const [status, setStatus] = useState<'listening' | 'analyzing' | 'detected' | 'not-found'>('listening');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isMicActive, setIsMicActive] = useState(false);

    // Detected Info
    const [detectedSong, setDetectedSong] = useState<{ title: string, artist: string } | null>(null);
    const [matchedLine, setMatchedLine] = useState<string | null>(null);
    const [nextLines, setNextLines] = useState<string[]>([]);

    // Explanation
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio();
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const playTTS = async (text: string) => {
        try {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            setIsPlaying(true);
            const audioBlob = await synthesizeSpeech(text);
            const audioUrl = URL.createObjectURL(audioBlob);

            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.onended = () => {
                    setIsPlaying(false);
                    URL.revokeObjectURL(audioUrl);
                };
                audioRef.current.onerror = () => {
                    setIsPlaying(false);
                    URL.revokeObjectURL(audioUrl);
                };
                await audioRef.current.play();
            }
        } catch (error) {
            console.error("TTS failed:", error);
            setIsPlaying(false);
        }
    }

    const handleInput = async (transcript: string) => {
        setStatus('analyzing');
        setFeedback("Analyzing...");

        try {
            console.log("Analyzing transcript:", transcript);
            const response = await getNextLine(transcript);

            if (response.found && response.title) {
                setDetectedSong({
                    title: response.title,
                    artist: response.artist || 'Unknown'
                });
                setMatchedLine(response.matched_line || transcript);
                setNextLines(response.next_lines);

                setStatus('detected');
                setFeedback(`Song Detected: ${response.title}`);

                // Get Explanation for the matched line
                if (response.matched_line) {
                    explainLyrics(response.matched_line).then(res => {
                        // setExplanation(res.explanation);
                        playTTS(`That's ${response.title} by ${response.artist}.`);
                    });
                } else {
                    playTTS(`I think that's from ${response.title}.`);
                }

            } else {
                setStatus('not-found');
                setFeedback("I couldn't recognize that song. Try singing clearly!");
                playTTS("I couldn't recognize that song. Try again.");

                setTimeout(() => {
                    setStatus('listening');
                    setFeedback(null);
                }, 3000);
            }

        } catch (err) {
            console.error("Error analyzing:", err);
            setStatus('not-found');
            setFeedback("Error connecting to server.");
            setTimeout(() => {
                setStatus('listening');
                setFeedback(null);
            }, 3000);
        }
    };

    return (
        <Stack align="center" gap="lg" style={{ width: '100%', maxWidth: '600px' }} className="animate-slide-up">
            <Group justify="space-between" style={{ width: '100%' }}>
                <Button variant="subtle" size="sm" onClick={onBack}>← Quit</Button>
                <Badge color="pink" size="lg">Open Mic Mode</Badge>
            </Group>

            <Stack align="center" gap="xs" mb="lg">
                <Title order={2}>Sing a Song!</Title>
                <Text c="dimmed" ta="center">Sing any line and AI will guess the song!</Text>
            </Stack>

            {/* Status Card */}
            <Card shadow="sm" padding="xl" radius="md" withBorder style={{ width: '100%', textAlign: 'center', minHeight: '150px' }}>
                <Stack justify="center" align="center" style={{ height: '100%' }} gap="md">
                    {status === 'listening' && (
                        <>
                            <>
                                {isMicActive ? (
                                    <>
                                        <Loader color="blue" type="bars" />
                                        <Text size="lg" fw={500}>Listening...</Text>
                                    </>
                                ) : (
                                    <Text size="lg" fw={500}>Click the mic to start...</Text>
                                )}
                            </>
                        </>
                    )}
                    {status === 'analyzing' && (
                        <>
                            <Loader color="violet" variant="dots" />
                            <Text size="lg" fw={500} c="violet">Identifying Song...</Text>
                        </>
                    )}
                    {status === 'detected' && detectedSong && (
                        <Stack gap="xs" className="animate-fade-in">
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Detected Song</Text>
                            <Title order={3} c="blue.6">{detectedSong.title}</Title>
                            <Text size="sm">{detectedSong.artist}</Text>
                        </Stack>
                    )}
                    {status === 'not-found' && (
                        <Text c="red" size="lg" fw={500}>Song not found 🤷‍♂️</Text>
                    )}
                </Stack>
            </Card>

            {/* Input Component - We ignore expected answers for open mic */}
            <Box style={{ display: status === 'listening' || status === 'not-found' ? 'block' : 'none' }}>
                <SpeechInput
                    language="en-US"
                    expectedAnswers={["DUMMY_VALUE_TO_FORCE_INCORRECT"]}
                    onCorrect={() => { }}

                    onIncorrect={(transcript) => handleInput(transcript)}
                    onStateChange={setIsMicActive}
                />
            </Box>

            {/* Results / Next Lines */}
            <Transition mounted={status === 'detected'} transition="slide-up" duration={400} timingFunction="ease">
                {(styles) => (
                    <Stack style={{ ...styles, width: '100%' }} align="center" gap="md">

                        {matchedLine && (
                            <Alert color="green" title="You Sang">
                                "{matchedLine}"
                            </Alert>
                        )}

                        {nextLines.length > 0 && (
                            <Card padding="md" radius="md" bg="gray.1" style={{ width: '100%' }}>
                                <Text size="sm" fw={700} c="dimmed" mb="xs">NEXT LINES:</Text>
                                <Stack gap="xs">
                                    {nextLines.map((line, i) => (
                                        <Text key={i} fw={500} size="lg">🎵 {line}</Text>
                                    ))}
                                </Stack>
                            </Card>
                        )}

                        {explanation && (
                            <Card padding="md" radius="md" bg="blue.0" style={{ width: '100%', border: '1px solid #A5D8FF' }}>
                                <Text size="sm" fw={700} c="blue.8">💡 Meaning:</Text>
                                <Text size="md" c="blue.9" style={{ fontStyle: 'italic' }}>"{explanation}"</Text>
                            </Card>
                        )}

                        <Button
                            color="blue"
                            size="lg"
                            fullWidth
                            onClick={() => {
                                setStatus('listening');
                                setDetectedSong(null);
                                setNextLines([]);
                                setMatchedLine(null);
                                setExplanation(null);
                            }}
                        >
                            Sing Another Line
                        </Button>
                    </Stack>
                )}
            </Transition>
        </Stack>
    );
}
