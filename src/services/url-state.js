class UrlStateService {
    constructor() {
        this._defaultState = {
            search: '',
            franchise: '',
            role: '',
            era: '',
            page: 1
        };

        window.addEventListener('popstate', () => this._notifyStateChange());
    }

    _getStateFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return {
            search: params.get('search') || '',
            franchise: params.get('franchise') || '',
            role: params.get('role') || '',
            era: params.get('era') || '',
            page: parseInt(params.get('page')) || 1
        };
    }

    _updateUrl(state) {
        const params = new URLSearchParams();
        
        Object.entries(state).forEach(([key, value]) => {
            if (value && value !== this._defaultState[key] && value.toString().trim()) {
                params.set(key, value);
            }
        });

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.pushState({}, '', newUrl);
        this._notifyStateChange();
    }

    _notifyStateChange() {
        window.dispatchEvent(new CustomEvent('urlStateChange', {
            detail: this.getState()
        }));
    }

    getState() {
        return this._getStateFromUrl();
    }

    setState(newState) {
        this._updateUrl({
            ...this._getStateFromUrl(),
            ...newState
        });
    }

    resetState() {
        this._updateUrl(this._defaultState);
    }
}

export const urlState = new UrlStateService();