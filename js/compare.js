const Compare = (function() {
    const STORAGE_KEY = 'superhero_compare';
    const MAX_COMPARE = 4;
    let compareList = [];

    function load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                compareList = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load compare list:', e);
            compareList = [];
        }
        updateCount();
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
        } catch (e) {
            console.error('Failed to save compare list:', e);
        }
    }

    function add(heroId) {
        if (compareList.length >= MAX_COMPARE) {
            alert(`You can only compare up to ${MAX_COMPARE} heroes at a time.`);
            return false;
        }
        if (!compareList.includes(heroId)) {
            compareList.push(heroId);
            save();
            updateCount();
            return true;
        }
        return false;
    }

    function remove(heroId) {
        const index = compareList.indexOf(heroId);
        if (index > -1) {
            compareList.splice(index, 1);
            save();
            updateCount();
            return true;
        }
        return false;
    }

    function toggle(heroId) {
        if (isInCompareList(heroId)) {
            remove(heroId);
            return false;
        } else {
            return add(heroId);
        }
    }

    function isInCompareList(heroId) {
        return compareList.includes(heroId);
    }

    function getAll() {
        return [...compareList];
    }

    function getCount() {
        return compareList.length;
    }

    function clear() {
        compareList = [];
        save();
        updateCount();
    }

    function updateCount() {
        const countEl = document.getElementById('compareCount');
        if (countEl) {
            countEl.textContent = compareList.length;
        }
    }

    function getStatColor(value) {
        if (value >= 80) return 'is-success';
        if (value >= 60) return 'is-info';
        if (value >= 40) return 'is-warning';
        return 'is-danger';
    }

    function createComparisonBar(statName, heroes) {
        const maxValue = Math.max(...heroes.map(h => h.powerstats?.[statName] || 0));

        return `
            <div class="comparison-stat mb-4">
                <h5 class="title is-6 mb-2">${statName.charAt(0).toUpperCase() + statName.slice(1)}</h5>
                <div class="columns is-mobile">
                    ${heroes.map(hero => {
                        const value = hero.powerstats?.[statName] || 0;
                        const isMax = value === maxValue && value > 0;
                        return `
                            <div class="column">
                                <div class="has-text-centered mb-1">
                                    <span class="is-size-7 ${isMax ? 'has-text-weight-bold has-text-success' : ''}">${value}</span>
                                </div>
                                <progress class="progress ${getStatColor(value)} is-small" value="${value}" max="100">${value}%</progress>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    function renderCompareModal() {
        const container = document.getElementById('compareContent');

        if (compareList.length === 0) {
            container.innerHTML = `
                <div class="notification is-info is-light">
                    <p>No heroes selected for comparison.</p>
                    <p class="mt-2">Click the ${Icons.compare} icon on hero cards to add them for comparison.</p>
                </div>
            `;
            return;
        }

        const heroes = compareList
            .map(id => SuperheroAPI.getHeroFromCache(id))
            .filter(h => h !== null);

        if (heroes.length === 0) {
            container.innerHTML = `
                <div class="notification is-warning">
                    <p>Could not load hero data. Please try again.</p>
                </div>
            `;
            return;
        }

        const statNames = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

        container.innerHTML = `
            <div class="compare-heroes mb-4">
                <div class="columns is-mobile">
                    ${heroes.map(hero => `
                        <div class="column has-text-centered">
                            <figure class="image is-96x96 is-inline-block">
                                <img class="is-rounded" src="${hero.images?.sm || ''}" alt="${hero.name}">
                            </figure>
                            <p class="has-text-weight-bold mt-2">${hero.name}</p>
                            <p class="is-size-7 has-text-grey">${hero.biography?.publisher || 'Unknown'}</p>
                            <button class="button is-small is-danger is-light mt-2 remove-compare-btn" data-hero-id="${hero.id}">
                                <span class="icon is-small">${Icons.times}</span>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
            <hr>
            <h4 class="title is-5">Power Stats Comparison</h4>
            ${statNames.map(stat => createComparisonBar(stat, heroes)).join('')}

            <hr>
            <h4 class="title is-5">Details Comparison</h4>
            <div class="table-container">
                <table class="table is-fullwidth is-narrow">
                    <thead>
                        <tr>
                            <th></th>
                            ${heroes.map(h => `<th class="has-text-centered">${h.name}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>Alignment</th>
                            ${heroes.map(h => `<td class="has-text-centered">${h.biography?.alignment || '-'}</td>`).join('')}
                        </tr>
                        <tr>
                            <th>Gender</th>
                            ${heroes.map(h => `<td class="has-text-centered">${h.appearance?.gender || '-'}</td>`).join('')}
                        </tr>
                        <tr>
                            <th>Race</th>
                            ${heroes.map(h => `<td class="has-text-centered">${h.appearance?.race || '-'}</td>`).join('')}
                        </tr>
                        <tr>
                            <th>Height</th>
                            ${heroes.map(h => `<td class="has-text-centered">${h.appearance?.height?.[1] || '-'}</td>`).join('')}
                        </tr>
                        <tr>
                            <th>Weight</th>
                            ${heroes.map(h => `<td class="has-text-centered">${h.appearance?.weight?.[1] || '-'}</td>`).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    function openModal() {
        renderCompareModal();
        document.getElementById('compareModal').classList.add('is-active');
        document.documentElement.classList.add('is-clipped');
    }

    function closeModal() {
        document.getElementById('compareModal').classList.remove('is-active');
        document.documentElement.classList.remove('is-clipped');
    }

    return {
        load,
        add,
        remove,
        toggle,
        isInCompareList,
        getAll,
        getCount,
        clear,
        updateCount,
        renderCompareModal,
        openModal,
        closeModal,
        MAX_COMPARE
    };
})();
