import { State } from '../state.js';
import { avatarOptions, colorOptions } from '../data.js';
import { sanitizeString } from '../utils.js';

export function createProfileModal(profileId, onSave, onDelete) {
    const isEdit = !!profileId;
    const profile = isEdit ? State.getProfile(profileId) : null;

    let selectedAvatarIndex = profile
        ? avatarOptions.findIndex(opt => opt.icon === profile.avatar)
        : 0;
    if (selectedAvatarIndex === -1) selectedAvatarIndex = 0;
    let selectedColorIndex = colorOptions.indexOf(profile?.color || '#E50914');
    if (selectedColorIndex === -1) selectedColorIndex = 0;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', isEdit ? 'Editar perfil' : 'Adicionar perfil');

    const modal = document.createElement('div');
    modal.className = 'profile-modal';

    // Title
    const title = document.createElement('h2');
    title.textContent = isEdit ? 'Editar Perfil' : 'Adicionar Perfil';
    modal.appendChild(title);

    // Form
    const form = document.createElement('div');
    form.className = 'profile-form';

    // Name input
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';

    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Nome';
    nameLabel.setAttribute('for', 'profile-name-input');

    const nameInput = document.createElement('input');
    nameInput.id = 'profile-name-input';
    nameInput.type = 'text';
    nameInput.maxLength = 20;
    nameInput.placeholder = 'Nome do perfil';
    nameInput.value = profile?.name || '';
    nameInput.className = 'profile-name-input';

    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);

    // Avatar picker
    const avatarGroup = document.createElement('div');
    avatarGroup.className = 'form-group';

    const avatarLabel = document.createElement('label');
    avatarLabel.textContent = 'Avatar';
    avatarGroup.appendChild(avatarLabel);

    const avatarGrid = document.createElement('div');
    avatarGrid.className = 'avatar-picker';

    avatarOptions.forEach((opt, idx) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'avatar-option' + (idx === selectedAvatarIndex ? ' selected' : '');
        option.setAttribute('aria-label', 'Avatar: ' + opt.label);

        const iconSpan = document.createElement('span');
        iconSpan.className = 'avatar-icon';
        iconSpan.textContent = opt.icon;
        option.appendChild(iconSpan);

        const labelSpan = document.createElement('span');
        labelSpan.className = 'avatar-option-label';
        labelSpan.textContent = opt.label;
        option.appendChild(labelSpan);

        option.addEventListener('click', () => {
            selectedAvatarIndex = idx;
            const allBtns = avatarGrid.querySelectorAll('.avatar-option');
            allBtns.forEach((b, i) => {
                b.classList.toggle('selected', i === idx);
            });
        });

        avatarGrid.appendChild(option);
    });

    avatarGroup.appendChild(avatarGrid);
    form.appendChild(avatarGroup);

    // Color picker
    const colorGroup = document.createElement('div');
    colorGroup.className = 'form-group';

    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Cor';
    colorGroup.appendChild(colorLabel);

    const colorRow = document.createElement('div');
    colorRow.className = 'color-picker';

    colorOptions.forEach((color, idx) => {
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'color-swatch' + (idx === selectedColorIndex ? ' selected' : '');
        swatch.style.backgroundColor = color;
        swatch.setAttribute('aria-label', 'Cor: ' + color);

        swatch.addEventListener('click', () => {
            selectedColorIndex = idx;
            const allSwatches = colorRow.querySelectorAll('.color-swatch');
            allSwatches.forEach((s, i) => {
                s.classList.toggle('selected', i === idx);
            });
        });

        colorRow.appendChild(swatch);
    });

    colorGroup.appendChild(colorRow);
    form.appendChild(colorGroup);

    modal.appendChild(form);

    // Buttons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons';

    if (isEdit) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.textContent = 'Excluir';
        deleteBtn.setAttribute('aria-label', 'Excluir perfil');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir este perfil?')) {
                onDelete(profileId);
                close();
            }
        });
        buttonsDiv.appendChild(deleteBtn);
    }

    const spacer = document.createElement('span');
    spacer.style.flex = '1';
    buttonsDiv.appendChild(spacer);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', close);
    buttonsDiv.appendChild(cancelBtn);

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Salvar';
    saveBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.focus();
            return;
        }
        const selectedAvatar = avatarOptions[selectedAvatarIndex];
        const selectedColor = colorOptions[selectedColorIndex];

        // Preserve image avatar if editing and avatarType is 'image'
        const isNewImageAvatar = isEdit && profile && profile.avatarType === 'image' && selectedAvatarIndex === 0;
        const saveData = {
            name: sanitizeString(name),
            color: selectedColor,
            avatar: isNewImageAvatar ? profile.avatar : selectedAvatar.icon,
            avatarType: isNewImageAvatar ? 'image' : 'generated',
            avatarIcon: isNewImageAvatar ? profile.avatarIcon : selectedAvatar.icon,
            avatarLabel: isNewImageAvatar ? profile.avatarLabel : selectedAvatar.label
        };

        onSave(saveData);
        close();
    });
    buttonsDiv.appendChild(saveBtn);

    modal.appendChild(buttonsDiv);

    function close() {
        document.removeEventListener('keydown', escHandler);
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    // Close on Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            close();
        }
    };
    document.addEventListener('keydown', escHandler);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        nameInput.focus();
    });

    return { close };
}
