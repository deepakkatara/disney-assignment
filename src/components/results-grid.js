import { LitElement, html, css } from 'lit';
import { disneyApi } from '../services/api.js';
import { urlState } from '../services/url-state.js';

export class DisneyResultsGrid extends LitElement {
    static properties = {
        characters: { type: Array },
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
        this.loading = false;
        this.error = '';
        this.currentPage = 1;

        // Initialize from URL state
        const state = urlState.getState();
        this.currentPage = state.page;

        // Listen for URL state changes
        window.addEventListener('urlStateChange', () => this._handleStateChange());
        
        // Listen for search and filter events
        window.addEventListener('search', (e) => this._handleSearch(e.detail.value));
        window.addEventListener('filter-change', () => this._loadCharacters());
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

        if (!this.characters.length) {
            return html`
                <div class="no-results">
                    No characters found. Try adjusting your search or filters.
                </div>
            `;
        }

        return html`
            <div class="grid">
                ${this.characters.map(character => html`
                    <disney-character-card
                        .character="${character}"
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
            const { search, franchise, role, era } = state;

            let data;
            if (search && search.trim()) {
                data = await disneyApi.searchCharacters(search.trim());
            } else {
                data = await disneyApi.getCharacters(this.currentPage);
            }

            // Apply filters
            // Ensure we have an array of characters
            const charactersArray = Array.isArray(data) ? data : (data.data || []);
            
            this.characters = charactersArray.filter(character => {
                if (franchise) {
                    const sourceLower = (character.sourceUrl || '').toLowerCase();
                    const filmMatch = character.films?.some(film => 
                        film.toLowerCase().includes(franchise.toLowerCase()));
                    const sourceMatch = sourceLower.includes(franchise.toLowerCase());
                    if (!filmMatch && !sourceMatch) {
                        return false;
                    }
                }
                if (role) {
                    const characterRole = this._determineCharacterRole(character);
                    if (characterRole.toLowerCase() !== role.toLowerCase()) {
                        return false;
                    }
                }
                if (era) {
                    const characterEra = this._determineCharacterEra(character);
                    if (characterEra.toLowerCase() !== era.toLowerCase()) {
                        return false;
                    }
                }
                return true;
            });
        } catch (error) {
            console.error('Error loading characters:', error);
            this.error = 'Failed to load characters. Please try again.';
        } finally {
            this.loading = false;
        }
    }

    _handleStateChange() {
        const state = urlState.getState();
        if (state.page !== this.currentPage) {
            this.currentPage = state.page;
            this._loadCharacters();
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

    _determineCharacterRole(character) {
        // Try to determine role based on available data
        if (character.role) {
            return character.role;
        }

        // Check if character is a villain
        const villainKeywords = ['villain', 'antagonist', 'evil'];
        const allText = [
            character.name,
            ...(character.films || []),
            character.sourceUrl || ''
        ].join(' ').toLowerCase();

        if (villainKeywords.some(keyword => allText.includes(keyword))) {
            return 'Villain';
        }

        // Check if character is a sidekick
        const sidekickKeywords = ['sidekick', 'companion', 'friend'];
        if (sidekickKeywords.some(keyword => allText.includes(keyword))) {
            return 'Sidekick';
        }

        // Default to Hero for main characters
        if (character.name && character.films?.length > 0) {
            return 'Hero';
        }

        return 'Supporting Character';
    }

    _determineCharacterEra(character) {
        if (character.era) {
            return character.era;
        }

        // Try to determine era based on release date or source material
        const sourceUrl = character.sourceUrl || '';
        const allText = [
            ...(character.films || []),
            sourceUrl
        ].join(' ').toLowerCase();

        // Classic era (pre-1970)
        const classicKeywords = ['snow white', 'pinocchio', 'dumbo', 'bambi', 'cinderella', 'peter pan', 'sleeping beauty'];
        if (classicKeywords.some(keyword => allText.includes(keyword))) {
            return 'Classic';
        }

        // Renaissance era (1989-1999)
        const renaissanceKeywords = ['little mermaid', 'beauty and the beast', 'aladdin', 'lion king', 'pocahontas', 'mulan'];
        if (renaissanceKeywords.some(keyword => allText.includes(keyword))) {
            return 'Renaissance';
        }

        // Modern era (2000-present)
        const modernKeywords = ['princess and the frog', 'tangled', 'frozen', 'moana', 'zootopia', 'big hero'];
        if (modernKeywords.some(keyword => allText.includes(keyword))) {
            return 'Modern';
        }

        // Default to Modern for unknown cases
        return 'Modern';
    }
}

customElements.define('disney-results-grid', DisneyResultsGrid);