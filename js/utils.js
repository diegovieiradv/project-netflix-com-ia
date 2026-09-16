export function getYouTubeId(url) {
    const defaultId = '7RUA0IOfar8';
    const ytRegex = /^[A-Za-z0-9_-]{11}$/;
    if (!url) return defaultId;
    let id = '';
    if (url.includes('v=')) {
        id = url.split('v=')[1].split('&')[0];
    } else {
        id = url.split('/').pop().split('?')[0].split('&')[0];
    }
    return ytRegex.test(id) ? id : defaultId;
}

export function getRandomMatchScore() {
    return Math.floor(Math.random() * 20 + 80);
}

export function getRandomDuration(hasProgress) {
    return hasProgress ? '10 temporadas' : '2h ' + Math.floor(Math.random() * 59) + 'm';
}

export function getRandomAgeBadge() {
    return Math.random() > 0.5 ? { text: 'A16', class: 'red-accent' } : { text: '16', class: '' };
}

export function generatePoster(title, color) {
    const safeTitle = encodeURIComponent(title || 'Filme');
    const safeColor = encodeURIComponent(color || '#333');
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='${safeColor}' width='200' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${safeTitle}%3C/text%3E%3C/svg%3E`;
}

export function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>&"']/g, (c) => {
        const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
        return map[c];
    });
}

// Deterministic random based on seed string
export function seededRandom(seed) {
    let hash = 0;
    const str = String(seed);
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
}

// Deterministic match score per movie
export function getMatchScore(title) {
    const hash = seededRandom(title || 'default');
    return 70 + (hash % 30);
}

// Deterministic duration per movie
export function getDuration(item) {
    if (item.progress) return '10 temporadas';
    const hash = seededRandom(item.title || 'unknown');
    const hours = 1 + (hash % 3);
    const minutes = (hash * 7) % 60;
    return hours + 'h ' + String(minutes).padStart(2, '0') + 'm';
}

// ===== Utility Functions =====

export function debounce(fn, delay) {
    let timer = null;
    const debounced = function () {
        const context = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
    debounced.cancel = function () {
        clearTimeout(timer);
        timer = null;
    };
    return debounced;
}

export function throttle(fn, limit) {
    let waiting = false;
    let lastArgs = null;
    let lastContext = null;
    return function () {
        if (!waiting) {
            fn.apply(this, arguments);
            waiting = true;
            setTimeout(function () {
                waiting = false;
                if (lastArgs) {
                    fn.apply(lastContext, lastArgs);
                    lastArgs = null;
                    lastContext = null;
                }
            }, limit);
        } else {
            lastArgs = arguments;
            lastContext = this;
        }
    };
}

export function memoize(fn) {
    const cache = new Map();
    return function () {
        const key = JSON.stringify(arguments);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, arguments);
        cache.set(key, result);
        return result;
    };
}

// Genre color mapping
export function getGenreColor(genre) {
    const colors = {
        'Ação': '#E50914',
        'Comédia': '#FFB81C',
        'Drama': '#4169E1',
        'Ficção Científica': '#46d369',
        'Romance': '#FF69B4',
        'Terror': '#8B0000',
        'Suspense': '#FF8C00',
        'Thriller': '#9932CC',
        'Crime': '#DC143C',
        'Épico': '#CD853F',
        'Animação': '#00CED1',
        'Fantasia': '#9370DB',
        'Aventura': '#2E8B57',
        'Documentário': '#708090',
        'Musical': '#FF1493',
        'Guerra': '#556B2F',
        'Biografia': '#B8860B'
    };
    return colors[genre] || '#666';
}
