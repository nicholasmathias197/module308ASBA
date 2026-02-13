// ui.js
import { addToFavorites, removeFromFavorites, voteOnImage, uploadImage, getUserUploads, deleteUpload } from './api.js';

const elements = {
    navButtons: document.querySelectorAll('.nav-btn'),
    sections: document.querySelectorAll('.section'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn'),
    randomGallery: document.getElementById('random-gallery'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    voteUpBtn: document.getElementById('vote-up-btn'),
    voteDownBtn: document.getElementById('vote-down-btn'),
    breedsSection: document.getElementById('breeds-section'),
    breedSearch: document.getElementById('breed-search'),
    searchBreedBtn: document.getElementById('search-breed-btn'),
    breedsList: document.getElementById('breeds-list'),
    breedGallery: document.getElementById('breed-gallery'),
    favoritesGallery: document.getElementById('favorites-gallery'),
    uploadSection: document.getElementById('upload-section'),
    uploadForm: document.getElementById('upload-form'),
    uploadStatus: document.getElementById('upload-status'),
    uploadPreview: document.getElementById('upload-preview'),
    uploadGallery: document.getElementById('upload-gallery'),
    refreshUploadsBtn: document.getElementById('refresh-uploads-btn'),
    modal: document.getElementById('image-modal'),
    modalImage: document.getElementById('modal-image'),
    modalBreed: document.getElementById('modal-breed'),
    modalDescription: document.getElementById('modal-description'),
    modalFavoriteBtn: document.getElementById('modal-favorite-btn'),
    modalVoteUpBtn: document.getElementById('modal-vote-up-btn'),
    modalVoteDownBtn: document.getElementById('modal-vote-down-btn'),
    modalDeleteBtn: document.getElementById('modal-delete-btn'),
    closeModal: document.getElementById('close-modal')
};

let currentSection = 'random';
let currentImages = [];
let currentBreedId = null;
let favoritesMap = new Map();
let currentUploads = [];

export function initUI() {
    console.log('UI initializing...');
    setupEventListeners();
    showSection('random');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');

    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', () => {
            console.log('Load more clicked');
            if (window.loadRandomDogs) {
                window.loadRandomDogs();
            }
        });
    }

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

    if (elements.uploadForm) {
        elements.uploadForm.addEventListener('submit', handleUpload);
        const fileInput = elements.uploadForm.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
    }

    if (elements.refreshUploadsBtn) {
        elements.refreshUploadsBtn.addEventListener('click', () => {
            console.log('Refresh uploads clicked');
            loadUserUploads();
        });
    }

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

    if (elements.modalFavoriteBtn) {
        elements.modalFavoriteBtn.addEventListener('click', () => handleModalFavorite());
    }

    if (elements.modalVoteUpBtn) {
        elements.modalVoteUpBtn.addEventListener('click', () => handleModalVote(1));
    }

    if (elements.modalVoteDownBtn) {
        elements.modalVoteDownBtn.addEventListener('click', () => handleModalVote(0));
    }

    if (elements.modalDeleteBtn) {
        elements.modalDeleteBtn.addEventListener('click', () => handleModalDelete());
    }

    if (elements.retryBtn) {
        elements.retryBtn.addEventListener('click', () => {
            console.log('Retry clicked');
            if (window.loadRandomDogs) {
                window.loadRandomDogs();
            }
        });
    }
}

export function showLoading() {
    if (elements.loading) {
        elements.loading.classList.remove('hidden');
    }
    if (elements.error) {
        elements.error.classList.add('hidden');
    }
}

export function hideLoading() {
    if (elements.loading) {
        elements.loading.classList.add('hidden');
    }
}

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

export function hideError() {
    if (elements.error) {
        elements.error.classList.add('hidden');
    }
}

export function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    currentSection = sectionName;

    elements.navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`${sectionName}-btn`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    elements.sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }

    if (sectionName === 'upload') {
        loadUserUploads();
    }
}

export function renderDogGallery(images, galleryElement, showActions = true, showDelete = false) {
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
            const dogCard = createDogCard(image, showActions, showDelete);
            galleryElement.appendChild(dogCard);
        }
    });
}

