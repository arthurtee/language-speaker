import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CountrySelector from './CountrySelector';
import { MantineProvider } from '@mantine/core';

// Mock MantineProvider to avoid theme issues
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>{children}</MantineProvider>
);

describe('CountrySelector', () => {
    it('renders correctly', () => {
        render(
            <TestWrapper>
                <CountrySelector selectedCountry={null} onSelect={() => { }} />
            </TestWrapper>
        );
        expect(screen.getByText('Singapore')).toBeDefined();
        expect(screen.getByText('China')).toBeDefined();
    });

    it('calls onSelect when a country is selected', async () => {
        const onSelect = vi.fn();
        render(
            <TestWrapper>
                <CountrySelector selectedCountry={null} onSelect={onSelect} />
            </TestWrapper>
        );

        const button = screen.getByText('Singapore');
        fireEvent.click(button);
        expect(onSelect).toHaveBeenCalledWith('singapore');
    });
});
