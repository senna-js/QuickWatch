// Anime Header Component
import { searchAnime, renderSearchResults, renderSearchUI, renderPagination } from "../search.js";

export function renderAnimeHeader() {
  return `
    <header class="h-16 fixed top-0 left-0 bg-[#0E0E0E] border-b border-[#F5F5F5]/10 transition-all duration-200 ease z-50 py-3 px-4 text-white items-center text-md flex-row justify-between hidden md:flex w-full">
      
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/anime" class="text-2xl hover:text-[#2392EE] transition duration-200 ease active:scale-90" style="font-family: 'Instrument Serif';">quickwatch anime</a>
      </div>

      <!-- Search Box -->
      <div class="flex-1 flex justify-center items-center pl-6 pr-2">
        <div class="relative w-full group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="icon-search text-gray-400 group-focus-within:text-[#2392EE]"></i>
          </div>
          <input
            id="anime-search-input"
            type="text"
            placeholder="Search anime"
            class="block w-full bg-[#141414] border border-[#F5F5F5]/10 rounded-md py-2 pl-10 pr-3 text-sm placeholder-[#F5F5F5]/20 text-white focus:outline-none focus:border-[#2392EE] focus:placeholder-[#2392EE]/40 transition duration-200 ease-in-out"
          />
        </div>
      </div>

      <!-- Icons -->
      <div class="flex items-center flex-row gap-2">
        <button aria-label="Search" id="anime-search-button" class="p-2 w-10 h-10 bg-[#141414] border border-[#F5F5F5]/10 rounded-md hover:bg-[#1f1f1f] cursor-pointer active:scale-90 focus:outline-none focus:border-[#2392EE] focus:text-[#2392EE]">
          <i class="icon-search"></i>
        </button>
        <button aria-label="Watchlist" class="p-2 w-10 h-10 bg-[#141414] border border-[#F5F5F5]/10 rounded-md hover:bg-[#1f1f1f] cursor-pointer active:scale-90 focus:outline-none focus:border-[#2392EE] focus:text-[#2392EE]">
          <i class="icon-bookmark"></i>
        </button>
      </div>
      
    </header>
  `;
}

export function initializeSearchFunctionality() {
  if (!document.getElementById('search-modal')) {
    const searchModal = document.createElement('div');
    searchModal.id = 'search-modal';
    searchModal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 hidden overflow-y-auto';
    searchModal.innerHTML = `
      <div class="relative w-full h-full">
        <button id="close-search-modal" class="absolute top-4 right-4 text-white p-2">
          <i class="icon-x text-xl"></i>
        </button>
        ${renderSearchUI()}
      </div>
    `;
    document.body.appendChild(searchModal);
    
    document.getElementById('close-search-modal').addEventListener('click', () => {
      document.getElementById('search-modal').classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    });
  }
  
  const searchButton = document.getElementById('anime-search-button');
  const searchInput = document.getElementById('anime-search-input');
  
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const modal = document.getElementById('search-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        const searchValue = searchInput.value.trim();
        if (searchValue) {
          performSearch(searchValue);
        } else {
          const modalInput = modal.querySelector('input');
          if (modalInput) modalInput.focus();
        }
      }
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const modal = document.getElementById('search-modal');
        if (modal) {
          modal.classList.remove('hidden');
          document.body.classList.add('overflow-hidden');
          const searchValue = searchInput.value.trim();
          if (searchValue) {
            performSearch(searchValue);
          }
        }
      }
    });
  }
  
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('[data-page]');
    if (target) {
      const page = parseInt(target.dataset.page);
      const query = target.dataset.query;
      if (page && query) {
        performSearch(query, page);
      }
    }
  });
  
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('.anime-card');
    if (target && target.dataset.id) {
      const animeId = target.dataset.id;
      window.location.href = `/anime/${animeId}`;
    }
  });
}

async function performSearch(query, page = 1) {
  if (!query || query.trim() === '') return;
  
  const resultsContainer = document.getElementById('search-results');
  const paginationContainer = document.getElementById('search-pagination');
  
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2392EE]"></div>
      </div>
    `;
  }
  
  if (paginationContainer) {
    paginationContainer.innerHTML = '';
  }
  
  try {
    const { results, totalPages } = await searchAnime(query, page);
    
    if (resultsContainer) {
      resultsContainer.innerHTML = renderSearchResults(results);
    }
    
    if (paginationContainer && totalPages > 0) {
      paginationContainer.innerHTML = renderPagination(page, totalPages, query);
    }
  } catch (error) {
    console.error('Error performing search:', error);
    
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="flex items-center justify-center p-8">
          <p class="text-white opacity-60">Error loading search results. Please try again later.</p>
        </div>
      `;
    }
  }
}