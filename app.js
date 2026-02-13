// app.js - Main application logic
import {
    fetchRandomDogs,
    fetchDogsByBreed,
    fetchBreeds,
    fetchFavorites,
    searchBreeds
} from './api.js';

import {
    initUI,
    showLoading,
    hideLoading,
    showError,
    hideError,
    showSection,
    renderDogGallery,
    renderBreedsList,
    showBreedGallery,
    updateFavoritesMap,
    getCurrentSection,
    getCurrentBreedId,
    setCurrentBreedId
} from './ui.js';

// Application state
let allBreeds = [];
let currentImages = [];

// Initialize the application
async function init() {
    initUI();
    setupEventListeners();

    try {
        // Load initial data
        await loadRandomDogs();
        await loadFavorites();
        await loadBreeds();
    } catch (error) {
        showError('Failed to initialize app: ' + error.message);
    }
}

// Setup custom event listeners
function setupEventListeners() {
    document.addEventListener('loadMoreDogs', loadRandomDogs);
    document.addEventListener('searchBreeds', handleBreedSearch);
    document.addEventListener('selectBreed', handleBreedSelection);
    document.addEventListener('retry', handleRetry);
}

// Load random dogs
async function loadRandomDogs() {
    try {
        showLoading();
        hideError();

        const images = await fetchRandomDogs(12);
        currentImages = images;

        const galleryElement = document.getElementById('random-gallery');
        renderDogGallery(images, galleryElement);

        hideLoading();
    } catch (error) {
        showError('Failed to load dogs: ' + error.message);
    }
}

// Load user's favorites
async function loadFavorites() {
    try {
        const favorites = await fetchFavorites();
        updateFavoritesMap(favorites);
    } catch (error) {
        console.warn('Failed to load favorites:', error);
        // Don't show error for favorites, as it's not critical
    }
}

// Load all breeds
async function loadBreeds() {
    try {
        allBreeds = await fetchBreeds();
    } catch (error) {
        console.warn('Failed to load breeds:', error);
        // Don't show error for breeds, as it's not critical
    }
}

// Handle breed search
async function handleBreedSearch(event) {
    const { query } = event.detail;

    if (!query.trim()) {
        renderBreedsList(allBreeds.slice(0, 20)); // Show first 20 breeds
        return;
    }

    try {
        showLoading();
        const filteredBreeds = await searchBreeds(query);
        renderBreedsList(filteredBreeds);
        hideLoading();
    } catch (error) {
        showError('Failed to search breeds: ' + error.message);
    }
}

// Handle breed selection
async function handleBreedSelection(event) {
    const { breedId, breedName } = event.detail;

    try {
        showLoading();
        setCurrentBreedId(breedId);

        const images = await fetchDogsByBreed(breedId, 12);
        showBreedGallery(images, breedName);

        hideLoading();
    } catch (error) {
        showError('Failed to load breed images: ' + error.message);
    }
}

// Handle navigation to favorites section
async function handleShowFavorites() {
    try {
        showLoading();

        const favorites = await fetchFavorites();
        const images = favorites.map(fav => fav.image);

        const galleryElement = document.getElementById('favorites-gallery');
        renderDogGallery(images, galleryElement, false); // Don't show actions in favorites

        hideLoading();
    } catch (error) {
        showError('Failed to load favorites: ' + error.message);
    }
}

// Handle navigation changes
function handleNavigation(section) {
    if (section === 'favorites') {
        handleShowFavorites();
    } else if (section === 'breeds') {
        // Show all breeds initially
        renderBreedsList(allBreeds.slice(0, 20));
    }
}

// Handle retry
function handleRetry() {
    const currentSection = getCurrentSection();
    switch (currentSection) {
        case 'random':
            loadRandomDogs();
            break;
        case 'favorites':
            handleShowFavorites();
            break;
        case 'breeds':
            renderBreedsList(allBreeds.slice(0, 20));
            break;
        default:
            loadRandomDogs();
    }
}

// Override the showSection function to handle navigation logic
const originalShowSection = window.showSection;
window.showSection = function(section) {
    showSection(section);
    handleNavigation(section);
};

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export for potential use in other modules
export { init };