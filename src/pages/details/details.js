// Details Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { renderSpinner, renderFullPageSpinner } from '../../components/loading.js';
import { renderError } from '../../components/error.js';

/**
 * Renders the details page for a movie or TV show
 * @param {HTMLElement} container
 * @param {Object} params
 */
export function renderDetailsPage(container, params) {
  container.innerHTML = `
    <div id="backdrop-bg" class="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 z-0 blur-[1rem]"></div>

    ${renderHeader()}
  
    <div class="md:ml-16 p-4 md:p-12 pb-20 md:pb-12 relative z-10" id="details-container">
      ${renderFullPageSpinner()}
    </div>
  `;
  
  loadMediaDetails(params.type, params.id);
}

/**
 * Loads and displays details for a specific movie or TV show
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
    
    let seasonData = null;
    if (type === 'tv') {
      const seasonResponse = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/1?language=en-US`, options);
      seasonData = await seasonResponse.json();
    }
    
    let initialSeason = 1;
    let initialEpisode = 1;
    
    if (type === 'tv') {
      const savedProgress = JSON.parse(localStorage.getItem(`tv-progress-${id}`) || '{}');
      if (savedProgress.season && savedProgress.episode) {
        initialSeason = savedProgress.season;
        initialEpisode = savedProgress.episode;
        if (initialSeason !== 1) {
          const seasonResponse = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${initialSeason}?language=en-US`, options);
          seasonData = await seasonResponse.json();
        }
      }
    }

    const detailsContainer = document.getElementById('details-container');
    if (!detailsContainer) return;
    
    if (data.backdrop_path) {
      const backdropBg = document.getElementById('backdrop-bg');
      if (backdropBg) {
        backdropBg.style.backgroundImage = `url(${TMDB_IMAGE_BASE_URL}original${data.backdrop_path})`;
      }
    }
    
    const sources = [
      {
        name: 'VidLink',
        movieUrl: `https://vidlink.pro/movie/${id}`,
        tvUrl: `https://vidlink.pro/tv/${id}/{season}/{episode}`
      },
      {
        name: 'Vidsrc.xyz',
        movieUrl: `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
        tvUrl: `https://vidsrc.xyz/embed/tv/${id}/{season}-{episode}`
      },
      {
        name: 'Vidjoy',
        movieUrl: `https://vidjoy.pro/embed/movie/${id}`,
        tvUrl: `https://vidjoy.pro/embed/tv/${id}/{season}/{episode}`
      },
      {
        name: 'VidsrcSU',
        movieUrl: `https://vidsrc.su/embed/movie/${id}`,
        tvUrl: `https://vidsrc.su/embed/tv/${id}/{season}/{episode}`
      },
      {
        name: 'VidsrcCC',
        movieUrl: `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false`,
        tvUrl: `https://vidsrc.cc/v3/embed/tv/${id}/{season}/{episode}?autoPlay=false`
      },
      {
        name: '111Movies',
        movieUrl: `https://111movies.com/movie/${id}`,
        tvUrl: `https://111movies.com/tv/${id}/{season}/{episode}`
      },
      {
        name: '🤩 AnimePahe',
        tvOnly: true,
        tvUrl: `/embed/animepahe/${id}/{episode}`
      }
    ];

    let initialSourceIndex = 0;
    if (type === 'tv') {
      const savedProgress = JSON.parse(localStorage.getItem(`tv-progress-${id}`) || '{}');
      if (savedProgress.sourceIndex !== undefined && savedProgress.sourceIndex >= 0 && savedProgress.sourceIndex < sources.length) {
        initialSourceIndex = savedProgress.sourceIndex;
      }
    } else {
      const savedSourcePref = JSON.parse(localStorage.getItem(`source-pref-${type}-${id}`) || 'null');
      if (savedSourcePref !== null && savedSourcePref >= 0 && savedSourcePref < sources.length) {
        initialSourceIndex = savedSourcePref;
      }
    }

    const defaultSource = sources[initialSourceIndex];
    const iframeUrl = type === 'movie' 
      ? defaultSource.movieUrl 
      : defaultSource.tvUrl
          .replace('{season}', initialSeason)
          .replace('{episode}', initialEpisode);
    
    detailsContainer.innerHTML = `
      <div class="mb-8">
        <div class="iframe-container loading">
          <iframe 
            id="media-player"
            src="${iframeUrl}" 
            class="w-full" 
            height="700" 
            frameborder="0" 
            allowfullscreen
          ></iframe>
          <div class="iframe-loader">
            ${renderSpinner('large')}
          </div>
        </div>
        
        <div class="mt-4">
          <div class="flex flex-col md:flex-row items-center justify-center gap-3">
            <div class="relative w-full md:w-auto">
              <select id="source-select" class="w-full md:w-auto bg-zinc-900 text-white py-2 px-4 rounded-full appearance-none border border-zinc-700 focus:border-zinc-500 focus:outline-none transition-colors text-sm min-w-[200px]">
                ${sources
                  .filter(source => type === 'movie' ? !source.tvOnly : true)
                  .map((source, index) => `<option value="${index}" ${index === initialSourceIndex ? 'selected' : ''}>${source.name}</option>`)
                  .join('')}
              </select>
              <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <i class="icon-chevron-down text-zinc-400 text-xs mr-1"></i>
              </div>
            </div>

            ${type === 'tv' ? `
            <div class="relative w-full md:w-auto">
              <select id="season-select" class="w-full md:w-auto bg-zinc-900 text-white py-2 px-4 rounded-full appearance-none border border-zinc-700 focus:border-zinc-500 focus:outline-none transition-colors text-sm min-w-[100px]">
                ${Array.from({length: data.number_of_seasons || 0}, (_, i) => 
                  `<option value="${i+1}" ${i+1 === initialSeason ? 'selected' : ''}>S${i+1}</option>`
                ).join('')}
              </select>
              <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <i class="icon-chevron-down text-zinc-400 text-xs mr-1"></i>
              </div>
            </div>
            <div class="relative w-full md:w-auto">
              <select id="episode-select" class="w-full md:w-auto bg-zinc-900 text-white py-2 px-4 rounded-full appearance-none border border-zinc-700 focus:border-zinc-500 focus:outline-none transition-colors text-sm min-w-[300px]">
                ${seasonData?.episodes?.map((episode, i) => 
                  `<option value="${i+1}" ${i+1 === initialEpisode ? 'selected' : ''}>E${i+1}  ${episode.name}</option>`
                ).join('') || ''}
              </select>
              <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <i class="icon-chevron-down text-zinc-400 text-xs mr-1"></i>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="md:col-span-1">
          <img src="${TMDB_IMAGE_BASE_URL}w500${data.poster_path}" 
               class="w-full rounded-lg" alt="${data.title || data.name} poster">
        </div>
        
        <div class="md:col-span-3">
          <h1 class="text-4xl font-bold mb-4">${data.title || data.name}</h1>
          
          <div class="flex items-center space-x-4 mb-6">
            <span class="flex items-center"><i class="fas fa-star text-yellow-500 mr-1"></i> ${data.vote_average?.toFixed(1) || 'N/A'}</span>
            <span>${new Date(data.release_date || data.first_air_date).getFullYear() || 'N/A'}</span>
            <span class="px-2 py-1 border border-zinc-500 text-sm">${type === 'movie' ? 'MOVIE' : 'TV'}</span>
          </div>
          
          <h2 class="text-2xl font-bold mb-4">Overview</h2>
          <p class="text-zinc-300 mb-6">${data.overview || 'No overview available'}</p>
          
          <div class="flex space-x-4 mb-6">
            <button class="flex items-center px-6 py-3 bg-transparent border border-white rounded-md hover:bg-zinc-800 transition add-to-watchlist">
              <i class="fas fa-plus mr-2"></i> Add to Watchlist
            </button>
          </div>
        </div>
      </div>
    `;
    
    const watchlistButton = detailsContainer.querySelector('.add-to-watchlist');
    if (watchlistButton) {
      watchlistButton.addEventListener('click', () => {
        const watchlist = JSON.parse(localStorage.getItem('quickwatch-watchlist') || '[]');
        
        const existingItem = watchlist.find(item => item.id === id && item.mediaType === type);
        
        if (!existingItem) {
          watchlist.push({
            id,
            mediaType: type,
            title: data.title || data.name,
            posterPath: `${TMDB_IMAGE_BASE_URL}w500${data.poster_path}`,
            dateAdded: new Date().toISOString()
          });
          
          localStorage.setItem('quickwatch-watchlist', JSON.stringify(watchlist));
          alert('Added to watchlist!');
        } else {
          alert('Already in your watchlist!');
        }
      });
    }

    const mediaPlayer = document.getElementById('media-player');
    const iframeContainer = mediaPlayer.parentElement;

    mediaPlayer.addEventListener('load', () => {
      iframeContainer.classList.remove('loading');
    });

    const updatePlayerSource = () => {
      let selectedSeason = '1';
      let selectedEpisode = '1';
      const sourceSelect = document.getElementById('source-select');
      const selectedSourceIndex = parseInt(sourceSelect.value);
      
      if (type === 'tv') {
        const seasonSelect = document.getElementById('season-select');
        const episodeSelect = document.getElementById('episode-select');
        selectedSeason = seasonSelect.value;
        selectedEpisode = episodeSelect.value;
        
        localStorage.setItem(`tv-progress-${id}`, JSON.stringify({
          season: parseInt(selectedSeason),
          episode: parseInt(selectedEpisode),
          sourceIndex: selectedSourceIndex,
          timestamp: new Date().toISOString()
        }));
      } else {
        localStorage.setItem(`source-pref-${type}-${id}`, JSON.stringify(selectedSourceIndex));
      }

      const selectedSource = sources[selectedSourceIndex];
      const newUrl = type === 'movie' 
        ? selectedSource.movieUrl 
        : selectedSource.tvUrl
            .replace('{season}', selectedSeason)
            .replace('{episode}', selectedEpisode);
      
      iframeContainer.classList.add('loading');
      mediaPlayer.src = newUrl;
    };
    
    const sourceSelect = document.getElementById('source-select');
    if (sourceSelect) {
      sourceSelect.addEventListener('change', updatePlayerSource);
    }

    if (type === 'tv') {
      const seasonSelect = document.getElementById('season-select');
      const episodeSelect = document.getElementById('episode-select');
            
      seasonSelect.addEventListener('change', async () => {
        const selectedSeason = parseInt(seasonSelect.value);
        
        const seasonResponse = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${selectedSeason}?language=en-US`, options);
        const seasonData = await seasonResponse.json();
        
        episodeSelect.innerHTML = seasonData.episodes.map((episode, index) => 
          `<option value="${index + 1}">E${index + 1}  ${episode.name}</option>`
        ).join('');
        
        updatePlayerSource();
      });
      
      episodeSelect.addEventListener('change', updatePlayerSource);
    }
    
  } catch (error) {
    console.error('Error loading media details:', error);
    document.getElementById('details-container').innerHTML = renderError(
      'Error', 
      'Failed to load details', 
      'Back to Home',
      "window.history.pushState(null, null, '/'); window.dispatchEvent(new PopStateEvent('popstate'))"
    );
  }
}