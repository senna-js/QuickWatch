// Download Details
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { renderError, renderAlert } from '../../components/error.js';

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

    ${renderHeader()}
  
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
      ${renderAlert(
        'You must have a torrenting client installed to download',
        'To download from QuickWatch, you need to have a torrenting client installed. We recommend <a href="https://www.qbittorrent.org/download" class="underline hover:text-zinc-300" target="_blank">qBittorent</a>, as it has a clean interface and is easy to use, but you can use whichever one you like.',
        'warning'
      )}
      ${/iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || (window.opera && opera.toString() === `[object Opera]`)) ? `
      <div class="bg-zinc-800 border-l-4 border-zinc-300 text-zinc-200 p-4 mb-8 rounded shadow-md">
        <div class="flex items-start">
          <div class="flex-shrink-0 mt-0.5">
            <i class="fas fa-info-circle text-zinc-200 text-xl"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium">You seem to be on an iPhone/iPad</h3>
            <p class="mt-1 text-zinc-400">It's really hard to download torrents on iOS, as there aren't any apps that make it easy to do so. However, we will still show you the torrent sources if you have your own method.</p>
          </div>
        </div>
      </div>
      ` : ''}

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
        <h2 class="text-2xl font-bold mb-4">Torrent Sources</h2>
        ${torrentsData.length > 0 ? `
          <div class="space-y-3">
            ${torrentsData.map(torrent => `
              <a href="${torrent.url}"
                    onclick="(e => {
                      e.preventDefault();
                      try {
                        window.location.href = '${torrent.url}';
                        return true;
                      } catch(e) {
                        alert('You must have a torrenting client installed to download this file');
                        return false;
                      }
                    })(event)"
                    class="block no-underline">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-zinc-800 rounded-lg hover:bg-[#36363c] transition-colors select-none">
                  <div class="flex-grow flex flex-col md:flex-row items-start md:items-center">
                    <span class="text-white mb-2 md:mb-0 md:mr-4">
                      ${torrent.title || data.title || data.name}
                    </span>
                    <div class="flex flex-wrap gap-2 mb-2 md:mb-0">
                      ${torrent.tags.map(tag => `
                        <span class="text-xs px-2 py-1 bg-zinc-600 rounded-full">${tag}</span>
                      `).join('')}
                    </div>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm text-zinc-400 mr-3">
                      ${torrent.source}
                    </span>
                    <div class="flex space-x-2">
                      <button 
                        class="text-zinc-200 hover:text-white bg-zinc-700 hover:bg-zinc-500 p-2 focus:outline-none rounded"
                        onclick="event.stopPropagation(); event.preventDefault(); navigator.clipboard.writeText('${torrent.url}'); alert('Magnet link copied to clipboard');"
                        aria-label="Copy magnet link">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                      <button
                        class="text-zinc-200 hover:text-white bg-zinc-700 hover:bg-zinc-500 p-2 focus:outline-none rounded"
                        onclick="event.stopPropagation(); event.preventDefault(); window.location.href='${torrent.url}';"
                        aria-label="Open magnet link">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      <button
                        class="text-zinc-200 hover:text-white bg-zinc-700 hover:bg-zinc-500 p-2 focus:outline-none rounded"
                        onclick="event.stopPropagation(); event.preventDefault(); window.location.href='/${type}/${id}';"
                        aria-label="Watch media">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </a>
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
    document.getElementById('details-container').innerHTML = renderError(
      'Error', 
      'Failed to load torrent sources', 
      'Back to Download Search',
      "window.history.pushState(null, null, '/download'); window.dispatchEvent(new PopStateEvent('popstate'))"
    );
    
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
    
    return Promise.resolve();
  }
}