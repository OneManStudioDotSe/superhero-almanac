const SuperheroAPI = (function() {
    const BASE_URL = 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api';
    let heroesCache = null;

    async function fetchAllHeroes() {
        if (heroesCache) {
            return heroesCache;
        }

        try {
            const response = await fetch(`${BASE_URL}/all.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            heroesCache = await response.json();
            return heroesCache;
        } catch (error) {
            console.error('Failed to fetch heroes:', error);
            throw error;
        }
    }

    async function fetchHeroById(id) {
        if (heroesCache) {
            const hero = heroesCache.find(h => h.id === id);
            if (hero) return hero;
        }

        try {
            const response = await fetch(`${BASE_URL}/id/${id}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch hero ${id}:`, error);
            throw error;
        }
    }

    function getHeroFromCache(id) {
        if (!heroesCache) return null;
        return heroesCache.find(h => h.id === id) || null;
    }

    function clearCache() {
        heroesCache = null;
    }

    return {
        fetchAllHeroes,
        fetchHeroById,
        getHeroFromCache,
        clearCache
    };
})();
