// modules/utils.js

// Store favorites in localStorage as backup
const FAVORITES_KEY = 'dogGalleryFavorites';

// Save favorite to localStorage
export function saveFavoriteToLocal(imageId, favoriteId) {
    const favorites = getLocalFavorites();
    favorites[imageId] = favoriteId;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Remove favorite from localStorage
export function removeFavoriteFromLocal(imageId) {
    const favorites = getLocalFavorites();
    delete favorites[imageId];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Get all local favorites
export function getLocalFavorites() {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : {};
}

// Check if image is favorited locally
export function isFavoritedLocally(imageId) {
    const favorites = getLocalFavorites();
    return !!favorites[imageId];
}

// Debounce function for search input
export function debounce(func, wait) {
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

// Format date for display
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Get breed group from breed object
export function getBreedGroup(breed) {
    return breed.breed_group || 'Not specified';
}

// Get breed weight range
export function getWeightRange(breed) {
    return breed.weight?.metric || 'Unknown';
}

// Get breed height range
export function getHeightRange(breed) {
    return breed.height?.metric || 'Unknown';
}

// Validate file before upload
export function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
        return { valid: false, message: 'Please upload a valid image file (JPEG, PNG, GIF, or WEBP)' };
    }
    
    if (file.size > maxSize) {
        return { valid: false, message: 'File size must be less than 10MB' };
    }
    
    return { valid: true };
}

// Create a unique ID for local use
export function generateLocalId() {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Handle API errors
export function handleApiError(error) {
    console.error('API Error:', error);
    
    if (error.message.includes('429')) {
        return 'Too many requests. Please wait a moment and try again.';
    } else if (error.message.includes('404')) {
        return 'The requested resource was not found.';
    } else if (error.message.includes('500')) {
        return 'Server error. Please try again later.';
    } else {
        return error.message || 'An unexpected error occurred. Please try again.';
    }
}