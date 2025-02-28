// Download Search
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';

/**
 * Renders the download search page
 * @param {HTMLElement} container
 */
export function renderDownloadPage(container) {
  container.innerHTML = `
    <div class="fixed left-0 top-0 h-full w-16 bg-zinc-900 flex flex-col items-center py-8 space-y-8 hidden md:flex">
      <a href="/" class="text-zinc-400 hover:text-white">
        <i class="fas fa-home text-2xl"></i>
      </a>
      <a href="/search" class="text-zinc-400 hover:text-white">
        <i class="fas fa-search text-2xl"></i>
      </a>
      <a href="/watchlist" class="text-zinc-400 hover:text-white">
        <i class="fas fa-bookmark text-2xl"></i>
      </a>
      <a href="/download" class="text-zinc-400 hover:text-white">
        <i class="fas fa-download text-2xl"></i>
      </a>
    </div>
  
    <div class="fixed bottom-0 left-0 w-full bg-zinc-900 flex justify-around items-center py-4 z-50 md:hidden">
      <a href="/" class="text-zinc-400 hover:text-white">
        <i class="fas fa-home text-xl"></i>
      </a>
      <a href="/search" class="text-zinc-400 hover:text-white">
        <i class="fas fa-search text-xl"></i>
      </a>
      <a href="/watchlist" class="text-zinc-400 hover:text-white">
        <i class="fas fa-bookmark text-xl"></i>
      </a>
      <a href="/download" class="text-zinc-400 hover:text-white">
        <i class="fas fa-download text-xl"></i>
      </a>
    </div>
      
    <div class="md:ml-16 p-4 md:p-12 pb-20 md:pb-12">
      <h1 class="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Download Search (BETA)</h1>
      <div class="mb-6 md:mb-8">
        <input type="text" id="search-input" placeholder="Search for movies or TV shows to download..." 
          class="w-full p-3 md:p-4 bg-zinc-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-zinc-400">
      </div>
      <div id="search-results" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"></div>
    </div>
  `;
  
  initSearch();
}

function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (!searchInput || !searchResults) return;
  
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    
    const query = searchInput.value.trim();
    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }
    
    searchTimeout = setTimeout(() => {
      performSearch(query, searchResults);
    }, 500);
  });
  
  searchInput.focus();
}

/**
 * Performs a search for movies and TV shows
 * @param {string} query - The search query
 * @param {HTMLElement} resultsContainer - The container to display results in
 */
async function performSearch(query, resultsContainer) {
  try {
    const searchResults = document.getElementById('search-results');
    searchResults.className = '';
    
    resultsContainer.innerHTML = `
      <div class="flex items-center justify-center w-full">
        <div class="spinner-container active text-center">
          <div class="ispinner ispinner-medium mx-auto">
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
          </div>
        </div>
      </div>
    `;
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };
    
    const response = await fetch(`${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, options);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const filteredResults = data.results.filter(item => 
        (item.media_type === 'movie' || item.media_type === 'tv') && 
        item.poster_path
      );

      searchResults.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6';
      
      if (filteredResults.length > 0) {
        displaySearchResults(filteredResults, resultsContainer);
      } else {
        showNoResults(resultsContainer);
      }
    } else {
      showNoResults(resultsContainer);
    }
  } catch (error) {
    console.error('Error searching:', error);
    searchResults.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6';
    resultsContainer.innerHTML = `
      <div class="col-span-5 text-center py-12">
        <i class="fas fa-exclamation-circle text-4xl mb-4 text-red-500"></i>
        <h2 class="text-2xl font-bold mb-2">Search Error</h2>
        <p class="text-zinc-400">Something went wrong. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Displays search results in the container
 * @param {Array} results - The search results to display
 * @param {HTMLElement} container - The container to display results in
 */
function displaySearchResults(results, container) {
  container.innerHTML = '';
  
  results.forEach(item => {
    const resultCard = document.createElement('div');
    resultCard.className = 'movie-card p-3 rounded-lg overflow-hidden transition-all duration-300 hover:bg-zinc-800 hover:border-zinc-700 border-2 border-transparent';
    
    resultCard.innerHTML = `
      <div class="transition-transform duration-300 hover:scale-95 active:scale-90">
        <img src="${TMDB_IMAGE_BASE_URL}w500${item.poster_path}" 
             alt="${item.title || item.name}" 
             class="w-full object-cover rounded-lg">
        <div class="mt-3">
          <h3 class="text-white font-semibold text-sm">${item.title || item.name}</h3>
          <p class="text-zinc-400 text-xs mt-1">
            ${item.media_type === 'movie' ? 'Movie' : 'TV Show'} • 
            ${new Date(item.release_date || item.first_air_date).getFullYear() || 'N/A'}
          </p>
        </div>
      </div>
    `;
    
    resultCard.addEventListener('click', () => {
      window.history.pushState(null, null, `/dl/${item.media_type}/${item.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    
    container.appendChild(resultCard);
  });
}

/**
 * Shows a no results message
 * @param {HTMLElement} container - The container to display the message in
 */
function showNoResults(container) {
  container.innerHTML = `
    <div class="col-span-5 text-center py-12">
      <i class="fas fa-search text-4xl mb-4 text-zinc-500"></i>
      <h2 class="text-2xl font-bold mb-2">No results found</h2>
      <p class="text-zinc-400">Try a different search term</p>
    </div>
  `;
}