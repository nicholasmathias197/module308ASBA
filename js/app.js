// Main application
import * as api from './api.js';
import * as ui from './ui.js';
import * as favorites from './favorites.js';

// State
let allBreeds = [];
let displayedBreeds = [];
let currentPage = 0;
let breedsPerPage = 20; // Changed to 20 for faster loading
let totalBreeds = 0;
let currentView = 'home';
let isLoading = false;
let searchTimeout = null;

// Initialize
async function init() {
    console.log('Initializing app...');
    
    // Initialize UI
    ui.initUI();
    
    // Load favorites
    favorites.loadFavorites();
    ui.updateFavoritesCount(favorites.getFavoritesCount());
    
    // Add event listeners
    ui.addEventListeners({
        onSearch: handleSearch,
        onClear: handleClear,
        onFilter: handleFilter,
        onReset: handleReset,
        onLoadMore: loadMoreBreeds
    });
    
    // Navigation listeners
    document.getElementById('home-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('home');
    });
    
    document.getElementById('home-nav-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('home');
    });
    
    document.getElementById('favorites-nav-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('favorites');
    });
    
    document.getElementById('browse-breeds-btn')?.addEventListener('click', () => {
        switchView('home');
        handleClear();
    });
    
    document.getElementById('go-home-btn')?.addEventListener('click', () => {
        switchView('home');
    });
    
    document.getElementById('clear-all-favorites')?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all favorites?')) {
            favorites.clearAllFavorites();
            ui.updateFavoritesCount(0);
            if (currentView === 'favorites') {
                displayFavorites();
            }
            ui.showMessage('All favorites cleared!', 'info');
        }
    });
    
    // Listen for favorite clicks
    document.addEventListener('favoriteClick', handleFavoriteClick);
    document.addEventListener('removeFavorite', handleRemoveFavorite);
    
    // Demo buttons
    document.getElementById('demo-post-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        demoPost();
    });
    
    document.getElementById('demo-patch-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        demoPatch();
    });
    
    // Load initial breeds with Promise
    await loadInitialBreeds();
}

// Load initial breeds using Promise
function loadInitialBreeds() {
    return new Promise(async (resolve, reject) => {
        try {
            ui.showLoading('Loading breeds...');
            
            // Get first page of breeds
            const breeds = await api.getBreeds(0, breedsPerPage);
            
            // Load images for these breeds (using Promise.all for parallel loading)
            await loadBreedImages(breeds);
            
            allBreeds = breeds;
            displayedBreeds = breeds;
            
            // Get total count for pagination
            const total = await api.getTotalBreedsCount();
            totalBreeds = total;
            
            displayBreeds();
            ui.updateBreedCount(breeds.length);
            
            // Show load more if there are more breeds
            if (total > breedsPerPage) {
                ui.showLoadMore();
            }
            
            console.log(`Loaded ${breeds.length} breeds (page 1 of ${Math.ceil(total/breedsPerPage)})`);
            ui.showMessage(`✅ Loaded ${breeds.length} dog breeds!`, 'success');
            
            resolve();
        } catch (error) {
            console.error('Error:', error);
            ui.showError('Failed to load breeds. Please refresh the page.');
            reject(error);
        } finally {
            ui.hideLoading();
        }
    });
}

// Load breed images using Promise.all for parallel loading
function loadBreedImages(breeds) {
    return new Promise(async (resolve) => {
        ui.showLoading('Loading breed images...');
        
        // Create an array of promises for each image load
        const imagePromises = breeds.map(async (breed) => {
            if (breed.reference_image_id) {
                const imageUrl = await api.getBreedImage(breed.reference_image_id);
                if (imageUrl) {
                    breed.image = { url: imageUrl };
                }
            }
        });
        
        // Wait for all images to load (or fail) in parallel
        await Promise.allSettled(imagePromises);
        
        ui.hideLoading();
        resolve();
    });
}

// Load more breeds (next page)
function loadMoreBreeds() {
    return new Promise(async (resolve) => {
        currentPage++;
        
        ui.showLoading(`Loading page ${currentPage + 1}...`);
        
        try {
            // Fetch next page of breeds
            const newBreeds = await api.getBreeds(currentPage, breedsPerPage);
            
            // Load images for new breeds
            await loadBreedImages(newBreeds);
            
            // Add to existing breeds
            allBreeds = [...allBreeds, ...newBreeds];
            displayedBreeds = [...displayedBreeds, ...newBreeds];
            
            displayBreeds();
            ui.updateBreedCount(displayedBreeds.length);
            
            // Check if we've loaded all breeds
            const totalPages = Math.ceil(totalBreeds / breedsPerPage);
            if (currentPage + 1 >= totalPages) {
                ui.hideLoadMore();
                ui.showMessage('All breeds loaded!', 'info');
            }
            
            console.log(`Loaded page ${currentPage + 1} with ${newBreeds.length} breeds`);
        } catch (error) {
            console.error('Error loading more breeds:', error);
            ui.showError('Failed to load more breeds');
        } finally {
            ui.hideLoading();
            resolve();
        }
    });
}

