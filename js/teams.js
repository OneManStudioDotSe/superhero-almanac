const Teams = (function() {
    function parseTeams(heroes) {
        const teamsMap = new Map();

        heroes.forEach(hero => {
            const aff = hero.connections?.groupAffiliation;
            if (!aff || aff === '-' || aff.toLowerCase() === 'null') return;

            aff.split(/[,;\/]/).forEach(raw => {
                const name = raw.replace(/\s*\(.*?\)\s*/g, '').trim();
                if (!name || name === '-' || name.length < 3 || name.toLowerCase() === 'null') return;
                if (!teamsMap.has(name)) {
                    teamsMap.set(name, { members: [], good: 0, bad: 0, neutral: 0 });
                }
                const d = teamsMap.get(name);
                d.members.push(hero);
                const al = hero.biography?.alignment;
                if (al === 'good') d.good++;
                else if (al === 'bad') d.bad++;
                else d.neutral++;
            });
        });

        return Array.from(teamsMap.entries())
            .filter(([, d]) => d.members.length >= 2)
            .sort((a, b) => b[1].members.length - a[1].members.length)
            .slice(0, 60);
    }

    function render(heroes) {
        const teams = parseTeams(heroes);
        const container = document.getElementById('teamsContent');
        if (!container) return;

        if (teams.length === 0) {
            container.innerHTML = '<div class="notification is-info">No teams data available.</div>';
            return;
        }

        container.innerHTML = `
            <div class="teams-modal-header">
                <p class="teams-modal-subtitle">${teams.length} teams &mdash; click any to filter the hero grid</p>
            </div>
            <div class="teams-list">
                ${teams.map(([name, data]) => {
                    const extraCount = data.members.length - 4;
                    return `
                    <div class="team-row" data-team="${encodeURIComponent(name)}">
                        <div class="team-row-avatars">
                            ${data.members.slice(0, 4).map(m => `
                                <div class="team-avatar-wrap">
                                    <img src="${m.images?.xs || ''}" alt="${m.name}" title="${m.name}" loading="lazy"
                                         onerror="this.closest('.team-avatar-wrap').style.display='none'">
                                </div>
                            `).join('')}
                            ${extraCount > 0 ? `<div class="team-avatar-more">+${extraCount}</div>` : ''}
                        </div>
                        <div class="team-row-body">
                            <span class="team-row-name">${name}</span>
                            <div class="team-row-meta">
                                <span class="team-row-count">${data.members.length}</span>
                                <span class="team-row-label">members</span>
                                ${data.good > 0 ? `<span class="team-dot good" title="${data.good} heroes"></span>` : ''}
                                ${data.bad > 0 ? `<span class="team-dot bad" title="${data.bad} villains"></span>` : ''}
                            </div>
                        </div>
                        <span class="team-row-cta">Browse ${Icons.chevronRight}</span>
                    </div>
                `;
                }).join('')}
            </div>
        `;

        container.querySelectorAll('.team-row').forEach(row => {
            row.addEventListener('click', () => filterByTeam(decodeURIComponent(row.dataset.team)));
        });
    }

    function filterByTeam(teamName) {
        document.getElementById('teamsModal').classList.remove('is-active');
        document.documentElement.classList.remove('is-clipped');

        Filters.setTeamFilter(teamName);
        HeroesRenderer.render(Filters.getFilteredHeroes());

        const chip = document.getElementById('activeTeamFilter');
        const nameEl = document.getElementById('activeTeamName');
        if (chip && nameEl) {
            nameEl.textContent = teamName;
            chip.classList.remove('is-hidden');
        }

        document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
    }

    function clearFilter() {
        Filters.clearTeamFilter();
        HeroesRenderer.render(Filters.getFilteredHeroes());
        const chip = document.getElementById('activeTeamFilter');
        if (chip) chip.classList.add('is-hidden');
    }

    function openModal() {
        render(Filters.getAllHeroes());
        document.getElementById('teamsModal').classList.add('is-active');
        document.documentElement.classList.add('is-clipped');
    }

    return { render, openModal, filterByTeam, clearFilter };
})();
