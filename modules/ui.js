// modules/ui.js
import { voteOnImage, favoriteImage, unfavoriteImage, getFavorites } from './api.js';

// Show/hide loading spinner
export function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

export function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// Show/hide error message
export function showError(message) {
    const errorDiv = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorDiv.classList.remove('hidden');
}

export function hideError() {
    document.getElementById('error').classList.add('hidden');
}

// Create a dog card element
export function createDogCard(image, isUploaded = false) {
    const col = document.createElement('div');
    col.className = 'dog-card';
    
    const breed = image.breeds && image.breeds[0];
    const breedName = breed ? breed.name : 'Unknown Breed';
    const temperament = breed ? breed.temperament || 'No temperament info' : 'No breed info';
    
    col.innerHTML = `
        <img src="${image.url}" class="dog-image" alt="${breedName}" loading="lazy">
        <div class="dog-info">
            <div class="dog-breed">${breedName}</div>
            <div class="dog-temperament">${temperament.substring(0, 100)}${temperament.length > 100 ? '...' : ''}</div>
            <div class="dog-actions">
                <button class="btn-favorite ${isUploaded ? '' : 'favorite-btn'}" data-image-id="${image.id}">
                    <i class="bi bi-heart"></i> Favorite
                </button>
                <button class="btn-vote vote-up-btn" data-image-id="${image.id}" data-vote="1">
                    <i class="bi bi-hand-thumbs-up"></i>
                </button>
                <button class="btn-vote vote-down-btn" data-image-id="${image.id}" data-vote="0">
                    <i class="bi bi-hand-thumbs-down"></i>
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

// Create breed item element
export function createBreedItem(breed) {
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

// Open image modal
export async function openModal(image, isUploaded = false) {
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

// Update gallery
export function updateGallery(containerId, images, isUploaded = false) {
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

// Update breeds list
export function updateBreedsList(breeds) {
    const container = document.getElementById('breeds-list');
    container.innerHTML = '';
    
    breeds.forEach(breed => {
        container.appendChild(createBreedItem(breed));
    });
}

// Show upload status
export function showUploadStatus(message, type = 'info') {
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

// Show image preview for upload
export function setupImagePreview() {
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