// Load all breeds (if user wants to load everything)
function loadAllBreeds() {
    return new Promise(async (resolve) => {
        ui.showLoading('Loading all breeds...');
        
        try {
            const totalPages = Math.ceil(totalBreeds / breedsPerPage);
            const allBreedsPromises = [];
            
            // Create promises for all remaining pages
            for (let page = currentPage + 1; page < totalPages; page++) {
                allBreedsPromises.push(api.getBreeds(page, breedsPerPage));
            }
            
            // Load all remaining pages in parallel
            const results = await Promise.all(allBreedsPromises);
            
            // Flatten all results
            const newBreeds = results.flat();
            
            // Load images for new breeds
            await loadBreedImages(newBreeds);
            
            // Update state
            allBreeds = [...allBreeds, ...newBreeds];
            displayedBreeds = [...allBreeds];
            
            displayBreeds();
            ui.updateBreedCount(allBreeds.length);
            ui.hideLoadMore();
            
            ui.showMessage(`✅ Loaded all ${allBreeds.length} breeds!`, 'success');
        } catch (error) {
            console.error('Error loading all breeds:', error);
            ui.showError('Failed to load all breeds');
        } finally {
            ui.hideLoading();
            resolve();
        }
    });
}

// Switch between home and favorites view
function switchView(view) {
    currentView = view;
    
    const homeView = document.getElementById('home-view');
    const favoritesView = document.getElementById('favorites-view');
    
    // Update navigation active states
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    if (view === 'home') {
        document.getElementById('home-nav-link')?.classList.add('active');
        homeView.style.display = 'block';
        favoritesView.style.display = 'none';
        
        // Show home content
        displayBreeds();
        
        // Show/hide load more button
        if (displayedBreeds.length < totalBreeds) {
            ui.showLoadMore();
        }
    } else {
        document.getElementById('favorites-nav-link')?.classList.add('active');
        homeView.style.display = 'none';
        favoritesView.style.display = 'block';
        
        // Show favorites
        displayFavorites();
        ui.hideLoadMore();
    }
}

// Display breeds in home view
function displayBreeds() {
    const favoritesList = favorites.getFavorites();
    ui.displayBreeds(displayedBreeds, favoritesList);
}

// Display favorites
function displayFavorites() {
    const favoritesList = favorites.getFavorites();
    ui.displayFavorites(favoritesList);
}

// Handle search with debounce
function handleSearch() {
    const query = ui.getSearchQuery().toLowerCase().trim();
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
        if (!query) {
            // Reset to first page
            displayedBreeds = allBreeds.slice(0, breedsPerPage);
            currentPage = 0;
            ui.showLoadMore();
        } else {
            // Search in all loaded breeds first
            let results = allBreeds.filter(breed => 
                breed.name.toLowerCase().includes(query)
            );
            
            // If not enough results, search API
            if (results.length < 5) {
                searchAPI(query).then(apiResults => {
                    displayedBreeds = apiResults;
                    displayBreeds();
                    ui.updateBreedCount(apiResults.length);
                    ui.hideLoadMore();
                    
                    if (apiResults.length === 0) {
                        ui.showNoResults();
                    }
                });
                return;
            }
            
            displayedBreeds = results;
            displayBreeds();
            ui.updateBreedCount(results.length);
            ui.hideLoadMore();
            
            if (results.length === 0) {
                ui.showNoResults();
            }
        }
        
        displayBreeds();
    }, 300);
}

// Search API for breeds
function searchAPI(query) {
    return new Promise(async (resolve) => {
        try {
            const results = await api.searchBreeds(query);
            
            // Load images for search results
            await loadBreedImages(results);
            
            resolve(results);
        } catch (error) {
            console.error('Search API error:', error);
            resolve([]);
        }
    });
}

// Handle clear search
function handleClear() {
    ui.clearSearch();
    displayedBreeds = allBreeds.slice(0, breedsPerPage);
    currentPage = 0;
    displayBreeds();
    ui.updateBreedCount(displayedBreeds.length);
    
    if (totalBreeds > breedsPerPage) {
        ui.showLoadMore();
    }
    ui.hideNoResults();
}

