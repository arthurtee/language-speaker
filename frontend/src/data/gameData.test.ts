import { describe, it, expect } from 'vitest';
import { countries, professions } from './gameData';

describe('Game Data', () => {
    it('should have valid countries', () => {
        expect(countries.length).toBeGreaterThan(0);
        countries.forEach(country => {
            expect(country).toHaveProperty('id');
            expect(country).toHaveProperty('name');
            expect(country).toHaveProperty('language');
            expect(country).toHaveProperty('label');
        });
    });

    it('should have valid professions', () => {
        expect(professions.length).toBeGreaterThan(0);
        professions.forEach(profession => {
            expect(profession).toHaveProperty('id');
            expect(profession).toHaveProperty('name');
            expect(profession).toHaveProperty('image');
            expect(profession).toHaveProperty('translations');
        });
    });

    it('should have translations for all countries in each profession', () => {
        const countryIds = countries.map(c => c.id);
        professions.forEach(profession => {
            countryIds.forEach(countryId => {
                const key = countryId as keyof typeof profession.translations;
                expect(profession.translations).toHaveProperty(key);
                expect(profession.translations[key].length).toBeGreaterThan(0);
            });
        });
    });
});
