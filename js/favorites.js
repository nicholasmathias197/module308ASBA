// Favorites management
let favorites = [];

// Load favorites from localStorage
export function loadFavorites() {
    try {
        const stored = localStorage.getItem('dogFavorites');
        favorites = stored ? JSON.parse(stored) : [];
        console.log('Favorites loaded:', favorites.length);
    } catch (error) {
        console.error('Error loading favorites:', error);
        favorites = [];
    }
    return favorites;
}

// Save favorites to localStorage
function saveFavorites() {
    try {
        localStorage.setItem('dogFavorites', JSON.stringify(favorites));
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
}

// Get all favorites
export function getFavorites() {
    return favorites;
}

// Check if breed is favorited
export function isFavorite(breedId) {
    return favorites.some(f => f.breedId === breedId.toString());
}

// Add to favorites
export async function addFavorite(breedId, breedName, imageUrl) {
    if (isFavorite(breedId)) {
        return { success: false, message: 'Already in favorites' };
    }
    
    const favorite = {
        breedId: breedId.toString(),
        breedName: breedName,
        imageUrl: imageUrl || `https://cdn2.thedogapi.com/images/${breedId}.jpg`,
        dateAdded: new Date().toISOString(),
        id: 'fav_' + Date.now()
    };
    
    favorites.push(favorite);
    saveFavorites();
    
    return { 
        success: true, 
        message: `❤️ Added ${breedName} to favorites!` 
    };
}

// Remove from favorites
export async function removeFavorite(breedId) {
    const breedIdStr = breedId.toString();
    favorites = favorites.filter(f => f.breedId !== breedIdStr);
    saveFavorites();
    
    const breed = favorites.find(f => f.breedId === breedIdStr);
    return { 
        success: true, 
        message: `💔 Removed from favorites` 
    };
}

// Remove favorite by ID
export async function removeFavoriteById(favoriteId) {
    favorites = favorites.filter(f => f.id !== favoriteId);
    saveFavorites();
    return { success: true };
}

// Clear all favorites
export function clearAllFavorites() {
    favorites = [];
    saveFavorites();
}

// Get favorites count
export function getFavoritesCount() {
    return favorites.length;
}

// Get favorite by breed ID
export function getFavorite(breedId) {
    return favorites.find(f => f.breedId === breedId.toString());
}