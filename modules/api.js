// modules/api.js
const API_KEY = 'live_RnkhjTYAAxEOyE3Zo61n4bKiFNeiixpn19qJwrf2BO9mYTfKGGLl5ZnNJwSyeSA2';
const BASE_URL = 'https://api.thedogapi.com/v1';

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
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
}

// Get random dog images
export async function getRandomDogs(limit = 12) {
    return await fetchAPI(`/images/search?limit=${limit}&has_breeds=true`);
}

// Get all breeds
export async function getBreeds() {
    return await fetchAPI('/breeds');
}

// Get images by breed ID
export async function getImagesByBreed(breedId, limit = 12) {
    return await fetchAPI(`/images/search?breed_ids=${breedId}&limit=${limit}`);
}

// Upload a dog image
export async function uploadDogImage(file, subId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sub_id', subId || 'anonymous');
    
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
    
    return await response.json();
}

// Get user's uploaded images
export async function getUploadedImages(subId = 'anonymous') {
    return await fetchAPI(`/images?limit=20&sub_id=${subId}`);
}

// Delete an uploaded image
export async function deleteImage(imageId) {
    const response = await fetch(`${BASE_URL}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
            'x-api-key': API_KEY
        }
    });
    
    if (!response.ok) {
        throw new Error('Delete failed');
    }
    
    return await response.json();
}

// Vote on an image
export async function voteOnImage(imageId, value) {
    return await fetchAPI('/votes', {
        method: 'POST',
        body: JSON.stringify({
            image_id: imageId,
            value: value
        })
    });
}

// Get votes for an image
export async function getVotes(imageId) {
    return await fetchAPI(`/votes?image_id=${imageId}`);
}

// Add to favorites
export async function favoriteImage(imageId) {
    return await fetchAPI('/favourites', {
        method: 'POST',
        body: JSON.stringify({
            image_id: imageId
        })
    });
}

// Remove from favorites
export async function unfavoriteImage(favouriteId) {
    const response = await fetch(`${BASE_URL}/favourites/${favouriteId}`, {
        method: 'DELETE',
        headers: {
            'x-api-key': API_KEY
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to remove favorite');
    }
    
    return await response.json();
}

// Get user's favorites
export async function getFavorites() {
    return await fetchAPI('/favourites');
}

// Search breeds by name
export async function searchBreeds(query) {
    const breeds = await getBreeds();
    return breeds.filter(breed => 
        breed.name.toLowerCase().includes(query.toLowerCase())
    );
}