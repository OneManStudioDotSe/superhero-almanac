const Favorites = (function() {
    const STORAGE_KEY = 'superhero_favorites';
    let favorites = new Set();

    function load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                favorites = new Set(parsed);
            }
        } catch (e) {
            console.error('Failed to load favorites:', e);
            favorites = new Set();
        }
        updateCount();
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
        } catch (e) {
            console.error('Failed to save favorites:', e);
        }
    }

    function add(heroId) {
        favorites.add(heroId);
        save();
        updateCount();
    }

    function remove(heroId) {
        favorites.delete(heroId);
        save();
        updateCount();
    }

    function toggle(heroId) {
        if (favorites.has(heroId)) {
            remove(heroId);
            return false;
        } else {
            add(heroId);
            return true;
        }
    }

    function isFavorite(heroId) {
        return favorites.has(heroId);
    }

    function getAll() {
        return [...favorites];
    }

    function getCount() {
        return favorites.size;
    }

    function updateCount() {
        const countEl = document.getElementById('favoritesCount');
        if (countEl) {
            countEl.textContent = favorites.size;
        }
    }

    function renderFavoritesModal() {
        const container = document.getElementById('favoritesContent');
        const favoriteIds = getAll();

        if (favoriteIds.length === 0) {
            container.innerHTML = `
                <div class="notification is-info is-light">
                    <p>You haven't added any favorites yet.</p>
                    <p class="mt-2">Click the ${Icons.heart} icon on a hero card to add them to your favorites.</p>
                </div>
            `;
            return;
        }

        const heroes = favoriteIds
            .map(id => SuperheroAPI.getHeroFromCache(id))
            .filter(h => h !== null);

        container.innerHTML = `
            <div class="columns is-multiline">
                ${heroes.map(hero => `
                    <div class="column is-4">
                        <div class="card favorite-card" data-hero-id="${hero.id}">
                            <div class="card-image">
                                <figure class="image is-4by5">
                                    <img src="${hero.images?.sm || ''}" alt="${hero.name}" loading="lazy">
                                </figure>
                            </div>
                            <div class="card-content py-2">
                                <p class="has-text-weight-semibold is-size-7">${hero.name}</p>
                            </div>
                            <footer class="card-footer">
                                <a href="#" class="card-footer-item details-btn" data-hero-id="${hero.id}">
                                    <span class="icon is-small">${Icons.info}</span>
                                </a>
                                <a href="#" class="card-footer-item remove-favorite-btn has-text-danger" data-hero-id="${hero.id}">
                                    <span class="icon is-small">${Icons.trash}</span>
                                </a>
                            </footer>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function openModal() {
        renderFavoritesModal();
        document.getElementById('favoritesModal').classList.add('is-active');
        document.documentElement.classList.add('is-clipped');
    }

    function closeModal() {
        document.getElementById('favoritesModal').classList.remove('is-active');
        document.documentElement.classList.remove('is-clipped');
    }

    return {
        load,
        add,
        remove,
        toggle,
        isFavorite,
        getAll,
        getCount,
        updateCount,
        renderFavoritesModal,
        openModal,
        closeModal
    };
})();
