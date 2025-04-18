// Details Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { renderSpinner, renderFullPageSpinner } from '../../components/misc/loading.js';
import { renderError } from '../../components/misc/error.js';
import { loadRelatedContentMobile, loadDetailsContentMobile } from '../../components/watch/tabs/tabContent.js';
import { initTabSwitcherMobile } from '../../components/watch/tabs/tabSwitcher.js';
import { renderPlayerModal, initPlayerModal } from '../../components/watch/playerModal.js';
import { renderEpisodeList, initEpisodeList } from '../../components/watch/tv/episodeList.js';
import { renderSeasonSelector, initSeasonSelector } from '../../components/watch/tv/seasonSelector.js';
import { getProgress } from '../../components/watch/progress/index.js';

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
    

    const seasonStep = window.splashScreen?.addStep('Fetching season data...');
    
    let seasonData = null;
    if (type === 'tv') {
      const seasonResponse = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/1?language=en-US`, options);
      seasonData = await seasonResponse.json();
    }
    
    let initialSeason = 1;
    let initialEpisode = 1;
    
    if (type === 'tv') {
      const continueWatching = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
      const savedItem = continueWatching.find(item => item.id === id && item.mediaType === type);
      
      if (savedItem && savedItem.season && savedItem.episode) {
        initialSeason = savedItem.season;
        initialEpisode = savedItem.episode;
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
      const continueWatching = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
      const savedItem = continueWatching.find(item => item.id === id && item.mediaType === type);
      
      if (savedItem && savedItem.sourceIndex !== undefined && savedItem.sourceIndex >= 0 && savedItem.sourceIndex < sources.length) {
        initialSourceIndex = savedItem.sourceIndex;
      }
    } else {
      const continueWatching = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
      const savedItem = continueWatching.find(item => item.id === id && item.mediaType === type);
      
      if (savedItem && savedItem.sourceIndex !== undefined && savedItem.sourceIndex >= 0 && savedItem.sourceIndex < sources.length) {
        initialSourceIndex = savedItem.sourceIndex;
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

    function formatRemainingTime(duration, watched) {
      const remainingMinutes = Math.round((duration - watched) / 60);
      if (remainingMinutes <= 0) return null;
      
      if (remainingMinutes >= 60) {
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;
        return `${hours}h${minutes}m left`;
      }
      return `${remainingMinutes}min left`;
    }
    
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
            ${(() => {
              if (type === 'tv') {
                const progress = getProgress(id, 'tv', initialSeason, initialEpisode);
                const remainingMinutes = progress ? Math.round((progress.fullDuration - progress.watchedDuration) / 60) : 0;
                
                if (progress && remainingMinutes <= 5) {
                  // Check if there are more episodes in current season
                  const nextEpisode = initialEpisode + 1;
                  if (nextEpisode <= seasonData.episodes.length) {
                    return `
                      <span class="mr-2">Watch S${initialSeason}E${nextEpisode} <span class="font-light">(Next episode)</span></span>
                      <span class="hidden" id="next-episode-data" 
                        data-season="${initialSeason}" 
                        data-episode="${nextEpisode}">
                      </span>
                    `;
                  } else {
                    // Check if there are more seasons
                    const nextSeason = initialSeason + 1;
                    if (nextSeason <= data.number_of_seasons) {
                      return `
                        <span class="mr-2">Watch S${nextSeason}E1 <span class="font-light">(Next season)</span></span>
                        <span class="hidden" id="next-episode-data" 
                          data-season="${nextSeason}" 
                          data-episode="1">
                        </span>
                      `;
                    } else {
                      // No more seasons: rewatch
                      return `
                        <span class="mr-2">Rewatch S1E1 <span class="font-light">(Start over)</span></span>
                        <span class="hidden" id="next-episode-data" 
                          data-season="1" 
                          data-episode="1">
                        </span>
                      `;
                    }
                  }
                }
                
                return `
                  <span class="mr-2">Continue S${initialSeason}E${initialEpisode} ${progress && progress.watchedDuration > 0 ? 
                    `<span class="font-light">(${remainingMinutes}min left)</span>` : ''}</span>
                `;
              } else {
                const progress = getProgress(id, 'movie');
                return progress && progress.watchedDuration > 0 ? 
                  `<span class="mr-2">Continue Watching <span class="font-light">(${formatRemainingTime(progress.fullDuration, progress.watchedDuration)})</span></span>` :
                  `<span class="mr-2">Play movie</span>`;
              }
            })()}
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
            ${renderSeasonSelector(data, initialSeason, true)}
            ${renderEpisodeList(seasonData.episodes, contentRating, true)}
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
      
      ${renderPlayerModal(type, id, sources, initialSourceIndex, initialSeason, initialEpisode, data.title || data.name, true)}
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

    initPlayerModal(id, type, sources, initialSourceIndex, initialSeason, initialEpisode, true);
    
    if (type === 'tv') {
      const playButton = document.getElementById('play-button');
      const nextEpisodeData = document.getElementById('next-episode-data');
      
      if (playButton && nextEpisodeData) {
        const originalClickHandler = playButton.onclick;
        playButton.onclick = null;
        
        playButton.addEventListener('click', () => {
          // if we have next episode data, update the initialSeason and initialEpisode
          if (nextEpisodeData) {
            const nextSeason = parseInt(nextEpisodeData.dataset.season);
            const nextEpisode = parseInt(nextEpisodeData.dataset.episode);
            
            if (!isNaN(nextSeason) && !isNaN(nextEpisode)) {
              const modal = document.getElementById('player-modal');
              if (modal) {
                const modalContent = renderPlayerModal(type, id, sources, initialSourceIndex, nextSeason, nextEpisode, data.title || data.name, true);
                modal.outerHTML = modalContent;
                initPlayerModal(id, type, sources, initialSourceIndex, nextSeason, nextEpisode, true);
                
                document.getElementById('player-modal').classList.remove('hidden');
                return;
              }
            }
          }
          
          const playerModal = document.getElementById('player-modal');
          if (playerModal) {
            playerModal.classList.remove('hidden');
          }
        });
      }
    }
    
    if (type === 'tv') {
      initEpisodeList(id, initialSeason, initialEpisode, sources, initialSourceIndex);
      initSeasonSelector(id, data, seasonData, initialSeason, initialEpisode, sources, initialSourceIndex, contentRating, true);
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
