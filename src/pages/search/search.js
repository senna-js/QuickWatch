// Search Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { renderSpinner } from '../../components/misc/loading.js';
import { renderSearchError } from '../../components/misc/error.js';
import { renderNoResults } from '../../components/misc/empty.js';
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
      
      <div class="relative md:px-[4.4rem] p-4 md:py-12 pb-20 md:pb-12 md:mt-10">
        <div class="mb-6 md:mb-8">
          <h1 class="text-3xl md:text-4xl font-bold mt-2 mb-4 md:mb-6 md:mt-0 hidden md:block">What do you feel like watching?</h1>
          <input type="text" id="search-input" placeholder="Enter your search query..." 
            class="w-full p-3 md:p-4 bg-gray-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-gray-700">
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
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    container.className = 'flex flex-col gap-4';
    container.innerHTML = '';
    
    if (results.length === 0) {
      container.innerHTML = renderNoResults();
      return;
    }
    
    results.forEach(item => {
      const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      const title = item.title || item.name;
      const releaseDate = item.release_date || item.first_air_date;
      const formattedDate = releaseDate ? new Date(releaseDate).getFullYear() : '';
      const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : '';
      const seasons = item.number_of_seasons ? `${item.number_of_seasons} Season${item.number_of_seasons > 1 ? 's' : ''}` : '';
      
      let imagePath;
      if (isMobile) {
        imagePath = item.images && item.images.backdrops && item.images.backdrops.length > 0 
          ? item.images.backdrops[0].file_path 
          : item.backdrop_path;
          
        if (!imagePath) {
          imagePath = item.poster_path;
        }
      } else {
        imagePath = item.poster_path;
      }
      
      if (!imagePath) return;
      
      const resultItem = document.createElement('div');
      resultItem.className = 'flex flex-row overflow-hidden cursor-pointer h-24';
      resultItem.dataset.id = item.id;
      resultItem.dataset.mediaType = mediaType;
      
      resultItem.innerHTML = `
        <div class="w-[10.67rem] h-full">
          <img src="${TMDB_IMAGE_BASE_URL}w300${imagePath}" alt="${title}" class="w-full h-full object-cover rounded-lg">
        </div>
        <div class="flex flex-col justify-center p-3 flex-1">
          <h3 class="text-white font-medium text-lg line-clamp-1">${title}</h3>
          <p class="text-zinc-400 text-sm">
            ${seasons ? `${seasons} • ` : ''}${formattedDate ? `${formattedDate} • ` : ''}${rating ? `★ ${rating}` : ''}
          </p>
        </div>
      `;
      
      resultItem.addEventListener('click', () => {
        window.history.pushState(null, null, `/${mediaType}/${item.id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      
      container.appendChild(resultItem);
    });
  } else {
    container.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6';
    container.innerHTML = '';
    
    if (results.length === 0) {
      container.innerHTML = renderNoResults();
      return;
    }
    
    results.forEach(item => {
      const carouselItem = createCarouselItem(item, false, 'grid');
      if (carouselItem) {
        carouselItem.classList.remove('w-[300px]', 'w-[140px]');
        carouselItem.classList.add('w-full');
        if (carouselItem.style.aspectRatio) {
        } else { carouselItem.classList.add('aspect-video'); }
        
        container.appendChild(carouselItem);
      }
    });
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
 * Shows a no results message
 * @param {HTMLElement} container - The container to display the message in
 */
function showNoResults(container) {
  container.innerHTML = renderNoResults('No results found', 'Please try a different search term', 'fa-search');
}