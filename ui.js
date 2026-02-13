// ui.js - Handles DOM manipulation and UI updates
import { addToFavorites, removeFromFavorites, voteOnImage, uploadImage } from './api.js';

// DOM elements
const elements = {
    navButtons: document.querySelectorAll('.nav-btn'),
    sections: document.querySelectorAll('.section'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn'),

    // Random section
    randomGallery: document.getElementById('random-gallery'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    voteUpBtn: document.getElementById('vote-up-btn'),
    voteDownBtn: document.getElementById('vote-down-btn'),

    // Breeds section
    breedsSection: document.getElementById('breeds-section'),
    breedSearch: document.getElementById('breed-search'),
    searchBreedBtn: document.getElementById('search-breed-btn'),
    breedsList: document.getElementById('breeds-list'),
    breedGallery: document.getElementById('breed-gallery'),

    // Favorites section
    favoritesGallery: document.getElementById('favorites-gallery'),

    // Upload section
    uploadForm: document.getElementById('upload-form'),
    uploadSubmitBtn: document.getElementById('upload-submit-btn'),
    uploadStatus: document.getElementById('upload-status'),

    // Modal
    modal: document.getElementById('image-modal'),
    modalImage: document.getElementById('modal-image'),
    modalBreed: document.getElementById('modal-breed'),
    modalDescription: document.getElementById('modal-description'),
    modalFavoriteBtn: document.getElementById('modal-favorite-btn'),
    modalVoteUpBtn: document.getElementById('modal-vote-up-btn'),
    modalVoteDownBtn: document.getElementById('modal-vote-down-btn'),
    closeModal: document.getElementById('close-modal')
};

// State management
let currentSection = 'random';
let currentImages = [];
let currentBreedId = null;
let favoritesMap = new Map();

// Initialize UI
export function initUI() {
    setupEventListeners();
    showSection('random');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.id.replace('-btn', '');
            // Use the navigate function from app.js if available, otherwise use showSection
            if (window.navigateToSection) {
                window.navigateToSection(section);
            } else {
                showSection(section);
            }
        });
    });

    // Random section
    elements.loadMoreBtn.addEventListener('click', () => {
        const event = new CustomEvent('loadMoreDogs');
        document.dispatchEvent(event);
    });

    elements.voteUpBtn.addEventListener('click', () => handleBulkVote(1));
    elements.voteDownBtn.addEventListener('click', () => handleBulkVote(0));

    // Breeds section
    elements.searchBreedBtn.addEventListener('click', () => {
        const event = new CustomEvent('searchBreeds', {
            detail: { query: elements.breedSearch.value }
        });
        document.dispatchEvent(event);
    });

    elements.breedSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.searchBreedBtn.click();
        }
    });

    // Upload section
    elements.uploadForm.addEventListener('submit', handleUpload);

    // Modal
    elements.closeModal.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            closeModal();
        }
    });

    elements.modalFavoriteBtn.addEventListener('click', () => handleModalFavorite());
    elements.modalVoteUpBtn.addEventListener('click', () => handleModalVote(1));
    elements.modalVoteDownBtn.addEventListener('click', () => handleModalVote(0));

    // Retry button
    elements.retryBtn.addEventListener('click', () => {
        const event = new CustomEvent('retry');
        document.dispatchEvent(event);
    });
}

// Show loading state
export function showLoading() {
    elements.loading.classList.remove('hidden');
    elements.error.classList.add('hidden');
}

// Hide loading state
export function hideLoading() {
    elements.loading.classList.add('hidden');
}

// Show error message
export function showError(message) {
    elements.errorMessage.textContent = message;
    elements.error.classList.remove('hidden');
    elements.loading.classList.add('hidden');
}

// Hide error
export function hideError() {
    elements.error.classList.add('hidden');
}

