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
        const response = await fetch(`${BASE_URL}/images/search?limit=${limit}&has_breeds=true`, {
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching random dogs:', error);
        throw error;
    }
}

export async function fetchDogsByBreed(breedId, limit = 12) {
    try {
        console.log('Fetching dogs for breed ID:', breedId);
        
        const breedResponse = await fetch(`${BASE_URL}/breeds/${breedId}`, {
            headers: getHeaders()
        });
        const breedData = await handleResponse(breedResponse);
        console.log('Breed data retrieved:', breedData.name);
        
        const response = await fetch(
            `${BASE_URL}/images/search?breed_ids=${breedId}&limit=${limit}&has_breeds=true&include_breed=1`, 
            {
                headers: getHeaders()
            }
        );
        let images = await handleResponse(response);
        console.log(`Found ${images.length} images for breed ${breedData.name}`);
        
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
        
        images = images.map(image => {
            if (!image.breeds || image.breeds.length === 0) {
                return {
                    ...image,
                    breeds: [breedInfo]
                };
            }
            return image;
        });
        
        return images;
    } catch (error) {
        console.error('Error fetching dogs by breed:', error);
        throw error;
    }
}

export async function fetchAllBreeds() {
    try {
        console.log('Fetching all breeds...');
        const response = await fetch(`${BASE_URL}/breeds`, {
            headers: getHeaders()
        });
        const breeds = await handleResponse(response);
        
        const sortedBreeds = breeds.sort((a, b) => a.name.localeCompare(b.name));
        console.log(`Fetched ${sortedBreeds.length} breeds, sorted alphabetically`);
        
        return sortedBreeds;
    } catch (error) {
        console.error('Error fetching breeds:', error);
        throw error;
    }
}

export async function searchBreeds(query) {
    try {
        console.log('Searching breeds for:', query);
        
        if (!query.trim()) {
            return await fetchAllBreeds();
        }
        
        // Fetch all breeds and filter locally since /breeds/search doesn't work well
        const allBreeds = await fetchAllBreeds();
        
        const searchQuery = query.trim().toLowerCase();
        const filtered = allBreeds.filter(breed => 
            breed.name.toLowerCase().includes(searchQuery) ||
            (breed.temperament && breed.temperament.toLowerCase().includes(searchQuery)) ||
            (breed.breed_group && breed.breed_group.toLowerCase().includes(searchQuery))
        );
        
        console.log(`Found ${filtered.length} breeds matching "${query}"`);
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Error searching breeds:', error);
        throw error;
    }
}

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

export async function uploadImage(formData) {
    try {
        const response = await fetch(`${BASE_URL}/images/upload`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY
            },
            body: formData
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}