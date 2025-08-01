import { LitElement, html, css } from 'lit';
import { urlState } from '../services/url-state.js';
import { debounce } from '../utils/debounce.js';
import { disneyApi } from '../services/api.js';

export class DisneySearchBar extends LitElement {
    static properties = {
        value: { type: String },
        suggestions: { type: Array },
        loading: { type: Boolean },
    };

    static styles = css`
        :host {
            display: block;
        }

        .search-container {
            position: relative;
            max-width: 600px;
            margin: 0 auto;
        }

        input {
            width: 100%;
            padding: 12px 40px 12px 16px;
            font-size: 16px;
            border: 2px solid #0066cc;
            border-radius: 4px;
            outline: none;
        }

        input:focus {
            box-shadow: 0 0 5px rgba(0, 102, 204, 0.3);
        }

        .clear-button {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            padding: 4px;
            cursor: pointer;
            color: #666;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .clear-button:hover {
            color: #333;
        }

        .suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 0 0 4px 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-height: 300px;
            overflow-y: auto;
        }

        .suggestion-item {
            padding: 8px 16px;
            cursor: pointer;
        }

        .suggestion-item:hover {
            background-color: #f5f5f5;
        }

        .loading {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
        }
    `;

    constructor() {
        super();
        this.value = '';
        this.suggestions = [];
        this.loading = false;

        // Initialize from URL state
        const state = urlState.getState();
        this.value = state.search || '';

        // Listen for URL state changes
        window.addEventListener('urlStateChange', (e) => {
            const state = e.detail;
            if (state.search !== this.value) {
                this.value = state.search || '';
            }
        });

        // Setup debounced search
        this._debouncedSearch = debounce((value) => {
            if (value.length >= 2) {
                this._searchCharacters();
            }
            urlState.setState({ 
                search: value || null,
                page: 1 
            });
        }, 500);
    }

    render() {
        return html`
            <div class="search-container">
                <input
                    type="text"
                    .value="${this.value}"
                    @input="${this._handleInput}"
                    placeholder="Search Disney characters..."
                    autocomplete="off"
                />
                ${this.value ? html`
                    <button class="clear-button" @click="${this._clearSearch}">×</button>
                ` : ''}
                ${this.loading ? html`
                    <div class="loading">
                        <span>Loading...</span>
                    </div>
                ` : ''}
                ${this.suggestions.length > 0 ? html`
                    <div class="suggestions">
                        ${this.suggestions.map(suggestion => html`
                            <div
                                class="suggestion-item"
                                @click="${() => this._selectSuggestion(suggestion)}"
                            >
                                ${suggestion.name}
                            </div>
                        `)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    _handleInput(e) {
        this.value = e.target.value;
        const trimmedValue = this.value.trim();
        
        // If input is empty, update immediately
        if (!trimmedValue) {
            this.suggestions = [];
            this.dispatchEvent(new CustomEvent('search', {
                detail: { value: '' },
                bubbles: true
            }));
            urlState.setState({ search: null, page: 1 });
            return;
        }

        // Use debounced search for non-empty input
        this._debouncedSearch(trimmedValue);
    }

    async _searchCharacters() {
        if (!this.value.trim()) {
            this.suggestions = [];
            return;
        }

        this.loading = true;

        try {
            const result = await disneyApi.searchCharacters(this.value.trim());
            this.suggestions = result.data.slice(0, 5); // Limit to 5 suggestions
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            this.suggestions = [];
        } finally {
            this.loading = false;
        }
    }

    _selectSuggestion(suggestion) {
        this.value = suggestion.name;
        this.suggestions = [];
        
        // Dispatch search event for immediate update
        this.dispatchEvent(new CustomEvent('search', {
            detail: { value: suggestion.name },
            bubbles: true
        }));
        
        // Update URL state
        urlState.setState({ search: suggestion.name, page: 1 });
    }

    _clearSearch() {
        this.value = '';
        this.suggestions = [];
        
        this.dispatchEvent(new CustomEvent('search', {
            detail: { value: '' },
            bubbles: true
        }));
        
        urlState.setState({ search: null, page: 1 });
    }
}

customElements.define('disney-search-bar', DisneySearchBar);