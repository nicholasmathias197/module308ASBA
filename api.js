// api.js - Handles all API calls to The Dog API
const API_KEY = 'live_RnkhjTYAAxEOyE3Zo61n4bKiFNeiixpn19qJwrf2BO9mYTfKGGLl5ZnNJwSyeSA2'; // Your Dog API key
const BASE_URL = 'https://api.thedogapi.com/v1';

// Helper function to handle API responses
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
    }
    return response.json();
}

// Helper function to create headers with API key
function getHeaders() {
    return {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    };
}

// GET: Fetch random dog images
export async function fetchRandomDogs(limit = 12) {
    try {
        const response = await fetch(`${BASE_URL}/images/search?limit=${limit}&has_breeds=true`, {
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching random dogs:', error);
        throw error;
    }
}

// GET: Fetch dogs by breed
export async function fetchDogsByBreed(breedId, limit = 12) {
    try {
        const response = await fetch(`${BASE_URL}/images/search?breed_ids=${breedId}&limit=${limit}`, {
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching dogs by breed:', error);
        throw error;
    }
}

// GET: Fetch all breeds
export async function fetchBreeds() {
    try {
        const response = await fetch(`${BASE_URL}/breeds`, {
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching breeds:', error);
        throw error;
    }
}

// GET: Fetch user's favorites
export async function fetchFavorites() {
    try {
        const response = await fetch(`${BASE_URL}/favourites`, {
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
}

// POST: Add image to favorites
export async function addToFavorites(imageId) {
    try {
        const response = await fetch(`${BASE_URL}/favourites`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ image_id: imageId })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw error;
    }
}

// DELETE: Remove from favorites
export async function removeFromFavorites(favoriteId) {
    try {
        const response = await fetch(`${BASE_URL}/favourites/${favoriteId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error removing from favorites:', error);
        throw error;
    }
}

// POST: Vote on an image
export async function voteOnImage(imageId, value) {
    try {
        const response = await fetch(`${BASE_URL}/votes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                image_id: imageId,
                value: value // 1 for upvote, 0 for downvote
            })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error voting on image:', error);
        throw error;
    }
}

// POST: Upload an image
export async function uploadImage(formData) {
    try {
        const response = await fetch(`${BASE_URL}/images/upload`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY
                // Don't set Content-Type for FormData, let browser set it with boundary
            },
            body: formData
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// GET: Search breeds by name
export async function searchBreeds(query) {
    try {
        const breeds = await fetchBreeds();
        return breeds.filter(breed =>
            breed.name.toLowerCase().includes(query.toLowerCase())
        );
    } catch (error) {
        console.error('Error searching breeds:', error);
        throw error;
    }
}