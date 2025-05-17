// Anime Header Component
import { searchAnime, renderSearchResults, renderSearchUI } from "../search.js";

export function renderAnimeHeader() {
  return `
    <header class="h-16 fixed top-0 left-0 bg-anime-modal-bg border-b border-anime-border/10 transition-all duration-200 ease z-50 py-3 px-4 text-white items-center text-md flex-row justify-between hidden md:flex w-full">
      
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/anime" class="text-2xl hover:text-accent transition duration-200 ease active:scale-90" style="font-family: 'Instrument Serif';">quickwatch anime</a>
      </div>

      <!-- Search Box -->
      <div class="flex-1 flex justify-center items-center pl-6 pr-2">
        <div class="relative w-full group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="icon-search text-gray-400 group-focus-within:text-accent"></i>
          </div>
          <input
            id="anime-search-input"
            type="text"
            placeholder="Search anime"
            class="block w-full bg-anime-card-bg border border-anime-border/10 rounded-md py-2 pl-10 pr-3 text-sm placeholder-anime-border/20 text-white focus:outline-none focus:border-accent focus:placeholder-accent/40 transition duration-200 ease-in-out"
          />
          <!-- Search Dropdown Container -->
          <div id="search-dropdown" class="absolute top-full left-0 right-0 mt-1 bg-anime-modal-bg border border-anime-border/10 rounded-md shadow-xl overflow-hidden z-50 max-h-[80vh] overflow-y-auto hidden">
            <div id="search-results" class="min-h-[100px]">
              <!-- Search results will be loaded here -->
              <div class="flex items-center justify-center p-8">
                <p class="text-white opacity-60">Enter your search query above</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Icons -->
      <div class="flex items-center flex-row gap-2">
        <button aria-label="Search" id="anime-search-button" class="p-2 w-10 h-10 bg-anime-card-bg border border-anime-border/10 rounded-md hover:bg-[#1f1f1f] cursor-pointer active:scale-90 focus:outline-none focus:border-accent focus:text-accent">
          <i class="icon-search"></i>
        </button>
        <button aria-label="Watchlist" class="p-2 w-10 h-10 bg-anime-card-bg border border-anime-border/10 rounded-md hover:bg-[#1f1f1f] cursor-pointer active:scale-90 focus:outline-none focus:border-accent focus:text-accent">
          <i class="icon-bookmark"></i>
        </button>
      </div>
      
    </header>
  `;
}

export function initializeSearchFunctionality() {
  const searchButton = document.getElementById('anime-search-button');
  const searchInput = document.getElementById('anime-search-input');
  const searchDropdown = document.getElementById('search-dropdown');
  
  document.addEventListener('click', (e) => {
    if (searchDropdown && 
        !searchDropdown.contains(e.target) && 
        e.target !== searchInput && 
        e.target !== searchButton) {
      searchDropdown.classList.add('hidden');
    }
  });
  
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      if (searchDropdown) {
        const searchValue = searchInput.value.trim();
        
        searchDropdown.classList.remove('hidden');
        
        if (searchValue) {
          initSearch(searchValue);
        }
      }
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (searchDropdown) {
          searchDropdown.classList.remove('hidden');
          const searchValue = searchInput.value.trim();
          if (searchValue) {
            initSearch(searchValue);
          }
        }
      }
    });
    
    searchInput.addEventListener('focus', () => {
      if (searchDropdown) {
        searchDropdown.classList.remove('hidden');
        const searchValue = searchInput.value.trim();
        if (searchValue) {
          initSearch(searchValue);
        }
      }
    });
  }
  
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('.anime-card');
    if (target && target.dataset.id) {
      const animeId = target.dataset.id;
      window.location.href = `/anime/${animeId}`;
      
      if (searchDropdown) {
        searchDropdown.classList.add('hidden');
      }
    }
  });
  
  if (searchDropdown) {
    searchDropdown.addEventListener('scroll', debounce(() => {
      const scrollPosition = searchDropdown.scrollTop + searchDropdown.clientHeight;
      const scrollHeight = searchDropdown.scrollHeight;
      
      if (scrollPosition >= scrollHeight * 0.8) {
        loadMoreResults();
      }
    }, 200));
  }
}

const searchState = {
  query: '',
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  hasMoreResults: true
};

function initSearch(query) {
  searchState.query = query;
  searchState.currentPage = 1;
  searchState.totalPages = 0;
  searchState.isLoading = false;
  searchState.hasMoreResults = true;
  
  const resultsContainer = document.getElementById('search-results');
  
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div class="flex items-center justify-center p-8">
        <p class="text-white opacity-60">Loading...</p>
      </div>
    `;
  }
  
  performSearch(query, 1, true);
}

function loadMoreResults() {
  if (searchState.isLoading || !searchState.hasMoreResults) return;
  
  if (searchState.totalPages > 0 && searchState.currentPage >= searchState.totalPages) {
    searchState.hasMoreResults = false;
    return;
  }
  
  performSearch(searchState.query, searchState.currentPage + 1, false);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function performSearch(query, page = 1, resetResults = false) {
  if (!query || query.trim() === '') return;
  
  searchState.isLoading = true;
  
  const resultsContainer = document.getElementById('search-results');
  const searchDropdown = document.getElementById('search-dropdown');
  
  if (searchDropdown) {
    searchDropdown.classList.remove('hidden');
  }
  
  try {
    const { results, totalPages } = await searchAnime(query, page);
    
    searchState.currentPage = page;
    searchState.totalPages = totalPages;
    searchState.hasMoreResults = page < totalPages;
    
    if (resultsContainer) {
      if (resetResults) {
        resultsContainer.innerHTML = results.length ? renderSearchResults(results) : 
          `<div class="flex items-center justify-center p-8">
            <p class="text-white opacity-60">No results found</p>
          </div>`;
      } else {
        if (results.length) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = renderSearchResults(results);
          
          const items = tempDiv.firstElementChild.innerHTML;
          
          const existingResultsContainer = resultsContainer.querySelector('.flex.flex-col');
          if (existingResultsContainer) {
            existingResultsContainer.insertAdjacentHTML('beforeend', items);
          } else {
            resultsContainer.innerHTML += renderSearchResults(results);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error performing search:', error);
    
    if (resultsContainer && resetResults) {
      resultsContainer.innerHTML = `
        <div class="flex items-center justify-center p-8">
          <p class="text-white opacity-60">Error loading search results. Please try again later.</p>
        </div>
      `;
    }
    
    searchState.hasMoreResults = false;
  } finally {
    searchState.isLoading = false;
  }
}