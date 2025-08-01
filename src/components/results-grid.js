import { LitElement, html, css } from 'lit';
import { disneyApi } from '../services/api.js';
import { FilterService } from '../services/filters.js';
import { urlState } from '../services/url-state.js';

export class DisneyResultsGrid extends LitElement {
    static properties = {
        characters: { type: Array },
        filteredCharacters: { type: Array },
        loading: { type: Boolean },
        error: { type: String },
        currentPage: { type: Number }
    };

    static styles = css`
        :host {
            display: block;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            padding: 20px;
        }

        .error {
            color: #ff4444;
            padding: 20px;
            text-align: center;
        }

        .loading {
            text-align: center;
            padding: 20px;
        }

        .no-results {
            text-align: center;
            padding: 20px;
            color: #666;
        }

        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            padding: 20px;
        }

        button {
            padding: 8px 16px;
            background-color: #0066cc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }

        .page-info {
            display: flex;
            align-items: center;
            padding: 0 16px;
        }
    `;

    constructor() {
        super();
        this.characters = [];
        this.filteredCharacters = [];
        this.loading = false;
        this.error = '';
        this.currentPage = 1;

        const state = urlState.getState();
        this.currentPage = state.page;

        window.addEventListener('urlStateChange', () => this._handleStateChange());
        window.addEventListener('search', (e) => this._handleSearch(e.detail.value));
        window.addEventListener('filter-change', () => this._applyFilters());
    }

    connectedCallback() {
        super.connectedCallback();
        this._loadCharacters();
    }

    render() {
        if (this.error) {
            return html`
                <div class="error">
                    ${this.error}
                    <button @click="${this._loadCharacters}">Try Again</button>
                </div>
            `;
        }

        if (this.loading) {
            return html`
                <div class="loading">
                    Loading characters...
                </div>
            `;
        }

        if (!this.filteredCharacters.length) {
            return html`
                <div class="no-results">
                    No characters found. Try adjusting your search or filters.
                </div>
            `;
        }

        return html`
            <div class="grid">
                ${this.filteredCharacters.map(character => html`
                    <disney-character-card
                        .character="${character}"
                        .searchTerm="${urlState.getState().search || ''}"
                    ></disney-character-card>
                `)}
            </div>

            <div class="pagination">
                <button
                    ?disabled="${this.currentPage === 1}"
                    @click="${() => this._changePage(this.currentPage - 1)}"
                >
                    Previous
                </button>
                <div class="page-info">Page ${this.currentPage}</div>
                <button
                    @click="${() => this._changePage(this.currentPage + 1)}"
                >
                    Next
                </button>
            </div>
        `;
    }

    async _loadCharacters() {
        this.loading = true;
        this.error = '';

        try {
            const state = urlState.getState();
            const { search } = state;

            let data;
            if (search && search.trim()) {
                data = await disneyApi.searchCharacters(search.trim());
            } else {
                data = await disneyApi.getCharacters(this.currentPage);
            }

            this.characters = data;
            this._applyFilters();
        } catch (error) {
            console.error('Error loading characters:', error);
            this.error = error.message || 'Failed to load characters. Please try again.';
        } finally {
            this.loading = false;
        }
    }

    _applyFilters() {
        const state = urlState.getState();
        const filters = {
            franchise: state.franchise,
            role: state.role,
            era: state.era,
            search: state.search
        };

        this.filteredCharacters = FilterService.applyFilters(this.characters, filters);
    }

    _handleStateChange() {
        const state = urlState.getState();
        if (state.page !== this.currentPage) {
            this.currentPage = state.page;
            this._loadCharacters();
        } else {
            this._applyFilters();
        }
    }

    _handleSearch(value) {
        urlState.setState({ search: value, page: 1 });
        this.currentPage = 1;
        this._loadCharacters();
    }

    _changePage(newPage) {
        urlState.setState({ page: newPage });
        this.currentPage = newPage;
        this._loadCharacters();
    }
}

customElements.define('disney-results-grid', DisneyResultsGrid);