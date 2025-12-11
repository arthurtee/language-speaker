'use client';

import { SimpleGrid, Card, Text, Center, ThemeIcon, Stack } from '@mantine/core';

interface ModeSelectorProps {
    onSelect: (mode: 'profession' | 'lyrics') => void;
}

export default function ModeSelector({ onSelect }: ModeSelectorProps) {
    return (
        <Stack align="center" gap="xl" style={{ width: '100%', maxWidth: '800px' }}>
            <Text size="xl" fw={700} c="dark">Choose Your Practice Mode</Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" style={{ width: '100%' }}>
                <Card
                    shadow="md"
                    padding="xl"
                    radius="lg"
                    withBorder
                    style={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    className="hover:scale-105 hover:shadow-lg"
                    onClick={() => onSelect('profession')}
                >
                    <Center mb="md">
                        <ThemeIcon size={60} radius="xl" color="blue" variant="light">
                            <span style={{ fontSize: '30px' }}>🌍</span>
                        </ThemeIcon>
                    </Center>
                    <Stack align="center" gap="xs">
                        <Text size="lg" fw={700} ta="center">Guess Professions</Text>
                        <Text size="sm" c="dimmed" ta="center">
                            Travel to different countries and learn profession names in local languages.
                        </Text>
                    </Stack>
                </Card>

                <Card
                    shadow="md"
                    padding="xl"
                    radius="lg"
                    withBorder
                    style={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    className="hover:scale-105 hover:shadow-lg"
                    onClick={() => onSelect('lyrics')}
                >
                    <Center mb="md">
                        <ThemeIcon size={60} radius="xl" color="pink" variant="light">
                            <span style={{ fontSize: '30px' }}>🎵</span>
                        </ThemeIcon>
                    </Center>
                    <Stack align="center" gap="xs">
                        <Text size="lg" fw={700} ta="center">Sing Lyrics</Text>
                        <Text size="sm" c="dimmed" ta="center">
                            Practice your pronunciation by singing along to popular songs with AI feedback.
                        </Text>
                    </Stack>
                </Card>
            </SimpleGrid>
        </Stack>
    );
}
