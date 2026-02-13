import { fetchRandomDogs, searchBreeds, fetchImagesByBreed, uploadDogImage, fetchUserUploads, addToFavorites, fetchFavorites, voteOnImage } from './api.js';
import { showSection, showLoading, hideLoading, showError, hideError, createDogCard, createBreedItem, clearGallery, addCardsToGallery, showUploadStatus, updateUploadPreview } from './ui.js';

// DOM elements
let randomBtn, breedsBtn, favoritesBtn, uploadBtn;
let loadMoreBtn, voteUpBtn, voteDownBtn;
let breedSearch, searchBreedBtn;
let uploadForm, dogImageInput, subIdInput, refreshUploadsBtn;
let retryBtn;
let modalFavoriteBtn, modalVoteUpBtn, modalVoteDownBtn, modalDeleteBtn;

// State
let currentSection = 'random-section';
let currentRandomDogs = [];
let currentBreedId = null;
let userSubId = localStorage.getItem('userSubId') || '';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    randomBtn = document.getElementById('random-btn');
    breedsBtn = document.getElementById('breeds-btn');
    favoritesBtn = document.getElementById('favorites-btn');
    uploadBtn = document.getElementById('upload-btn');

    loadMoreBtn = document.getElementById('load-more-btn');
    voteUpBtn = document.getElementById('vote-up-btn');
    voteDownBtn = document.getElementById('vote-down-btn');

    breedSearch = document.getElementById('breed-search');
    searchBreedBtn = document.getElementById('search-breed-btn');

    uploadForm = document.getElementById('upload-form');
    dogImageInput = document.getElementById('dog-image');
    subIdInput = document.getElementById('sub-id');
    refreshUploadsBtn = document.getElementById('refresh-uploads-btn');

    retryBtn = document.getElementById('retry-btn');

    modalFavoriteBtn = document.getElementById('modal-favorite-btn');
    modalVoteUpBtn = document.getElementById('modal-vote-up-btn');
    modalVoteDownBtn = document.getElementById('modal-vote-down-btn');
    modalDeleteBtn = document.getElementById('modal-delete-btn');
    
    setupEventListeners();
    loadRandomDogs();
    showSection('random-section');
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    randomBtn.addEventListener('click', () => switchSection('random-section'));
    breedsBtn.addEventListener('click', () => switchSection('breeds-section'));
    favoritesBtn.addEventListener('click', () => switchSection('favorites-section'));
    uploadBtn.addEventListener('click', () => switchSection('upload-section'));

    // Random section
    loadMoreBtn.addEventListener('click', loadRandomDogs);
    voteUpBtn.addEventListener('click', () => voteOnSelected(1));
    voteDownBtn.addEventListener('click', () => voteOnSelected(-1));

    // Breeds section
    searchBreedBtn.addEventListener('click', searchBreedsHandler);
    breedSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBreedsHandler();
        }
    });

    // Upload section
    uploadForm.addEventListener('submit', uploadDogHandler);
    dogImageInput.addEventListener('change', handleFileSelect);
    refreshUploadsBtn.addEventListener('click', loadUserUploads);

    // Modal actions
    modalFavoriteBtn.addEventListener('click', addToFavoritesHandler);
    modalVoteUpBtn.addEventListener('click', () => voteOnModal(1));
    modalVoteDownBtn.addEventListener('click', () => voteOnModal(-1));

    // Retry
    retryBtn.addEventListener('click', () => {
        hideError();
        loadRandomDogs();
    });

    // Custom events
    document.addEventListener('loadBreedImages', handleLoadBreedImages);
}

// Switch sections
function switchSection(sectionId) {
    currentSection = sectionId;
    showSection(sectionId);

    // Load content for section
    switch (sectionId) {
        case 'random-section':
            if (document.getElementById('random-gallery').children.length === 0) {
                loadRandomDogs();
            }
            break;
        case 'favorites-section':
            loadFavorites();
            break;
        case 'upload-section':
            loadUserUploads();
            break;
    }
}

// Load random dogs
async function loadRandomDogs() {
    try {
        showLoading();
        hideError();
        const dogs = await fetchRandomDogs(12);
        currentRandomDogs = dogs;

        const cards = dogs.map(createDogCard);
        clearGallery('random-gallery');
        addCardsToGallery('random-gallery', cards);
    } catch (error) {
        showError('Failed to load random dogs. Please try again.');
    } finally {
        hideLoading();
    }
}

