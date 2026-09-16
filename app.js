import { registerRoute, initRouter } from './js/router.js';
import { renderProfileScreen } from './js/components/ProfileScreen.js';
import { renderCatalogScreen } from './js/components/CatalogScreen.js';
import { getYouTubeId, getMatchScore, getDuration, getGenreColor, sanitizeString } from './js/utils.js';
import { State, Toast } from './js/state.js';
import { initTheme, toggleTheme, getTheme } from './js/theme.js';

function openVideoModal(movie) {
    if (!movie || !movie.youtube) return;
    const videoId = getYouTubeId(movie.youtube);
    if (!videoId) return;

    const overlay = document.createElement('div');
    overlay.className = 'video-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Reproduzir vídeo: ' + (movie.title || ''));

    const content = document.createElement('div');
    content.className = 'video-modal-content';

    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&mute=1&rel=0';
    iframe.setAttribute('allow', 'autoplay; encrypted-media');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('title', 'Vídeo: ' + (movie.title || ''));

    // YouTube iframe error handling
    let iframeLoaded = false;
    iframe.addEventListener('load', () => {
        iframeLoaded = true;
    });
    // Fallback timeout in case iframe fails to load
    const loadTimeout = setTimeout(() => {
        if (!iframeLoaded) {
            Toast.warning('Não foi possível carregar o vídeo. Verifique sua conexão.');
        }
    }, 8000);

    content.appendChild(iframe);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'video-modal-close';
    closeBtn.setAttribute('aria-label', 'Fechar vídeo');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', closeVideoModal);
    content.appendChild(closeBtn);

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Track watched
    const profile = State.getCurrentProfile();
    if (profile) {
        State.addToWatched(profile.id, movie.title);
    }

    // Trigger animation
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    function closeVideoModal() {
        clearTimeout(loadTimeout);
        iframe.src = '';
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
        document.removeEventListener('keydown', escHandler);
    }

    function escHandler(e) {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeVideoModal();
    });
    document.addEventListener('keydown', escHandler);

    // Trap focus inside modal
    closeBtn.focus();
}

