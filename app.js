// app.js
import {
    fetchRandomDogs,
    fetchFavorites
} from './api.js';

import {
    initUI,
    showLoading,
    hideLoading,
    showError,
    renderDogGallery,
    updateFavoritesMap,
    updateUIWithFavorites
} from './ui.js';

let currentImages = [];

async function init() {
    console.log('App initializing...');
    
    initUI();
    
    try {
        await Promise.all([
            loadRandomDogs(),
            loadFavorites()
        ]);
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to initialize app: ' + error.message);
    }
}

async function loadRandomDogs() {
    try {
        console.log('Loading random dogs...');
        showLoading();
        
        const images = await fetchRandomDogs(12);
        console.log('Random dogs loaded:', images.length);
        
        if (!images || images.length === 0) {
            throw new Error('No images returned from API');
        }
        
        currentImages = images;
        const galleryElement = document.getElementById('random-gallery');
        
        if (!galleryElement) {
            throw new Error('Gallery element not found');
        }
        
        renderDogGallery(images, galleryElement);
        hideLoading();
    } catch (error) {
        console.error('Error in loadRandomDogs:', error);
        showError('Failed to load dogs: ' + error.message);
        hideLoading();
    }
}

async function loadFavorites() {
    try {
        console.log('Loading favorites...');
        const favorites = await fetchFavorites();
        console.log('Favorites loaded:', favorites.length);
        updateFavoritesMap(favorites);
        updateUIWithFavorites();
    } catch (error) {
        console.warn('Failed to load favorites:', error);
    }
}

window.loadRandomDogs = loadRandomDogs;

document.addEventListener('DOMContentLoaded', init);

export { init };
