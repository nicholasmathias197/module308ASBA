// UI manipulation functions

// Show/hide sections
export function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section-card');
    sections.forEach(section => section.classList.add('hidden'));

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Update nav active state
    const navButtons = document.querySelectorAll('.nav-link');
    navButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(sectionId.replace('-section', '-btn'));
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Show loading spinner
export function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

// Hide loading spinner
export function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// Show error message
export function showError(message) {
    const errorDiv = document.getElementById('error');
    document.getElementById('error-message').textContent = message;
    errorDiv.classList.remove('hidden');
}

// Hide error message
export function hideError() {
    document.getElementById('error').classList.add('hidden');
}

// Create dog card element
export function createDogCard(dog) {
    const card = document.createElement('div');
    card.className = 'dog-card';
    card.dataset.imageId = dog.id;

    const img = document.createElement('img');
    img.className = 'dog-image';
    img.src = dog.url;
    img.alt = dog.breeds && dog.breeds.length > 0 ? dog.breeds[0].name : 'Dog';
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'dog-info';

    const breed = document.createElement('div');
    breed.className = 'dog-breed';
    breed.textContent = dog.breeds && dog.breeds.length > 0 ? dog.breeds[0].name : 'Unknown Breed';

    const temperament = document.createElement('div');
    temperament.className = 'dog-temperament';
    if (dog.breeds && dog.breeds.length > 0 && dog.breeds[0].temperament) {
        temperament.textContent = dog.breeds[0].temperament;
    } else {
        temperament.textContent = 'No temperament info';
    }

    info.appendChild(breed);
    info.appendChild(temperament);

    card.appendChild(img);
    card.appendChild(info);

    // Add click event to open modal
    card.addEventListener('click', () => openModal(dog));

    return card;
}

// Create breed list item
export function createBreedItem(breed) {
    const item = document.createElement('div');
    item.className = 'breed-item';
    item.dataset.breedId = breed.id;
    item.textContent = breed.name;

    item.addEventListener('click', () => {
        // Hide breeds list and show gallery
        document.getElementById('breeds-list').classList.add('hidden');
        document.getElementById('breed-gallery').classList.remove('hidden');
        // Load images for this breed
        const event = new CustomEvent('loadBreedImages', { detail: { breedId: breed.id, breedName: breed.name } });
        document.dispatchEvent(event);
    });

    return item;
}

// Open modal with dog details
function openModal(dog) {
    const modal = new bootstrap.Modal(document.getElementById('image-modal'));
    const modalImage = document.getElementById('modal-image');
    const modalBreed = document.getElementById('modal-breed');
    const modalDescription = document.getElementById('modal-description');

    modalImage.src = dog.url;
    modalBreed.textContent = dog.breeds && dog.breeds.length > 0 ? dog.breeds[0].name : 'Unknown Breed';
    modalDescription.textContent = dog.breeds && dog.breeds.length > 0 && dog.breeds[0].temperament
        ? dog.breeds[0].temperament
        : 'No description available';

    // Store current dog data for actions
    document.getElementById('image-modal').dataset.currentDog = JSON.stringify(dog);

    modal.show();
}

// Clear gallery
export function clearGallery(galleryId) {
    const gallery = document.getElementById(galleryId);
    if (gallery) {
        gallery.innerHTML = '';
    }
}

// Add cards to gallery
export function addCardsToGallery(galleryId, cards) {
    const gallery = document.getElementById(galleryId);
    if (gallery) {
        cards.forEach(card => gallery.appendChild(card));
    }
}

// Show upload status
export function showUploadStatus(message, isSuccess = true) {
    const statusDiv = document.getElementById('upload-status');
    statusDiv.textContent = message;
    statusDiv.className = `upload-status mt-3 ${isSuccess ? 'text-success' : 'text-danger'}`;
    statusDiv.classList.remove('hidden');

    // Hide after 5 seconds
    setTimeout(() => {
        statusDiv.classList.add('hidden');
    }, 5000);
}

// Update upload preview
export function updateUploadPreview(file) {
    const preview = document.getElementById('upload-preview');
    preview.innerHTML = '';

    if (file) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'img-fluid rounded';
        img.style.maxHeight = '200px';
        preview.appendChild(img);
    }
}