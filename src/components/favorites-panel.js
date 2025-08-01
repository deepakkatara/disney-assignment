import { LitElement, html, css } from 'lit';
import { storageService } from '../services/storage.js';

export class DisneyFavoritesPanel extends LitElement {
    static properties = {
        favorites: { type: Array },
        expanded: { type: Boolean }
    };

    static styles = css`
        :host {
            display: block;
            background: white;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header {
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }

        h2 {
            margin: 0;
            color: #0066cc;
        }

        .content {
            max-height: 0;
            overflow: hidden;
        }

        .content.expanded {
            max-height: 500px;
            overflow-y: auto;
        }

        .favorite-item {
            display: flex;
            align-items: center;
            padding: 8px 16px;
            border-top: 1px solid #eee;
        }

        .favorite-item img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            object-fit: cover;
        }

        .favorite-item .info {
            flex-grow: 1;
        }

        .favorite-item .name {
            font-weight: 500;
        }

        .favorite-item .movie {
            font-size: 0.8em;
            color: #666;
        }

        .remove-button {
            background: none;
            border: none;
            color: #ff4081;
            cursor: pointer;
            padding: 4px 8px;
            font-size: 1.2em;
        }

        .empty {
            padding: 16px;
            text-align: center;
            color: #666;
        }
    `;

    constructor() {
        super();
        this.favorites = [];
        this.expanded = false;
        this._loadFavorites();

        window.addEventListener('favorite-change', () => this._loadFavorites());
    }

    render() {
        return html`
            <div class="header" @click="${this._toggleExpanded}">
                <h2>Favorites (${this.favorites.length})</h2>
                <span>${this.expanded ? '▼' : '▶'}</span>
            </div>

            <div class="content ${this.expanded ? 'expanded' : ''}">
                ${this._renderContent()}
            </div>
        `;
    }

    _renderContent() {
        if (!this.favorites.length) {
            return html`
                <div class="empty">
                    No favorite characters yet.
                    Click the heart icon on character cards to add them here.
                </div>
            `;
        }

        return this.favorites.map(character => html`
            <div class="favorite-item">
                <img
                    src="${character.imageUrl || '/src/assets/placeholder.svg'}"
                    alt="${character.name}"
                    @error="${this._handleImageError}"
                />
                <div class="info">
                    <div class="name">${character.name}</div>
                    <div class="movie">${character.films?.[0] || 'Unknown Movie'}</div>
                </div>
                <button
                    class="remove-button"
                    @click="${() => this._removeFavorite(character._id)}"
                >
                    ×
                </button>
            </div>
        `);
    }

    _loadFavorites() {
        this.favorites = storageService.getAllFavorites();
    }

    _removeFavorite(id) {
        storageService.removeFavorite(id);
        window.dispatchEvent(new CustomEvent('favorite-change'));
    }

    _toggleExpanded() {
        this.expanded = !this.expanded;
    }

    _handleImageError(e) {
        e.target.src = '/src/assets/placeholder.svg';
    }
}

customElements.define('disney-favorites-panel', DisneyFavoritesPanel);