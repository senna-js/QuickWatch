// Details Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { renderSpinner, renderFullPageSpinner } from '../../components/misc/loading.js';
import { renderError } from '../../components/misc/error.js';
import { initTabSwitcher } from '../../components/watch/tabs/tabSwitcher.js';
import { loadRelatedContent, loadDetailsContent } from '../../components/watch/tabs/tabContent.js';
import { renderPlayerModal, initPlayerModal } from '../../components/watch/playerModal.js';
import { renderEpisodeList, initEpisodeList } from '../../components/watch/tv/episodeList.js';
import { renderSeasonSelector, initSeasonSelector } from '../../components/watch/tv/seasonSelector.js';

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
            ${renderSeasonSelector(data, initialSeason)}
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
            ${renderEpisodeList(seasonData.episodes, contentRating)}
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
      
      ${renderPlayerModal(type, id, sources, initialSourceIndex, initialSeason, initialEpisode, mediaTitle)}
    `;

    initPlayerModal(type, id, sources, initialSourceIndex, initialSeason, initialEpisode);
  
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


    if (type === 'tv') {
      initEpisodeList(id, initialSeason, initialEpisode, sources, initialSourceIndex);
    }
    
    if (type === 'tv') {
      initSeasonSelector(id, data, seasonData, initialSeason, initialEpisode, sources, initialSourceIndex, contentRating);
    }
    
    initTabSwitcher(type, id, data);
    
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