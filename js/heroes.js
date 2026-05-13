const HeroesRenderer = (function() {
    const ITEMS_PER_PAGE = 20;
    let currentView = 'grid';
    let currentPage = 1;
    let sortColumn = 'name';
    let sortDirection = 'asc';

    function getAlignmentClass(alignment) {
        switch (alignment) {
            case 'good': return 'is-success';
            case 'bad': return 'is-danger';
            case 'neutral': return 'is-warning';
            default: return 'is-light';
        }
    }

    function createHeroCard(hero) {
        const isFavorite  = Favorites.isFavorite(hero.id);
        const isInCompare = Compare.isInCompareList(hero.id);
        const alignment   = hero.biography?.alignment || 'unknown';
        const publisher   = hero.biography?.publisher || 'Unknown';
        const stats       = hero.powerstats || {};
        const statEntries = Object.entries(stats).filter(([, v]) => v > 0);

        return `
            <div class="column is-3-desktop is-4-tablet is-6-mobile">
                <div class="hero-flip-container" data-hero-id="${hero.id}">
                    <div class="hero-flip-inner">
                        <!-- FRONT -->
                        <div class="card hero-card hero-flip-front">
                            <div class="card-image">
                                <figure class="image hero-image">
                                    <img src="${hero.images?.md || hero.images?.sm || ''}"
                                         alt="${hero.name}"
                                         loading="lazy"
                                         onerror="this.src='https://via.placeholder.com/300x340?text=No+Image'">
                                </figure>
                                <span class="tag alignment-tag ${getAlignmentClass(alignment)}">${alignment}</span>
                            </div>
                            <div class="card-content">
                                <p class="title is-5 hero-name">${hero.name}</p>
                                <p class="subtitle is-7 has-text-grey">${publisher}</p>
                            </div>
                            <footer class="card-footer">
                                <a href="#" class="card-footer-item favorite-btn ${isFavorite ? 'is-active' : ''}"
                                   data-hero-id="${hero.id}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                                    <span class="icon">${Icons.heart}</span>
                                </a>
                                <a href="#" class="card-footer-item compare-btn ${isInCompare ? 'is-active' : ''}"
                                   data-hero-id="${hero.id}" title="${isInCompare ? 'Remove from compare' : 'Add to compare'}">
                                    <span class="icon">${Icons.compare}</span>
                                </a>
                                <a href="#" class="card-footer-item details-btn" data-hero-id="${hero.id}" title="View details">
                                    <span class="icon">${Icons.info}</span>
                                </a>
                            </footer>
                        </div>
                        <!-- BACK -->
                        <div class="card hero-flip-back">
                            <div class="hero-flip-back-content">
                                <div class="flip-hero-avatar">
                                    <img src="${hero.images?.sm || hero.images?.xs || ''}"
                                         alt="${hero.name}"
                                         onerror="this.style.display='none'">
                                </div>
                                <h4 class="flip-hero-name">${hero.name}</h4>
                                <p class="flip-hero-publisher">${publisher}</p>
                                <div class="flip-stats">
                                    ${statEntries.length > 0
                                        ? statEntries.slice(0, 6).map(([key, val]) => `
                                            <div class="flip-stat-row">
                                                <span class="flip-stat-label">${key.slice(0, 3).toUpperCase()}</span>
                                                <div class="flip-stat-track">
                                                    <div class="flip-stat-fill" style="width:${val}%"></div>
                                                </div>
                                                <span class="flip-stat-num">${val}</span>
                                            </div>
                                        `).join('')
                                        : '<p class="flip-no-stats">No stats available</p>'
                                    }
                                </div>
                                <a href="#" class="button flip-view-btn details-btn" data-hero-id="${hero.id}">
                                    <span class="icon">${Icons.eye}</span>
                                    <span>View Details</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function createTableRow(hero) {
        const isFavorite  = Favorites.isFavorite(hero.id);
        const isInCompare = Compare.isInCompareList(hero.id);
        const alignment   = hero.biography?.alignment || 'unknown';
        const publisher   = hero.biography?.publisher || 'Unknown';
        const powerstats  = hero.powerstats || {};

        return `
            <tr class="hero-row" data-hero-id="${hero.id}">
                <td>
                    <div class="is-flex is-align-items-center">
                        <figure class="image is-32x32 mr-2">
                            <img class="is-rounded" src="${hero.images?.xs || ''}" alt="${hero.name}">
                        </figure>
                        <span class="hero-name-link">${hero.name}</span>
                    </div>
                </td>
                <td>${publisher}</td>
                <td><span class="tag ${getAlignmentClass(alignment)}">${alignment}</span></td>
                <td>${powerstats.intelligence || '-'}</td>
                <td>${powerstats.strength || '-'}</td>
                <td>${powerstats.speed || '-'}</td>
                <td>
                    <div class="buttons are-small">
                        <button class="button favorite-btn ${isFavorite ? 'is-danger' : 'is-light'}"
                                data-hero-id="${hero.id}">
                            <span class="icon">${Icons.heart}</span>
                        </button>
                        <button class="button compare-btn ${isInCompare ? 'is-info' : 'is-light'}"
                                data-hero-id="${hero.id}">
                            <span class="icon">${Icons.compare}</span>
                        </button>
                        <button class="button is-light details-btn" data-hero-id="${hero.id}">
                            <span class="icon">${Icons.info}</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    function renderGrid(heroes) {
        const grid = document.getElementById('heroesGrid');
        if (heroes.length === 0) {
            grid.innerHTML = `
                <div class="column is-12">
                    <div class="notification is-warning has-text-centered">
                        <p>No heroes found matching your criteria.</p>
                    </div>
                </div>
            `;
        } else {
            grid.innerHTML = heroes.map(createHeroCard).join('');
        }
    }

    function renderTable(heroes) {
        const tbody = document.getElementById('heroesTableBody');
        if (heroes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="has-text-centered">
                        <div class="notification is-warning">
                            <p>No heroes found matching your criteria.</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = heroes.map(createTableRow).join('');
        }
    }

    function sortHeroes(heroes, column, direction) {
        return [...heroes].sort((a, b) => {
            let valA, valB;

            switch (column) {
                case 'name':
                    valA = a.name || '';
                    valB = b.name || '';
                    break;
                case 'publisher':
                    valA = a.biography?.publisher || '';
                    valB = b.biography?.publisher || '';
                    break;
                case 'alignment':
                    valA = a.biography?.alignment || '';
                    valB = b.biography?.alignment || '';
                    break;
                case 'intelligence':
                case 'strength':
                case 'speed':
                    valA = a.powerstats?.[column] || 0;
                    valB = b.powerstats?.[column] || 0;
                    return direction === 'asc' ? valA - valB : valB - valA;
                default:
                    return 0;
            }

            const comparison = valA.toString().localeCompare(valB.toString());
            return direction === 'asc' ? comparison : -comparison;
        });
    }

    function render(heroes) {
        const sortedHeroes = sortHeroes(heroes, sortColumn, sortDirection);
        const totalPages   = Math.ceil(sortedHeroes.length / ITEMS_PER_PAGE);
        currentPage = Math.min(currentPage, totalPages) || 1;

        const startIndex      = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedHeroes = sortedHeroes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        if (currentView === 'grid') {
            renderGrid(paginatedHeroes);
        } else {
            renderTable(paginatedHeroes);
        }

        updatePagination(sortedHeroes.length, totalPages);
        updateResultsCount(sortedHeroes.length);
    }

    function updatePagination(totalItems, totalPages) {
        const pagination = document.getElementById('pagination');
        const prevBtn    = document.getElementById('prevPage');
        const nextBtn    = document.getElementById('nextPage');
        const pageInfo   = document.getElementById('pageInfo');

        if (totalItems <= ITEMS_PER_PAGE) {
            pagination.classList.add('is-hidden');
        } else {
            pagination.classList.remove('is-hidden');
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        }
    }

    function updateResultsCount(count) {
        document.getElementById('resultsCount').textContent = `${count} hero${count !== 1 ? 'es' : ''} found`;
    }

    function setView(view) {
        currentView = view;
        const gridBtn  = document.getElementById('gridViewBtn');
        const tableBtn = document.getElementById('tableViewBtn');
        const gridEl   = document.getElementById('heroesGrid');
        const tableEl  = document.getElementById('heroesTable');

        if (view === 'grid') {
            gridBtn.classList.add('is-info', 'is-selected');
            tableBtn.classList.remove('is-info', 'is-selected');
            gridEl.classList.remove('is-hidden');
            tableEl.classList.add('is-hidden');
        } else {
            tableBtn.classList.add('is-info', 'is-selected');
            gridBtn.classList.remove('is-info', 'is-selected');
            tableEl.classList.remove('is-hidden');
            gridEl.classList.add('is-hidden');
        }

        localStorage.setItem('heroViewPreference', view);
    }

    function getView()  { return currentView; }
    function setPage(p) { currentPage = p; }
    function getPage()  { return currentPage; }
    function nextPage() { currentPage++; }
    function prevPage() { currentPage--; }

    function setSort(column) {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn    = column;
            sortDirection = 'asc';
        }
        updateSortIndicators();
    }

    function updateSortIndicators() {
        document.querySelectorAll('.sortable').forEach(th => {
            const iconSpan = th.querySelector('.sort-icon');
            if (!iconSpan) return;
            if (th.dataset.sort === sortColumn) {
                iconSpan.innerHTML = sortDirection === 'asc' ? Icons.sortUp : Icons.sortDown;
            } else {
                iconSpan.innerHTML = Icons.sort;
            }
        });
    }

    function loadViewPreference() {
        const saved = localStorage.getItem('heroViewPreference');
        if (saved) currentView = saved;
    }

    return {
        render,
        setView,
        getView,
        setPage,
        getPage,
        nextPage,
        prevPage,
        setSort,
        loadViewPreference,
        ITEMS_PER_PAGE
    };
})();