function openDetailsModal(movie) {
    if (!movie) return;

    const overlay = document.createElement('div');
    overlay.className = 'details-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Detalhes: ' + (movie.title || ''));

    const modal = document.createElement('div');
    modal.className = 'details-modal';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'details-modal-close';
    closeBtn.setAttribute('aria-label', 'Fechar detalhes');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', closeDetailsModal);
    modal.appendChild(closeBtn);

    // Title
    const title = document.createElement('h2');
    title.textContent = sanitizeString(movie.title || 'Sem título');
    modal.appendChild(title);

    // Info row
    const info = document.createElement('div');
    info.className = 'details-modal-info';

    const matchSpan = document.createElement('span');
    matchSpan.style.color = '#46d369';
    matchSpan.textContent = getMatchScore(movie.title) + '% relevante';
    info.appendChild(matchSpan);

    const yearSpan = document.createElement('span');
    yearSpan.textContent = movie.year || 'N/A';
    info.appendChild(yearSpan);

    const ratingSpan = document.createElement('span');
    ratingSpan.textContent = movie.rating || '';
    info.appendChild(ratingSpan);

    const durationSpan = document.createElement('span');
    durationSpan.textContent = getDuration(movie);
    info.appendChild(durationSpan);

    const hdSpan = document.createElement('span');
    hdSpan.textContent = 'HD';
    info.appendChild(hdSpan);

    modal.appendChild(info);

    // Description
    const desc = document.createElement('p');
    desc.style.color = 'var(--text-secondary)';
    desc.style.lineHeight = '1.6';
    desc.style.marginTop = '1rem';
    desc.textContent = sanitizeString(
        movie.title + ' (' + (movie.year || 'N/A') + ') - ' +
        (movie.rating || '') + '. ' +
        'Uma experiência imperdível no streaming FLIXIO.'
    );
    modal.appendChild(desc);

    // Genres/Tags
    if (movie.genres && movie.genres.length > 0) {
        const tags = document.createElement('div');
        tags.className = 'details-modal-tags';
        movie.genres.forEach(genre => {
            const tag = document.createElement('span');
            tag.className = 'details-modal-tag';
            tag.textContent = genre;
            tags.appendChild(tag);
        });
        modal.appendChild(tags);
    }

    // Action buttons
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '0.5rem';
    buttons.style.marginTop = '1.5rem';

    const playBtn = document.createElement('button');
    playBtn.className = 'btn btn-primary';
    playBtn.textContent = '▶ Assistir';
    playBtn.setAttribute('aria-label', 'Assistir ' + (movie.title || ''));
    playBtn.addEventListener('click', () => {
        closeDetailsModal();
        openVideoModal(movie);
    });
    buttons.appendChild(playBtn);

    const favBtn = document.createElement('button');
    favBtn.className = 'btn btn-secondary';
    const profile = State.getCurrentProfile();
    const isFav = profile && State.isFavorite(profile.id, movie.title);
    favBtn.textContent = isFav ? '✓ Na Lista' : '＋ Minha Lista';
    favBtn.setAttribute('aria-label', isFav ? 'Remover ' + (movie.title || '') + ' da lista' : 'Adicionar ' + (movie.title || '') + ' à lista');
    favBtn.addEventListener('click', () => {
        if (!profile) return;
        const result = State.toggleFavorite(profile.id, movie.title);
        if (result && result.includes(movie.title)) {
            favBtn.textContent = '✓ Na Lista';
            favBtn.setAttribute('aria-label', 'Remover ' + (movie.title || '') + ' da lista');
            Toast.success('Adicionado à Minha Lista');
        } else {
            favBtn.textContent = '＋ Minha Lista';
            favBtn.setAttribute('aria-label', 'Adicionar ' + (movie.title || '') + ' à lista');
            Toast.info('Removido da Minha Lista');
        }
    });
    buttons.appendChild(favBtn);

    modal.appendChild(buttons);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    function closeDetailsModal() {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
        document.removeEventListener('keydown', escHandler);
    }

    function escHandler(e) {
        if (e.key === 'Escape') {
            closeDetailsModal();
        }
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeDetailsModal();
    });
    document.addEventListener('keydown', escHandler);

    // Trap focus inside modal
    closeBtn.focus();
}

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) return;

    // Initialize theme
    initTheme();

    // Register routes
    registerRoute('#profiles', (container) => {
        renderProfileScreen(container);
    });

    registerRoute('#catalog', (container) => {
        renderCatalogScreen(container);
    });

    // Initialize router
    initRouter();

    // Event listeners for modals
    document.addEventListener('open:video', (e) => {
        openVideoModal(e.detail);
    });

    document.addEventListener('open:details', (e) => {
        openDetailsModal(e.detail);
    });

    // Toast container with aria-live for accessibility
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('role', 'status');
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'false');
    document.body.appendChild(toastContainer);

    document.addEventListener('toast:show', (e) => {
        const { id, message, type } = e.detail;
        const toast = document.createElement('div');
        toast.className = 'toast ' + (type || 'info');
        toast.setAttribute('role', 'alert');
        toast.textContent = message;
        toast.id = 'toast-' + id;
        toastContainer.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    document.addEventListener('toast:hide', (e) => {
        const { id } = e.detail;
        const toast = document.getElementById('toast-' + id);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    });

    // Theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Alternar tema');
    themeToggle.textContent = getTheme() === 'dark' ? '☀' : '☾';
    themeToggle.addEventListener('click', () => {
        const newTheme = toggleTheme();
        themeToggle.textContent = newTheme === 'dark' ? '☀' : '☾';
        themeToggle.setAttribute('aria-label', newTheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
    });
    document.body.appendChild(themeToggle);

    // Scroll to top button
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.setAttribute('aria-label', 'Voltar ao topo');
    scrollTopBtn.textContent = '↑';
    document.body.appendChild(scrollTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