// Search breeds
async function searchBreedsHandler() {
    const query = breedSearch.value.trim();
    if (!query) return;

    try {
        showLoading();
        const breeds = await searchBreeds(query);

        const items = breeds.map(createBreedItem);
        clearGallery('breeds-list');
        addCardsToGallery('breeds-list', items);

        // Show breeds list, hide gallery
        document.getElementById('breeds-list').classList.remove('hidden');
        document.getElementById('breed-gallery').classList.add('hidden');
    } catch (error) {
        showError('Failed to search breeds. Please try again.');
    } finally {
        hideLoading();
    }
}

// Load breed images
async function handleLoadBreedImages(event) {
    const { breedId, breedName } = event.detail;
    currentBreedId = breedId;

    try {
        showLoading();
        const images = await fetchImagesByBreed(breedId, 12);

        const cards = images.map(createDogCard);
        clearGallery('breed-gallery');
        addCardsToGallery('breed-gallery', cards);
    } catch (error) {
        showError(`Failed to load images for ${breedName}. Please try again.`);
    } finally {
        hideLoading();
    }
}

// Upload dog
async function uploadDogHandler(event) {
    event.preventDefault();

    const file = dogImageInput.files[0];
    const subId = subIdInput.value.trim();

    if (!file) {
        showUploadStatus('Please select an image file.', false);
        return;
    }

    try {
        showLoading();
        const result = await uploadDogImage(file, subId);

        if (subId) {
            userSubId = subId;
            localStorage.setItem('userSubId', subId);
        }

        showUploadStatus('Dog uploaded successfully!', true);
        uploadForm.reset();
        updateUploadPreview(null);
        loadUserUploads();
    } catch (error) {
        showUploadStatus('Failed to upload dog. Please try again.', false);
    } finally {
        hideLoading();
    }
}

// Handle file select for preview
function handleFileSelect(event) {
    const file = event.target.files[0];
    updateUploadPreview(file);
}

// Load user uploads
async function loadUserUploads() {
    if (!userSubId) {
        clearGallery('upload-gallery');
        return;
    }

    try {
        const uploads = await fetchUserUploads(userSubId, 12);
        const cards = uploads.map(createDogCard);
        clearGallery('upload-gallery');
        addCardsToGallery('upload-gallery', cards);
    } catch (error) {
        console.error('Failed to load user uploads:', error);
    }
}

// Load favorites
async function loadFavorites() {
    try {
        showLoading();
        const favorites = await fetchFavorites(userSubId, 12);
        const cards = favorites.map(fav => createDogCard(fav.image));
        clearGallery('favorites-gallery');
        addCardsToGallery('favorites-gallery', cards);
    } catch (error) {
        showError('Failed to load favorites. Please try again.');
    } finally {
        hideLoading();
    }
}

// Vote on selected dogs (random section)
async function voteOnSelected(value) {
    const selectedCards = document.querySelectorAll('.dog-card.selected');
    if (selectedCards.length === 0) {
        alert('Please select dogs to vote on first.');
        return;
    }

    try {
        const promises = Array.from(selectedCards).map(card => {
            const imageId = card.dataset.imageId;
            return voteOnImage(imageId, value, userSubId);
        });

        await Promise.all(promises);
        alert(`Voted ${value > 0 ? 'up' : 'down'} on ${selectedCards.length} dog(s)!`);
    } catch (error) {
        alert('Failed to vote. Please try again.');
    }
}

// Add to favorites from modal
async function addToFavoritesHandler() {
    const modal = document.getElementById('image-modal');
    const dogData = JSON.parse(modal.dataset.currentDog || '{}');
    if (!dogData.id) return;

    try {
        await addToFavorites(dogData.id, userSubId);
        alert('Added to favorites!');
    } catch (error) {
        alert('Failed to add to favorites. Please try again.');
    }
}

// Vote from modal
async function voteOnModal(value) {
    const modal = document.getElementById('image-modal');
    const dogData = JSON.parse(modal.dataset.currentDog || '{}');
    if (!dogData.id) return;

    try {
        await voteOnImage(dogData.id, value, userSubId);
        alert(`Voted ${value > 0 ? 'up' : 'down'}!`);
    } catch (error) {
        alert('Failed to vote. Please try again.');
    }
}