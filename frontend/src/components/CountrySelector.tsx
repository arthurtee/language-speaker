'use client';

import { Group, Button } from '@mantine/core';
import { countries } from '@/data/gameData';

interface CountrySelectorProps {
    selectedCountry: string | null;
    onSelect: (countryId: string) => void;
}

export default function CountrySelector({ selectedCountry, onSelect }: CountrySelectorProps) {
    return (
        <Group justify="center" mb="xl">
            {countries.map((country) => (
                <Button
                    key={country.id}
                    onClick={() => onSelect(country.id)}
                    variant={selectedCountry === country.id ? 'filled' : 'light'}
                    size="lg"
                    radius="xl"
                    color="blue"
                >
                    {country.name}
                </Button>
            ))}
        </Group>
    );
}
