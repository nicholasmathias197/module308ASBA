// UI elements
let breedsGrid;
let loadingEl;
let errorEl;
let errorMessage;
let noResultsEl;
let noFavoritesEl;
let searchInput;
let searchBtn;
let clearBtn;
let sizeFilter;
let sortFilter;
let resetFiltersBtn;
let favoritesCountEl;
let favoritesTotalEl;
let loadMoreBtn;
let loadingMessage;
let breedCountEl;

// Initialize UI
export function initUI() {
    breedsGrid = document.getElementById('breeds-grid');
    loadingEl = document.getElementById('loading');
    errorEl = document.getElementById('error');
    errorMessage = document.getElementById('error-message');
    noResultsEl = document.getElementById('no-results');
    noFavoritesEl = document.getElementById('no-favorites');
    searchInput = document.getElementById('search-input');
    searchBtn = document.getElementById('search-btn');
    clearBtn = document.getElementById('clear-btn');
    sizeFilter = document.getElementById('size-filter');
    sortFilter = document.getElementById('sort-filter');
    resetFiltersBtn = document.getElementById('reset-filters');
    favoritesCountEl = document.getElementById('favorites-count');
    favoritesTotalEl = document.getElementById('favorites-total');
    loadMoreBtn = document.getElementById('load-more-btn');
    loadingMessage = document.getElementById('loading-message');
    breedCountEl = document.getElementById('breed-count');
}

// Show loading
export function showLoading(message = 'Loading breeds...') {
    if (loadingEl) {
        if (loadingMessage) loadingMessage.textContent = message;
        loadingEl.style.display = 'block';
    }
    if (breedsGrid) breedsGrid.style.innerHTML = '';
}

// Hide loading
export function hideLoading() {
    if (loadingEl) loadingEl.style.display = 'none';
}

// Show error
export function showError(message) {
    if (errorEl && errorMessage) {
        errorMessage.textContent = message;
        errorEl.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }
}

// Show no results
export function showNoResults() {
    if (noResultsEl) {
        noResultsEl.style.display = 'block';
        if (breedsGrid) breedsGrid.innerHTML = '';
    }
    hideLoadMore();
}

// Hide no results
export function hideNoResults() {
    if (noResultsEl) noResultsEl.style.display = 'none';
}

// Show no favorites
export function showNoFavorites() {
    if (noFavoritesEl) noFavoritesEl.style.display = 'block';
    if (breedsGrid) breedsGrid.innerHTML = '';
}

// Hide no favorites
export function hideNoFavorites() {
    if (noFavoritesEl) noFavoritesEl.style.display = 'none';
}

// Show load more button
export function showLoadMore() {
    if (loadMoreBtn) loadMoreBtn.style.display = 'inline-block';
}

// Hide load more button
export function hideLoadMore() {
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
}

// Update breed count
export function updateBreedCount(count) {
    if (breedCountEl) {
        breedCountEl.textContent = count;
    }
}

// Display breeds
export function displayBreeds(breeds, favorites = []) {
    if (!breedsGrid) return;
    
    if (!breeds || breeds.length === 0) {
        showNoResults();
        return;
    }
    
    hideNoResults();
    
    breedsGrid.innerHTML = breeds.map(breed => createBreedCard(breed, favorites)).join('');
    
    // Attach favorite button listeners
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const breedId = btn.dataset.breedId;
            const breedName = btn.dataset.breedName;
            const imageUrl = btn.dataset.imageUrl;
            
            // Add pulse animation
            btn.classList.add('favorite-pulse');
            setTimeout(() => btn.classList.remove('favorite-pulse'), 400);
            
            // Dispatch custom event
            const event = new CustomEvent('favoriteClick', {
                detail: { breedId, breedName, imageUrl, element: btn }
            });
            document.dispatchEvent(event);
        });
    });
    
    // Attach card click listeners
    document.querySelectorAll('.breed-card').forEach(card => {
        card.addEventListener('click', () => {
            const breedId = card.dataset.breedId;
            const breed = breeds.find(b => b.id == breedId);
            if (breed) {
                showBreedDetails(breed);
            }
        });
    });
}

