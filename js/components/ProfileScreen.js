import { State } from '../state.js';
import { navigateTo } from '../router.js';
import { createProfileModal } from './ProfileModal.js';

export function renderProfileScreen(container) {
    const section = document.createElement('section');
    section.className = 'profile-selection';
    section.setAttribute('aria-label', 'Seleção de perfil');

    // Content wrapper
    const content = document.createElement('div');
    content.className = 'profile-selection-content';

    // Header with logo
    const header = document.createElement('header');
    header.className = 'profile-header';

    const logo = document.createElement('img');
    logo.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 100'%3E%3Ctext x='50' y='70' font-size='60' fill='%23E50914' font-weight='bold' font-family='Arial'%3EFLIXIO%3C/text%3E%3C/svg%3E";
    logo.alt = 'FLIXIO';
    logo.className = 'profile-logo';
    header.appendChild(logo);
    content.appendChild(header);

    // Main content
    const main = document.createElement('main');
    main.className = 'profiles-main';

    const h1 = document.createElement('h1');
    h1.className = 'profiles-title';
    h1.textContent = 'Quem está assistindo?';
    main.appendChild(h1);

    const list = document.createElement('ul');
    list.className = 'profiles-list';
    list.setAttribute('role', 'list');
    list.setAttribute('aria-label', 'Perfis disponíveis');

    const profiles = State.getProfiles();

    profiles.forEach(profile => {
        const li = document.createElement('li');
        li.className = 'profiles-list-item';
        li.setAttribute('role', 'listitem');

        const card = document.createElement('article');
        card.className = 'profile-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'Perfil: ' + profile.name);

        const avatar = document.createElement('div');
        avatar.className = 'profile-avatar';

        if (profile.avatarType === 'image' && profile.avatar) {
            const img = document.createElement('img');
            img.src = profile.avatar;
            img.alt = profile.name;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.addEventListener('error', () => {
                if (avatar.contains(img)) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'avatar-generated';
                    fallbackDiv.style.backgroundColor = profile.color;
                    fallbackDiv.textContent = profile.avatarIcon || '👤';
                    avatar.replaceChild(fallbackDiv, img);
                }
            });
            avatar.appendChild(img);
        } else {
            const generated = document.createElement('div');
            generated.className = 'avatar-generated';
            generated.style.backgroundColor = profile.color || '#E50914';
            generated.textContent = profile.avatarIcon || '👤';
            avatar.appendChild(generated);
        }

        // Edit button on hover
        const editBtn = document.createElement('button');
        editBtn.className = 'profile-edit-btn';
        editBtn.setAttribute('aria-label', 'Editar perfil ' + profile.name);
        const editIcon = document.createElement('i');
        editIcon.className = 'fas fa-pencil-alt';
        editBtn.appendChild(editIcon);
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            createProfileModal(profile.id, (updates) => {
                State.updateProfile(profile.id, updates);
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                renderProfileScreen(container);
            }, (id) => {
                State.removeProfile(id);
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                renderProfileScreen(container);
            });
        });
        avatar.appendChild(editBtn);

        card.appendChild(avatar);

        const name = document.createElement('p');
        name.className = 'profile-name';
        name.textContent = profile.name;
        card.appendChild(name);

        card.addEventListener('click', () => {
            State.setCurrentProfile(profile.id);
            navigateTo('#catalog');
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                State.setCurrentProfile(profile.id);
                navigateTo('#catalog');
            }
        });

        li.appendChild(card);
        list.appendChild(li);
    });

    // Add profile card
    const addLi = document.createElement('li');
    addLi.className = 'profiles-list-item';
    const addCard = document.createElement('article');
    addCard.className = 'profile-card add-profile-card';
    addCard.setAttribute('tabindex', '0');
    addCard.setAttribute('role', 'button');
    addCard.setAttribute('aria-label', 'Adicionar novo perfil');

    const addAvatar = document.createElement('div');
    addAvatar.className = 'profile-avatar add-avatar';

    const addIcon = document.createElement('div');
    addIcon.className = 'add-icon';
    addIcon.textContent = '+';
    addIcon.setAttribute('aria-hidden', 'true');
    addAvatar.appendChild(addIcon);
    addCard.appendChild(addAvatar);

    const addName = document.createElement('p');
    addName.className = 'profile-name';
    addName.textContent = 'Adicionar Perfil';
    addCard.appendChild(addName);

    addCard.addEventListener('click', () => {
        createProfileModal(null, (data) => {
            State.addProfile(data);
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            renderProfileScreen(container);
        }, () => {});
    });

    addCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            createProfileModal(null, (data) => {
                State.addProfile(data);
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                renderProfileScreen(container);
            }, () => {});
        }
    });

    addLi.appendChild(addCard);
    list.appendChild(addLi);

    main.appendChild(list);
    content.appendChild(main);
    section.appendChild(content);
    container.appendChild(section);
}
