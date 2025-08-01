import { LitElement, html, css } from 'lit';
import { storageService } from '../services/storage.js';
import { urlState } from '../services/url-state.js';
import {
    FRANCHISE_SEARCH_TERMS,
    FRANCHISE_CHARACTER_NAMES,
    ROLE_RULES,
    ERA_FILMS
} from '../constants/index.js';

export class DisneyCharacterCard extends LitElement {
    static properties = {
        character: { type: Object },
        isFavorite: { type: Boolean },
        loading: { type: Boolean },
        currentFilters: { type: Object }
    };

    static styles = css`
        :host {
            display: block;
            background: white;
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .card-image {
            position: relative;
            width: 100%;
            padding-top: 100%;
            background-color: #f0f0f0;
            overflow: hidden;
        }

        .card-image img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .card-content {
            padding: 16px;
        }

        h3 {
            margin: 0;
            font-size: 1.2em;
            color: #333;
        }

        .movie {
            color: #666;
            font-size: 0.9em;
            margin: 4px 0;
        }

        .role {
            display: inline-block;
            padding: 2px 8px;
            background-color: #f5f5f5;
            border-radius: 12px;
            font-size: 0.8em;
            margin-top: 8px;
        }

        .favorite-button {
            position: absolute;
            top: 8px;
            right: 8px;
            background: white;
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .favorite-button.active {
            background-color: #ff4081;
            color: white;
        }

        .loading {
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .highlight {
            color: #0066cc;
            font-weight: bold;
        }
    `;

    constructor() {
        super();
        this.character = null;
        this.isFavorite = false;
        this.loading = false;
        this.currentFilters = {
            franchise: '',
            role: '',
            era: ''
        };

        this._favoriteChangeHandler = () => {
            if (this.character) {
                this.isFavorite = storageService.isFavorite(this.character._id);
            }
        };
        window.addEventListener('favorite-change', this._favoriteChangeHandler);

        // Listen for filter changes
        this._filterChangeHandler = (e) => {
            this.currentFilters = e.detail;
            this.requestUpdate();
        };
        window.addEventListener('filter-change', this._filterChangeHandler);

        // Initialize filters from URL
        const urlFilters = urlState.getState();
        this.currentFilters = {
            franchise: urlFilters.franchise || '',
            role: urlFilters.role || '',
            era: urlFilters.era || ''
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.character) {
            this.isFavorite = storageService.isFavorite(this.character._id);
        }
    }

    render() {
        if (this.loading) {
            return html`
                <div class="loading">
                    Loading...
                </div>
            `;
        }

        if (!this.character) {
            return html`
                <div class="loading">
                    No character data
                </div>
            `;
        }

        return html`
            <div class="card-image">
                <img
                    src="${this.character.imageUrl || this.character.image || '/src/assets/placeholder.svg'}"
                    alt="${this.character.name}"
                    @error="${this._handleImageError}"
                />
                <button
                    class="favorite-button ${this.isFavorite ? 'active' : ''}"
                    @click="${this._toggleFavorite}"
                >
                    ♥
                </button>
            </div>
            <div class="card-content">
                <h3>${this._highlightSearchTerm(this.character.name)}</h3>
                <div class="movie">${this._getMediaAppearances()}</div>
                <div class="role">${this._getCharacterRole()}</div>
            </div>
        `;
    }

    _handleImageError(e) {
        e.target.src = '/src/assets/placeholder.svg';
    }

    _getMediaAppearances() {
        if (!this.character) return '';
    
        const { films, shortFilms, tvShows, videoGames } = this.character;
        
        // Primary media - prioritize films and TV shows
        if (films?.length > 0) {
            return `Film: ${films[0]}`;
        }
        
        if (tvShows?.length > 0) {
            return `TV: ${tvShows[0]}`;
        }
    
        // Secondary media - if no films/TV, show other appearances
        if (shortFilms?.length > 0) {
            return `Short Film: ${shortFilms[0]}`;
        }
        
        if (videoGames?.length > 0) {
            return `Game: ${videoGames[0]}`;
        }
    
        return 'No media appearances';
    }

        _getCharacterRole() {
        if (!this.character) return '';

        if (ROLE_RULES.isVillain(this.character)) return 'Villain';
        if (ROLE_RULES.isHero(this.character)) return 'Hero';
        if (ROLE_RULES.isSidekick(this.character)) return 'Sidekick';
        
        return this.character.parkAttractions?.length > 0 ? 'Featured Character' : 'Character';
    }

    _toggleFavorite() {
        if (this.isFavorite) {
            storageService.removeFavorite(this.character._id);
        } else {
            storageService.addFavorite(this.character);
        }
        window.dispatchEvent(new CustomEvent('favorite-change'));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('favorite-change', this._favoriteChangeHandler);
        window.removeEventListener('filter-change', this._filterChangeHandler);
    }

    _highlightSearchTerm(text) {
        const searchParams = new URLSearchParams(window.location.search);
        const searchTerm = searchParams.get('search');

        if (!searchTerm) return text;

        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return html`${parts.map(part => 
            part.toLowerCase() === searchTerm.toLowerCase()
                ? html`<span class="highlight">${part}</span>`
                : html`${part}`
        )}`;
    }

    _matchesFilters() {
        if (!this.character) return false;

        const { franchise, role, era } = this.currentFilters;

        if (!franchise && !role && !era) return true;

        // Check franchise filter
        if (franchise) {
            const searchTerms = FRANCHISE_SEARCH_TERMS[franchise] || [franchise.replace('-', ' ')];
            let isMatch = false;

            // Check films
            if (this.character.films?.length) {
                isMatch = this.character.films.some(film => 
                    searchTerms.some(term => film.toLowerCase().includes(term))
                );
            }

            // Check character names for specific franchises
            const characterNames = FRANCHISE_CHARACTER_NAMES[franchise];
            if (!isMatch && characterNames) {
                const name = this.character.name.toLowerCase();
                isMatch = characterNames.some(charName => name.includes(charName));
            }

            if (!isMatch) return false;
        }

        // Check role filter
        if (role) {
            const characterRole = this._getCharacterRole().toLowerCase();
            console.log('Role match for', this.character.name, ':', characterRole, 'vs', role);
            if (characterRole !== role.toLowerCase()) return false;
        }

        // Check era filter
        if (era && this.character.films?.length) {
            const firstFilm = this.character.films[0].toLowerCase();
            const eraFilms = ERA_FILMS[era] || [];
            
            const matchesEra = eraFilms.some(eraFilm => 
                firstFilm.includes(eraFilm.toLowerCase())
            );
            
            if (!matchesEra) return false;
        }

        return true;
    }
}

customElements.define('disney-character-card', DisneyCharacterCard);