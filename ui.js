// ui.js - Handles DOM manipulation and UI updates
import { addToFavorites, removeFromFavorites, voteOnImage } from './api.js';

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
let currentBreedData = null;
let favoritesMap = new Map();

// Initialize UI
export function initUI() {
    console.log('UI initializing...');
    setupEventListeners();
    showSection('random');
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Load more button
    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', () => {
            console.log('Load more clicked');
            if (window.loadRandomDogs) {
                window.loadRandomDogs();
            }
        });
    }

    // Vote buttons
    if (elements.voteUpBtn) {
        elements.voteUpBtn.addEventListener('click', () => {
            console.log('Vote up clicked');
            handleVote(1);
        });
    }

    if (elements.voteDownBtn) {
        elements.voteDownBtn.addEventListener('click', () => {
            console.log('Vote down clicked');
            handleVote(0);
        });
    }

    // Breed search
    if (elements.searchBreedBtn) {
        elements.searchBreedBtn.addEventListener('click', () => {
            console.log('Search breeds clicked');
            if (window.handleBreedSearch) {
                window.handleBreedSearch(elements.breedSearch.value);
            }
        });
    }

    if (elements.breedSearch) {
        elements.breedSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Search breeds enter pressed');
                if (window.handleBreedSearch) {
                    window.handleBreedSearch(elements.breedSearch.value);
                }
            }
        });
    }

    // Upload form
    if (elements.uploadForm) {
        elements.uploadForm.addEventListener('submit', handleUpload);
    }

    // Modal close
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeModal);
    }

    if (elements.modal) {
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                closeModal();
            }
        });
    }

    // Modal buttons
    if (elements.modalFavoriteBtn) {
        elements.modalFavoriteBtn.addEventListener('click', () => handleModalFavorite());
    }

    if (elements.modalVoteUpBtn) {
        elements.modalVoteUpBtn.addEventListener('click', () => handleModalVote(1));
    }

    if (elements.modalVoteDownBtn) {
        elements.modalVoteDownBtn.addEventListener('click', () => handleModalVote(0));
    }

    // Retry button
    if (elements.retryBtn) {
        elements.retryBtn.addEventListener('click', () => {
            console.log('Retry clicked');
            if (window.loadRandomDogs) {
                window.loadRandomDogs();
            }
        });
    }
}

// Show loading state
export function showLoading() {
    if (elements.loading) {
        elements.loading.classList.remove('hidden');
    }
    if (elements.error) {
        elements.error.classList.add('hidden');
    }
}

// Hide loading state
export function hideLoading() {
    if (elements.loading) {
        elements.loading.classList.add('hidden');
    }
}

// Show error message
export function showError(message) {
    console.error('Error:', message);
    if (elements.errorMessage) {
        elements.errorMessage.textContent = message;
    }
    if (elements.error) {
        elements.error.classList.remove('hidden');
    }
    if (elements.loading) {
        elements.loading.classList.add('hidden');
    }
}

// Hide error
export function hideError() {
    if (elements.error) {
        elements.error.classList.add('hidden');
    }
}

// Show specific section
export function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    currentSection = sectionName;

    // Update navigation
    elements.navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`${sectionName}-btn`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Show/hide sections
    elements.sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }
}

// Render dog images in gallery
export function renderDogGallery(images, galleryElement, showActions = true) {
    console.log('Rendering gallery with images:', images.length);
    
    currentImages = images;
    
    if (!galleryElement) {
        console.error('Gallery element not found');
        return;
    }
    
    galleryElement.innerHTML = '';

    if (!images || images.length === 0) {
        galleryElement.innerHTML = '<p class="no-results">No dogs found. Try loading more!</p>';
        return;
    }

    images.forEach(image => {
        if (image && image.url) {
            const dogCard = createDogCard(image, showActions);
            galleryElement.appendChild(dogCard);
        }
    });
}

