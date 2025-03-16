// Watchlist Page
import { renderHeader } from '../../components/header.js';

/**
 * Renders the watchlist page
 * @param {HTMLElement} container
 */
export function renderWatchlistPage(container) {
  container.innerHTML = `
    ${renderHeader()}
    
  <div class="md:ml-16 p-4 md:p-12 pb-20 md:pb-12">
    <h1 class="text-3xl md:text-4xl font-bold mb-6 md:mb-8">My Watchlist</h1>
    <div id="watchlist-container" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
    </div>
  </div>
  `;
  
  loadWatchlist();
}

function loadWatchlist() {
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
  
  watchlist.forEach(item => {
    const watchlistItem = document.createElement('div');
    watchlistItem.className = 'movie-card p-3 rounded-lg overflow-hidden transition-all duration-200 hover:bg-zinc-800 hover:border-zinc-700 border-2 border-transparent';
    
    watchlistItem.innerHTML = `
      <div class="relative">
        <img src="${item.posterPath}" alt="${item.title}" class="w-full object-cover rounded-lg">
        <button class="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-2 pb-1 text-white hover:text-red-500 hover:scale-105 focus:scale-90 remove-btn">
          <i class="icon-x text-2xl"></i>
        </button>
      </div>
      <div class="mt-3">
        <h3 class="text-white font-semibold text-sm">${item.title}</h3>
        <p class="text-zinc-400 text-xs mt-1">${item.mediaType === 'movie' ? 'Movie' : 'TV Show'}</p>
      </div>
    `;
    
    watchlistItem.addEventListener('click', (e) => {
      if (e.target.closest('.remove-btn')) return;
      
      window.history.pushState(null, null, `/${item.mediaType}/${item.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    
    const removeBtn = watchlistItem.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const updatedWatchlist = watchlist.filter(i => !(i.id === item.id && i.mediaType === item.mediaType));
        localStorage.setItem('quickwatch-watchlist', JSON.stringify(updatedWatchlist));
        
        loadWatchlist();
      });
    }
    
    watchlistContainer.appendChild(watchlistItem);
  });
}