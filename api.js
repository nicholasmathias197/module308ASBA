// Show breed gallery - UPDATED VERSION
export function showBreedGallery(images, breedName) {
    console.log('Showing breed gallery for:', breedName, 'with', images.length, 'images');
    
    if (elements.breedGallery) {
        elements.breedGallery.classList.remove('hidden');
        elements.breedGallery.innerHTML = ''; // Clear previous content
        
        // Make sure we show actions (favorite/vote buttons) in breed gallery
        renderDogGallery(images, elements.breedGallery, true);
        
        // Remove any existing breed header
        const existingHeader = document.querySelector('.breed-gallery-header');
        if (existingHeader) {
            existingHeader.remove();
        }
        
        // Add a header with breed info
        const breedHeader = document.createElement('div');
        breedHeader.className = 'breed-gallery-header';
        breedHeader.innerHTML = `
            <div class="breed-header-info">
                <h3>${breedName} Dogs</h3>
                <span class="dog-count">${images.length} images found</span>
            </div>
            <button class="back-to-breeds-btn">← Back to Breeds</button>
        `;
        
        // Insert header before gallery
        elements.breedGallery.parentNode.insertBefore(breedHeader, elements.breedGallery);
        
        // Add back button functionality
        const backBtn = breedHeader.querySelector('.back-to-breeds-btn');
        backBtn.addEventListener('click', () => {
            breedHeader.remove();
            elements.breedGallery.classList.add('hidden');
            elements.breedGallery.innerHTML = '';
        });
        
        // Scroll to gallery
        elements.breedGallery.scrollIntoView({ behavior: 'smooth' });
    }
}