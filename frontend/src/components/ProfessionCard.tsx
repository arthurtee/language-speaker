'use client';

import { useState, useEffect } from 'react';
import { Card, Image, Text, Button, Stack, Center } from '@mantine/core';

interface ProfessionCardProps {
    profession: {
        id: string;
        name: string;
        image: string;
        translations: Record<string, string[]>;
    };
    countryId: string;
}

export default function ProfessionCard({ profession, countryId }: ProfessionCardProps) {
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        setShowHelp(false);
    }, [profession, countryId]);

    const answers = profession.translations[countryId] || [];

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder w={300} bg="rgba(255, 255, 255, 0.1)">
            <Card.Section>
                <Center p="md" bg="gray.8">
                    <Image
                        src={profession.image}
                        alt={profession.name}
                        w={192}
                        h={192}
                        fit="contain"
                    />
                </Center>
            </Card.Section>

            <Stack align="center" mt="md" mb="xs">
                <Button
                    variant="subtle"
                    onClick={() => setShowHelp(!showHelp)}
                    color="blue.4"
                >
                    {showHelp ? 'Hide Answer' : 'Need Help?'}
                </Button>

                {showHelp && (
                    <Text size="xl" fw={700} c="yellow">
                        {answers.join(' / ')}
                    </Text>
                )}
            </Stack>
        </Card>
    );
}
