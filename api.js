const API_KEY = 'live_RnkhjTYAAxEOyE3Zo61n4bKiFNeiixpn19qJwrf2BO9mYTfKGGLl5ZnNJwSyeSA2';
const BASE_URL = 'https://api.thedogapi.com/v1';

// Helper function to handle API responses
async function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Fetch random dog images
export async function fetchRandomDogs(limit = 10) {
    try {
        const response = await fetch(`${BASE_URL}/images/search?limit=${limit}`, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching random dogs:', error);
        throw error;
    }
}

// Search breeds
export async function searchBreeds(query) {
    try {
        const response = await fetch(`${BASE_URL}/breeds/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error searching breeds:', error);
        throw error;
    }
}

// Fetch images by breed
export async function fetchImagesByBreed(breedId, limit = 10) {
    try {
        const response = await fetch(`${BASE_URL}/images/search?breed_ids=${breedId}&limit=${limit}`, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching images by breed:', error);
        throw error;
    }
}

// Upload dog image
export async function uploadDogImage(file, subId = '') {
    try {
        const formData = new FormData();
        formData.append('file', file);
        if (subId) {
            formData.append('sub_id', subId);
        }

        const response = await fetch(`${BASE_URL}/images/upload`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY
            },
            body: formData
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error uploading dog image:', error);
        throw error;
    }
}

// Fetch user's uploaded images
export async function fetchUserUploads(subId, limit = 10) {
    try {
        const response = await fetch(`${BASE_URL}/images?sub_id=${encodeURIComponent(subId)}&limit=${limit}`, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching user uploads:', error);
        throw error;
    }
}

// Add to favorites
export async function addToFavorites(imageId, subId = '') {
    try {
        const response = await fetch(`${BASE_URL}/favourites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                image_id: imageId,
                sub_id: subId
            })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw error;
    }
}

// Fetch favorites
export async function fetchFavorites(subId = '', limit = 10) {
    try {
        const response = await fetch(`${BASE_URL}/favourites?sub_id=${encodeURIComponent(subId)}&limit=${limit}`, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
}

// Vote on image
export async function voteOnImage(imageId, value, subId = '') {
    try {
        const response = await fetch(`${BASE_URL}/votes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                image_id: imageId,
                value: value,
                sub_id: subId
            })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error voting on image:', error);
        throw error;
    }
}