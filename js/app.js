const App = (function() {
    async function init() {
        Theme.init();
        Favorites.load();
        Compare.load();
        HeroesRenderer.loadViewPreference();

        setupEventListeners();
        await loadHeroes();
    }

    async function loadHeroes() {
        showLoading(true);
        hideError();

        try {
            const heroes = await SuperheroAPI.fetchAllHeroes();
            Filters.setHeroes(heroes);
            Filters.populatePublishers();

            showLoading(false);
            showHeroes();

            HeroesRenderer.setView(HeroesRenderer.getView());
            HeroesRenderer.render(Filters.getFilteredHeroes());

            Spotlight.render(heroes);
        } catch (error) {
            console.error('Failed to load heroes:', error);
            showLoading(false);
            showError();
        }
    }

    function showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) spinner.classList.remove('is-hidden');
        else      spinner.classList.add('is-hidden');
    }

    function showError() {
        document.getElementById('errorMessage').classList.remove('is-hidden');
    }

    function hideError() {
        document.getElementById('errorMessage').classList.add('is-hidden');
    }

    function showHeroes() {
        const view = HeroesRenderer.getView();
        if (view === 'grid') {
            document.getElementById('heroesGrid').classList.remove('is-hidden');
        } else {
            document.getElementById('heroesTable').classList.remove('is-hidden');
        }
    }

    function setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggleBtn').addEventListener('click', Theme.toggle);

        // Teams & Publishers buttons
        document.getElementById('teamsBtn').addEventListener('click', Teams.openModal);
        document.getElementById('publishersBtn').addEventListener('click', Publishers.openModal);

        // Clear team filter chip
        document.getElementById('clearTeamFilterBtn').addEventListener('click', Teams.clearFilter);

        // Search input (debounced)
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                HeroesRenderer.render(Filters.applyFilters());
            }, 300);
        });

        // Filter dropdowns
        ['publisherFilter', 'alignmentFilter', 'genderFilter'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                HeroesRenderer.render(Filters.applyFilters());
            });
        });

        // Show favorites only checkbox
        document.getElementById('showFavoritesOnly').addEventListener('change', () => {
            HeroesRenderer.render(Filters.applyFilters());
        });

        // Clear filters
        document.getElementById('clearFilters').addEventListener('click', () => {
            HeroesRenderer.render(Filters.clearFilters());
        });

        // View toggle
        document.getElementById('gridViewBtn').addEventListener('click', () => {
            HeroesRenderer.setView('grid');
            HeroesRenderer.render(Filters.getFilteredHeroes());
        });
        document.getElementById('tableViewBtn').addEventListener('click', () => {
            HeroesRenderer.setView('table');
            HeroesRenderer.render(Filters.getFilteredHeroes());
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            HeroesRenderer.prevPage();
            HeroesRenderer.render(Filters.getFilteredHeroes());
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.getElementById('nextPage').addEventListener('click', () => {
            HeroesRenderer.nextPage();
            HeroesRenderer.render(Filters.getFilteredHeroes());
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Table sorting
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                HeroesRenderer.setSort(th.dataset.sort);
                HeroesRenderer.render(Filters.getFilteredHeroes());
            });
        });

        // Retry button
        document.getElementById('retryBtn').addEventListener('click', loadHeroes);

        // Navbar buttons
        document.getElementById('favoritesBtn').addEventListener('click', Favorites.openModal);
        document.getElementById('compareBtn').addEventListener('click', Compare.openModal);

        // Modal close buttons and backdrops
        document.querySelectorAll('.modal-close-btn, .modal-background').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('is-active');
                });
                document.documentElement.classList.remove('is-clipped');
            });
        });

        // Modal action buttons
        document.getElementById('modalFavoriteBtn').addEventListener('click', () => {
            const heroId = HeroDetails.getCurrentHeroId();
            if (heroId) {
                Favorites.toggle(heroId);
                HeroDetails.updateModalButtons();
                HeroesRenderer.render(Filters.getFilteredHeroes());
            }
        });

        document.getElementById('modalCompareBtn').addEventListener('click', () => {
            const heroId = HeroDetails.getCurrentHeroId();
            if (heroId) {
                Compare.toggle(heroId);
                HeroDetails.updateModalButtons();
                HeroesRenderer.render(Filters.getFilteredHeroes());
            }
        });

        // Clear compare
        document.getElementById('clearCompareBtn').addEventListener('click', () => {
            Compare.clear();
            Compare.renderCompareModal();
            HeroesRenderer.render(Filters.getFilteredHeroes());
        });

        // Delegated events for dynamic content
        document.addEventListener('click', handleDelegatedClicks);

        // Escape key closes modals
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('is-active'));
                document.documentElement.classList.remove('is-clipped');
            }
        });
    }

    function handleDelegatedClicks(e) {
        const target = e.target.closest('[data-hero-id]');
        if (!target) return;

        const heroId = parseInt(target.dataset.heroId);

        if (target.classList.contains('favorite-btn')) {
            e.preventDefault();
            Favorites.toggle(heroId);
            HeroesRenderer.render(Filters.getFilteredHeroes());
            return;
        }

        if (target.classList.contains('compare-btn')) {
            e.preventDefault();
            Compare.toggle(heroId);
            HeroesRenderer.render(Filters.getFilteredHeroes());
            return;
        }

        if (target.classList.contains('details-btn')) {
            e.preventDefault();
            document.getElementById('favoritesModal').classList.remove('is-active');
            HeroDetails.openModal(heroId);
            return;
        }

        if (target.classList.contains('remove-favorite-btn')) {
            e.preventDefault();
            Favorites.remove(heroId);
            Favorites.renderFavoritesModal();
            HeroesRenderer.render(Filters.getFilteredHeroes());
            return;
        }

        if (target.classList.contains('remove-compare-btn')) {
            e.preventDefault();
            Compare.remove(heroId);
            Compare.renderCompareModal();
            HeroesRenderer.render(Filters.getFilteredHeroes());
            return;
        }

        // Click on card body / flip container / table row opens detail modal
        if (
            target.classList.contains('hero-flip-container') ||
            target.classList.contains('hero-card') ||
            target.classList.contains('hero-row') ||
            target.classList.contains('hero-name-link')
        ) {
            e.preventDefault();
            HeroDetails.openModal(heroId);
        }
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
