// API configuration
const API_KEY = 'live_RnkhjTYAAxEOyE3Zo61n4bKiFNeiixpn19qJwrf2BO9mYTfKGGLl5ZnNJwSyeSA2';
const BASE_URL = 'https://api.thedogapi.com/v1';

// Cache for images
const imageCache = new Map();

// Simple fetch wrapper
async function fetchAPI(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'x-api-key': API_KEY
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Get total breeds count
export async function getTotalBreedsCount() {
    try {
        // Get first page to get total count from headers
        const response = await fetch(`${BASE_URL}/breeds?limit=1&page=0`, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        
        // Try to get total count from headers
        const totalCount = response.headers.get('pagination-count');
        return totalCount ? parseInt(totalCount) : 172; // Fallback to known total
    } catch (error) {
        console.error('Error getting total count:', error);
        return 172; // Known total from The Dog API
    }
}

// Get breeds with pagination
export async function getBreeds(page = 0, limit = 20) {
    try {
        const data = await fetchAPI(`/breeds?limit=${limit}&page=${page}`);
        return data;
    } catch (error) {
        console.error('Error fetching breeds:', error);
        throw error;
    }
}

// Search breeds
export async function searchBreeds(query) {
    try {
        return await fetchAPI(`/breeds/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
        console.error('Error searching breeds:', error);
        throw error;
    }
}

// Get breed image with caching
export async function getBreedImage(referenceImageId) {
    if (!referenceImageId) return null;
    
    // Check cache first
    if (imageCache.has(referenceImageId)) {
        return imageCache.get(referenceImageId);
    }
    
    return new Promise((resolve) => {
        // Try multiple image sizes
        const imageUrl = `https://cdn2.thedogapi.com/images/${referenceImageId}.jpg`;
        
        // Test if image exists
        fetch(imageUrl, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    imageCache.set(referenceImageId, imageUrl);
                    resolve(imageUrl);
                } else {
                    // Try with different extension
                    const imageUrlAlt = `https://cdn2.thedogapi.com/images/${referenceImageId}.png`;
                    return fetch(imageUrlAlt, { method: 'HEAD' });
                }
            })
            .then(response => {
                if (response && response.ok) {
                    const imageUrlAlt = `https://cdn2.thedogapi.com/images/${referenceImageId}.png`;
                    imageCache.set(referenceImageId, imageUrlAlt);
                    resolve(imageUrlAlt);
                } else {
                    resolve(null);
                }
            })
            .catch(() => resolve(null));
    });
}

// Get multiple breed images
export async function getBreedImages(breedId, limit = 5) {
    try {
        return await fetchAPI(`/images/search?breed_id=${breedId}&limit=${limit}`);
    } catch (error) {
        console.error('Error fetching breed images:', error);
        return [];
    }
}

// POST - Add to favorites
export async function addToFavorites(breedId, breedName, imageId) {
    console.log('POST: Adding to favorites', { breedId, breedName, imageId });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        success: true,
        message: `✨ Added ${breedName} to favorites!`,
        id: Date.now().toString()
    };
}

// DELETE - Remove from favorites
export async function removeFromFavorites(favoriteId) {
    console.log('DELETE: Removing from favorites', favoriteId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        success: true,
        message: '✅ Removed from favorites!'
    };
}

// POST - Vote on breed
export async function voteOnBreed(breedName, vote) {
    console.log('POST: Voting on breed', { breedName, vote });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const voteEmoji = vote > 0 ? '👍' : '👎';
    
    return {
        success: true,
        message: `${voteEmoji} Voted ${vote > 0 ? 'for' : 'against'} ${breedName}!`,
        id: Date.now().toString()
    };
}

// PATCH - Update vote
export async function updateVote(voteId, newVote) {
    console.log('PATCH: Updating vote', { voteId, newVote });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const voteEmoji = newVote > 0 ? '👍' : '👎';
    
    return {
        success: true,
        message: `🔄 Vote updated to ${voteEmoji}!`
    };
}

// Get image by ID
export function getImageUrl(imageId) {
    if (!imageId) return null;
    return `https://cdn2.thedogapi.com/images/${imageId}.jpg`;
}