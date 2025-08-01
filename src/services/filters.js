import {
    FRANCHISE_SEARCH_TERMS,
    FRANCHISE_CHARACTER_NAMES,
    ROLE_RULES,
    ERA_FILMS
} from '../constants/index.js';

export class FilterService {
    static applyFilters(characters, filters = {}) {
        if (!Array.isArray(characters)) return [];

        const { franchise, role, era, search } = filters;

        return characters.filter(character => {
            if (search && !this.matchesSearch(character, search)) return false;
            if (franchise && !this.matchesFranchise(character, franchise)) return false;
            if (role && !this.matchesRole(character, role)) return false;
            if (era && !this.matchesEra(character, era)) return false;
            return true;
        });
    }

    static matchesSearch(character, searchTerm) {
        if (!searchTerm?.trim()) return true;

        const term = searchTerm.toLowerCase().trim();
        const searchableText = [
            character.name || '',
            ...(character.films || []),
            ...(character.tvShows || []),
            character.sourceUrl || ''
        ].join(' ').toLowerCase();

        return searchableText.includes(term);
    }

    static matchesFranchise(character, franchise) {
        if (!franchise) return true;

        const searchTerms = FRANCHISE_SEARCH_TERMS[franchise] || [franchise.replace('-', ' ')];
        
        if (character.films?.length) {
            const filmMatch = character.films.some(film => 
                searchTerms.some(term => film.toLowerCase().includes(term.toLowerCase()))
            );
            if (filmMatch) return true;
        }

        if (character.tvShows?.length) {
            const tvMatch = character.tvShows.some(show => 
                searchTerms.some(term => show.toLowerCase().includes(term.toLowerCase()))
            );
            if (tvMatch) return true;
        }

        const characterNames = FRANCHISE_CHARACTER_NAMES[franchise];
        if (characterNames) {
            const name = character.name.toLowerCase();
            return characterNames.some(charName => name.includes(charName.toLowerCase()));
        }

        return false;
    }

    static matchesRole(character, role) {
        if (!role) return true;
        const characterRole = this.determineCharacterRole(character);
        return characterRole.toLowerCase() === role.toLowerCase();
    }

    static matchesEra(character, era) {
        if (!era || !character.films?.length) return !era;

        const firstFilm = character.films[0].toLowerCase();
        const eraFilms = ERA_FILMS[era] || [];
        
        return eraFilms.some(eraFilm => firstFilm.includes(eraFilm.toLowerCase()));
    }

    static determineCharacterRole(character) {
        if (!character) return 'Character';

        if (ROLE_RULES.isVillain(character)) return 'Villain';
        if (ROLE_RULES.isHero(character)) return 'Hero';
        if (ROLE_RULES.isSidekick(character)) return 'Sidekick';

        const villainKeywords = ['villain', 'antagonist', 'evil'];
        const heroKeywords = ['hero', 'protagonist', 'prince', 'princess'];
        const sidekickKeywords = ['sidekick', 'companion', 'friend'];

        const allText = [
            character.name || '',
            ...(character.films || []),
            character.sourceUrl || ''
        ].join(' ').toLowerCase();

        if (villainKeywords.some(keyword => allText.includes(keyword))) return 'Villain';
        if (heroKeywords.some(keyword => allText.includes(keyword))) return 'Hero';
        if (sidekickKeywords.some(keyword => allText.includes(keyword))) return 'Sidekick';

        return character.parkAttractions?.length > 0 ? 'Featured Character' : 'Character';
    }

    static getMediaAppearances(character) {
        if (!character) return 'No media appearances';

        const { films, shortFilms, tvShows, videoGames } = character;
        
        if (films?.length > 0) return `Film: ${films[0]}`;
        if (tvShows?.length > 0) return `TV: ${tvShows[0]}`;
        if (shortFilms?.length > 0) return `Short Film: ${shortFilms[0]}`;
        if (videoGames?.length > 0) return `Game: ${videoGames[0]}`;

        return 'No media appearances';
    }

    static highlightSearchTerm(text, searchTerm) {
        if (!searchTerm?.trim()) return text;
        
        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return parts.map(part => 
            part.toLowerCase() === searchTerm.toLowerCase() 
                ? `<span class="highlight">${part}</span>`
                : part
        ).join('');
    }
}