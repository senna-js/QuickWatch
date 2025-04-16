// Details Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { renderSpinner, renderFullPageSpinner } from '../../components/loading.js';
import { renderError } from '../../components/error.js';
import { createCarouselItem } from '../../components/carouselItem.js';
import { initTabSwitcher } from '../../components/tabSwitcher.js';
import { loadRelatedContent, loadDetailsContent } from '../../components/tabContent.js';

/**
 * Renders the details page for a movie or TV show
 * @param {HTMLElement} container
 * @param {Object} params
 */
export function renderDetailsPage(container, params) {
  if (window.splashScreen) {
    window.splashScreen.show();
  }
  
  container.innerHTML = `
    ${renderHeader()}
    <div id="details-container">
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
    const mediaDetailsStep = window.splashScreen?.addStep('Loading media details...');
    
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };
    
    const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?language=en-US&append_to_response=images&include_image_language=en`, options);
    const data = await response.json();
    
    // Fetch content ratings
    let contentRating = type === 'movie' ? 'MOVIE' : 'TV';
    if (type === 'tv') {
      try {
        const ratingsResponse = await fetch(`${TMDB_BASE_URL}/tv/${id}/content_ratings`, options);
        const ratingsData = await ratingsResponse.json();
        
        const usRating = ratingsData.results?.find(rating => rating.iso_3166_1 === 'US');
        if (usRating && usRating.rating) { contentRating = usRating.rating; }
      } catch (error) {
        console.error('Error fetching content ratings:', error);
      }
    }
    
    window.splashScreen?.completeStep(mediaDetailsStep);
    
    const viewingStartTime = Date.now();
    const currentMedia = { id, mediaType: type };
    let addedToContinueWatching = false;
    
    const viewingTimer = setInterval(() => {
      const viewingDuration = Date.now() - viewingStartTime;
      const seconds = Math.floor(viewingDuration / 1000);
      console.log(`${seconds}/30s`);
      
      if (!addedToContinueWatching && viewingDuration >= 30000) {
        addedToContinueWatching = true;
        const continueWatching = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
        
        const existingIndex = continueWatching.findIndex(item => 
          item.id === currentMedia.id && item.mediaType === currentMedia.mediaType
        );
        
        if (existingIndex !== -1) {
          continueWatching.splice(existingIndex, 1);
        }
        
        continueWatching.unshift({
          id: currentMedia.id,
          mediaType: currentMedia.mediaType
        });
        
        if (continueWatching.length > 10) {
          continueWatching.pop();
        }
        
        localStorage.setItem('quickwatch-continue', JSON.stringify(continueWatching));
        console.log('Added to continue watching list after 30s of viewing');
      }
    }, 5000);
    
    window.addEventListener('beforeunload', () => {
      clearInterval(viewingTimer);
      const viewingDuration = Date.now() - viewingStartTime;
      console.log(`Final viewing time: ${Math.floor(viewingDuration / 1000)} seconds`);
    });
    
    const seasonStep = window.splashScreen?.addStep('Fetching season data...');
    
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
    
    window.splashScreen?.completeStep(seasonStep);
    
    const renderStep = window.splashScreen?.addStep('Rendering page...');

    const detailsContainer = document.getElementById('details-container');
    if (!detailsContainer) return;
    
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
        name: '🤩 AnimePahe',
        tvOnly: true,
        tvUrl: `/embed/animepahe/${id}/{season}/{episode}`
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
    
    // genres
    const genresText = data.genres?.slice(0, 3).map(genre => genre.name).join(' • ') || '';
    
    // release year
    const year = new Date(data.release_date || data.first_air_date).getFullYear() || 'N/A';
    
    // (white) network logo
    const networkLogo = data.networks && data.networks.length > 0 ? 
      `<img src="${TMDB_IMAGE_BASE_URL}w500${data.networks[0].logo_path}" class="max-w-[6rem] mb-4" style="filter: invert(50%) brightness(10000%);">` : '';
    
    // title logo with title fallback
    const titleDisplay = data.images?.logos && data.images.logos.length > 0 ?
      `<img src="${TMDB_IMAGE_BASE_URL}w500${data.images.logos[0].file_path}" class="max-w-[26rem] max-h-[15rem] mb-8">` :
      `<h1 class="text-4xl font-bold mb-8">${data.title || data.name}</h1>`;
    
    detailsContainer.innerHTML = `
      <section class="w-full mt-16 relative" style="height: calc(100vh - 4rem);">
        <img class="object-cover w-full h-full object-right-top" src="${TMDB_IMAGE_BASE_URL}original${data.backdrop_path}">
        
        <div class="absolute inset-0 bg-gradient-to-t from-[#00050D] via-transparent to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#00050D] via-[#00050D80] to-transparent w-full">
          <div class="absolute bottom-0 left-0 pl-16 pb-16 w-full">
            
            ${networkLogo}
            ${titleDisplay}
            
            ${type === 'tv' ? `
            <div class="relative inline-block w-48 mb-4">
              <div id="custom-select" class="w-full px-4 py-3 rounded-lg bg-[#32363D] text-lg md:text-xl font-medium cursor-pointer flex items-center justify-between">
                <span id="selected-season">Season ${initialSeason}</span>
                <i class="icon-chevron-down transition-transform duration-200"></i>
              </div>
              <div id="season-options" class="absolute w-full mt-2 bg-[#32363D] rounded-lg shadow-lg hidden z-10 max-h-60 overflow-y-auto">
                ${data.seasons.map((season, i) => 
                  `<div class="season-option px-4 py-2 hover:bg-[#454950] cursor-pointer transition-colors duration-150 ${i+1 === initialSeason ? 'bg-[#454950]' : ''}" data-value="${season.season_number}">${season.name}</div>`
                ).join('')}
              </div>
            </div>
            ` : ''}
            
            <p class="text-lg mb-3 max-w-3xl">
              ${data.overview || 'No overview available'}
            </p>
            
            <div class="flex items-center gap-4 mb-3 text-[0.95rem] text-zinc-400 font-bold">
              <span>TMDB ${data.vote_average?.toFixed(1) || 'N/A'}</span>
              <span>${year}</span>
              ${type === 'tv' ? `<span>${data.number_of_episodes || 0} episodes</span>` : ''}
              <button class="bg-[#32363D] px-2.5 py-0 rounded-[0.275rem] text-white">
                ${contentRating}
              </button>
              ${type === 'tv' ? `
              <button class="bg-[#32363D] px-2.5 py-0 rounded-[0.275rem] text-white">
                ${data.status || 'Returning series'}
              </button>
              ` : ''}
            </div>
            
            <div class="flex items-center text-[0.95rem] gap-2 mb-12">
              ${genresText}
            </div>
            
            <div class="flex items-center gap-4 mb-6">
              <button class="px-6 py-3 rounded-lg bg-[#32363D] text-lg md:text-xl pagebtn font-medium flex flex-row items-center justify-center gap-4" id="play-button">
                <i class="fas fa-play text-[1.65rem]"></i>
                <div class="flex flex-col items-start justify-center text-lg leading-tight">
                  ${type === 'tv' ? `
                  <span class="mr-2">Episode ${initialEpisode}</span>
                  <span class="mr-2">Continue watching</span>
                  ` : `<span class="mr-2">Play movie</span>`}
                </div>
              </button>
              
              <button class="pagebtn bg-[#32363D] w-[4.3125rem] aspect-square rounded-full"><i class="icon-film text-3xl"></i></button>
              <button class="pagebtn bg-[#32363D] w-[4.3125rem] aspect-square rounded-full add-to-watchlist"><i class="icon-plus text-4xl"></i></button>
              <a href="/dl/${type}/${id}" class="pagebtn bg-[#32363D] w-[4.3125rem] aspect-square rounded-full flex items-center justify-center"><i class="icon-download text-3xl"></i></a>
              <button class="pagebtn bg-[#32363D] w-[4.3125rem] aspect-square rounded-full"><i class="icon-share text-3xl"></i></button>
            </div>
          </div>
        </div>
      </section>
      
      <section class="w-full mb-16 relative">
        <div class="flex flex-row gap-8 px-16 text-xl text-bold">
          ${type === 'tv' ? `<span class="tab-item active border-b-2 border-white pb-2 cursor-pointer" data-tab="episodes">Episodes</span>` : ''}
          <span class="tab-item ${type === 'movie' ? 'active border-b-2 border-white pb-2' : 'text-zinc-400'} cursor-pointer" data-tab="related">Related</span>
          <span class="tab-item text-zinc-400 cursor-pointer" data-tab="details">Details</span>
        </div>
        <div class="px-16 mt-8">
          ${type === 'tv' ? `
          <div id="episodes-tab" class="tab-content active">
            <div class="flex flex-col gap-0" id="episodes-list">
              ${seasonData.episodes.map(episode => `
              <div class="flex flex-row gap-6 -mx-4 p-4 transition duration-200 ease hover:bg-[#191E25] rounded-xl cursor-pointer episode-item" data-episode="${episode.episode_number}">
                <div class="relative">
                  <div class="bg-zinc-600 h-44 aspect-video rounded-lg overflow-hidden relative">
                    <img class="object-cover w-full h-full" src="${episode.still_path ? `${TMDB_IMAGE_BASE_URL}original${episode.still_path}` : 'https://placehold.co/600x400/0e1117/fff/?text=No%20thumbnail%20found&font=poppins'}">
                  </div>
                </div>
                <div class="flex flex-col justify-start">
                  <h3 class="text-xl font-medium mb-2">S${episode.season_number} E${episode.episode_number} - ${episode.name}</h3>
                  <div class="flex flex-row gap-3 mb-3 font-medium text-lg opacity-[95%]">
                    <span>${new Date(episode.air_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span>${episode.runtime || 0} min</span>
                    <span class="px-2 bg-[#32363D] rounded-[0.275rem]">${contentRating}</span>
                  </div>

                  <p class="text-zinc-400 text-xl font-light max-w-3xl mb-3 overflow-hidden line-clamp-2 text-ellipsis">${episode.overview || 'No overview available'}</p>

                  <span class="text-sm font-medium text-[#2392EE]"><i class="fas fa-circle-check mr-2"></i> Available on QuickWatch</span>
                </div>
              </div>
            `).join('')}
            </div>
          </div>
          ` : ''}
          
          <div id="related-tab" class="tab-content ${type === 'movie' ? 'active' : 'hidden'} min-h-screen">
            <div class="related-content-container"></div>
          </div>
          <div id="details-tab" class="tab-content hidden min-h-screen">
            <div class="details-content-container"></div>
          </div>
        </div>
      </section>
      
      <div id="player-modal" class="fixed inset-0 bg-[#00050d] bg-opacity-90 z-50 hidden flex items-center justify-center p-4">
        <div class="relative w-full max-w-6xl">
          <button id="close-modal" class="absolute -top-10 right-0 text-white text-2xl">
            <i class="icon-x"></i> Close
          </button>
          
          <div class="iframe-container loading rounded">
            <iframe 
              id="media-player"
              src="${iframeUrl}" 
              class="w-full rounded-xl" 
              height="700" 
              frameborder="0" 
              allowfullscreen
            ></iframe>
            <div class="iframe-loader">
              ${renderSpinner('large')}
            </div>
          </div>
          
          <div class="mt-4 bg-[#121212] p-4 rounded-lg">
            <div class="flex flex-wrap gap-3">
              ${sources
                .filter(source => (type === 'movie' ? !source.tvOnly : true))
                .map((source, index) => `
                  <button class="source-button px-4 py-2 rounded-lg ${index === initialSourceIndex ? 'bg-[#2392EE]' : 'bg-[#32363D]'}" data-index="${index}">
                    ${source.name}
                  </button>
                `).join('')}
              <div class="flex-grow"></div>
              <button id="popup-blocker" class="px-4 py-2 rounded-lg bg-[#32363D]">
                <i class="fas fa-shield-alt mr-2"></i>Disable Popups
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // media player load event
    const mediaPlayer = document.getElementById('media-player');
    const iframeContainer = mediaPlayer?.parentElement;
    if (mediaPlayer && iframeContainer) {
      mediaPlayer.addEventListener('load', () => {
        iframeContainer.classList.remove('loading');
      });
    }
    
    // popup blocker toggle - moved after mediaPlayer is defined
    const popupBlocker = document.getElementById('popup-blocker');
    let popupBlockerEnabled = false;
    
    if (popupBlocker && mediaPlayer) {
      popupBlocker.addEventListener('click', () => {
        popupBlockerEnabled = !popupBlockerEnabled;
        
        if (popupBlockerEnabled) {
          // Enable sandbox mode
          mediaPlayer.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
          popupBlocker.classList.remove('bg-[#32363D]');
          popupBlocker.classList.add('bg-[#2392EE]');
          popupBlocker.innerHTML = '<i class="fas fa-shield-alt mr-2"></i>Popups Disabled';
        } else {
          // Disable sandbox mode
          mediaPlayer.removeAttribute('sandbox');
          popupBlocker.classList.remove('bg-[#2392EE]');
          popupBlocker.classList.add('bg-[#32363D]');
          popupBlocker.innerHTML = '<i class="fas fa-shield-alt mr-2"></i>Disable Popups';
        }
        
        // Reload the iframe to apply changes
        const currentSrc = mediaPlayer.src;
        mediaPlayer.src = currentSrc;
        iframeContainer.classList.add('loading');
      });
    }
  
    // watchlist button
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

    // play button and modal
    const playButton = document.getElementById('play-button');
    const playerModal = document.getElementById('player-modal');
    const closeModal = document.getElementById('close-modal');
    
    if (playButton && playerModal && closeModal) {
      playButton.addEventListener('click', () => {
        playerModal.classList.remove('hidden');
      });
      
      closeModal.addEventListener('click', () => {
        playerModal.classList.add('hidden');
      });
    }

    // episode selection
    const episodeItems = document.querySelectorAll('.episode-item');
    episodeItems.forEach(item => {
      item.addEventListener('click', () => {
        const episodeNumber = item.dataset.episode;
        if (episodeNumber) {
          initialEpisode = parseInt(episodeNumber);
          const selectedSource = sources[initialSourceIndex];
          const newUrl = selectedSource.tvUrl
            .replace('{season}', initialSeason)
            .replace('{episode}', episodeNumber);
          
          // update player and show modal
          const mediaPlayer = document.getElementById('media-player');
          if (mediaPlayer) {
            mediaPlayer.src = newUrl;
            document.getElementById('player-modal').classList.remove('hidden');
          }
          
          // save progress
          localStorage.setItem(`tv-progress-${id}`, JSON.stringify({
            season: initialSeason,
            episode: parseInt(episodeNumber),
            sourceIndex: initialSourceIndex,
            timestamp: new Date().toISOString()
          }));
        }
      });
    });
    
    // custom select
    const customSelect = document.getElementById('custom-select');
    const seasonOptions = document.getElementById('season-options');
    const selectedSeasonText = document.getElementById('selected-season');
    const chevronIcon = customSelect?.querySelector('.icon-chevron-down');
    
    if (customSelect && seasonOptions && type === 'tv') {
      customSelect.addEventListener('click', () => {
        seasonOptions.classList.toggle('hidden');
        chevronIcon?.classList.toggle('rotate-180');
      });
      
      document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
          seasonOptions.classList.add('hidden');
          chevronIcon?.classList.remove('rotate-180');
        }
      });
      
      const seasonOptionElements = document.querySelectorAll('.season-option');
      seasonOptionElements.forEach((option, index) => {
        option.addEventListener('click', async () => {
          const selectedSeason = parseInt(option.dataset.value);
          initialSeason = selectedSeason;
          selectedSeasonText.textContent = data.seasons[index].name;
          
          seasonOptionElements.forEach(opt => opt.classList.remove('bg-[#454950]'));
          option.classList.add('bg-[#454950]');
          
          seasonOptions.classList.add('hidden');
          chevronIcon?.classList.remove('rotate-180');
          
          initialEpisode = 1;

          try {
            const seasonResponse = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${selectedSeason}?language=en-US`, options);
            seasonData = await seasonResponse.json();
            
            // update episodes list
            const episodesList = document.getElementById('episodes-list');
            if (episodesList && seasonData.episodes) {
              episodesList.innerHTML = seasonData.episodes.map(episode => `
                <div class="flex flex-row gap-6 -mx-4 p-4 transition duration-200 ease hover:bg-[#191E25] rounded-xl cursor-pointer episode-item" data-episode="${episode.episode_number}">
                  <div class="relative">
                    <div class="bg-zinc-600 h-44 aspect-video rounded-lg overflow-hidden relative">
                      <img class="object-cover w-full h-full" src="${episode.still_path ? `${TMDB_IMAGE_BASE_URL}original${episode.still_path}` : 'https://placehold.co/600x400/0e1117/fff/?text=No%20thumbnail%20found&font=poppins'}">
                    </div>

                  </div>
                  <div class="flex flex-col justify-start">
                    <h3 class="text-xl font-medium mb-2">S${episode.season_number} E${episode.episode_number} - ${episode.name}</h3>
                    <div class="flex flex-row gap-3 mb-3 font-medium text-lg opacity-[95%]">
                      <span>${new Date(episode.air_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <span>${episode.runtime || 0} min</span>
                      <span class="px-2 bg-[#32363D] rounded-[0.275rem]">${contentRating}</span>
                    </div>
                    <p class="text-zinc-400 text-xl font-light max-w-3xl mb-3 line-clamp-2">${episode.overview || 'No overview available'}</p>
                    <span class="text-sm font-medium text-[#2392EE]"><i class="fas fa-circle-check mr-2"></i> Available on QuickWatch</span>
                  </div>
                </div>
              `).join('');
              
              const newEpisodeItems = episodesList.querySelectorAll('.episode-item');
              newEpisodeItems.forEach(item => {
                item.addEventListener('click', () => {
                  const episodeNumber = item.dataset.episode;
                  if (episodeNumber) {
                    initialEpisode = parseInt(episodeNumber);
                    const selectedSource = sources[initialSourceIndex];
                    const newUrl = selectedSource.tvUrl
                      .replace('{season}', initialSeason)
                      .replace('{episode}', episodeNumber);
                    
                    // update player and show modal
                    const mediaPlayer = document.getElementById('media-player');
                    if (mediaPlayer) {
                      mediaPlayer.src = newUrl;
                      document.getElementById('player-modal').classList.remove('hidden');
                    }
                    
                    // save progress
                    localStorage.setItem(`tv-progress-${id}`, JSON.stringify({
                      season: initialSeason,
                      episode: parseInt(episodeNumber),
                      sourceIndex: initialSourceIndex,
                      timestamp: new Date().toISOString()
                    }));
                  }
                });
              });
            }
          } catch (error) {
            console.error('Error fetching season data:', error);
          }
        });
      });
    }
    
    // source selection
    const sourceButtons = document.querySelectorAll('.source-button');
    sourceButtons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedIndex = parseInt(button.dataset.index);
        initialSourceIndex = selectedIndex;
        
        sourceButtons.forEach(btn => {
          btn.classList.remove('bg-[#2392EE]');
          btn.classList.add('bg-[#32363D]');
        });
        button.classList.remove('bg-[#32363D]');
        button.classList.add('bg-[#2392EE]');
        
        // update player source
        const selectedSource = sources[selectedIndex];
        const newUrl = type === 'movie' 
          ? selectedSource.movieUrl 
          : selectedSource.tvUrl
              .replace('{season}', initialSeason)
              .replace('{episode}', initialEpisode);
        
        const mediaPlayer = document.getElementById('media-player');
        if (mediaPlayer) {
          const iframeContainer = mediaPlayer.parentElement;
          iframeContainer.classList.add('loading');
          mediaPlayer.src = newUrl;
        }
        
        // save preference
        if (type === 'tv') {
          localStorage.setItem(`tv-progress-${id}`, JSON.stringify({
            season: initialSeason,
            episode: initialEpisode,
            sourceIndex: selectedIndex,
            timestamp: new Date().toISOString()
          }));
        } else {
          localStorage.setItem(`source-pref-${type}-${id}`, JSON.stringify(selectedIndex));
        }
      });
    });
    
    // tab switching
    const tabItems = document.querySelectorAll('.tab-item');
    if (tabItems.length > 0) {
      tabItems.forEach(tab => {
        tab.addEventListener('click', async () => {
          // remove active class from all tabs
          tabItems.forEach(t => {
            t.classList.remove('active');
            t.classList.add('text-zinc-400');
            t.classList.remove('border-b-2', 'border-white', 'pb-2');
          });
          
          // add active class to clicked tab
          tab.classList.add('active');
          tab.classList.remove('text-zinc-400');
          tab.classList.add('border-b-2', 'border-white', 'pb-2');
          
          // hide all other tabs' content
          const tabContents = document.querySelectorAll('.tab-content');
          tabContents.forEach(content => {
            content.classList.add('hidden');
            content.classList.remove('active');
          });
          
          // show selected tab content
          const tabName = tab.dataset.tab;
          const selectedTabContent = document.getElementById(`${tabName}-tab`);
          if (selectedTabContent) {
            selectedTabContent.classList.remove('hidden');
            selectedTabContent.classList.add('active');
          }
          
          if (tabName === 'related') {
            await loadRelatedContent(type, id, document.querySelector('.related-content-container'));
          }
          if (tabName === 'details') {
            await loadDetailsContent(type, data, document.querySelector('.details-content-container'));
          }
        });
      });
    }
    
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab && activeTab.dataset.tab !== 'episodes') {
      if (activeTab.dataset.tab === 'related') {
        loadRelatedContent(type, id, document.querySelector('.related-content-container'));
      } else if (activeTab.dataset.tab === 'details') {
        loadDetailsContent(type, data, document.querySelector('.details-content-container'));
      }
    }
    
    window.splashScreen?.completeStep(renderStep);
    
    if (window.splashScreen) {
      setTimeout(() => {
        window.splashScreen.hide();
      }, 800);
    }
    
    initTabSwitcher(type, id, data);
    
  } catch (error) {
    console.error('Error loading media details:', error);
    document.getElementById('details-container').innerHTML = renderError(
      'Error', 
      'Failed to load details', 
      'Back to Home',
      "window.history.pushState(null, null, '/'); window.dispatchEvent(new PopStateEvent('popstate'))"
    );
    
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
  }
}

const relatedContainer = document.querySelector('.related-content-container');
const detailsContainer = document.querySelector('.details-content-container');

if (relatedContainer && detailsContainer) {
  if (type === 'movie') {
    loadRelatedContent(type, id, relatedContainer);
  }
  
  const relatedTab = document.querySelector('[data-tab="related"]');
  const detailsTab = document.querySelector('[data-tab="details"]');
  
  relatedTab?.addEventListener('click', () => {
    if (!relatedContainer.innerHTML.trim()) {
      loadRelatedContent(type, id, relatedContainer);
    }
  });
  
  detailsTab?.addEventListener('click', () => {
    if (!detailsContainer.innerHTML.trim()) {
      loadDetailsContent(type, data, detailsContainer);
    }
  });
}