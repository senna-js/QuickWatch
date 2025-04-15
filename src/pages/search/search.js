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
      
      <div class="relative md:px-[4.4rem] p-4 md:py-12 pb-20 md:pb-12 mt-10">
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
async function displayRecentShows(container) {
  const recents = JSON.parse(localStorage.getItem('quickwatch-recents') || '[]');
  
  if (recents.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.className = 'flex flex-col gap-4 md:gap-6 pb-4';
  container.innerHTML = `
    <h2 class="text-3xl md:text-4xl font-normal mt-6 md:mt-4">You recently watched...</h2>
    <div class="flex flex-row overflow-x-auto gap-4 md:gap-6 pb-4 mx-[-4.4rem]" style="scrollbar-width: none;" id="recent-results">
  `;

  const recentResults = document.getElementById('recent-results');
  const options = {
    method: 'GET',
    headers: { 'accept': 'application/json', 'Authorization': TMDB_API_KEY }
  };
  
  for (const item of recents) {
    try {
      const detailUrl = `${TMDB_BASE_URL}/${item.mediaType}/${item.id}?append_to_response=images&language=en-US&include_image_language=en`;
      const detailResponse = await fetch(detailUrl, options);
      const detailData = await detailResponse.json();
      
      let backdropPath = '';
      if (detailData.images && detailData.images.backdrops && detailData.images.backdrops.length > 0) {
        backdropPath = `${TMDB_IMAGE_BASE_URL}w500${detailData.images.backdrops[0].file_path}`;
      } else if (detailData.backdrop_path) {
        backdropPath = `${TMDB_IMAGE_BASE_URL}w500${detailData.backdrop_path}`;
      } else {
        backdropPath = item.posterPath;
      }
      
      const resultCard = document.createElement('div');
      resultCard.className = 'w-[300px] aspect-video bg-[#32363D] flex-shrink-0 rounded-lg';
      
      if (recentResults.children.length === 0) {
        resultCard.className += ' ml-[4.4rem]';
      }
      
      resultCard.style.backgroundImage = `url(${backdropPath})`;
      resultCard.style.backgroundSize = 'cover';
      resultCard.style.backgroundPosition = 'center';
      
      const overlay = document.createElement('div');
      overlay.className = 'w-full h-full flex items-end p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300';
      
      const title = document.createElement('h3');
      title.className = 'text-white font-semibold';
      title.textContent = detailData.title || detailData.name || item.title;
      
      overlay.appendChild(title);
      resultCard.appendChild(overlay);
      
      resultCard.addEventListener('click', () => {
        window.history.pushState(null, null, `/${item.mediaType}/${item.id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      
      recentResults.appendChild(resultCard);
    } catch (error) {
      console.error(`Error loading recent item ${item.id}:`, error);
      
      const resultCard = document.createElement('div');
      resultCard.className = 'w-[300px] aspect-video bg-[#32363D] flex-shrink-0 rounded-lg';
      
      if (recentResults.children.length === 0) {
        resultCard.className += ' ml-[4.4rem]';
      }
      
      resultCard.style.backgroundImage = `url(${item.posterPath})`;
      resultCard.style.backgroundSize = 'cover';
      resultCard.style.backgroundPosition = 'center';
      
      const overlay = document.createElement('div');
      overlay.className = 'w-full h-full flex items-end p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300';
      
      const title = document.createElement('h3');
      title.className = 'text-white font-semibold';
      title.textContent = item.title;
      
      overlay.appendChild(title);
      resultCard.appendChild(overlay);
      
      resultCard.addEventListener('click', () => {
        window.history.pushState(null, null, `/${item.mediaType}/${item.id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      
      recentResults.appendChild(resultCard);
    }
  }
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
 * Displays search results in the container
 * @param {Array} results - The search results to display
 * @param {HTMLElement} container - The container to display results in
 */
function displaySearchResults(results, container) {
  container.innerHTML = '';
  
  container.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6';
  
  results.forEach((item) => {
    let backdropPath = '';
    if (item.images && item.images.backdrops && item.images.backdrops.length > 0) {
      backdropPath = `${TMDB_IMAGE_BASE_URL}w500${item.images.backdrops[0].file_path}`;
    } else if (item.backdrop_path) {
      backdropPath = `${TMDB_IMAGE_BASE_URL}w500${item.backdrop_path}`;
    }
    
    if (!backdropPath) return;
    
    const resultCard = document.createElement('div');
    resultCard.className = 'aspect-video bg-[#32363D] rounded-lg w-full';
    
    resultCard.style.backgroundImage = `url(${backdropPath})`;
    resultCard.style.backgroundSize = 'cover';
    resultCard.style.backgroundPosition = 'center';
    
    const overlay = document.createElement('div');
    overlay.className = 'w-full h-full flex items-end p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300';
    
    const title = document.createElement('h3');
    title.className = 'text-white font-semibold';
    title.textContent = item.title || item.name;
    
    overlay.appendChild(title);
    resultCard.appendChild(overlay);
    
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