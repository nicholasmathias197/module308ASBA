// app.js - Main application logic
import {
    fetchRandomDogs,
    fetchDogsByBreed,
    fetchBreeds,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    voteOnImage,
    searchBreeds,
    uploadImage
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
    setCurrentBreedId,
    updateUIWithFavorites
} from './ui.js';

// Application state
let allBreeds = [];
let currentImages = [];

// Initialize the application
async function init() {
    console.log('App initializing...'); // Debug log
    
    // Initialize UI first
    initUI();
    
    // Setup navigation listeners
    setupNavigationListeners();

    try {
        // Load initial data
        await Promise.all([
            loadRandomDogs(),
            loadFavorites(),
            loadBreeds()
        ]);
        console.log('App initialized successfully'); // Debug log
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to initialize app: ' + error.message);
    }
}

// Setup navigation listeners
function setupNavigationListeners() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.id.replace('-btn', '');
            showSection(section);
            
            // Handle section-specific loading
            if (section === 'favorites') {
                handleShowFavorites();
            } else if (section === 'breeds') {
                handleShowBreeds();
            }
        });
    });
}

// Load random dogs
async function loadRandomDogs() {
    try {
        console.log('Loading random dogs...'); // Debug log
        showLoading();
        hideError();

        const images = await fetchRandomDogs(12);
        console.log('Random dogs loaded:', images); // Debug log
        
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

// Load user's favorites
async function loadFavorites() {
    try {
        console.log('Loading favorites...'); // Debug log
        const favorites = await fetchFavorites();
        console.log('Favorites loaded:', favorites); // Debug log
        updateFavoritesMap(favorites);
        updateUIWithFavorites();
    } catch (error) {
        console.warn('Failed to load favorites:', error);
    }
}

// Load all breeds
async function loadBreeds() {
    try {
        console.log('Loading breeds...'); // Debug log
        allBreeds = await fetchBreeds();
        console.log('Breeds loaded:', allBreeds.length); // Debug log
    } catch (error) {
        console.warn('Failed to load breeds:', error);
    }
}

// Handle show breeds
function handleShowBreeds() {
    console.log('Showing breeds...'); // Debug log
    if (allBreeds.length > 0) {
        renderBreedsList(allBreeds.slice(0, 20));
    }
}

// Handle show favorites
async function handleShowFavorites() {
    try {
        console.log('Showing favorites...'); // Debug log
        showLoading();

        const favorites = await fetchFavorites();
        console.log('Favorites for display:', favorites); // Debug log
        
        const images = favorites.map(fav => fav.image).filter(img => img); // Filter out any null images

        const galleryElement = document.getElementById('favorites-gallery');
        if (galleryElement) {
            renderDogGallery(images, galleryElement, true); // Show actions in favorites
        }

        hideLoading();
    } catch (error) {
        console.error('Failed to load favorites:', error);
        showError('Failed to load favorites: ' + error.message);
        hideLoading();
    }
}

// Handle breed search
async function handleBreedSearch(query) {
    console.log('Searching breeds:', query); // Debug log

    if (!query.trim()) {
        renderBreedsList(allBreeds.slice(0, 20));
        return;
    }

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

// Handle breed selection
async function handleBreedSelection(breedId, breedName) {
    console.log('Selecting breed:', breedId, breedName);

    try {
        showLoading();
        setCurrentBreedId(breedId);

        // Fetch images for this specific breed
        const images = await fetchDogsByBreed(breedId, 12);
        console.log('Breed images received:', images);
        
        if (images.length === 0) {
            showError(`No images found for ${breedName}. Try another breed.`);
            hideLoading();
            return;
        }
        
        // Get the breed data from the first image (should be the same for all)
        const breedData = images[0]?.breeds?.[0];
        
        if (!breedData) {
            showError('Breed information not available');
            hideLoading();
            return;
        }
        
        // Show the breed gallery with the images AND breed description
        showBreedGallery(images, breedData);

        hideLoading();
    } catch (error) {
        console.error('Failed to load breed images:', error);
        showError('Failed to load breed images: ' + error.message);
        hideLoading();
    }
}

// Make functions available globally for event listeners
window.loadRandomDogs = loadRandomDogs;
window.handleBreedSearch = handleBreedSearch;
window.handleBreedSelection = handleBreedSelection;
window.handleShowFavorites = handleShowFavorites;

// Start the application
document.addEventListener('DOMContentLoaded', init);