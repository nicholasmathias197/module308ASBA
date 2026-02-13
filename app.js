// app.js - Simplified version that works

// API Key and Base URL
const API_KEY = 'live_RnkhjTYAAxEOyE3Zo61n4bKiFNeiixpn19qJwrf2BO9mYTfKGGLl5ZnNJwSyeSA2';
const BASE_URL = 'https://api.thedogapi.com/v1';

// State management
const state = {
    currentSection: 'random',
    currentImages: [],
    currentBreeds: [],
    currentFavorites: [],
    currentUploadedImages: [],
    subId: localStorage.getItem('subId') || 'anonymous'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');
    initializeEventListeners();
    loadRandomDogs();
    loadBreeds();
    setupImagePreview();
});

// Set up all event listeners
function initializeEventListeners() {
    console.log('Setting up event listeners');
    
    // Navigation buttons
    document.getElementById('random-btn').addEventListener('click', () => switchSection('random'));
    document.getElementById('breeds-btn').addEventListener('click', () => switchSection('breeds'));
    document.getElementById('favorites-btn').addEventListener('click', () => switchSection('favorites'));
    document.getElementById('upload-btn').addEventListener('click', () => switchSection('upload'));
    
    // Random section
    document.getElementById('load-more-btn').addEventListener('click', loadRandomDogs);
    
    // Breeds section
    document.getElementById('search-breed-btn').addEventListener('click', searchBreeds);
    document.getElementById('breed-search').addEventListener('input', debounce(searchBreeds, 500));
    
    // Upload section
    document.getElementById('upload-form').addEventListener('submit', handleUpload);
    document.getElementById('refresh-uploads-btn').addEventListener('click', loadUploadedImages);
    
    // Error retry
    document.getElementById('retry-btn').addEventListener('click', () => {
        hideError();
        refreshCurrentSection();
    });
    
    // Modal buttons
    document.getElementById('modal-favorite-btn').addEventListener('click', handleModalFavorite);
    document.getElementById('modal-vote-up-btn').addEventListener('click', () => handleModalVote(1));
    document.getElementById('modal-vote-down-btn').addEventListener('click', () => handleModalVote(0));
    document.getElementById('modal-delete-btn').addEventListener('click', handleModalDelete);
    
    // Event delegation for dynamic buttons
    document.addEventListener('click', async (e) => {
        // Breed items
        if (e.target.closest('.breed-item')) {
            const breedItem = e.target.closest('.breed-item');
            const breedId = breedItem.dataset.breedId;
            await loadBreedImages(breedId);
        }
        
        // Favorite buttons
        if (e.target.closest('.favorite-btn')) {
            const btn = e.target.closest('.favorite-btn');
            const imageId = btn.dataset.imageId;
            await toggleFavorite(imageId);
        }
        
        // Delete buttons
        if (e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn');
            await deleteUploadedImage(btn.dataset.imageId);
        }
    });
}

// UI Helper Functions
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}

