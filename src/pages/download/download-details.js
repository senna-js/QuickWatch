// Download Details
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';

/**
 * Renders the download details page for a movie or TV show
 * @param {HTMLElement} container
 * @param {Object} params
 */
let currentLoadingPromise = null;

export function renderDownloadDetailsPage(container, params) {
  if (window.splashScreen) {
    window.splashScreen.show();
  }
  
  container.innerHTML = `
    <div id="backdrop-bg" class="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 z-0 blur-[1rem]"></div>

    <div class="fixed left-0 top-0 h-full w-16 bg-zinc-900 flex flex-col items-center py-8 space-y-8 z-10 hidden md:flex">
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
  
    <div class="md:ml-16 p-4 md:p-12 pb-20 md:pb-12 relative z-10" id="details-container">
      <!-- Content will be loaded dynamically -->
    </div>
  `;
  
  currentLoadingPromise = loadMediaDetails(params.type, params.id);
  return currentLoadingPromise;
}

/**
 * Loads and displays download details for a specific movie or TV show
 * @param {string} type - The media type ('movie' or 'tv')
 * @param {string} id - The media ID
 */
async function loadMediaDetails(type, id) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };
    
    const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?language=en-US`, options);
    const data = await response.json();

    console.log(data)
    
    const externalIdsResponse = await fetch(`${TMDB_BASE_URL}/${type}/${id}/external_ids`, options);
    const externalIds = await externalIdsResponse.json();
    
    const imdbId = externalIds.imdb_id;
    
    if (!imdbId) {
      throw new Error('IMDB ID not found for this media');
    }
    
    let torrentsData = [];
    try {
      const formData = new FormData();
      formData.append('title', data.title || data.name);
      formData.append('imdbid', imdbId);
      formData.append('type', type);
      
      const torrentsResponse = await fetch('https://varunaditya.xyz/api/get_torrents', {
        method: 'POST',
        body: formData
      });
      
      if (torrentsResponse.ok) {
        torrentsData = await torrentsResponse.json();
      } else {
        console.warn('Torrent API returned non-OK status:', torrentsResponse.status);
      }
    } catch (torrentsError) {
      console.warn('Failed to fetch torrent data:', torrentsError);
    }

    console.log(torrentsData);
    
    const detailsContainer = document.getElementById('details-container');
    if (!detailsContainer) return;
    
    if (data.backdrop_path) {
      const backdropBg = document.getElementById('backdrop-bg');
      if (backdropBg) {
        backdropBg.style.backgroundImage = `url(${TMDB_IMAGE_BASE_URL}original${data.backdrop_path})`;
      }
    }
    
    detailsContainer.innerHTML = `
      <div class="bg-zinc-900 border-l-4 border-amber-500 text-amber-400 p-4 mb-8 rounded shadow-md">
        <div class="flex items-start">
          <div class="flex-shrink-0 mt-0.5">
            <i class="fas fa-exclamation-triangle text-amber-400 text-xl"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium">You must have a torrenting client installed to download</h3>
            <p class="mt-1 text-zinc-400">To download from QuickWatch, you need to have a torrenting client installed. We recommend <a href="https://www.qbittorrent.org/download" class="underline hover:text-zinc-300" target="_blank">qBittorent</a>, as it has a clean interface and is easy to use, but you can use whichever one you like.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div class="md:col-span-1">
          <img src="${TMDB_IMAGE_BASE_URL}w500${data.poster_path}" 
               class="w-full rounded-lg" alt="${data.title || data.name} poster">
        </div>
        
        <div class="md:col-span-3">
          <h1 class="text-4xl font-bold mb-4">${data.title || data.name}</h1>
          
          <div class="flex items-center space-x-4 mb-6">
            <span class="flex items-center"><i class="fas fa-star text-yellow-500 mr-1"></i> ${data.vote_average?.toFixed(1) || 'N/A'}</span>
            <span>${new Date(data.release_date || data.first_air_date).getFullYear() || 'N/A'}</span>
            <span class="px-2 py-1 border border-zinc-500 text-sm">${type === 'movie' ? 'Movie' : 'TV Show'}</span>
          </div>
          
          <h2 class="text-2xl font-bold mb-4">Overview</h2>
          <p class="text-zinc-300 mb-6">${data.overview || 'No overview available'}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-bold mb-4">Download Options</h2>
        ${torrentsData.length > 0 ? `
          <div class="space-y-3">
            ${torrentsData.map(torrent => `
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer"
                   onclick="(() => {
                     try {
                       window.location.href = '${torrent.url}';
                       return true;
                     } catch(e) {
                       alert('You must have a torrenting client installed to download this file');
                       return false;
                     }
                   })()">
                <div class="flex flex-col md:flex-row items-start md:items-center">
                  <span class="text-white mb-2 md:mb-0 md:mr-4">
                    ${torrent.title || data.title || data.name}
                  </span>
                  <div class="flex flex-wrap gap-2 mb-2 md:mb-0">
                    ${torrent.tags.map(tag => `
                      <span class="text-xs px-2 py-1 bg-zinc-600 rounded-full">${tag}</span>
                    `).join('')}
                  </div>
                </div>
                <span class="text-sm text-zinc-400">
                  ${torrent.source}
                </span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="text-center py-8 bg-zinc-800 rounded-lg px-2">
            <i class="fas fa-exclamation-circle text-4xl mb-4 text-zinc-500"></i>
            <h3 class="text-xl font-bold mb-2">No downloads found</h3>
            <p class="text-zinc-400">We couldn't find any torrent sources for ${data.title || data.name}. Try checking:
              <a href="https://torrentgalaxy.one/get-posts/keywords:${imdbId}/" class="text-blue-400 hover:underline" target="_blank">TorrentGalaxy</a>, 
              <a href="https://1337x.pro/search/?q=${encodeURIComponent(data.title || data.name)}" class="text-blue-400 hover:underline" target="_blank">1337x</a>, 
              <a href="https://nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(data.title || data.name)}" class="text-blue-400 hover:underline" target="_blank">Nyaa.si</a> or 
              <a href="#" class="text-blue-400 hover:underline" onclick="(() => {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://ww4.thepiratebay3.co/s/';
                form.target = '_blank';
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'q';
                input.value = '${(data.title || data.name).replace(/'/g, "\\'")}';
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);
                return false;
              })()">The Pirate Bay</a>
            </p>
          </div>
        `}
      </div>
    `;
    
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
    
    return Promise.resolve();
    
  } catch (error) {
    console.error('Error loading media details:', error);
    document.getElementById('details-container').innerHTML = `
      <div class="flex flex-col items-center justify-center h-screen">
        <h1 class="text-4xl font-bold mb-4">Error</h1>
        <p class="text-xl mb-8">Failed to load download options</p>
        <button onclick="window.history.pushState(null, null, '/download'); window.dispatchEvent(new PopStateEvent('popstate'))" 
            class="px-6 py-3 bg-white text-black rounded-md hover:bg-zinc-200 transition">
            Back to Download Search
        </button>
      </div>
    `;
    
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
    
    return Promise.resolve();
  }
}