// Handle filter changes
function handleFilter() {
    const filters = ui.getFilters();
    
    // Use Promise to handle filtering
    new Promise((resolve) => {
        let breeds = [...allBreeds];
        
        // Apply search if exists
        const query = ui.getSearchQuery().toLowerCase().trim();
        if (query) {
            breeds = breeds.filter(breed => 
                breed.name.toLowerCase().includes(query)
            );
        }
        
        // Apply size filter
        if (filters.size) {
            breeds = breeds.filter(breed => {
                if (!breed.weight?.metric) return false;
                
                const numbers = breed.weight.metric.match(/\d+/g);
                if (!numbers) return false;
                
                const weights = numbers.map(Number);
                const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
                
                switch(filters.size) {
                    case 'small': return avgWeight <= 10;
                    case 'medium': return avgWeight > 10 && avgWeight <= 25;
                    case 'large': return avgWeight > 25 && avgWeight <= 40;
                    case 'xlarge': return avgWeight > 40;
                    default: return true;
                }
            });
        }
        
        // Apply sort
        if (filters.sort) {
            breeds.sort((a, b) => {
                if (filters.sort === 'name') {
                    return a.name.localeCompare(b.name);
                } else if (filters.sort === 'weight') {
                    const aWeight = getAverageWeight(a);
                    const bWeight = getAverageWeight(b);
                    return aWeight - bWeight;
                } else if (filters.sort === 'weight-desc') {
                    const aWeight = getAverageWeight(a);
                    const bWeight = getAverageWeight(b);
                    return bWeight - aWeight;
                }
            });
        }
        
        resolve(breeds);
    }).then(filteredBreeds => {
        displayedBreeds = filteredBreeds;
        displayBreeds();
        ui.updateBreedCount(displayedBreeds.length);
        
        if (displayedBreeds.length === 0) {
            ui.showNoResults();
        } else {
            ui.hideNoResults();
        }
    });
}

// Helper to get average weight
function getAverageWeight(breed) {
    if (!breed.weight?.metric) return 0;
    const numbers = breed.weight.metric.match(/\d+/g);
    if (!numbers) return 0;
    const weights = numbers.map(Number);
    return weights.reduce((a, b) => a + b, 0) / weights.length;
}

// Handle reset filters
function handleReset() {
    ui.clearSearch();
    document.getElementById('size-filter').value = '';
    document.getElementById('sort-filter').value = 'name';
    
    displayedBreeds = allBreeds.slice(0, breedsPerPage);
    currentPage = 0;
    displayBreeds();
    ui.updateBreedCount(displayedBreeds.length);
    
    if (totalBreeds > breedsPerPage) {
        ui.showLoadMore();
    }
    ui.hideNoResults();
}

// Handle favorite click
async function handleFavoriteClick(e) {
    const { breedId, breedName, imageUrl, element } = e.detail;
    
    const isFav = favorites.isFavorite(breedId);
    
    if (isFav) {
        const result = await favorites.removeFavorite(breedId);
        
        // Update button
        if (element) {
            element.classList.remove('active');
            element.querySelector('i').className = 'far fa-heart';
        }
        
        ui.showMessage(result.message, 'success');
        
        // Call API
        await api.removeFromFavorites(breedId);
    } else {
        const result = await favorites.addFavorite(breedId, breedName, imageUrl);
        
        // Update button
        if (element) {
            element.classList.add('active');
            element.querySelector('i').className = 'fas fa-heart';
        }
        
        ui.showMessage(result.message, 'success');
        
        // Call API (POST)
        await api.addToFavorites(breedId, breedName, imageUrl);
    }
    
    // Update counts
    ui.updateFavoritesCount(favorites.getFavoritesCount());
    
    // Refresh current view
    if (currentView === 'favorites') {
        displayFavorites();
    }
}

// Handle remove favorite
async function handleRemoveFavorite(e) {
    const { breedId } = e.detail;
    
    await favorites.removeFavorite(breedId);
    ui.updateFavoritesCount(favorites.getFavoritesCount());
    displayFavorites();
    ui.showMessage('Removed from favorites!', 'success');
    
    // Call API
    await api.removeFromFavorites(breedId);
}

// Demo POST
async function demoPost() {
    if (allBreeds.length === 0) {
        ui.showMessage('No breeds loaded yet!', 'warning');
        return;
    }
    
    const randomBreed = allBreeds[Math.floor(Math.random() * allBreeds.length)];
    const result = await api.addToFavorites(
        randomBreed.id,
        randomBreed.name,
        randomBreed.image?.url
    );
    
    ui.showMessage(result.message, 'success');
}

// Demo PATCH
async function demoPatch() {
    const result = await api.updateVote('vote-123', -1);
    ui.showMessage(result.message, 'info');
}

// Start the app
init();