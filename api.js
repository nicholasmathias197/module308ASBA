// api.js - Handles all API calls to The Dog API
const API_KEY = 'live_RnkhjTYAAxEOyE3Zo61n4bKiFNeiixpn19qJwrf2BO9mYTfKGGLl5ZnNJwSyeSA2';
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

// GET: Fetch dogs by breed - FIXED to ensure breed data
export async function fetchDogsByBreed(breedId, limit = 12) {
    try {
        console.log('Fetching dogs for breed ID:', breedId);
        
        // First, get the complete breed details
        const breedResponse = await fetch(`${BASE_URL}/breeds/${breedId}`, {
            headers: getHeaders()
        });
        const breedData = await handleResponse(breedResponse);
        console.log('Breed data retrieved:', breedData.name);
        
        // Then fetch images for this breed
        const response = await fetch(
            `${BASE_URL}/images/search?breed_ids=${breedId}&limit=${limit}&has_breeds=true`, 
            {
                headers: getHeaders()
            }
        );
        let images = await handleResponse(response);
        console.log(`Found ${images.length} images for breed ${breedData.name}`);
        
        // Create a complete breed info object
        const breedInfo = {
            id: breedData.id,
            name: breedData.name,
            temperament: breedData.temperament || 'No temperament information available',
            life_span: breedData.life_span || 'Unknown',
            weight: breedData.weight || { metric: 'Unknown' },
            height: breedData.height || { metric: 'Unknown' },
            bred_for: breedData.bred_for || 'Not specified',
            breed_group: breedData.breed_group || 'Not specified',
            origin: breedData.origin || 'Unknown',
            country_code: breedData.country_code || 'Unknown'
        };
        
        // Ensure every image has breed information
        images = images.map(image => {
            return {
                ...image,
                breeds: [breedInfo] // Attach the complete breed info to every image
            };
        });
        
        return images;
    } catch (error) {
        console.error('Error fetching dogs by breed:', error);
        throw error;
    }
}

// GET: Fetch ALL breeds and sort alphabetically
export async function fetchAllBreeds() {
    try {
        console.log('Fetching all breeds...');
        const response = await fetch(`${BASE_URL}/breeds`, {
            headers: getHeaders()
        });
        const breeds = await handleResponse(response);
        
        // Sort breeds alphabetically by name
        const sortedBreeds = breeds.sort((a, b) => a.name.localeCompare(b.name));
        console.log(`Fetched ${sortedBreeds.length} breeds, sorted alphabetically`);
        
        return sortedBreeds;
    } catch (error) {
        console.error('Error fetching breeds:', error);
        throw error;
    }
}

// GET: Search breeds by name (for the search functionality)
export async function searchBreeds(query) {
    try {
        console.log('Searching breeds for:', query);
        
        if (!query.trim()) {
            // If query is empty, return all breeds
            return await fetchAllBreeds();
        }
        
        const response = await fetch(`${BASE_URL}/breeds/search?q=${encodeURIComponent(query)}`, {
            headers: getHeaders()
        });
        const results = await handleResponse(response);
        console.log(`Found ${results.length} breeds matching "${query}"`);
        
        // Sort results alphabetically
        return results.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Error searching breeds:', error);
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

// POST: Upload an image
export async function uploadImage(formData) {
    try {
        const response = await fetch(`${BASE_URL}/images/upload`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY
                // Don't set Content-Type for FormData
            },
            body: formData
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}