// Show specific section
export function showSection(sectionName) {
    currentSection = sectionName;

    // Update navigation
    elements.navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${sectionName}-btn`).classList.add('active');

    // Show/hide sections
    elements.sections.forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
}

// Render dog images in gallery
export function renderDogGallery(images, galleryElement, showActions = true) {
    currentImages = images;
    galleryElement.innerHTML = '';

    if (!images || images.length === 0) {
        galleryElement.innerHTML = '<p class="no-results">No dogs found.</p>';
        return;
    }

    images.forEach(image => {
        const dogCard = createDogCard(image, showActions);
        galleryElement.appendChild(dogCard);
    });
}

// Create a dog card element
function createDogCard(image, showActions = true) {
    const card = document.createElement('div');
    card.className = 'dog-card';
    card.dataset.imageId = image.id;

    const breedName = image.breeds && image.breeds.length > 0 ? image.breeds[0].name : 'Unknown Breed';
    const isFavorited = favoritesMap.has(image.id);

    card.innerHTML = `
        <img src="${image.url}" alt="${breedName}" class="dog-image" loading="lazy">
        <div class="dog-info">
            <div class="dog-breed">${breedName}</div>
            ${showActions ? `
                <div class="dog-actions">
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-image-id="${image.id}">
                        ${isFavorited ? '❤️' : '🤍'}
                    </button>
                    <button class="vote-btn" data-action="upvote" data-image-id="${image.id}">👍</button>
                    <button class="vote-btn" data-action="downvote" data-image-id="${image.id}">👎</button>
                </div>
            ` : ''}
        </div>
    `;

    // Add event listeners
    card.addEventListener('click', (e) => {
        if (!e.target.matches('button')) {
            openModal(image);
        }
    });

    if (showActions) {
        const favoriteBtn = card.querySelector('.favorite-btn');
        const voteBtns = card.querySelectorAll('.vote-btn');

        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleFavorite(image.id, favoriteBtn);
        });

        voteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const value = action === 'upvote' ? 1 : 0;
                handleVoteOnCard(image.id, value);
            });
        });
    }

    return card;
}

// Render breeds list
export function renderBreedsList(breeds) {
    elements.breedsList.innerHTML = '';

    if (!breeds || breeds.length === 0) {
        elements.breedsList.innerHTML = '<p class="no-results">No breeds found.</p>';
        return;
    }

    breeds.forEach(breed => {
        const breedItem = document.createElement('div');
        breedItem.className = 'breed-item';
        breedItem.dataset.breedId = breed.id;

        breedItem.innerHTML = `
            <div class="breed-name">${breed.name}</div>
            <div class="breed-info">${breed.temperament || 'No temperament info'}</div>
        `;

        breedItem.addEventListener('click', () => {
            const event = new CustomEvent('selectBreed', {
                detail: { breedId: breed.id, breedName: breed.name }
            });
            document.dispatchEvent(event);
        });

        elements.breedsList.appendChild(breedItem);
    });
}

// Show breed gallery
export function showBreedGallery(images, breedName) {
    elements.breedGallery.classList.remove('hidden');
    renderDogGallery(images, elements.breedGallery);

    // Scroll to gallery
    elements.breedGallery.scrollIntoView({ behavior: 'smooth' });
}

// Handle favorite/unfavorite
async function handleFavorite(imageId, buttonElement) {
    try {
        const isFavorited = favoritesMap.has(imageId);

        if (isFavorited) {
            const favoriteId = favoritesMap.get(imageId);
            await removeFromFavorites(favoriteId);
            favoritesMap.delete(imageId);
            buttonElement.textContent = '🤍';
            buttonElement.classList.remove('favorited');
        } else {
            const result = await addToFavorites(imageId);
            favoritesMap.set(imageId, result.id);
            buttonElement.textContent = '❤️';
            buttonElement.classList.add('favorited');
        }
    } catch (error) {
        showError('Failed to update favorite: ' + error.message);
    }
}

// Handle voting on cards
async function handleVoteOnCard(imageId, value) {
    try {
        await voteOnImage(imageId, value);
        // Show temporary success message
        showTemporaryMessage('Vote recorded!');
    } catch (error) {
        showError('Failed to vote: ' + error.message);
    }
}

// Handle bulk voting
async function handleBulkVote(value) {
    if (currentImages.length === 0) {
        showError('No images to vote on. Load some dogs first!');
        return;
    }

    try {
        // Vote on the first image (could be enhanced to vote on all visible images)
        await voteOnImage(currentImages[0].id, value);
        showTemporaryMessage('Vote recorded successfully!');
    } catch (error) {
        showError('Failed to vote: ' + error.message);
    }
}

// Show temporary message
function showTemporaryMessage(message) {
    const originalMessage = elements.errorMessage.textContent;
    const wasHidden = elements.error.classList.contains('hidden');
    
    elements.errorMessage.textContent = message;
    elements.error.classList.remove('hidden');
    
    setTimeout(() => {
        if (wasHidden) {
            elements.error.classList.add('hidden');
        }
        elements.errorMessage.textContent = originalMessage;
    }, 2000);
}

// Handle modal favorite
async function handleModalFavorite() {
    const imageId = elements.modalImage.dataset.imageId;
    const button = elements.modalFavoriteBtn;

    if (imageId) {
        await handleFavorite(imageId, button);
    }
}

// Handle modal voting
async function handleModalVote(value) {
    const imageId = elements.modalImage.dataset.imageId;

    if (imageId) {
        try {
            await voteOnImage(imageId, value);
            showTemporaryMessage('Vote recorded successfully!');
        } catch (error) {
            showError('Failed to vote: ' + error.message);
        }
    }
}

// Open modal with full-size image
function openModal(image) {
    elements.modalImage.src = image.url;
    elements.modalImage.dataset.imageId = image.id;
    elements.modalImage.alt = image.breeds && image.breeds.length > 0 ? image.breeds[0].name : 'Dog';

    const breed = image.breeds && image.breeds.length > 0 ? image.breeds[0] : null;
    elements.modalBreed.textContent = breed ? breed.name : 'Unknown Breed';
    elements.modalDescription.textContent = breed ? (breed.temperament || 'No temperament information available') : 'No breed information available';

    const isFavorited = favoritesMap.has(image.id);
    elements.modalFavoriteBtn.textContent = isFavorited ? '❤️ Favorited' : '🤍 Favorite';
    elements.modalFavoriteBtn.classList.toggle('favorited', isFavorited);

    elements.modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    elements.modal.classList.add('hidden');
}

// Handle file upload
async function handleUpload(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const file = formData.get('file');

    if (!file) {
        showUploadStatus('Please select a file to upload.', 'error');
        return;
    }

    // Disable submit button during upload
    elements.uploadSubmitBtn.disabled = true;
    elements.uploadSubmitBtn.textContent = 'Uploading...';

    try {
        showUploadStatus('Uploading...', 'info');
        const result = await uploadImage(formData);

        if (result && result.id) {
            showUploadStatus('Upload successful! Your dog photo has been submitted.', 'success');
            // Clear form
            e.target.reset();
        } else {
            showUploadStatus('Upload submitted! It may take a moment to be reviewed.', 'success');
        }

    } catch (error) {
        showUploadStatus('Upload failed: ' + error.message, 'error');
    } finally {
        // Re-enable submit button
        elements.uploadSubmitBtn.disabled = false;
        elements.uploadSubmitBtn.textContent = 'Upload Dog';
    }
}

// Show upload status
function showUploadStatus(message, type) {
    elements.uploadStatus.textContent = message;
    elements.uploadStatus.className = `upload-status ${type}`;
    elements.uploadStatus.classList.remove('hidden');
}

// Update favorites map
export function updateFavoritesMap(favorites) {
    favoritesMap.clear();
    if (favorites && favorites.length > 0) {
        favorites.forEach(fav => {
            if (fav.image && fav.image.id) {
                favoritesMap.set(fav.image.id, fav.id);
            }
        });
    }
}

// Get current section
export function getCurrentSection() {
    return currentSection;
}

// Get current breed ID
export function getCurrentBreedId() {
    return currentBreedId;
}

// Set current breed ID
export function setCurrentBreedId(breedId) {
    currentBreedId = breedId;
}