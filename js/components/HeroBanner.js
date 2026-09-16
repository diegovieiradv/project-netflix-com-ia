import { generatePoster } from '../utils.js';
import { State, Toast } from '../state.js';

export function createHeroBanner(movie) {
    const banner = document.createElement('section');
    banner.className = 'hero-banner';
    banner.setAttribute('aria-label', 'Destaque: ' + (movie?.title || 'FLIXIO'));

    const bg = document.createElement('div');
    bg.className = 'hero-background';
    bg.setAttribute('aria-hidden', 'true');
    if (movie && movie.img) {
        bg.style.backgroundImage = `url('${movie.img}')`;
        // Validate image URL using Image() object since div error events don't fire
        const img = new Image();
        img.onload = () => { /* URL is valid */ };
        img.onerror = () => {
            bg.style.backgroundImage = `url('${generatePoster(movie.title, movie.color)}')`;
        };
        img.src = movie.img;
    }
    banner.appendChild(bg);

    const content = document.createElement('div');
    content.className = 'hero-content';

    const title = document.createElement('h1');
    title.className = 'hero-title';
    title.textContent = movie?.title || 'Bem-vindo ao FLIXIO';
    content.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'hero-description';
    desc.textContent = movie
        ? `${movie.title} (${movie.year}) - ${movie.rating}. Uma experiência imperdível no streaming.`
        : 'Aproveite o conteúdo personalizado para este perfil.';
    content.appendChild(desc);

    const buttons = document.createElement('div');
    buttons.className = 'hero-buttons';

    const watchBtn = document.createElement('button');
    watchBtn.className = 'btn btn-primary';
    watchBtn.setAttribute('aria-label', 'Assistir ' + (movie?.title || ''));
    const playIcon = document.createElement('span');
    playIcon.textContent = '▶ ';
    playIcon.setAttribute('aria-hidden', 'true');
    watchBtn.appendChild(playIcon);
    watchBtn.appendChild(document.createTextNode('Assistir'));
    watchBtn.addEventListener('click', () => {
        if (movie) {
            document.dispatchEvent(new CustomEvent('open:video', { detail: movie }));
        }
    });
    buttons.appendChild(watchBtn);

    const myListBtn = document.createElement('button');
    myListBtn.className = 'btn btn-secondary';
    const profile = State.getCurrentProfile();
    const isFav = profile && movie ? State.isFavorite(profile.id, movie.title) : false;
    myListBtn.setAttribute('aria-label', isFav ? 'Remover ' + (movie?.title || '') + ' da lista' : 'Adicionar ' + (movie?.title || '') + ' à lista');
    const myListIcon = document.createElement('span');
    myListIcon.textContent = isFav ? '✓ ' : '＋ ';
    myListIcon.setAttribute('aria-hidden', 'true');
    myListBtn.appendChild(myListIcon);
    myListBtn.appendChild(document.createTextNode(isFav ? 'Na Lista' : 'Minha Lista'));
    myListBtn.addEventListener('click', () => {
        const profile = State.getCurrentProfile();
        if (!profile || !movie) return;
        const result = State.toggleFavorite(profile.id, movie.title);
        if (result && result.includes(movie.title)) {
            Toast.success('Adicionado à Minha Lista');
        } else {
            Toast.info('Removido da Minha Lista');
        }
    });
    buttons.appendChild(myListBtn);

    const infoBtn = document.createElement('button');
    infoBtn.className = 'btn btn-secondary';
    infoBtn.setAttribute('aria-label', 'Mais informações sobre ' + (movie?.title || ''));
    const infoIcon = document.createElement('span');
    infoIcon.textContent = 'ℹ ';
    infoIcon.setAttribute('aria-hidden', 'true');
    infoBtn.appendChild(infoIcon);
    infoBtn.appendChild(document.createTextNode('Mais Informações'));
    infoBtn.addEventListener('click', () => {
        if (movie) {
            document.dispatchEvent(new CustomEvent('open:details', { detail: movie }));
        }
    });
    buttons.appendChild(infoBtn);

    content.appendChild(buttons);
    banner.appendChild(content);

    return banner;
}
