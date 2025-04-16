// Details Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { renderSpinner, renderFullPageSpinner } from '../../components/loading.js';
import { renderError } from '../../components/error.js';
import { loadRelatedContentMobile, loadDetailsContentMobile } from '../../components/tabContent.js';
import { initTabSwitcherMobile } from '../../components/tabSwitcher.js';

/**
 * Renders the details page for a movie or TV show
 * @param {HTMLElement} container
 * @param {Object} params
 */
export function renderDetailsMobilepage(container, params) {
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
    
    const mediaTitle = data.title || data.name;
    document.title = `QW | ${mediaTitle}`;
    
    const currentPath = window.location.pathname;
    const titleSlug = mediaTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    if (!currentPath.includes('-')) {
      const newPath = `/${type}/${id}-${titleSlug}`;
      history.replaceState(null, null, newPath);
    }
    
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
      { // add event listeners (for progress tracking. check source documentation)
        name: 'VidLink',
        movieUrl: `https://vidlink.pro/movie/${id}?primaryColor=FFFFFF&secondaryColor=2392EE&title=true&poster=false&autoplay=false`,
        tvUrl: `https://vidlink.pro/tv/${id}/{season}/{episode}?primaryColor=2392EE&secondaryColor=FFFFFF&title=true&poster=false&autoplay=false&nextbutton=true`
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
      { // add event listeners
        name: 'VidsrcCC',
        movieUrl: `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false&poster=false`,
        tvUrl: `https://vidsrc.cc/v3/embed/tv/${id}/{season}/{episode}?autoPlay=false&poster=false`
      },
      { // add event listeners
        name: 'Vidzee',
        movieUrl: `https://vidzee.wtf/movie/${id}`,
        tvUrl: `https://vidzee.wtf/tv/${id}/{season}/{episode}`
      },
      { // add event listeners
        name: 'VidFast',
        movieUrl: `https://vidfast.pro/movie/${id}?autoPlay=false&theme=2392EE&poster=false`,
        tvUrl: `https://vidfast.pro/tv/${id}/{season}/{episode}?autoPlay=false&theme=2392EE&poster=false`
      },
      { // add event listeners
        name: 'MultiWTF',
        movieUrl: `https://vidsrc.wtf/api/1/movie/?id=${id}&color=2392EE`,
        tvUrl: `https://vidsrc.wtf/api/1/tv/?id=${id}&s={season}&e={episode}&color=2392EE`
      },
      { // add event listeners
        name: 'GlobalWTF',
        movieUrl: `https://vidsrc.wtf/api/2/movie/?id=${id}&color=2392EE`,
        tvUrl: `https://vidsrc.wtf/api/2/tv/?id=${id}&s={season}&e={episode}&color=2392EE`
      },
      { // add event listeners
        name: 'PremiWTF',
        movieUrl: `https://vidsrc.wtf/api/4/movie/?id=${id}&color=2392EE`,
        tvUrl: `https://vidsrc.wtf/api/4/tv/?id=${id}&s={season}&e={episode}&color=2392EE`
      },
      { // add event listeners
        name: 'Videasy',
        movieUrl: `https://player.videasy.net/movie/${id}?color=2392EE`,
        tvUrl: `https://player.videasy.net/tv/${id}/{season}/{episode}?color=2392EE&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=false`
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
    const genresText = data.genres?.slice(0, 2).map(genre => genre.name.toUpperCase()).join('  ') || '';
    // release year
    const year = new Date(data.release_date || data.first_air_date).getFullYear() || 'N/A';
    
    // (white) network logo
    const networkLogo = data.networks && data.networks.length > 0 ? 
      `<img src="${TMDB_IMAGE_BASE_URL}w500${data.networks[0].logo_path}" class="max-w-[4rem] mb-3" style="filter: invert(50%) brightness(10000%);">` : '';
    
    // title logo with title fallback
    const titleDisplay = data.images?.logos && data.images.logos.length > 0 ?
      `<img src="${TMDB_IMAGE_BASE_URL}w500${data.images.logos[0].file_path}" class="max-w-[16rem] max-h-[15rem] mb-4">` :
      `<h1 class="text-4xl font-bold mb-8">${data.title || data.name}</h1>`;
    
    detailsContainer.innerHTML = `
      <section class="w-full relative h-[60vh]">
        <img class="object-cover w-full h-full object-center" src="${TMDB_IMAGE_BASE_URL}original${data.backdrop_path}">
        
        <div class="absolute inset-0 bg-gradient-to-t from-[#00050d] via-[#00050d]/70 via-[#00050d]/40 via-transparent to-transparent bottom-[-2px]"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-[#00050d]/80 via-[#00050d]/60 via-[#00050d]/30 via-transparent to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#00050d]/30 via-transparent to-transparent"></div>
        
        <div class="absolute bottom-0 left-0 w-full px-5 py-4">
          ${networkLogo ? `<div class="mb-2">${networkLogo}</div>` : ''}
          <div class="mb-2">
            ${titleDisplay}
          </div>
          
          <div class="flex items-center gap-1 mb-1 text-[0.83rem] text-bold">
            <span class="bg-[#3B54F6] px-1.5 pt-0.5 pb-[0.07rem] rounded text-white">${data.status.toUpperCase()}</span>
            <span class="px-2 py-0.5 rounded text-white">TMDB ${data.vote_average?.toFixed(1) || 'N/A'}</span>
          </div>
          
          <div class="flex items-center gap-3 text-[0.8rem] text-white/80 mb-4 ml-1 font-light">
            ${year}
            ${type === 'tv' ? `<span>${data.number_of_seasons || 0} SEASONS</span>` : ''}
            ${contentRating}
          </div>
        </div>
      </section>
      
      <section class="px-5 py-6 bg-[#00050d]">
        <div class="flex flex-col w-full items-center justify-center mb-6">
          <button class="flex-1 py-3 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 w-full mb-3" id="play-button">
            <i class="fas fa-play"></i>
            ${type === 'tv' ? `
              <span>Watch S${initialSeason} E${initialEpisode}</span>
              ` : `<span>Play movie</span>`}
          </button>
          
          <div class="flex flex-row gap-8 ml-4 p-2 w-full items-center justify-start">
            <button class="h-12 bg-[#00050d] flex flex-col items-center justify-center add-to-watchlist">
              <i class="icon-plus text-3xl"></i>
              <span class="text-xs font-light">My List</span>
            </button>
            <button class="h-12 bg-[#00050d] flex flex-col items-center justify-center">
              <i class="icon-film text-2xl mb-1"></i>
              <span class="text-xs font-light">Trailer</span>
            </button>
          </div>
        </div>
        
        <p class="text-[1.07rem] text-white/80 mb-2 font-light leading-tight overflow-hidden line-clamp-4 text-ellipsis">
          ${data.overview || 'No overview available'}
        </p>
        
        <div class="flex items-center text-xs text-white/60 gap-2 mb-4 font-light">
          ${genresText}
        </div>
      </section>
      
      <section class="w-full mb-16 relative">
        <div class="flex flex-row gap-8 px-5 text-xl text-bold">
          ${type === 'tv' ? `<span class="tab-item active border-b-2 border-white pb-2 cursor-pointer" data-tab="episodes">Episodes</span>` : ''}
          <span class="tab-item ${type === 'movie' ? 'active border-b-2 border-white pb-2' : 'text-zinc-400'} cursor-pointer" data-tab="related">Related</span>
          <span class="tab-item text-zinc-400 cursor-pointer" data-tab="details">Details</span>
        </div>

        <div class="mt-4 pb-16">
          ${type === 'tv' ? `
          <div id="episodes-tab" class="tab-content active">
            <div class="relative mb-3 mx-[1.3rem]">
              <div id="custom-select" class="w-full px-4 py-3 rounded-lg bg-[#292D3C] text-lg font-medium cursor-pointer flex items-center justify-between">
                <span id="selected-season">Season ${initialSeason}</span>
                <i class="icon-chevron-down transition-transform duration-200"></i>
              </div>
              <div id="season-options" class="absolute w-full mt-2 bg-[#292D3C] rounded-lg shadow-lg hidden z-10 max-h-60 overflow-y-auto">
                ${data.seasons.map((season, i) => 
                  `<div class="season-option px-4 py-2 hover:bg-[#464b5e] cursor-pointer transition-colors duration-150 ${i+1 === initialSeason ? 'bg-[#464b5e]' : ''}" data-value="${season.season_number}">${season.name}</div>`
                ).join('')}
              </div>
            </div>

            <div class="flex flex-col" id="episodes-list">
              ${seasonData.episodes.map(episode => `
              <div class="flex flex-row gap-3 p-3 px-5 transition duration-200 ease hover:bg-[#191E25] rounded-lg cursor-pointer episode-item" data-episode="${episode.episode_number}">
                <div class="relative">
                  <div class="bg-zinc-600 w-[8rem] aspect-video rounded-md overflow-hidden relative">
                    <img class="object-cover w-full h-full" src="${episode.still_path ? `${TMDB_IMAGE_BASE_URL}original${episode.still_path}` : 'https://placehold.co/600x400/0e1117/fff/?text=No%20thumbnail%20found&font=poppins'}">
                    <div class="absolute inset-0 flex items-end justify-start">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center">
                        <i class="fas fa-play text-white text-lg" style="filter: drop-shadow(2px 2px 8px black);"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col justify-center flex-1">
                  <div class="flex justify-between items-start">
                    <h3 class="text-base font-medium text-white leading-tight w-[90%]">${episode.episode_number}. ${episode.name}</h3>
                  </div>
                  <div class="flex flex-row gap-2 text-sm text-zinc-400 font-light">
                    <span>${episode.runtime || 0}m</span>
                    <span>${new Date(episode.air_date).getFullYear()}</span>
                    <span>${contentRating}</span>
                  </div>
                </div>
              </div>
              <p class="text-[0.95] mx-2 mb-2 leading-tight text-[#ADACAC] font-light px-3 -mt-1 overflow-hidden line-clamp-2 text-ellipsis">${episode.overview || 'No overview available'}</p>
              `).join('')}
            </div>
          </div>
          ` : ''}
          
          <div id="related-tab" class="tab-content ${type === 'movie' ? 'active' : 'hidden'}">
            <div class="related-content-container px-4"></div>
          </div>
          
          <div id="details-tab" class="tab-content hidden">
            <div class="details-content-container px-4"></div>
          </div>
        </div>
      </section>
      
      <div id="player-modal" class="fixed inset-0 bg-[#00050d] bg-opacity-90 z-50 hidden flex flex-col items-center justify-between p-0">
        <div class="relative w-full h-full flex flex-col">
          <div class="iframe-container loading rounded-none flex-grow">
            <iframe 
              id="media-player"
              src="${iframeUrl}" 
              class="w-full h-full rounded-none" 
              frameborder="0" 
              allowfullscreen
            ></iframe>
            <div class="iframe-loader">
              ${renderSpinner('large')}
            </div>
          </div>
          
          <div class="w-full bg-[#121212] p-3 flex flex-col">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-medium truncate">${data.title || data.name}</h3>
              <button id="close-modal" class="text-white px-3 py-1 rounded-lg bg-[#32363D]">
                <i class="icon-x"></i> Close
              </button>
            </div>
            
            <div class="source-selector-container overflow-x-auto pb-1">
              <div class="flex gap-2 min-w-max">
                ${sources
                  .filter(source => type === 'movie' ? !source.tvOnly : true)
                  .map((source, index) => `
                    <button class="source-button px-4 py-2 rounded-lg whitespace-nowrap ${index === initialSourceIndex ? 'bg-[#2392EE]' : 'bg-[#32363D]'}" data-index="${index}">
                      ${source.name}
                    </button>
                  `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
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
          
          seasonOptionElements.forEach(opt => opt.classList.remove('bg-[#464b5e]'));
          option.classList.add('bg-[#464b5e]');
          
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
                      <img class="object-cover w-full h-full" src="${TMDB_IMAGE_BASE_URL}original${episode.still_path}">
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
                    <span class="text-sm font-medium"><i class="fas fa-circle-check mr-2"></i> Available on QuickWatch</span>
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
    
    // media player load event
    const mediaPlayer = document.getElementById('media-player');
    const iframeContainer = mediaPlayer?.parentElement;
    if (mediaPlayer && iframeContainer) {
      mediaPlayer.addEventListener('load', () => {
        iframeContainer.classList.remove('loading');
      });
    }

    initTabSwitcherMobile(type, id, data);
    
    if (type === 'movie') {
      const relatedContainer = document.querySelector('.related-content-container');
      if (relatedContainer) {
        loadRelatedContentMobile(type, id, relatedContainer);
      }
    }
    
    if (detailsContainer && detailsContainer.innerHTML.trim() === '') {
      loadDetailsContentMobile(type, data, detailsContainer);
    }

    window.splashScreen?.completeStep(renderStep);

    if (window.splashScreen) {
      setTimeout(() => {
        window.splashScreen.hide();
      }, 800);
    }

    if (window.splashScreen) {
      setTimeout(() => {
        window.splashScreen.hide();
      }, 800);
    }

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
