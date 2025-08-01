const API_BASE_URL = 'https://api.disneyapi.dev';

class DisneyApiService {
    constructor() {
        this._cache = new Map();
    }

    _normalizeResponse(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.data) {
            if (Array.isArray(data.data)) return data.data;
            return [data.data];
        }
        if (data._id || data.name) return [data];
        return [];
    }

    _handleApiError(error, operation) {
        console.error(`API Error during ${operation}:`, error);
        throw error;
    }

    async _fetchWithErrorHandling(url, operation) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            this._handleApiError(error, operation);
        }
    }

    async getCharacters(page = 1) {
        const cacheKey = `characters_page_${page}`;
        
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        const data = await this._fetchWithErrorHandling(
            `${API_BASE_URL}/character?page=${page}`,
            'getCharacters'
        );

        const normalizedData = this._normalizeResponse(data);
        this._cache.set(cacheKey, normalizedData);
        return normalizedData;
    }

    async searchCharacters(query) {
        const cacheKey = `search_${query}`;

        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        const data = await this._fetchWithErrorHandling(
            `${API_BASE_URL}/character?name=${encodeURIComponent(query)}`,
            'searchCharacters'
        );

        const normalizedData = this._normalizeResponse(data);
        this._cache.set(cacheKey, normalizedData);
        return normalizedData;
    }

    async getCharacterById(id) {
        const cacheKey = `character_${id}`;

        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        const data = await this._fetchWithErrorHandling(
            `${API_BASE_URL}/characters/${id}`,
            'getCharacterById'
        );

        const normalizedData = this._normalizeResponse(data);
        const character = normalizedData[0] || null;
        this._cache.set(cacheKey, character);
        return character;
    }

    clearCache() {
        this._cache.clear();
    }
}

export const disneyApi = new DisneyApiService();