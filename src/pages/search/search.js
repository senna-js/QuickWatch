// Search Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { renderSpinner } from '../../components/loading.js';
import { renderSearchError } from '../../components/error.js';
import { renderNoResults } from '../../components/empty.js';

/**
 * Renders the search page
 * @param {HTMLElement} container
 */
export function renderSearchPage(container) {
  container.innerHTML = `
    ${renderHeader()}
      
    <div class="relative w-screen h-screen">
      <!-- Grid Background -->
      <div class="absolute inset-0 opacity-10 pointer-events-none"
           style="background-image: linear-gradient(to bottom, 
                    rgba(215, 215, 228, 0.5),
                    rgba(0, 0, 0, 0.5)
                  ),
                  radial-gradient(circle, currentColor 1px, transparent 1px);
                  background-size: 100% 100%, 24px 24px;">
      </div>
      
      <div class="relative md:ml-16 p-4 md:p-12 pb-20 md:pb-12">
        <h1 class="text-3xl md:text-4xl font-normal mt-2 mb-4 md:mb-6 md:mt-0">Find your next favorite series, movie, or anime...</h1>
        <div class="mb-6 md:mb-8">
          <input type="text" id="search-input" placeholder="Enter your search query..." 
            class="w-full p-3 md:p-4 bg-zinc-900 rounded-lg text-white outline-none focus:ring-2 focus:ring-zinc-800">
        </div>
        <div id="search-results" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"></div>
      </div>
    </div>
  `;
  
  initSearch();
}

function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (!searchInput || !searchResults) return;
  
  displayRecentShows(searchResults);
  
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    
    const query = searchInput.value.trim();
    if (query.length < 2) {
      displayRecentShows(searchResults);
      return;
    }
    
    searchTimeout = setTimeout(() => {
      performSearch(query, searchResults);
    }, 500);
  });
  
  searchInput.focus();
}

/**
 * Displays recently viewed shows
 * @param {HTMLElement} container - The container to display results in
 */
function displayRecentShows(container) {
  const recents = JSON.parse(localStorage.getItem('quickwatch-recents') || '[]');
  
  if (recents.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.className = 'flex flex-col gap-4 md:gap-6 pb-4';
  container.innerHTML = `
    <h2 class="text-3xl md:text-4xl font-normal mt-6 md:mt-4">You recently watched...</h2>
    <div class="flex flex-row overflow-x-auto gap-4 md:gap-6 pb-4" style="scrollbar-width: none;" id="recent-results">
  `;

  const recentResults = document.getElementById('recent-results');
  
  recents.forEach(item => {
    const resultCard = document.createElement('div');
    resultCard.className = 'movie-card p-3 w-32 md:w-48 rounded-lg overflow-hidden transition-all duration-300 hover:bg-zinc-800 hover:border-zinc-700 border-2 border-transparent flex-shrink-0';
    
    resultCard.innerHTML = `
      <div class="transition-transform duration-300 hover:scale-95 active:scale-90">
        ${item.posterPath ? 
          `<img src="${item.posterPath}" 
                alt="${item.title}" 
                class="w-full object-cover rounded-lg">` : 
          `<div class="w-full h-64 bg-zinc-800 rounded-lg flex items-center justify-center">
             <span class="text-zinc-500">No Image</span>
           </div>`
        }
        <div class="mt-3">
          <h3 class="text-white font-semibold text-sm">${item.title}</h3>
          <p class="text-zinc-400 text-xs mt-1">
            ${item.mediaType === 'movie' ? 'Movie' : 'TV Show'} • 
            ${item.year}
          </p>
        </div>
      </div>
    `;
    
    resultCard.addEventListener('click', () => {
      window.history.pushState(null, null, `/${item.mediaType}/${item.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    
    recentResults.appendChild(resultCard);
  });
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
        ${renderSpinner('medium')}
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
    resultsContainer.innerHTML = renderSearchError('Something went wrong. Please try again later.');
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
      window.history.pushState(null, null, `/${item.media_type}/${item.id}`);
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
  container.innerHTML = renderNoResults('No results found', 'Please try a different search term', 'fa-search');
}