// Switch between sections
function switchSection(section) {
    console.log('Switching to section:', section);
    state.currentSection = section;
    
    // Update navigation buttons
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${section}-btn`).classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.remove('hidden');
}

// Refresh current section data
async function refreshCurrentSection() {
    switch (state.currentSection) {
        case 'random':
            await loadRandomDogs();
            break;
        case 'favorites':
            await loadFavorites();
            break;
        case 'upload':
            await loadUploadedImages();
            break;
    }
}

// API Functions
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load random dogs
async function loadRandomDogs() {
    try {
        showLoading();
        console.log('Loading random dogs...');
        const images = await fetchAPI('/images/search?limit=12&has_breeds=true');
        console.log('Loaded images:', images);
        state.currentImages = images;
        updateGallery('random-gallery', images);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Load all breeds
async function loadBreeds() {
    try {
        showLoading();
        console.log('Loading breeds...');
        const breeds = await fetchAPI('/breeds');
        console.log('Loaded breeds:', breeds.length);
        state.currentBreeds = breeds;
        updateBreedsList(breeds);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Search breeds
async function searchBreeds() {
    const query = document.getElementById('breed-search').value.trim();
    console.log('Searching breeds:', query);
    
    if (!query) {
        updateBreedsList(state.currentBreeds);
        return;
    }
    
    try {
        showLoading();
        const results = state.currentBreeds.filter(breed => 
            breed.name.toLowerCase().includes(query.toLowerCase())
        );
        updateBreedsList(results);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Load images for a specific breed
async function loadBreedImages(breedId) {
    try {
        showLoading();
        console.log('Loading breed images:', breedId);
        const breed = state.currentBreeds.find(b => b.id === breedId);
        const images = await fetchAPI(`/images/search?breed_ids=${breedId}&limit=12`);
        
        // Hide breeds list, show breed gallery
        document.getElementById('breeds-list').classList.add('hidden');
        document.getElementById('breed-gallery').classList.remove('hidden');
        
        const gallery = document.getElementById('breed-gallery');
        gallery.innerHTML = `
            <div class="breed-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h2>${breed.name}</h2>
                    <button class="back-to-breeds-btn btn btn-primary" onclick="backToBreeds()">← Back to Breeds</button>
                </div>
            </div>
            <div class="gallery-header">
                <h3>${breed.name} Gallery</h3>
                <div class="gallery-subtitle">${images.length} images found</div>
            </div>
        `;
        
        // Create gallery grid
        const galleryGrid = document.createElement('div');
        galleryGrid.className = 'gallery-grid';
        images.forEach(image => galleryGrid.appendChild(createDogCard(image)));
        gallery.appendChild(galleryGrid);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Back to breeds list
window.backToBreeds = function() {
    document.getElementById('breeds-list').classList.remove('hidden');
    document.getElementById('breed-gallery').classList.add('hidden');
};

// Handle image upload
async function handleUpload(e) {
    e.preventDefault();
    console.log('Handling upload...');
    
    const fileInput = document.getElementById('dog-image');
    const subIdInput = document.getElementById('sub-id');
    
    if (!fileInput.files[0]) {
        showUploadStatus('Please select an image to upload', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('sub_id', subIdInput.value.trim() || 'anonymous');
    
    try {
        showLoading();
        const response = await fetch(`${BASE_URL}/images/upload`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        showUploadStatus('Image uploaded successfully!', 'success');
        
        // Reset form
        document.getElementById('upload-form').reset();
        document.getElementById('upload-preview').innerHTML = '';
        
        // Refresh uploaded images
        await loadUploadedImages();
    } catch (error) {
        showUploadStatus(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Load uploaded images
async function loadUploadedImages() {
    try {
        showLoading();
        console.log('Loading uploaded images...');
        const images = await fetchAPI(`/images?limit=20&sub_id=${state.subId}`);
        console.log('Uploaded images:', images);
        state.currentUploadedImages = images;
        updateGallery('upload-gallery', images, true);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Delete uploaded image
async function deleteUploadedImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }
    
    try {
        showLoading();
        const response = await fetch(`${BASE_URL}/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'x-api-key': API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error('Delete failed');
        }
        
        await loadUploadedImages();
        showUploadStatus('Image deleted successfully', 'success');
        
        // Close modal if open
        const modal = bootstrap.Modal.getInstance(document.getElementById('image-modal'));
        if (modal) modal.hide();
    } catch (error) {
        showUploadStatus(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Load favorites
async function loadFavorites() {
    try {
        showLoading();
        console.log('Loading favorites...');
        const favorites = await fetchAPI('/favourites');
        console.log('Favorites:', favorites);
        state.currentFavorites = favorites;
        
        // Extract image data from favorites
        const images = favorites.map(fav => fav.image).filter(img => img);
        updateGallery('favorites-gallery', images);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Toggle favorite
async function toggleFavorite(imageId) {
    try {
        // Check if already favorited
        const existingFav = state.currentFavorites.find(fav => fav.image_id === imageId);
        
        if (existingFav) {
            await fetchAPI(`/favourites/${existingFav.id}`, {
                method: 'DELETE'
            });
        } else {
            await fetchAPI('/favourites', {
                method: 'POST',
                body: JSON.stringify({
                    image_id: imageId
                })
            });
        }
        
        // Refresh favorites
        await loadFavorites();
    } catch (error) {
        showError(error.message);
    }
}

// Handle modal favorite button
async function handleModalFavorite(e) {
    const imageId = e.target.dataset.imageId || e.target.closest('button').dataset.imageId;
    await toggleFavorite(imageId);
}

// Handle modal vote buttons
async function handleModalVote(value) {
    const imageId = e.target.dataset.imageId || e.target.closest('button').dataset.imageId;
    await voteOnImage(imageId, value);
}

// Handle modal delete button
async function handleModalDelete(e) {
    const imageId = e.target.dataset.imageId || e.target.closest('button').dataset.imageId;
    await deleteUploadedImage(imageId);
}

// Vote on image
async function voteOnImage(imageId, value) {
    try {
        await fetchAPI('/votes', {
            method: 'POST',
            body: JSON.stringify({
                image_id: imageId,
                value: value
            })
        });
        showUploadStatus('Vote recorded!', 'success');
    } catch (error) {
        showError(error.message);
    }
}

// UI Creation Functions
function createDogCard(image, isUploaded = false) {
    const col = document.createElement('div');
    col.className = 'dog-card';
    
    const breed = image.breeds && image.breeds[0];
    const breedName = breed ? breed.name : 'Unknown Breed';
    const temperament = breed ? (breed.temperament || 'No temperament info') : 'No breed info';
    
    col.innerHTML = `
        <img src="${image.url}" class="dog-image" alt="${breedName}" loading="lazy">
        <div class="dog-info">
            <div class="dog-breed">${breedName}</div>
            <div class="dog-temperament">${temperament.substring(0, 100)}${temperament.length > 100 ? '...' : ''}</div>
            <div class="dog-actions">
                <button class="btn-favorite favorite-btn" data-image-id="${image.id}">
                    <i class="bi bi-heart"></i> Favorite
                </button>
                ${isUploaded ? `<button class="btn-delete delete-btn" data-image-id="${image.id}">
                    <i class="bi bi-trash"></i> Delete
                </button>` : ''}
            </div>
        </div>
    `;
    
    // Add click event to open modal
    col.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            openModal(image, isUploaded);
        }
    });
    
    return col;
}

function createBreedItem(breed) {
    const div = document.createElement('div');
    div.className = 'breed-item';
    div.dataset.breedId = breed.id;
    
    div.innerHTML = `
        <div class="breed-name">${breed.name}</div>
        <div class="breed-temperament">${breed.temperament ? breed.temperament.substring(0, 50) + '...' : 'No temperament info'}</div>
        <div class="breed-meta">
            ${breed.life_span ? `<span>Life: ${breed.life_span}</span>` : ''}
            ${breed.weight?.metric ? `<span>Weight: ${breed.weight.metric} kg</span>` : ''}
        </div>
    `;
    
    return div;
}

function updateGallery(containerId, images, isUploaded = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!images || images.length === 0) {
        container.innerHTML = '<div class="no-results">No dogs found!</div>';
        return;
    }
    
    images.forEach(image => {
        container.appendChild(createDogCard(image, isUploaded));
    });
}

