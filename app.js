// app.js
import {
    fetchRandomDogs,
    fetchDogsByBreed,
    fetchAllBreeds,
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
    updateUIWithFavorites,
    getCurrentSection,
    setCurrentBreedId
} from './ui.js';

let allBreeds = [];
let currentImages = [];

async function init() {
    console.log('App initializing...');
    
    initUI();
    
    setupNavigationListeners();

    try {
        await Promise.all([
            loadRandomDogs(),
            loadFavorites(),
            loadAllBreeds()
        ]);
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to initialize app: ' + error.message);
    }
}

function setupNavigationListeners() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.id.replace('-btn', '');
            showSection(section);
            
            if (section === 'favorites') {
                handleShowFavorites();
            } else if (section === 'breeds') {
                handleShowBreeds();
            }
        });
    });

    document.addEventListener('loadMoreDogs', () => loadRandomDogs());
    document.addEventListener('searchBreeds', (e) => handleBreedSearch(e.detail.query));
    document.addEventListener('selectBreed', (e) => handleBreedSelection(e.detail.breedId, e.detail.breedName));
    document.addEventListener('retry', handleRetry);
}

async function loadRandomDogs() {
    try {
        console.log('Loading random dogs...');
        showLoading();
        hideError();

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
        
        renderDogGallery(images, galleryElement, true, false);
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

async function loadAllBreeds() {
    try {
        console.log('Loading all breeds...');
        allBreeds = await fetchAllBreeds();
        console.log('All breeds loaded:', allBreeds.length);
        console.log('First 5 breeds:', allBreeds.slice(0, 5).map(b => b.name));
    } catch (error) {
        console.warn('Failed to load breeds:', error);
    }
}

function handleShowBreeds() {
    console.log('Showing all breeds...');
    if (allBreeds.length > 0) {
        renderBreedsList(allBreeds);
    } else {
        loadAllBreeds().then(() => {
            renderBreedsList(allBreeds);
        });
    }
}

async function handleBreedSearch(query) {
    console.log('Searching breeds for:', query);

    try {
        showLoading();
        const filteredBreeds = await searchBreeds(query);
        renderBreedsList(filteredBreeds);
        hideLoading();
    } catch (error) {
        console.error('Failed to search breeds:', error);
        showError('Failed to search breeds: ' + error.message);
        hideLoading();
    }
}

async function handleBreedSelection(breedId, breedName) {
    console.log('SELECTING BREED:', breedName, 'with ID:', breedId);

    try {
        showLoading();
        setCurrentBreedId(breedId);

        const images = await fetchDogsByBreed(breedId, 12);
        console.log(`Found ${images.length} images for ${breedName}`);
        
        if (images.length === 0) {
            showError(`No images found for ${breedName}. Try another breed.`);
            hideLoading();
            return;
        }
        
        const breedData = images[0]?.breeds?.[0];
        
        if (!breedData) {
            console.error('No breed data in images');
            showError('Breed information not available');
            hideLoading();
            return;
        }
        
        console.log('Breed data for display:', breedData.name);
        console.log('Breed temperament:', breedData.temperament);
        
        showBreedGallery(images, breedData);

        hideLoading();
    } catch (error) {
        console.error('Failed to load breed images:', error);
        showError('Failed to load breed images: ' + error.message);
        hideLoading();
    }
}

async function handleShowFavorites() {
    try {
        console.log('Showing favorites...');
        showLoading();

        const favorites = await fetchFavorites();
        console.log('Favorites for display:', favorites.length);
        
        const images = favorites.map(fav => fav.image).filter(img => img);

        const galleryElement = document.getElementById('favorites-gallery');
        if (galleryElement) {
            renderDogGallery(images, galleryElement, true, false);
        }

        hideLoading();
    } catch (error) {
        console.error('Failed to load favorites:', error);
        showError('Failed to load favorites: ' + error.message);
        hideLoading();
    }
}

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
            handleShowBreeds();
            break;
        default:
            loadRandomDogs();
    }
}

window.loadRandomDogs = loadRandomDogs;
window.handleBreedSearch = handleBreedSearch;
window.handleBreedSelection = handleBreedSelection;
window.handleShowFavorites = handleShowFavorites;
window.handleRetry = handleRetry;

document.addEventListener('DOMContentLoaded', init);

export { init };