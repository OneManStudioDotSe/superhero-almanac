const Publishers = (function() {
    const PUBLISHER_THEMES = {
        'Marvel Comics': {
            gradient: 'linear-gradient(135deg, #e23636 0%, #8b0000 100%)',
            accent: '#e23636'
        },
        'DC Comics': {
            gradient: 'linear-gradient(135deg, #0476d0 0%, #002366 100%)',
            accent: '#0476d0'
        },
        'Dark Horse Comics': {
            gradient: 'linear-gradient(135deg, #555 0%, #1a1a1a 100%)',
            accent: '#888'
        },
        'Image Comics': {
            gradient: 'linear-gradient(135deg, #f4891f 0%, #c45e00 100%)',
            accent: '#f4891f'
        },
        'NBC - Heroes': {
            gradient: 'linear-gradient(135deg, #7b2ff7 0%, #4a0099 100%)',
            accent: '#7b2ff7'
        },
        'Wildstorm': {
            gradient: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
            accent: '#00b4d8'
        },
        'IDW Publishing': {
            gradient: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
            accent: '#52b788'
        },
        'George Lucas': {
            gradient: 'linear-gradient(135deg, #f8c90d 0%, #c7a000 100%)',
            accent: '#f8c90d'
        },
        'Shueisha': {
            gradient: 'linear-gradient(135deg, #ff6b35 0%, #c23b00 100%)',
            accent: '#ff6b35'
        },
    };

    const DEFAULT_THEME = {
        gradient: 'linear-gradient(135deg, #546e7a 0%, #263238 100%)',
        accent: '#78909c'
    };

    function getTheme(publisher) {
        return PUBLISHER_THEMES[publisher] || DEFAULT_THEME;
    }

    function buildPublisherData(heroes) {
        const map = new Map();
        heroes.forEach(hero => {
            const pub = hero.biography?.publisher;
            if (!pub || pub === '-' || pub === 'null') return;
            if (!map.has(pub)) map.set(pub, { heroes: [], good: 0, bad: 0, neutral: 0 });
            const d = map.get(pub);
            d.heroes.push(hero);
            const al = hero.biography?.alignment;
            if (al === 'good') d.good++;
            else if (al === 'bad') d.bad++;
            else d.neutral++;
        });
        return Array.from(map.entries()).sort((a, b) => b[1].heroes.length - a[1].heroes.length);
    }

    function render(heroes) {
        const publishers = buildPublisherData(heroes);
        const container = document.getElementById('publishersContent');
        if (!container) return;

        container.innerHTML = `
            <p class="publishers-hint">${publishers.length} universes &mdash; click to browse their characters</p>
            <div class="publishers-grid">
                ${publishers.map(([name, data]) => {
                    const theme = getTheme(name);
                    const total = data.heroes.length;
                    const goodPct  = ((data.good    / total) * 100).toFixed(1);
                    const neutralPct = ((data.neutral / total) * 100).toFixed(1);
                    const badPct   = ((data.bad     / total) * 100).toFixed(1);
                    return `
                        <div class="publisher-card" data-publisher="${encodeURIComponent(name)}"
                             style="--pub-gradient:${theme.gradient};--pub-accent:${theme.accent}">
                            <div class="pub-header">
                                <div class="pub-header-text">
                                    <h3 class="pub-name">${name}</h3>
                                    <p class="pub-tagline">${total} characters</p>
                                </div>
                                <span class="pub-count">${total}</span>
                            </div>
                            <div class="pub-avatars">
                                ${data.heroes.slice(0, 5).map(h => `
                                    <img src="${h.images?.xs || ''}" alt="${h.name}" title="${h.name}" loading="lazy"
                                         onerror="this.style.display='none'">
                                `).join('')}
                            </div>
                            <div class="pub-footer">
                                <div class="pub-bar"
                                     title="${data.good} heroes · ${data.neutral} neutral · ${data.bad} villains">
                                    <div class="pub-bar-good"    style="width:${goodPct}%"></div>
                                    <div class="pub-bar-neutral" style="width:${neutralPct}%"></div>
                                    <div class="pub-bar-bad"     style="width:${badPct}%"></div>
                                </div>
                                <div class="pub-legend">
                                    <span class="pub-legend-item good">
                                        ${Icons.shield} ${data.good}
                                    </span>
                                    <span class="pub-legend-item neutral">
                                        ${Icons.compare} ${data.neutral}
                                    </span>
                                    <span class="pub-legend-item bad">
                                        ${Icons.skull} ${data.bad}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        container.querySelectorAll('.publisher-card').forEach(card => {
            card.addEventListener('click', () => filterByPublisher(decodeURIComponent(card.dataset.publisher)));
        });
    }

    function filterByPublisher(publisher) {
        document.getElementById('publishersModal').classList.remove('is-active');
        document.documentElement.classList.remove('is-clipped');

        const select = document.getElementById('publisherFilter');
        select.value = publisher;
        const filtered = Filters.applyFilters();
        HeroesRenderer.render(filtered);

        document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
    }

    function openModal() {
        render(Filters.getAllHeroes());
        document.getElementById('publishersModal').classList.add('is-active');
        document.documentElement.classList.add('is-clipped');
    }

    return { render, openModal };
})();
