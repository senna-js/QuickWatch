// Watchlist Page
import { renderHeader } from '../../components/header.js';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { createCarouselItem } from '../../components/carouselItem.js';

/**
 * Renders the watchlist page
 * @param {HTMLElement} container
 */
export function renderWatchlistPage(container) {
  container.innerHTML = `
    ${renderHeader()}

    <!-- Grid Background -->
    <div class="absolute inset-0 opacity-10 pointer-events-none"
          style="background-image: linear-gradient(to bottom, 
                  rgba(215, 215, 228, 0.3),
                  rgba(0, 0, 0, 1)
                ),
                radial-gradient(circle, currentColor 1px, transparent 1px);
                background-size: 100% 100%, 24px 24px;">
    </div>
  
    <div class="md:ml-16 p-4 md:p-12 md:pl-1 pb-20 md:pb-12 mt-10">
      <h1 class="text-3xl md:text-4xl font-bold mt-2 mb-4 md:mb-6 md:mt-0">Your Watchlist</h1>
      <div id="watchlist-container" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"></div>
    </div>
  `;
  
  loadWatchlist();
}

async function loadWatchlist() {
  const watchlistContainer = document.getElementById('watchlist-container');
  if (!watchlistContainer) return;
  
  const watchlist = JSON.parse(localStorage.getItem('quickwatch-watchlist') || '[]');
  
  if (watchlist.length === 0) {
    watchlistContainer.innerHTML = `
      <div class="col-span-5 text-center py-12">
        <i class="fas fa-bookmark text-4xl mb-4 text-zinc-500"></i>
        <h2 class="text-2xl font-bold mb-2">Your watchlist is empty</h2>
        <p class="text-zinc-400 mb-6">Add movies and TV shows to keep track of what you want to watch</p>
        <a href="/" class="px-6 py-3 bg-white text-black rounded-md hover:bg-zinc-200 transition">
          Browse Content
        </a>
      </div>
    `;
    return;
  }
  
  watchlist.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  
  watchlistContainer.innerHTML = '';
  
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': TMDB_API_KEY
    }
  };
  
  for (const item of watchlist) {
    try {
      const detailUrl = `${TMDB_BASE_URL}/${item.mediaType}/${item.id}?append_to_response=images&language=en-US&include_image_language=en`;
      const detailResponse = await fetch(detailUrl, options);
      const detailData = await detailResponse.json();
      
      detailData.media_type = item.mediaType;
      
      const carouselItem = createCarouselItem(detailData, false, 'grid');
      
      if (carouselItem) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-2 pb-1 text-white hover:text-red-500 hover:scale-105 focus:scale-90 z-20';
        removeBtn.innerHTML = '<i class="icon-x text-2xl"></i>';
        
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          
          const updatedWatchlist = watchlist.filter(i => !(i.id === item.id && i.mediaType === item.mediaType));
          localStorage.setItem('quickwatch-watchlist', JSON.stringify(updatedWatchlist));
          
          loadWatchlist();
        });
        
        carouselItem.appendChild(removeBtn);
        watchlistContainer.appendChild(carouselItem);
      }
    } catch (error) {
      console.error(`Error loading watchlist item ${item.id}:`, error);
    }
  }
}