// Create breed card
function createBreedCard(breed, favorites) {
    const breedId = breed.id.toString();
    const isFav = favorites.some(f => f.breedId === breedId);
    const imageUrl = breed.image?.url || `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`;
    const weight = breed.weight?.metric || 'Unknown';
    const lifeSpan = breed.life_span || 'Unknown';
    
    // Get first 3 temperaments
    let temperaments = [];
    if (breed.temperament) {
        temperaments = breed.temperament.split(',').slice(0, 3).map(t => t.trim());
    }
    
    return `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="card breed-card" data-breed-id="${breed.id}">
                <div class="breed-image-container">
                    <img src="${imageUrl}" 
                         class="breed-image" 
                         alt="${breed.name}"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(breed.name)}'">
                    <div class="favorite-btn ${isFav ? 'active' : ''}" 
                         data-breed-id="${breed.id}"
                         data-breed-name="${breed.name}"
                         data-image-url="${imageUrl}">
                        <i class="fa${isFav ? 's' : 'r'} fa-heart"></i>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${breed.name}</h5>
                    <div class="breed-stats mb-2">
                        <small><i class="fas fa-weight me-1"></i> ${weight} kg</small>
                        <small class="ms-3"><i class="fas fa-clock me-1"></i> ${lifeSpan}</small>
                    </div>
                    ${temperaments.length > 0 ? `
                        <div class="temperament-container">
                            ${temperaments.map(t => `<span class="temperament-badge">${t}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Display favorites
export function displayFavorites(favoritesList) {
    if (!breedsGrid) return;
    
    if (!favoritesList || favoritesList.length === 0) {
        showNoFavorites();
        if (favoritesTotalEl) favoritesTotalEl.textContent = '0';
        return;
    }
    
    hideNoFavorites();
    
    if (favoritesTotalEl) {
        favoritesTotalEl.textContent = favoritesList.length;
    }
    
    breedsGrid.innerHTML = favoritesList.map(fav => createFavoriteCard(fav)).join('');
    
    // Attach remove button listeners
    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const breedId = btn.dataset.breedId;
            
            // Add pulse animation
            btn.classList.add('favorite-pulse');
            setTimeout(() => btn.classList.remove('favorite-pulse'), 400);
            
            // Dispatch remove event
            const event = new CustomEvent('removeFavorite', {
                detail: { breedId }
            });
            document.dispatchEvent(event);
        });
    });
    
    // Attach card click listeners
    document.querySelectorAll('.breed-card').forEach(card => {
        card.addEventListener('click', () => {
            const breedId = card.dataset.breedId;
            const fav = favoritesList.find(f => f.breedId === breedId);
            if (fav) {
                showFavoriteDetails(fav);
            }
        });
    });
}

// Create favorite card
function createFavoriteCard(fav) {
    const dateAdded = new Date(fav.dateAdded).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    return `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="card breed-card favorite-card" data-breed-id="${fav.breedId}">
                <div class="breed-image-container">
                    <img src="${fav.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                         class="breed-image" 
                         alt="${fav.breedName}"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(fav.breedName)}'">
                    <div class="remove-favorite-btn" data-breed-id="${fav.breedId}">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${fav.breedName}</h5>
                    <p class="favorite-date mb-0">
                        <i class="far fa-calendar-alt me-1"></i>
                        Added: ${dateAdded}
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Show breed details in alert (simple version)
export function showBreedDetails(breed) {
    const temperaments = breed.temperament ? breed.temperament.split(',').map(t => t.trim()) : [];
    
    alert(`
🐕 ${breed.name}

📊 Statistics:
• Weight: ${breed.weight?.metric || 'Unknown'} kg
• Height: ${breed.height?.metric || 'Unknown'} cm
• Life Span: ${breed.life_span || 'Unknown'}

🎯 Bred For: ${breed.bred_for || 'Not specified'}
📋 Group: ${breed.breed_group || 'Not specified'}

🧠 Temperament:
${temperaments.map(t => `  • ${t}`).join('\n')}
    `);
}

// Show favorite details
export function showFavoriteDetails(fav) {
    const dateAdded = new Date(fav.dateAdded).toLocaleString();
    
    alert(`
❤️ ${fav.breedName}

📅 Added to favorites on:
${dateAdded}

Click the heart button to remove from favorites.
    `);
}

// Get filter values
export function getFilters() {
    return {
        size: sizeFilter?.value || '',
        sort: sortFilter?.value || 'name'
    };
}

// Get search query
export function getSearchQuery() {
    return searchInput?.value || '';
}

// Clear search
export function clearSearch() {
    if (searchInput) searchInput.value = '';
}

// Update favorites count
export function updateFavoritesCount(count) {
    if (favoritesCountEl) {
        favoritesCountEl.textContent = count;
        
        // Hide badge if 0
        if (count === 0) {
            favoritesCountEl.classList.add('d-none');
        } else {
            favoritesCountEl.classList.remove('d-none');
        }
    }
}

// Show message (toast)
export function showMessage(message, type = 'info') {
    // Create toast container if needed
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>
            ${message}
        </div>
    `;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add event listeners
export function addEventListeners(handlers) {
    if (searchBtn) searchBtn.addEventListener('click', handlers.onSearch);
    if (clearBtn) clearBtn.addEventListener('click', handlers.onClear);
    if (sizeFilter) sizeFilter.addEventListener('change', handlers.onFilter);
    if (sortFilter) sortFilter.addEventListener('change', handlers.onFilter);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', handlers.onReset);
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', handlers.onLoadMore);
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handlers.onSearch();
        });
    }
}