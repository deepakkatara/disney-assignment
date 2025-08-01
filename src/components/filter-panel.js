import { LitElement, html, css } from 'lit';
import { urlState } from '../services/url-state.js';
import { 
    FRANCHISE_OPTIONS,
    ROLE_OPTIONS,
    ERA_OPTIONS
} from '../constants/index.js';

export class DisneyFilterPanel extends LitElement {
    static properties = {
        franchise: { type: String },
        role: { type: String },
        era: { type: String }
    };

    static styles = css`
        :host {
            display: block;
            background: white;
            padding: 16px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        h2 {
            margin-bottom: 16px;
            color: #0066cc;
        }

        .filter-group {
            margin-bottom: 16px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }

        select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: white;
            font-size: 14px;
        }

        select:focus {
            border-color: #0066cc;
            outline: none;
            box-shadow: 0 0 5px rgba(0, 102, 204, 0.2);
        }

        button {
            width: 100%;
            padding: 8px 16px;
            background-color: #0066cc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        button:hover {
            background-color: #0052a3;
        }
    `;

    constructor() {
        super();
        this.franchise = '';
        this.role = '';
        this.era = '';

        // Initialize from URL state
        const state = urlState.getState();
        this.franchise = state.franchise;
        this.role = state.role;
        this.era = state.era;

        // Listen for URL state changes
        window.addEventListener('urlStateChange', (e) => {
            const state = e.detail;
            this.franchise = state.franchise;
            this.role = state.role;
            this.era = state.era;
        });
    }

    render() {
        return html`
            <h2>Filters</h2>
            
            <div class="filter-group">
                <label for="franchise">Franchise</label>
                <select id="franchise" .value="${this.franchise}" @change="${this._handleFranchiseChange}">
                    ${FRANCHISE_OPTIONS.map(option => html`
                        <option value="${option.value}">${option.label}</option>
                    `)}
                </select>
            </div>

            <div class="filter-group">
                <label for="role">Role</label>
                <select id="role" .value="${this.role}" @change="${this._handleRoleChange}">
                    ${ROLE_OPTIONS.map(option => html`
                        <option value="${option.value}">${option.label}</option>
                    `)}
                </select>
            </div>

            <div class="filter-group">
                <label for="era">Era</label>
                <select id="era" .value="${this.era}" @change="${this._handleEraChange}">
                    ${ERA_OPTIONS.map(option => html`
                        <option value="${option.value}">${option.label}</option>
                    `)}
                </select>
            </div>

            <button @click="${this._resetFilters}">Reset Filters</button>
        `;
    }

    _handleFranchiseChange(e) {
        this.franchise = e.target.value;
        this._updateFilters();
    }

    _handleRoleChange(e) {
        this.role = e.target.value;
        this._updateFilters();
    }

    _handleEraChange(e) {
        this.era = e.target.value;
        this._updateFilters();
    }

    _updateFilters() {
        urlState.setState({
            franchise: this.franchise,
            role: this.role,
            era: this.era
        });

        this.dispatchEvent(new CustomEvent('filter-change', {
            detail: {
                franchise: this.franchise,
                role: this.role,
                era: this.era
            },
            bubbles: true,
            composed: true
        }));
    }

    _resetFilters() {
        this.franchise = '';
        this.role = '';
        this.era = '';
        this._updateFilters();
    }
}

customElements.define('disney-filter-panel', DisneyFilterPanel);