function updateBreedsList(breeds) {
    const container = document.getElementById('breeds-list');
    container.innerHTML = '';
    
    if (!breeds || breeds.length === 0) {
        container.innerHTML = '<div class="no-results">No breeds found!</div>';
        return;
    }
    
    breeds.forEach(breed => {
        container.appendChild(createBreedItem(breed));
    });
}

function showUploadStatus(message, type = 'info') {
    const statusDiv = document.getElementById('upload-status');
    statusDiv.textContent = message;
    statusDiv.className = `upload-status ${type}`;
    statusDiv.classList.remove('hidden');
    
    // Hide after 3 seconds for success/info messages
    if (type !== 'error') {
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 3000);
    }
}

function setupImagePreview() {
    const fileInput = document.getElementById('dog-image');
    const previewDiv = document.getElementById('upload-preview');
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewDiv.innerHTML = `<img src="${e.target.result}" class="preview-image" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            previewDiv.innerHTML = '';
        }
    });
}

async function openModal(image, isUploaded = false) {
    const modal = new bootstrap.Modal(document.getElementById('image-modal'));
    const modalImage = document.getElementById('modal-image');
    const modalBreed = document.getElementById('modal-breed');
    const modalDescription = document.getElementById('modal-description');
    const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
    const modalDeleteBtn = document.getElementById('modal-delete-btn');
    
    modalImage.src = image.url;
    
    const breed = image.breeds && image.breeds[0];
    if (breed) {
        modalBreed.textContent = breed.name;
        modalDescription.innerHTML = `
            <strong>Temperament:</strong> ${breed.temperament || 'Not available'}<br>
            <strong>Life Span:</strong> ${breed.life_span || 'Not available'}<br>
            <strong>Weight:</strong> ${breed.weight?.metric || 'Not available'} kg<br>
            <strong>Height:</strong> ${breed.height?.metric || 'Not available'} cm
        `;
    } else {
        modalBreed.textContent = 'Unknown Breed';
        modalDescription.textContent = 'No breed information available';
    }
    
    // Show/hide delete button for uploaded images
    if (isUploaded) {
        modalDeleteBtn.classList.remove('hidden');
        modalDeleteBtn.dataset.imageId = image.id;
    } else {
        modalDeleteBtn.classList.add('hidden');
    }
    
    // Set up favorite button
    modalFavoriteBtn.dataset.imageId = image.id;
    
    // Set up vote buttons
    document.getElementById('modal-vote-up-btn').dataset.imageId = image.id;
    document.getElementById('modal-vote-down-btn').dataset.imageId = image.id;
    
    modal.show();
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}