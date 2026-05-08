const HeroDetails = (function() {
    let currentHeroId = null;

    function getAlignmentClass(alignment) {
        switch (alignment) {
            case 'good': return 'is-success';
            case 'bad': return 'is-danger';
            case 'neutral': return 'is-warning';
            default: return 'is-light';
        }
    }

    function getStatColor(value) {
        if (value >= 80) return 'is-success';
        if (value >= 60) return 'is-info';
        if (value >= 40) return 'is-warning';
        return 'is-danger';
    }

    function createPowerstatBar(name, value) {
        const numValue = parseInt(value) || 0;
        return `
            <div class="powerstat-item mb-2">
                <div class="is-flex is-justify-content-space-between mb-1">
                    <span class="has-text-weight-semibold is-size-7">${name}</span>
                    <span class="is-size-7">${numValue}</span>
                </div>
                <progress class="progress ${getStatColor(numValue)} is-small" value="${numValue}" max="100">${numValue}%</progress>
            </div>
        `;
    }

    function renderDetails(hero) {
        currentHeroId = hero.id;
        const modalTitle = document.getElementById('heroModalTitle');
        const detailsContainer = document.getElementById('heroDetails');

        modalTitle.textContent = hero.name;

        const alignment = hero.biography?.alignment || 'unknown';
        const publisher = hero.biography?.publisher || 'Unknown';
        const fullName = hero.biography?.fullName || hero.name;
        const aliases = hero.biography?.aliases?.filter(a => a !== '-').join(', ') || 'None';
        const placeOfBirth = hero.biography?.placeOfBirth || 'Unknown';
        const firstAppearance = hero.biography?.firstAppearance || 'Unknown';

        const height = hero.appearance?.height?.join(' / ') || 'Unknown';
        const weight = hero.appearance?.weight?.join(' / ') || 'Unknown';
        const eyeColor = hero.appearance?.eyeColor || 'Unknown';
        const hairColor = hero.appearance?.hairColor || 'Unknown';
        const race = hero.appearance?.race || 'Unknown';
        const gender = hero.appearance?.gender || 'Unknown';

        const occupation = hero.work?.occupation || 'Unknown';
        const base = hero.work?.base || 'Unknown';
        const groupAffiliation = hero.connections?.groupAffiliation || 'None';
        const relatives = hero.connections?.relatives || 'Unknown';

        const powerstats = hero.powerstats || {};

        detailsContainer.innerHTML = `
            <div class="columns">
                <div class="column is-5">
                    <figure class="image">
                        <img src="${hero.images?.lg || hero.images?.md || ''}"
                             alt="${hero.name}"
                             onerror="this.src='https://via.placeholder.com/400x500?text=No+Image'">
                    </figure>
                    <div class="has-text-centered mt-3">
                        <span class="tag is-medium ${getAlignmentClass(alignment)}">${alignment}</span>
                        <span class="tag is-medium is-dark ml-2">${publisher}</span>
                    </div>
                </div>
                <div class="column is-7">
                    <div class="content">
                        <h4 class="title is-5 mb-3">Power Stats</h4>
                        <div class="powerstats-container">
                            ${createPowerstatBar('Intelligence', powerstats.intelligence)}
                            ${createPowerstatBar('Strength', powerstats.strength)}
                            ${createPowerstatBar('Speed', powerstats.speed)}
                            ${createPowerstatBar('Durability', powerstats.durability)}
                            ${createPowerstatBar('Power', powerstats.power)}
                            ${createPowerstatBar('Combat', powerstats.combat)}
                        </div>

                        <h4 class="title is-5 mt-4 mb-3">Biography</h4>
                        <table class="table is-narrow is-fullwidth">
                            <tbody>
                                <tr><th>Full Name</th><td>${fullName}</td></tr>
                                <tr><th>Aliases</th><td>${aliases}</td></tr>
                                <tr><th>Place of Birth</th><td>${placeOfBirth}</td></tr>
                                <tr><th>First Appearance</th><td>${firstAppearance}</td></tr>
                            </tbody>
                        </table>

                        <h4 class="title is-5 mt-4 mb-3">Appearance</h4>
                        <table class="table is-narrow is-fullwidth">
                            <tbody>
                                <tr><th>Gender</th><td>${gender}</td></tr>
                                <tr><th>Race</th><td>${race}</td></tr>
                                <tr><th>Height</th><td>${height}</td></tr>
                                <tr><th>Weight</th><td>${weight}</td></tr>
                                <tr><th>Eye Color</th><td>${eyeColor}</td></tr>
                                <tr><th>Hair Color</th><td>${hairColor}</td></tr>
                            </tbody>
                        </table>

                        <h4 class="title is-5 mt-4 mb-3">Work & Connections</h4>
                        <table class="table is-narrow is-fullwidth">
                            <tbody>
                                <tr><th>Occupation</th><td>${occupation}</td></tr>
                                <tr><th>Base</th><td>${base}</td></tr>
                                <tr><th>Group Affiliation</th><td>${groupAffiliation}</td></tr>
                                <tr><th>Relatives</th><td>${relatives}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        updateModalButtons();
    }

    function updateModalButtons() {
        if (!currentHeroId) return;

        const favoriteBtn = document.getElementById('modalFavoriteBtn');
        const compareBtn = document.getElementById('modalCompareBtn');

        const isFavorite = Favorites.isFavorite(currentHeroId);
        const isInCompare = Compare.isInCompareList(currentHeroId);

        favoriteBtn.innerHTML = `
            <span class="icon"><i class="fas fa-heart"></i></span>
            <span>${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
        `;
        favoriteBtn.classList.toggle('is-danger', isFavorite);
        favoriteBtn.classList.toggle('is-outlined', !isFavorite);

        compareBtn.innerHTML = `
            <span class="icon"><i class="fas fa-balance-scale"></i></span>
            <span>${isInCompare ? 'Remove from Compare' : 'Add to Compare'}</span>
        `;
        compareBtn.classList.toggle('is-info', isInCompare);
        compareBtn.classList.toggle('is-outlined', !isInCompare);
    }

    function getCurrentHeroId() {
        return currentHeroId;
    }

    function openModal(heroId) {
        const hero = SuperheroAPI.getHeroFromCache(heroId);
        if (hero) {
            renderDetails(hero);
            document.getElementById('heroModal').classList.add('is-active');
            document.documentElement.classList.add('is-clipped');
        }
    }

    function closeModal() {
        document.getElementById('heroModal').classList.remove('is-active');
        document.documentElement.classList.remove('is-clipped');
        currentHeroId = null;
    }

    return {
        renderDetails,
        updateModalButtons,
        getCurrentHeroId,
        openModal,
        closeModal
    };
})();
