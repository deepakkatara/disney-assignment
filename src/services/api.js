const API_BASE_URL = 'https://api.disneyapi.dev';

class DisneyApiService {
    constructor() {
        this._cache = new Map();
    }

    async getCharacters(page = 1) {
        const cacheKey = `characters_page_${page}`;
        
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/character?page=${page}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const transformedData = {
                data: Array.isArray(data.data) ? data.data : [data.data]
            };
            this._cache.set(cacheKey, transformedData);
            return transformedData;
        } catch (error) {
            console.error('Error fetching characters:', error);
            throw error;
        }
    }

    async searchCharacters(query) {
        const cacheKey = `search_${query}`;

        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/character?name=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            // Transform the response to match our expected format
            const transformedData = {
                data: Array.isArray(data.data) ? data.data : [data.data]
            };
            this._cache.set(cacheKey, transformedData);
            return transformedData;
        } catch (error) {
            console.error('Error searching characters:', error);
            throw error;
        }
    }

    async getCharacterById(id) {
        const cacheKey = `character_${id}`;

        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/characters/${id}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            this._cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching character:', error);
            throw error;
        }
    }

    clearCache() {
        this._cache.clear();
    }
}

export const disneyApi = new DisneyApiService();