// Create a dog card element
function createDogCard(image, showActions = true) {
    const card = document.createElement('div');
    card.className = 'dog-card';
    card.dataset.imageId = image.id;

    const breedName = image.breeds && image.breeds.length > 0 ? image.breeds[0].name : 'Unknown Breed';
    const breedTemperament = image.breeds && image.breeds.length > 0 ? image.breeds[0].temperament : '';
    const isFavorited = favoritesMap.has(image.id);

    card.innerHTML = `
        <img src="${image.url}" alt="${breedName}" class="dog-image" loading="lazy">
        <div class="dog-info">
            <div class="dog-breed">${breedName}</div>
            ${breedTemperament ? `<div class="dog-temperament">${breedTemperament.substring(0, 60)}...</div>` : ''}
            ${showActions ? `
                <div class="dog-actions">
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-image-id="${image.id}">
                        ${isFavorited ? '❤️' : '🤍'} Favorite
                    </button>
                    <button class="vote-btn" data-action="upvote" data-image-id="${image.id}">👍 Up</button>
                    <button class="vote-btn" data-action="downvote" data-image-id="${image.id}">👎 Down</button>
                </div>
            ` : ''}
        </div>
    `;

    // Add event listeners
    card.addEventListener('click', (e) => {
        if (!e.target.matches('button')) {
            console.log('Card clicked:', image.id);
            openModal(image);
        }
    });

    if (showActions) {
        const favoriteBtn = card.querySelector('.favorite-btn');
        const voteBtns = card.querySelectorAll('.vote-btn');

        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Favorite clicked:', image.id);
            handleFavorite(image.id, favoriteBtn);
        });

        voteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const value = action === 'upvote' ? 1 : 0;
                console.log('Vote clicked:', image.id, value);
                handleVoteOnCard(image.id, value);
            });
        });
    }

    return card;
}

// Render breeds list
export function renderBreedsList(breeds) {
    console.log('Rendering breeds list:', breeds.length);
    
    if (!elements.breedsList) {
        console.error('Breeds list element not found');
        return;
    }
    
    elements.breedsList.innerHTML = '';

    breeds.forEach(breed => {
        const breedItem = document.createElement('div');
        breedItem.className = 'breed-item';
        breedItem.dataset.breedId = breed.id;

        // Get additional breed info
        const temperament = breed.temperament || 'No temperament information available';
        const lifeSpan = breed.life_span || 'Unknown';
        const weight = breed.weight?.metric || 'Unknown';
        const height = breed.height?.metric || 'Unknown';

        breedItem.innerHTML = `
            <div class="breed-name">${breed.name}</div>
            <div class="breed-details">
                <div class="breed-temperament">${temperament.substring(0, 80)}${temperament.length > 80 ? '...' : ''}</div>
                <div class="breed-meta">
                    <span>📏 Height: ${height} cm</span>
                    <span>⚖️ Weight: ${weight} kg</span>
                    <span>⏱️ Lifespan: ${lifeSpan}</span>
                </div>
            </div>
        `;

        breedItem.addEventListener('click', () => {
            console.log('Breed selected:', breed.name);
            if (window.handleBreedSelection) {
                window.handleBreedSelection(breed.id, breed.name);
            }
        });

        elements.breedsList.appendChild(breedItem);
    });
}

