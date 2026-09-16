import { getYouTubeId, getMatchScore, getDuration, getRandomAgeBadge, generatePoster } from '../utils.js';
import { State, Toast } from '../state.js';

export function createContentCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', 'Card de filme: ' + (item.title || 'Sem título'));
    card.setAttribute('tabindex', '0');
    if (item.progress) {
        card.classList.add('has-progress');
    }

    // Image with robust fallback
    const img = document.createElement('img');
    const originalSrc = item.img || generatePoster(item.title, item.color);
    img.src = originalSrc;
    img.alt = item.title || 'Filme';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
        // Avoid infinite loop if fallback also fails
        if (img.src !== originalSrc) {
            img.src = generatePoster(item.title, item.color);
        } else {
            // Last resort: show a colored placeholder
            img.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'avatar-generated';
            placeholder.style.backgroundColor = item.color || '#333';
            placeholder.style.position = 'absolute';
            placeholder.style.top = '0';
            placeholder.style.left = '0';
            placeholder.style.width = '100%';
            placeholder.style.height = '100%';
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.fontSize = '2rem';
            placeholder.style.color = 'var(--text-primary)';
            placeholder.textContent = item.title ? item.title.charAt(0) : '🎬';
            card.appendChild(placeholder);
        }
    });

    // Iframe for YouTube preview
    const iframe = document.createElement('iframe');
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.setAttribute('title', 'Preview de vídeo: ' + (item.title || ''));

    const videoId = getYouTubeId(item.youtube);

    // Card details section (bottom panel on hover)
    const ageBadge = getRandomAgeBadge();
    const details = document.createElement('div');
    details.className = 'card-details';

    // Buttons row
    const buttonsRow = document.createElement('div');
    buttonsRow.className = 'details-buttons';

    const leftBtns = document.createElement('div');
    leftBtns.className = 'left-buttons';

    const playBtn = document.createElement('button');
    playBtn.className = 'btn-icon btn-play-icon';
    playBtn.setAttribute('aria-label', 'Reproduzir ' + (item.title || ''));
    const playI = document.createElement('i');
    playI.className = 'fas fa-play';
    playI.style.marginLeft = '2px';
    playBtn.appendChild(playI);
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.dispatchEvent(new CustomEvent('open:video', { detail: item }));
    });
    leftBtns.appendChild(playBtn);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-icon';
    const addI = document.createElement('i');
    addI.className = 'fas fa-plus';
    addBtn.appendChild(addI);
    // Check if already favorited
    const currentProfile = State.getCurrentProfile();
    if (currentProfile && State.isFavorite(currentProfile.id, item.title)) {
        addI.className = 'fas fa-check';
        addBtn.setAttribute('aria-label', 'Remover ' + (item.title || '') + ' da lista');
    } else {
        addBtn.setAttribute('aria-label', 'Adicionar ' + (item.title || '') + ' à lista');
    }
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const profile = State.getCurrentProfile();
        if (!profile) return;
        const result = State.toggleFavorite(profile.id, item.title);
        if (result && result.includes(item.title)) {
            addI.className = 'fas fa-check';
            addBtn.setAttribute('aria-label', 'Remover ' + (item.title || '') + ' da lista');
            Toast.success('Adicionado à Minha Lista');
        } else {
            addI.className = 'fas fa-plus';
            addBtn.setAttribute('aria-label', 'Adicionar ' + (item.title || '') + ' à lista');
            Toast.info('Removido da Minha Lista');
        }
    });
    leftBtns.appendChild(addBtn);

    const likeBtn = document.createElement('button');
    likeBtn.className = 'btn-icon';
    likeBtn.setAttribute('aria-label', 'Curtir ' + (item.title || ''));
    const likeI = document.createElement('i');
    likeI.className = 'fas fa-thumbs-up';
    likeBtn.appendChild(likeI);
    leftBtns.appendChild(likeBtn);

    const rightBtns = document.createElement('div');
    rightBtns.className = 'right-buttons';

    const expandBtn = document.createElement('button');
    expandBtn.className = 'btn-icon';
    expandBtn.setAttribute('aria-label', 'Mais informações sobre ' + (item.title || ''));
    const expandI = document.createElement('i');
    expandI.className = 'fas fa-chevron-down';
    expandBtn.appendChild(expandI);
    expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.dispatchEvent(new CustomEvent('open:details', { detail: item }));
    });
    rightBtns.appendChild(expandBtn);

    buttonsRow.appendChild(leftBtns);
    buttonsRow.appendChild(rightBtns);
    details.appendChild(buttonsRow);

    // Info row
    const infoRow = document.createElement('div');
    infoRow.className = 'details-info';

    const matchScore = document.createElement('span');
    matchScore.className = 'match-score';
    matchScore.textContent = getMatchScore(item.title) + '% relevante';
    infoRow.appendChild(matchScore);

    const age = document.createElement('span');
    age.className = 'age-badge ' + ageBadge.class;
    age.textContent = ageBadge.text;
    infoRow.appendChild(age);

    const duration = document.createElement('span');
    duration.className = 'duration';
    duration.textContent = getDuration(item);
    infoRow.appendChild(duration);

    const hd = document.createElement('span');
    hd.className = 'resolution';
    hd.textContent = 'HD';
    infoRow.appendChild(hd);

    details.appendChild(infoRow);

    // Tags row - dynamic from genres
    const tagsRow = document.createElement('div');
    tagsRow.className = 'details-tags';
    const genres = item.genres || ['Filme'];
    genres.slice(0, 3).forEach((genre, idx) => {
        const tag = document.createElement('span');
        tag.textContent = genre;
        tagsRow.appendChild(tag);
    });
    details.appendChild(tagsRow);

    // Assemble card (details first so img/iframe are on top)
    card.appendChild(iframe);
    card.appendChild(img);
    card.appendChild(details);

    // Top 10 badge
    if (item.top10) {
        const badge = document.createElement('div');
        badge.className = 'badge-top10';
        badge.setAttribute('aria-label', 'Top 10');
        const topSpan = document.createElement('span');
        topSpan.className = 'top';
        topSpan.textContent = 'TOP';
        badge.appendChild(topSpan);
        const numSpan = document.createElement('span');
        numSpan.className = 'number';
        numSpan.textContent = '10';
        badge.appendChild(numSpan);
        card.appendChild(badge);
    }

    // Bottom badge
    if (item.badge) {
        const badgeBottom = document.createElement('div');
        badgeBottom.className = 'badge-bottom ' + (item.badgeColor === 'red' ? 'red' : 'white');
        badgeBottom.textContent = item.badge;
        card.appendChild(badgeBottom);
    }

    // Progress bar
    if (item.progress) {
        const pbContainer = document.createElement('div');
        pbContainer.className = 'progress-bar-container';
        pbContainer.setAttribute('role', 'progressbar');
        pbContainer.setAttribute('aria-valuenow', item.progress);
        pbContainer.setAttribute('aria-valuemin', '0');
        pbContainer.setAttribute('aria-valuemax', '100');
        pbContainer.setAttribute('aria-label', item.progress + '% assistido');
        const pbValue = document.createElement('div');
        pbValue.className = 'progress-value';
        pbValue.style.width = item.progress + '%';
        pbContainer.appendChild(pbValue);
        card.appendChild(pbContainer);
    }

    // Touch detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Helper: start trailer playback after delay
    function startTrailerPreview() {
        const rect = card.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        if (rect.left < 100) {
            card.classList.add('origin-left');
        } else if (rect.right > windowWidth - 100) {
            card.classList.add('origin-right');
        }

        if (videoId) {
            iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=' + videoId;
            iframe.classList.add('playing');
            img.classList.add('playing-video');
        }
    }

    // Helper: stop trailer playback
    function stopTrailerPreview() {
        iframe.classList.remove('playing');
        img.classList.remove('playing-video');
        iframe.src = '';
        card.classList.remove('origin-left');
        card.classList.remove('origin-right');
    }

    // Hover handlers (desktop only)
    let playTimeout;
    if (!isTouchDevice) {
        card.addEventListener('mouseenter', () => {
            playTimeout = setTimeout(startTrailerPreview, 600);
        });

        card.addEventListener('mouseleave', () => {
            clearTimeout(playTimeout);
            stopTrailerPreview();
        });
    }

    // Touch handlers (mobile)
    if (isTouchDevice) {
        card.addEventListener('touchstart', (e) => {
            // Only start if not tapping a button inside the card
            if (e.target.closest('.btn-icon')) return;

            playTimeout = setTimeout(startTrailerPreview, 600);
        }, { passive: true });

        card.addEventListener('touchend', () => {
            clearTimeout(playTimeout);
            stopTrailerPreview();
        });

        card.addEventListener('touchcancel', () => {
            clearTimeout(playTimeout);
            stopTrailerPreview();
        });
    }

    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('open:video', { detail: item }));
        } else if (e.key === 'Escape') {
            card.blur();
        }
    });

    return card;
}
