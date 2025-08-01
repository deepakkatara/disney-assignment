const FAVORITES_KEY = 'favorites';

class StorageService {
    constructor() {
        this._favorites = this._loadFavorites();
    }

    _loadFavorites() {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    _saveFavorites() {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(this._favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    addFavorite(character) {
        if (!this.isFavorite(character._id)) {
            this._favorites.push(character);
            this._saveFavorites();
            this._dispatchChange();
        }
    }

    removeFavorite(characterId) {
        this._favorites = this._favorites.filter(char => char._id !== characterId);
        this._saveFavorites();
        this._dispatchChange();
    }

    isFavorite(characterId) {
        return this._favorites.some(char => char._id === characterId);
    }

    getAllFavorites() {
        return [...this._favorites];
    }

    _dispatchChange() {
        window.dispatchEvent(new CustomEvent('favorite-change'));
    }
}

export const storageService = new StorageService();