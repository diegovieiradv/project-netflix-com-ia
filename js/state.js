import { defaultProfiles } from './data.js';

const STORAGE_KEY = 'flixio_state';
const PROFILE_KEY = 'flixio_current_profile';

function getDefaultState() {
    return {
        profiles: defaultProfiles.map(p => ({ ...p, favorites: [], watched: [] })),
        currentProfileId: null
    };
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return getDefaultState();

        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.profiles)) {
            console.warn('Invalid state format, using defaults');
            return getDefaultState();
        }

        // Filter out dangerous keys and validate profiles
        parsed.profiles = parsed.profiles.filter(function (p) {
            if (Object.prototype.hasOwnProperty.call(p, '__proto__') ||
                Object.prototype.hasOwnProperty.call(p, 'constructor') ||
                Object.prototype.hasOwnProperty.call(p, 'prototype')) return false;
            if (typeof p.name !== 'string' || typeof p.id !== 'string') return false;
            return true;
        });

        // Migration: add favorites/watched to existing profiles
        parsed.profiles.forEach(function (p) {
            if (!Array.isArray(p.favorites)) p.favorites = [];
            if (!Array.isArray(p.watched)) p.watched = [];
        });

        return parsed;
    } catch (e) {
        console.warn('Failed to load state from localStorage:', e);
        return getDefaultState();
    }
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save state to localStorage:', e);
        Toast.warning('Dados não puderam ser salvos. Verifique o espaço disponível.');
    }
}

const state = loadState();

const toastQueue = [];

export const Toast = {
    add(message, type, duration) {
        type = type || 'info';
        duration = duration || 3000;
        const id = Date.now() + Math.random();
        toastQueue.push({ id: id, message: message, type: type, duration: duration });
        document.dispatchEvent(new CustomEvent('toast:show', { detail: { id: id, message: message, type: type } }));
        setTimeout(function() {
            document.dispatchEvent(new CustomEvent('toast:hide', { detail: { id: id } }));
        }, duration);
    },
    success: function(msg) { this.add(msg, 'success'); },
    info: function(msg) { this.add(msg, 'info'); },
    warning: function(msg) { this.add(msg, 'warning'); }
};

export const State = {
    get: function() {
        return state;
    },

    getProfiles: function() {
        return state.profiles;
    },

    getProfile: function(id) {
        return state.profiles.find(function(p) { return p.id === id; }) || null;
    },

    getCurrentProfile: function() {
        if (!state.currentProfileId) return null;
        return this.getProfile(state.currentProfileId);
    },

    setCurrentProfile: function(id) {
        state.currentProfileId = id;
        saveState(state);
        try {
            if (id === null) {
                localStorage.removeItem(PROFILE_KEY);
            } else {
                localStorage.setItem(PROFILE_KEY, id);
            }
        } catch (e) {
            console.warn('Failed to save current profile key:', e);
        }
    },

    addProfile: function(profile) {
        var MAX_PROFILES = 8;
        if (state.profiles.length >= MAX_PROFILES) {
            console.warn('Maximum number of profiles reached');
            return null;
        }
        var id = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now();
        var newProfile = {
            id: id,
            name: profile.name || 'Novo Perfil',
            color: profile.color || '#E50914',
            avatar: profile.avatar || null,
            avatarType: profile.avatarType || 'generated',
            avatarIcon: profile.avatarIcon || '🎭',
            avatarLabel: profile.avatarLabel || '',
            favorites: [],
            watched: []
        };
        state.profiles.push(newProfile);
        saveState(state);
        return newProfile;
    },

    updateProfile: function(id, updates) {
        var idx = state.profiles.findIndex(function(p) { return p.id === id; });
        if (idx === -1) return null;
        // Filtrar apenas campos permitidos para evitar prototype pollution
        const allowed = ['name', 'color', 'avatar', 'avatarType', 'avatarIcon', 'avatarLabel'];
        allowed.forEach(function(key) {
            if (updates.hasOwnProperty(key) && typeof updates[key] === 'string') {
                state.profiles[idx][key] = updates[key];
            }
        });
        saveState(state);
        return state.profiles[idx];
    },

    removeProfile: function(id) {
        var idx = state.profiles.findIndex(function(p) { return p.id === id; });
        if (idx === -1) return false;
        state.profiles.splice(idx, 1);
        if (state.currentProfileId === id) {
            state.currentProfileId = null;
        }
        saveState(state);
        return true;
    },

    toggleFavorite: function(profileId, movieId) {
        var profile = this.getProfile(profileId);
        if (!profile) return false;
        var idx = profile.favorites.indexOf(movieId);
        if (idx > -1) {
            profile.favorites.splice(idx, 1);
        } else {
            profile.favorites.push(movieId);
        }
        saveState(state);
        return profile.favorites;
    },

    isFavorite: function(profileId, movieId) {
        var profile = this.getProfile(profileId);
        return profile ? profile.favorites.includes(movieId) : false;
    },

    getFavorites: function(profileId) {
        var profile = this.getProfile(profileId);
        return profile ? profile.favorites : [];
    },

    addToWatched: function(profileId, movieId) {
        var profile = this.getProfile(profileId);
        if (!profile) return;
        if (!profile.watched.includes(movieId)) {
            profile.watched.push(movieId);
        }
        saveState(state);
    }
};
