const Filters = (function() {
    let allHeroes = [];
    let filteredHeroes = [];

    function setHeroes(heroes) {
        allHeroes = heroes;
        filteredHeroes = heroes;
    }

    function populatePublishers() {
        const select = document.getElementById('publisherFilter');
        const publishers = new Set();

        allHeroes.forEach(hero => {
            const publisher = hero.biography?.publisher;
            if (publisher && publisher !== '-' && publisher !== 'null') {
                publishers.add(publisher);
            }
        });

        const sortedPublishers = Array.from(publishers).sort();
        sortedPublishers.forEach(publisher => {
            const option = document.createElement('option');
            option.value = publisher;
            option.textContent = publisher;
            select.appendChild(option);
        });
    }

    function applyFilters() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const publisher = document.getElementById('publisherFilter').value;
        const alignment = document.getElementById('alignmentFilter').value;
        const gender = document.getElementById('genderFilter').value;
        const showFavoritesOnly = document.getElementById('showFavoritesOnly').checked;

        filteredHeroes = allHeroes.filter(hero => {
            if (searchTerm && !hero.name.toLowerCase().includes(searchTerm)) {
                return false;
            }

            if (publisher && hero.biography?.publisher !== publisher) {
                return false;
            }

            if (alignment && hero.biography?.alignment !== alignment) {
                return false;
            }

            if (gender && hero.appearance?.gender !== gender) {
                return false;
            }

            if (showFavoritesOnly && !Favorites.isFavorite(hero.id)) {
                return false;
            }

            return true;
        });

        HeroesRenderer.setPage(1);
        return filteredHeroes;
    }

    function clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('publisherFilter').value = '';
        document.getElementById('alignmentFilter').value = '';
        document.getElementById('genderFilter').value = '';
        document.getElementById('showFavoritesOnly').checked = false;

        filteredHeroes = allHeroes;
        HeroesRenderer.setPage(1);
        return filteredHeroes;
    }

    function getFilteredHeroes() {
        return filteredHeroes;
    }

    function getAllHeroes() {
        return allHeroes;
    }

    return {
        setHeroes,
        populatePublishers,
        applyFilters,
        clearFilters,
        getFilteredHeroes,
        getAllHeroes
    };
})();
