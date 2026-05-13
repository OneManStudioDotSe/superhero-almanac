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

    function createRadarChart(powerstats) {
        const stats = [
            { name: 'INT', full: 'Intelligence', value: parseInt(powerstats.intelligence) || 0 },
            { name: 'STR', full: 'Strength',     value: parseInt(powerstats.strength)     || 0 },
            { name: 'SPD', full: 'Speed',         value: parseInt(powerstats.speed)        || 0 },
            { name: 'DUR', full: 'Durability',    value: parseInt(powerstats.durability)   || 0 },
            { name: 'PWR', full: 'Power',         value: parseInt(powerstats.power)        || 0 },
            { name: 'CMB', full: 'Combat',        value: parseInt(powerstats.combat)       || 0 },
        ];

        const cx = 115, cy = 115, r = 80, n = 6;
        const toRad = deg => (deg * Math.PI) / 180;

        function pt(i, radius) {
            const angle = toRad(-90 + i * (360 / n));
            return {
                x: (cx + radius * Math.cos(angle)).toFixed(2),
                y: (cy + radius * Math.sin(angle)).toFixed(2)
            };
        }

        const gridRings = [0.2, 0.4, 0.6, 0.8, 1.0].map(level => {
            const pts = stats.map((_, i) => { const p = pt(i, r * level); return `${p.x},${p.y}`; }).join(' ');
            return `<polygon points="${pts}" fill="none" stroke="rgba(102,126,234,0.2)" stroke-width="1"/>`;
        }).join('');

        const axes = stats.map((_, i) => {
            const p = pt(i, r);
            return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(102,126,234,0.25)" stroke-width="1"/>`;
        }).join('');

        const dataPoints = stats.map((s, i) => {
            const p = pt(i, r * (s.value / 100));
            return `${p.x},${p.y}`;
        }).join(' ');

        const dots = stats.map((s, i) => {
            if (s.value === 0) return '';
            const p = pt(i, r * (s.value / 100));
            return `<circle cx="${p.x}" cy="${p.y}" r="3.5" class="radar-dot"/>`;
        }).join('');

        const labels = stats.map((s, i) => {
            const p = pt(i, r + 20);
            return `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" class="radar-label">${s.name}</text>`;
        }).join('');

        const gradId = `rg${Date.now()}`;

        return `
            <div class="radar-chart-wrapper">
                <svg viewBox="0 0 230 230" class="radar-chart">
                    <defs>
                        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"   style="stop-color:#667eea;stop-opacity:0.7"/>
                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.35"/>
                        </linearGradient>
                    </defs>
                    ${gridRings}
                    ${axes}
                    <polygon points="${dataPoints}"
                             fill="url(#${gradId})"
                             stroke="#667eea" stroke-width="2"
                             class="radar-polygon"/>
                    ${dots}
                    ${labels}
                </svg>
                <div class="radar-values-grid">
                    ${stats.map(s => `
                        <div class="radar-value-item">
                            <span class="radar-val-name">${s.full}</span>
                            <span class="radar-val-num">${s.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function renderDetails(hero) {
        currentHeroId = hero.id;
        const modalTitle = document.getElementById('heroModalTitle');
        const detailsContainer = document.getElementById('heroDetails');

        modalTitle.textContent = hero.name;

        const alignment       = hero.biography?.alignment              || 'unknown';
        const publisher       = hero.biography?.publisher              || 'Unknown';
        const fullName        = hero.biography?.fullName               || hero.name;
        const aliases         = hero.biography?.aliases?.filter(a => a !== '-').join(', ') || 'None';
        const placeOfBirth    = hero.biography?.placeOfBirth           || 'Unknown';
        const firstAppearance = hero.biography?.firstAppearance        || 'Unknown';

        const height   = hero.appearance?.height?.join(' / ') || 'Unknown';
        const weight   = hero.appearance?.weight?.join(' / ') || 'Unknown';
        const eyeColor = hero.appearance?.eyeColor             || 'Unknown';
        const hairColor= hero.appearance?.hairColor            || 'Unknown';
        const race     = hero.appearance?.race                 || 'Unknown';
        const gender   = hero.appearance?.gender               || 'Unknown';

        const occupation      = hero.work?.occupation                  || 'Unknown';
        const base            = hero.work?.base                        || 'Unknown';
        const groupAffiliation= hero.connections?.groupAffiliation     || 'None';
        const relatives       = hero.connections?.relatives            || 'Unknown';

        const powerstats = hero.powerstats || {};

        detailsContainer.innerHTML = `
            <div class="columns">
                <!-- Left: portrait + radar chart stacked -->
                <div class="column is-4">
                    <figure class="image hero-detail-portrait">
                        <img src="${hero.images?.lg || hero.images?.md || ''}"
                             alt="${hero.name}"
                             onerror="this.src='https://via.placeholder.com/400x500?text=No+Image'">
                    </figure>
                    <div class="has-text-centered mt-3 mb-3">
                        <span class="tag is-medium ${getAlignmentClass(alignment)}">${alignment}</span>
                        <span class="tag is-medium is-dark ml-2">${publisher}</span>
                    </div>
                    <h4 class="title is-6 mb-2">Power Stats</h4>
                    ${createRadarChart(powerstats)}
                </div>
                <!-- Right: all text info -->
                <div class="column is-8">
                    <div class="content">
                        <h4 class="title is-5 mb-3">Biography</h4>
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

                        <h4 class="title is-5 mt-4 mb-3">Work &amp; Connections</h4>
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
        const compareBtn  = document.getElementById('modalCompareBtn');

        const isFavorite  = Favorites.isFavorite(currentHeroId);
        const isInCompare = Compare.isInCompareList(currentHeroId);

        favoriteBtn.innerHTML = `
            <span class="icon">${Icons.heart}</span>
            <span>${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
        `;
        favoriteBtn.classList.toggle('is-danger',   isFavorite);
        favoriteBtn.classList.toggle('is-outlined', !isFavorite);

        compareBtn.innerHTML = `
            <span class="icon">${Icons.compare}</span>
            <span>${isInCompare ? 'Remove from Compare' : 'Add to Compare'}</span>
        `;
        compareBtn.classList.toggle('is-info',     isInCompare);
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