// Show breed gallery with description - UPDATED VERSION
export function showBreedGallery(images, breedData) {
    console.log('Showing breed gallery for:', breedData.name, 'with', images.length, 'images');
    
    if (elements.breedGallery) {
        elements.breedGallery.classList.remove('hidden');
        elements.breedGallery.innerHTML = ''; // Clear previous content
        
        // Remove any existing breed header
        const existingHeader = document.querySelector('.breed-gallery-header');
        if (existingHeader) {
            existingHeader.remove();
        }
        
        // Create breed info section with description
        const breedInfoSection = document.createElement('div');
        breedInfoSection.className = 'breed-info-section';
        
        // Format breed description
        const temperament = breedData.temperament || 'No temperament information available';
        const lifeSpan = breedData.life_span || 'Unknown';
        const weight = breedData.weight?.metric || 'Unknown';
        const height = breedData.height?.metric || 'Unknown';
        const bredFor = breedData.bred_for || 'Not specified';
        const breedGroup = breedData.breed_group || 'Not specified';
        
        breedInfoSection.innerHTML = `
            <div class="breed-header">
                <div class="breed-header-title">
                    <h2>${breedData.name}</h2>
                    <span class="breed-group">${breedGroup}</span>
                </div>
                <button class="back-to-breeds-btn">← Back to Breeds</button>
            </div>
            <div class="breed-description-card">
                <div class="breed-description">
                    <p><strong>Bred For:</strong> ${bredFor}</p>
                    <p><strong>Temperament:</strong> ${temperament}</p>
                </div>
                <div class="breed-stats">
                    <div class="stat-item">
                        <span class="stat-label">Height</span>
                        <span class="stat-value">${height} cm</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Weight</span>
                        <span class="stat-value">${weight} kg</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Lifespan</span>
                        <span class="stat-value">${lifeSpan}</span>
                    </div>
                </div>
            </div>
            <div class="gallery-header">
                <h3>${breedData.name} Images <span class="dog-count">(${images.length} photos)</span></h3>
                <p class="gallery-subtitle">Click on any image to view full size and see more details</p>
            </div>
        `;
        
        // Insert breed info before gallery
        elements.breedGallery.parentNode.insertBefore(breedInfoSection, elements.breedGallery);
        
        // Add back button functionality
        const backBtn = breedInfoSection.querySelector('.back-to-breeds-btn');
        backBtn.addEventListener('click', () => {
            breedInfoSection.remove();
            elements.breedGallery.classList.add('hidden');
            elements.breedGallery.innerHTML = '';
        });
        
        // Make sure we show actions (favorite/vote buttons) in breed gallery
        renderDogGallery(images, elements.breedGallery, true);
        
        // Scroll to gallery
        elements.breedGallery.scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle favorite/unfavorite
export async function handleFavorite(imageId, buttonElement) {
    try {
        console.log('Handling favorite for:', imageId);
        
        const isFavorited = favoritesMap.has(imageId);

        if (isFavorited) {
            const favoriteId = favoritesMap.get(imageId);
            await removeFromFavorites(favoriteId);
            favoritesMap.delete(imageId);
            buttonElement.textContent = '🤍 Favorite';
            buttonElement.classList.remove('favorited');
            console.log('Removed from favorites');
            showTemporaryMessage('Removed from favorites!');
        } else {
            const result = await addToFavorites(imageId);
            favoritesMap.set(imageId, result.id);
            buttonElement.textContent = '❤️ Favorite';
            buttonElement.classList.add('favorited');
            console.log('Added to favorites');
            showTemporaryMessage('Added to favorites!');
        }
        
        // Update all instances of this image's favorite button
        updateAllFavoriteButtons(imageId);
        
    } catch (error) {
        console.error('Failed to update favorite:', error);
        showError('Failed to update favorite: ' + error.message);
    }
}

// Update all favorite buttons for a specific image across all galleries
function updateAllFavoriteButtons(imageId) {
    const isFavorited = favoritesMap.has(imageId);
    const allButtons = document.querySelectorAll(`.favorite-btn[data-image-id="${imageId}"]`);
    
    allButtons.forEach(button => {
        button.textContent = isFavorited ? '❤️ Favorite' : '🤍 Favorite';
        button.classList.toggle('favorited', isFavorited);
    });
}

// Handle voting on cards
export async function handleVoteOnCard(imageId, value) {
    try {
        console.log('Voting on image:', imageId, 'value:', value);
        await voteOnImage(imageId, value);
        showTemporaryMessage(value === 1 ? 'Upvote recorded! 👍' : 'Downvote recorded! 👎');
    } catch (error) {
        console.error('Failed to vote:', error);
        showError('Failed to vote: ' + error.message);
    }
}

// Handle voting on selected images
async function handleVote(value) {
    if (currentImages.length === 0) {
        showError('No images to vote on. Load some dogs first!');
        return;
    }

    try {
        // Vote on the first image (could be enhanced to vote on selected images)
        console.log('Voting on first image:', currentImages[0].id, 'value:', value);
        await voteOnImage(currentImages[0].id, value);
        showTemporaryMessage(value === 1 ? 'Upvote recorded! 👍' : 'Downvote recorded! 👎');
    } catch (error) {
        console.error('Failed to vote:', error);
        showError('Failed to vote: ' + error.message);
    }
}

// Show temporary success message
function showTemporaryMessage(message) {
    showError(message);
    setTimeout(() => hideError(), 2000);
}

// Handle modal favorite
async function handleModalFavorite() {
    if (!elements.modalImage || !elements.modalFavoriteBtn) return;
    
    const imageId = elements.modalImage.dataset.imageId;
    const button = elements.modalFavoriteBtn;

    if (imageId) {
        await handleFavorite(imageId, button);
    }
}

// Handle modal voting
async function handleModalVote(value) {
    if (!elements.modalImage) return;
    
    const imageId = elements.modalImage.dataset.imageId;

    if (imageId) {
        try {
            console.log('Modal vote:', imageId, value);
            await voteOnImage(imageId, value);
            showTemporaryMessage(value === 1 ? 'Upvote recorded! 👍' : 'Downvote recorded! 👎');
        } catch (error) {
            console.error('Failed to vote:', error);
            showError('Failed to vote: ' + error.message);
        }
    }
}

// Open modal with full-size image
function openModal(image) {
    console.log('Opening modal for:', image.id);
    
    if (!elements.modal || !elements.modalImage) return;
    
    elements.modalImage.src = image.url;
    elements.modalImage.dataset.imageId = image.id;
    elements.modalImage.alt = image.breeds && image.breeds.length > 0 ? image.breeds[0].name : 'Dog';

    const breed = image.breeds && image.breeds.length > 0 ? image.breeds[0] : null;
    
    if (elements.modalBreed) {
        elements.modalBreed.textContent = breed ? breed.name : 'Unknown Breed';
    }
    
    if (elements.modalDescription) {
        const description = breed ? 
            `<strong>Temperament:</strong> ${breed.temperament || 'Not available'}<br>
             <strong>Life Span:</strong> ${breed.life_span || 'Not available'}<br>
             <strong>Weight:</strong> ${breed.weight?.metric || 'Not available'} kg<br>
             <strong>Height:</strong> ${breed.height?.metric || 'Not available'} cm<br>
             <strong>Bred For:</strong> ${breed.bred_for || 'Not available'}<br>
             <strong>Breed Group:</strong> ${breed.breed_group || 'Not available'}` 
            : 'No breed information available';
        elements.modalDescription.innerHTML = description;
    }

    const isFavorited = favoritesMap.has(image.id);
    if (elements.modalFavoriteBtn) {
        elements.modalFavoriteBtn.textContent = isFavorited ? '❤️ Favorited' : '🤍 Favorite';
        elements.modalFavoriteBtn.classList.toggle('favorited', isFavorited);
    }

    elements.modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    if (elements.modal) {
        elements.modal.classList.add('hidden');
    }
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

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showUploadStatus('File too large. Maximum size is 10MB.', 'error');
        return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
        showUploadStatus('Please upload an image file.', 'error');
        return;
    }

    try {
        console.log('Uploading file:', file.name);
        
        const { uploadImage } = await import('./api.js');
        
        showUploadStatus('Uploading...', '');
        const result = await uploadImage(formData);
        console.log('Upload result:', result);

        if (result.approved === 1) {
            showUploadStatus('Upload successful! Your dog photo has been approved.', 'success');
        } else {
            showUploadStatus('Upload submitted! It may take a moment to be reviewed.', 'success');
        }

        e.target.reset();

    } catch (error) {
        console.error('Upload failed:', error);
        showUploadStatus('Upload failed: ' + error.message, 'error');
    }
}

// Show upload status
function showUploadStatus(message, type) {
    if (!elements.uploadStatus) return;
    
    elements.uploadStatus.textContent = message;
    elements.uploadStatus.className = `upload-status ${type}`;
    elements.uploadStatus.classList.remove('hidden');
}

// Update favorites map
export function updateFavoritesMap(favorites) {
    console.log('Updating favorites map with:', favorites.length);
    
    favoritesMap.clear();
    favorites.forEach(fav => {
        if (fav.image && fav.image.id) {
            favoritesMap.set(fav.image.id, fav.id);
        }
    });
}

// Update UI with favorites
export function updateUIWithFavorites() {
    console.log('Updating UI with favorites');
    
    // Update favorite buttons in all galleries
    const allFavoriteButtons = document.querySelectorAll('.favorite-btn');
    allFavoriteButtons.forEach(button => {
        const imageId = button.dataset.imageId;
        if (imageId && favoritesMap.has(imageId)) {
            button.textContent = '❤️ Favorite';
            button.classList.add('favorited');
        } else if (imageId) {
            button.textContent = '🤍 Favorite';
            button.classList.remove('favorited');
        }
    });
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

// Export functions
export { handleVoteOnCard, handleFavorite };