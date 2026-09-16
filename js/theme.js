const THEME_KEY = 'flixio_theme';
const THEME_EVENT = 'theme:change';

function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return 'dark';
}

function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_KEY);
    } catch {
        return null;
    }
}

function storeTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
        console.warn('Failed to save theme preference:', e);
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: theme } }));
}

export function initTheme() {
    const stored = getStoredTheme();
    const theme = stored || getSystemPreference();
    applyTheme(theme);
    return theme;
}

export function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
}

export function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    storeTheme(next);
    applyTheme(next);
    return next;
}

export function setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    storeTheme(theme);
    applyTheme(theme);
}

export function onThemeChange(callback) {
    document.addEventListener(THEME_EVENT, (e) => {
        callback(e.detail.theme);
    });
}
