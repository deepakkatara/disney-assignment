import { LitElement, html, css } from 'lit';
import { storageService } from '../services/storage.js';
import { FilterService } from '../services/filters.js';

export class DisneyCharacterCard extends LitElement {
    static properties = {
        character: { type: Object },
        isFavorite: { type: Boolean },
        loading: { type: Boolean },
        searchTerm: { type: String }
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
        this.searchTerm = '';

        this._favoriteChangeHandler = () => {
            if (this.character) {
                this.isFavorite = storageService.isFavorite(this.character._id);
            }
        };
        window.addEventListener('favorite-change', this._favoriteChangeHandler);

        const urlParams = new URLSearchParams(window.location.search);
        this.searchTerm = urlParams.get('search') || '';
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
                    loading="lazy"
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
                <h3>${this._getHighlightedName()}</h3>
                <div class="movie">${FilterService.getMediaAppearances(this.character)}</div>
                <div class="role">${FilterService.determineCharacterRole(this.character)}</div>
            </div>
        `;
    }

    _handleImageError(e) {
        e.target.src = '/src/assets/placeholder.svg';
    }

    _getHighlightedName() {
        if (!this.searchTerm) {
            return this.character.name;
        }
        
        const highlighted = FilterService.highlightSearchTerm(this.character.name, this.searchTerm);
        return html`${highlighted}`;
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
    }
}

customElements.define('disney-character-card', DisneyCharacterCard);