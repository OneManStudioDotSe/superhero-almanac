const Theme = (function() {
    const STORAGE_KEY = 'heroverse_theme';
    let currentTheme = 'light';

    function init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            currentTheme = saved;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentTheme = 'dark';
        }
        apply(false);
    }

    function apply(animate) {
        if (animate) {
            document.body.classList.add('theme-transitioning');
            setTimeout(() => document.body.classList.remove('theme-transitioning'), 400);
        }
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateToggleIcon();
    }

    function toggle() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        apply(true);
        localStorage.setItem(STORAGE_KEY, currentTheme);
    }

    function updateToggleIcon() {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;
        const iconSpan = btn.querySelector('.icon');
        if (currentTheme === 'dark') {
            iconSpan.innerHTML = Icons.sun;
            btn.setAttribute('title', 'Switch to Light Mode');
        } else {
            iconSpan.innerHTML = Icons.moon;
            btn.setAttribute('title', 'Switch to Dark Mode');
        }
    }

    function isDark() {
        return currentTheme === 'dark';
    }

    return { init, toggle, isDark };
})();
