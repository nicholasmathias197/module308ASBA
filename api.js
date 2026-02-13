// api.js
const API_KEY = 'live_RnkhjTYAAxEOyE3Zo61n4bKiFNeiixpn19qJwrf2BO9mYTfKGGLl5ZnNJwSyeSA2';
const BASE_URL = 'https://api.thedogapi.com/v1';

async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
    }
    return response.json();
}

function getHeaders() {
    return {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    };
}

export async function fetchRandomDogs(limit = 12) {
    try {
        const response = await fetch(${BASE_URL}/images/search?limit=&has_breeds=true, {
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching random dogs:', error);
        throw error;
    }
}

export async function fetchFavorites() {
    try {
        const response = await fetch(${BASE_URL}/favourites, {
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
}

export async function addToFavorites(imageId) {
    try {
        const response = await fetch(${BASE_URL}/favourites, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                image_id: imageId,
                sub_id: 'dog-gallery-user'
            })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw error;
    }
}

export async function removeFromFavorites(favoriteId) {
    try {
        const response = await fetch(${BASE_URL}/favourites/, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error removing from favorites:', error);
        throw error;
    }
}

export async function voteOnImage(imageId, value) {
    try {
        const response = await fetch(${BASE_URL}/votes, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                image_id: imageId,
                value: value,
                sub_id: 'dog-gallery-user'
            })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error voting on image:', error);
        throw error;
    }
}
