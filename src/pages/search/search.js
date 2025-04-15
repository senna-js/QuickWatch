// Search Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { renderSpinner } from '../../components/loading.js';
import { renderSearchError } from '../../components/error.js';
import { renderNoResults } from '../../components/empty.js';
import { createCarouselItem } from '../../components/carouselItem.js';

/**
 * Renders the search page
 * @param {HTMLElement} container
 */
export function renderSearchPage(container) {
  container.innerHTML = `
    ${renderHeader()}
      
    <div class="absolute w-screen h-screen">
      <!-- Grid Background -->
      <div class="absolute inset-0 opacity-10 pointer-events-none"
           style="background-image: linear-gradient(to bottom, 
                    rgba(215, 215, 228, 0.5),
                    rgba(0, 0, 0, 0.5)
                  ),
                  radial-gradient(circle, currentColor 1px, transparent 1px);
                  background-size: 100% 100%, 24px 24px;">
      </div>
      
      <div class="relative md:px-[4.4rem] p-4 md:py-12 pb-20 md:pb-12 mt-10">
        <div class="mb-6 md:mb-8">
          <h1 class="text-3xl md:text-4xl font-bold mt-2 mb-4 md:mb-6 md:mt-0">What do you feel like watching?</h1>
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

function displaySearchResults(results, container) {
  container.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6';
  container.innerHTML = '';
  
  if (results.length === 0) {
    container.innerHTML = renderNoResults();
    return;
  }
  
  results.forEach(item => {
    const carouselItem = createCarouselItem(item, false, 'grid');
    if (carouselItem) {
      container.appendChild(carouselItem);
    }
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
        (item.media_type === 'movie' || item.media_type === 'tv')
      );

      
      if (filteredResults.length > 0) {
        const detailedResults = await Promise.all(
          filteredResults.slice(0, 20).map(async (item) => {
            try {
              const detailUrl = `${TMDB_BASE_URL}/${item.media_type}/${item.id}?append_to_response=images&language=en-US&include_image_language=en`;
              const detailResponse = await fetch(detailUrl, options);
              return {...await detailResponse.json(), media_type: item.media_type};
            } catch (error) {
              console.error(`Error fetching details for ${item.id}:`, error);
              return item;
            }
          })
        );
        
        displaySearchResults(detailedResults, resultsContainer);
      } else {
        showNoResults(resultsContainer);
      }
    } else {
      showNoResults(resultsContainer);
    }
  } catch (error) {
    console.error('Error searching:', error);
    resultsContainer.innerHTML = renderSearchError('Something went wrong. Please try again later.');
  }
}

/**
 * Shows a no results message
 * @param {HTMLElement} container - The container to display the message in
 */
function showNoResults(container) {
  container.innerHTML = renderNoResults('No results found', 'Please try a different search term', 'fa-search');
}