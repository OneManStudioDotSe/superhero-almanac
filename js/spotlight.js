const Spotlight = (function() {
    function getDailyHero(heroes) {
        if (!heroes || heroes.length === 0) return null;
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        return heroes[seed % heroes.length];
    }

    function getAlignmentClass(alignment) {
        switch (alignment) {
            case 'good': return 'is-success';
            case 'bad': return 'is-danger';
            case 'neutral': return 'is-warning';
            default: return 'is-light';
        }
    }

    function render(heroes) {
        const hero = getDailyHero(heroes);
        const section = document.getElementById('spotlightSection');
        const container = document.getElementById('spotlightContent');
        if (!hero || !section || !container) return;

        const alignment = hero.biography?.alignment || 'unknown';
        const publisher = hero.biography?.publisher || 'Unknown';
        const stats = hero.powerstats || {};
        const statEntries = Object.entries(stats).filter(([, v]) => v > 0);
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        container.innerHTML = `
            <div class="spotlight-hero">
                <div class="spotlight-left">
                    <div class="spotlight-eyebrow">
                        <span class="spotlight-badge">
                            ${Icons.star}&nbsp;Hero of the Day
                        </span>
                        <span class="spotlight-date">${dateStr}</span>
                    </div>
                    <h2 class="spotlight-name">${hero.name}</h2>
                    <div class="spotlight-meta">
                        <span class="tag spotlight-alignment ${getAlignmentClass(alignment)}">${alignment}</span>
                        <span class="spotlight-publisher">${publisher}</span>
                    </div>
                    <div class="spotlight-stats-row">
                        ${statEntries.slice(0, 6).map(([key, val]) => `
                            <div class="spotlight-stat">
                                <span class="spotlight-stat-val">${val}</span>
                                <span class="spotlight-stat-key">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="button spotlight-cta details-btn" data-hero-id="${hero.id}">
                        <span class="icon">${Icons.bolt}</span>
                        <span>View Full Profile</span>
                    </button>
                </div>
                <div class="spotlight-right">
                    <div class="spotlight-image-container details-btn" data-hero-id="${hero.id}">
                        <div class="spotlight-glow"></div>
                        <div class="spotlight-rings">
                            <div class="spotlight-ring ring-1"></div>
                            <div class="spotlight-ring ring-2"></div>
                            <div class="spotlight-ring ring-3"></div>
                        </div>
                        <img class="spotlight-img"
                             src="${hero.images?.lg || hero.images?.md || ''}"
                             alt="${hero.name}"
                             onerror="this.src='https://via.placeholder.com/400x500?text=No+Image'">
                    </div>
                </div>
            </div>
        `;

        section.classList.remove('is-hidden');
    }

    return { render, getDailyHero };
})();