function createDogCard(image, showActions = true, showDelete = false) {
    const card = document.createElement('div');
    card.className = 'dog-card';
    card.dataset.imageId = image.id;

    const breedName = image.breeds && image.breeds.length > 0 ? image.breeds[0].name : 'Unknown Breed';
    const breedTemperament = image.breeds && image.breeds.length > 0 ? image.breeds[0].temperament : '';
    const isFavorited = favoritesMap.has(image.id);

    let actionsHtml = '';
    
    if (showActions) {
        actionsHtml = `
            <div class="dog-actions">
                <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-image-id="${image.id}">
                    ${isFavorited ? '❤️' : '🤍'} Favorite
                </button>
                <button class="vote-btn" data-action="upvote" data-image-id="${image.id}">👍 Up</button>
                <button class="vote-btn" data-action="downvote" data-image-id="${image.id}">👎 Down</button>
            </div>
        `;
    }
    
    if (showDelete) {
        actionsHtml = `
            <div class="dog-actions">
                <button class="delete-btn" data-image-id="${image.id}">🗑️ Delete</button>
            </div>
        `;
    }

    card.innerHTML = `
        <img src="${image.url}" alt="${breedName}" class="dog-image" loading="lazy">
        <div class="dog-info">
            <div class="dog-breed">${breedName}</div>
            ${breedTemperament ? `<div class="dog-temperament">${breedTemperament.substring(0, 60)}...</div>` : ''}
            ${actionsHtml}
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.matches('button')) {
            console.log('Card clicked:', image.id);
            openModal(image, showDelete);
        }
    });

    if (showActions) {
        const favoriteBtn = card.querySelector('.favorite-btn');
        const voteBtns = card.querySelectorAll('.vote-btn');

        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Favorite clicked:', image.id);
                handleFavorite(image.id, favoriteBtn);
            });
        }

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

    if (showDelete) {
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Delete clicked:', image.id);
                handleDelete(image.id);
            });
        }
    }

    return card;
}

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

export function showBreedGallery(images, breedData) {
    console.log('Showing breed gallery for:', breedData.name, 'with', images.length, 'images');
    
    if (elements.breedGallery) {
        elements.breedGallery.classList.remove('hidden');
        elements.breedGallery.innerHTML = '';
        
        const existingHeader = document.querySelector('.breed-gallery-header');
        if (existingHeader) {
            existingHeader.remove();
        }
        
        const breedInfoSection = document.createElement('div');
        breedInfoSection.className = 'breed-info-section';
        
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
        
        elements.breedGallery.parentNode.insertBefore(breedInfoSection, elements.breedGallery);
        
        const backBtn = breedInfoSection.querySelector('.back-to-breeds-btn');
        backBtn.addEventListener('click', () => {
            breedInfoSection.remove();
            elements.breedGallery.classList.add('hidden');
            elements.breedGallery.innerHTML = '';
        });
        
        const processedImages = images.map(image => {
            if (!image.breeds || image.breeds.length === 0) {
                return {
                    ...image,
                    breeds: [breedData]
                };
            }
            return image;
        });
        
        renderDogGallery(processedImages, elements.breedGallery, true, false);
        
        elements.breedGallery.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (elements.uploadPreview) {
                elements.uploadPreview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="preview-image">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

async function handleUpload(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const file = formData.get('file');

    if (!file) {
        showUploadStatus('Please select a file to upload.', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showUploadStatus('File too large. Maximum size is 10MB.', 'error');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showUploadStatus('Please upload an image file.', 'error');
        return;
    }

    try {
        console.log('Uploading file:', file.name);
        
        showUploadStatus('Uploading...', 'info');
        
        const result = await uploadImage(formData);
        console.log('Upload result:', result);

        if (result.approved === 1) {
            showUploadStatus('Upload successful! Your dog photo has been approved.', 'success');
        } else {
            showUploadStatus('Upload submitted! It may take a moment to be reviewed.', 'success');
        }

        e.target.reset();
        if (elements.uploadPreview) {
            elements.uploadPreview.innerHTML = '';
        }
        
        setTimeout(() => {
            loadUserUploads();
        }, 2000);

    } catch (error) {
        console.error('Upload failed:', error);
        showUploadStatus('Upload failed: ' + error.message, 'error');
    }
}

function showUploadStatus(message, type) {
    if (!elements.uploadStatus) return;
    
    elements.uploadStatus.textContent = message;
    elements.uploadStatus.className = `upload-status ${type}`;
    elements.uploadStatus.classList.remove('hidden');
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            elements.uploadStatus.classList.add('hidden');
        }, 5000);
    }
}

async function loadUserUploads() {
    try {
        console.log('Loading user uploads...');
        showLoading();
        
        const uploads = await getUserUploads(20);
        console.log('User uploads loaded:', uploads.length);
        
        currentUploads = uploads;
        
        if (elements.uploadGallery) {
            if (uploads.length === 0) {
                elements.uploadGallery.innerHTML = '<p class="no-results">No uploads yet. Upload your first dog photo!</p>';
            } else {
                renderDogGallery(uploads, elements.uploadGallery, false, true);
            }
        }
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load user uploads:', error);
        showError('Failed to load your uploads: ' + error.message);
        hideLoading();
    }
}

async function handleDelete(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }
    
    try {
        console.log('Deleting image:', imageId);
        showLoading();
        
        await deleteUpload(imageId);
        console.log('Image deleted successfully');
        
        showTemporaryMessage('Image deleted successfully!');
        
        await loadUserUploads();
        
        hideLoading();
    } catch (error) {
        console.error('Failed to delete image:', error);
        showError('Failed to delete image: ' + error.message);
        hideLoading();
    }
}

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
        
        updateAllFavoriteButtons(imageId);
        
    } catch (error) {
        console.error('Failed to update favorite:', error);
        showError('Failed to update favorite: ' + error.message);
    }
}

function updateAllFavoriteButtons(imageId) {
    const isFavorited = favoritesMap.has(imageId);
    const allButtons = document.querySelectorAll(`.favorite-btn[data-image-id="${imageId}"]`);
    
    allButtons.forEach(button => {
        button.textContent = isFavorited ? '❤️ Favorite' : '🤍 Favorite';
        button.classList.toggle('favorited', isFavorited);
    });
}

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

async function handleVote(value) {
    if (currentImages.length === 0) {
        showError('No images to vote on. Load some dogs first!');
        return;
    }

    try {
        console.log('Voting on first image:', currentImages[0].id, 'value:', value);
        await voteOnImage(currentImages[0].id, value);
        showTemporaryMessage(value === 1 ? 'Upvote recorded! 👍' : 'Downvote recorded! 👎');
    } catch (error) {
        console.error('Failed to vote:', error);
        showError('Failed to vote: ' + error.message);
    }
}

function showTemporaryMessage(message) {
    showError(message);
    setTimeout(() => hideError(), 2000);
}

async function handleModalFavorite() {
    if (!elements.modalImage || !elements.modalFavoriteBtn) return;
    
    const imageId = elements.modalImage.dataset.imageId;
    const button = elements.modalFavoriteBtn;

    if (imageId) {
        await handleFavorite(imageId, button);
    }
}

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

async function handleModalDelete() {
    if (!elements.modalImage) return;
    
    const imageId = elements.modalImage.dataset.imageId;
    
    closeModal();
    
    setTimeout(() => {
        handleDelete(imageId);
    }, 300);
}

function openModal(image, showDelete = false) {
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
    
    if (elements.modalDeleteBtn) {
        if (showDelete) {
            elements.modalDeleteBtn.classList.remove('hidden');
        } else {
            elements.modalDeleteBtn.classList.add('hidden');
        }
    }

    elements.modal.classList.remove('hidden');
}

function closeModal() {
    if (elements.modal) {
        elements.modal.classList.add('hidden');
    }
}

export function updateFavoritesMap(favorites) {
    console.log('Updating favorites map with:', favorites.length);
    
    favoritesMap.clear();
    favorites.forEach(fav => {
        if (fav.image && fav.image.id) {
            favoritesMap.set(fav.image.id, fav.id);
        }
    });
}

export function updateUIWithFavorites() {
    console.log('Updating UI with favorites');
    
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

export function getCurrentSection() {
    return currentSection;
}

export function getCurrentBreedId() {
    return currentBreedId;
}

export function setCurrentBreedId(breedId) {
    currentBreedId = breedId;
}

export { handleVoteOnCard, handleFavorite };