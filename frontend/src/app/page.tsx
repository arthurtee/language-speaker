'use client';

import { useState, useEffect, useRef } from 'react';
import { Container, Title, Stack, Text, Center, Box, Loader, Alert, Button } from '@mantine/core';
import CountrySelector from '@/components/CountrySelector';
import ProfessionCard from '@/components/ProfessionCard';
import SpeechInput from '@/components/SpeechInput';
import { countries, professions } from '@/data/gameData';
import { synthesizeSpeech } from '@/lib/api';

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [currentProfession, setCurrentProfession] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [completedProfessions, setCompletedProfessions] = useState<Set<string>>(new Set());
  const [isGameComplete, setIsGameComplete] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    audioRef.current = new Audio();

    // Check backend health
    checkBackend();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const checkBackend = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`);
      if (res.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (e) {
      setBackendStatus('error');
    }
  };

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId);
    setScore(0);
    setFeedback(null);
    setCompletedProfessions(new Set());
    setIsGameComplete(false);
    pickRandomProfession(new Set());
  };

  const pickRandomProfession = (completed: Set<string> = completedProfessions) => {
    const available = professions.filter(p => !completed.has(p.id));

    if (available.length === 0) {
      setIsGameComplete(true);
      setCurrentProfession(null);
      return;
    }

    const random = available[Math.floor(Math.random() * available.length)];
    setCurrentProfession(random);
    setFeedback(null);
  };

  const speak = async (text: string) => {
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
      console.error("TTS Error:", error);
      setIsPlaying(false);
    }
  };

  const handleCorrect = () => {
    setScore((prev) => prev + 1);
    const encouragements = [
      'Awesome! You got it!',
      'Perfect! Well done!',
      'Fantastic! Keep it up!',
      'Amazing! You\'re doing great!',
      'Excellent work!',
      'Brilliant! That\'s right!'
    ];
    const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
    setFeedback(msg);
    speak(msg);

    // Update completed professions
    const newCompleted = new Set(completedProfessions);
    if (currentProfession) {
      newCompleted.add(currentProfession.id);
      setCompletedProfessions(newCompleted);
    }

    // Delay moving to next profession so user sees feedback
    setTimeout(() => {
      pickRandomProfession(newCompleted);
    }, 1500);
  };

  const handleIncorrect = (transcript: string) => {
    let msg = `Not quite! You said "${transcript}"`;

    // Simple guidance logic
    if (transcript.length === 0) {
      msg = "Hmm, I didn't catch that. Try speaking a bit louder!";
    } else if (currentProfession && currentProfession.translations[selectedCountry!]) {
      const answers = currentProfession.translations[selectedCountry!];
      msg = `Try saying "${answers[0]}" - you can do it!`;
    }

    setFeedback(msg);
    speak(msg);
  };

  const currentCountry = countries.find((c) => c.id === selectedCountry);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <Box
      suppressHydrationWarning
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #A9F1DF, #FFBBBB)',
        color: '#1A1B1E',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container size="sm">
        <Stack align="center" gap="xl">
          <Title order={1} className="gradient-title">
            Language Speaker
          </Title>

          {backendStatus === 'error' && (
            <Alert variant="light" color="red" title="Backend Error">
              Cannot connect to the Python backend. Please ensure it is running on port 8000.
            </Alert>
          )}

          {backendStatus === 'checking' && (
            <Loader color="dark" size="sm" />
          )}

          {backendStatus === 'connected' && (
            <>
              {!selectedCountry ? (
                <CountrySelector selectedCountry={selectedCountry} onSelect={handleCountrySelect} />
              ) : null}

              {selectedCountry && currentCountry ? (
                isGameComplete ? (
                  <Stack align="center" gap="xl" className="animate-slide-up" style={{ textAlign: 'center' }}>
                    <Title order={2} c="indigo.9" style={{ fontSize: '3rem' }}>🎉 Congratulations! 🎉</Title>
                    <Text size="xl">You've mastered all questions in <Text span fw={700} c="indigo.7">{currentCountry.label}</Text>!</Text>
                    <Text size="lg" fw={700}>Final Score: {score} / {professions.length}</Text>

                    <Stack gap="md">
                      <Button
                        size="lg"
                        variant="filled"
                        color="yellow"
                        onClick={() => handleCountrySelect(selectedCountry)}
                        style={{ color: 'black' }}
                      >
                        Play Again ({currentCountry.label})
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        color="dark"
                        onClick={() => setSelectedCountry(null)}
                      >
                        Choose Another Country
                      </Button>
                    </Stack>
                  </Stack>
                ) : currentProfession ? (
                  <Stack align="center" gap="lg" className="animate-slide-up">
                    <Text size="xl" fw={300}>
                      Speaking <Text span fw={700} c="indigo.7">{currentCountry.label}</Text>
                    </Text>

                    <ProfessionCard
                      key={currentProfession.id}
                      profession={currentProfession}
                      countryId={selectedCountry}
                    />

                    <SpeechInput
                      language={currentCountry.language}
                      expectedAnswers={currentProfession.translations[selectedCountry]}
                      onCorrect={handleCorrect}
                      onIncorrect={handleIncorrect}
                    />

                    {feedback && (
                      <Text
                        size="xl"
                        fw={700}
                        c={feedback.includes('Correct') || feedback.includes('Awesome') || feedback.includes('Perfect') || feedback.includes('Fantastic') || feedback.includes('Amazing') || feedback.includes('Excellent') || feedback.includes('Brilliant') ? 'green.8' : 'red.4'}
                        className="animate-bounce"
                      >
                        {feedback}
                      </Text>
                    )}

                    <Stack align="center" gap="md">
                      <Text c="dimmed">
                        Score: <Text span c="dark" fw={700}>{score}</Text>
                      </Text>

                      <button
                        onClick={() => pickRandomProfession()}
                        style={{
                          padding: '8px 24px',
                          background: 'rgba(0, 0, 0, 0.05)',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '12px',
                          color: 'black',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                        }}
                      >
                        Skip →
                      </button>
                    </Stack>
                  </Stack>
                ) : null
              ) : (
                !selectedCountry && (
                  <Text size="xl" c="grey">
                    Select a country to start practicing!
                  </Text>
                )
              )}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
