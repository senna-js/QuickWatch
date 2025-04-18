// Home Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { createCarouselItem } from '../../components/carouselItem.js';

/**
 * Renders the home page
 * @param {HTMLElement} container
 */
export function renderHomePage(container) {
  window.splashScreen.show();
  const loadingStep = window.splashScreen.addStep('Loading media content...');
  
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="pb-20 md:pb-0">
      <div id="hero-section" class="h-[550px] w-full flex items-end justify-end relative">
        <div class="absolute inset-x-0 md:inset-x-auto md:left-[4.4rem] text-white z-[6] flex flex-col items-center md:items-start">
          <img id="logo" class="w-[250px] md:w-[400px]">
          <span id="overview" class="text-[14px] md:text-[18px] mt-4 w-[80%] md:w-[37%] line-clamp-3 md:line-clamp-2 font-light text-center md:text-left">
            Peter Parker is on his way to becoming a hero, but his path to get there is anything but ordinary.
          </span>
          <div class="flex flex-row gap-4 mt-4 text-white">
            <button id="watch-now-btn" class="px-4 py-2 md:px-6 md:py-4 rounded-lg bg-[#32363D] text-lg md:text-xl pagebtn font-medium">Watch now</button>
            <button id="info-btn" class="w-[2.75rem] h-[2.75rem] md:w-[3.75rem] md:h-[3.75rem] rounded-full bg-[#32363D] text-2xl md:text-3xl flex items-center justify-center pagebtn font-medium"><i class="icon-info"></i></button>
            <button id="add-watchlist-btn" class="w-[2.75rem] h-[2.75rem] md:w-[3.75rem] md:h-[3.75rem] rounded-full bg-[#32363D] text-3xl md:text-4xl flex items-center justify-center pagebtn font-medium"><i class="icon-plus"></i></button>
          </div>
        </div>
        <div class="absolute inset-y-0 left-0 md:left-[30%] w-full md:w-[40%] bg-gradient-to-r from-[#00050d] to-transparent z-[3]"></div>
        <div class="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-[#00050d] to-transparent z-[3]"></div>
        <img id="herobk" class="h-[550px] w-full md:w-[70%] object-cover items-center ml-auto">
      </div>
      
      <div class="bg-[#00050d]">
        <div class="mt-12 md:mt-24">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Continue watching</h2>
          <div id="continue-watching" class="flex flex-row gap-4 overflow-x-auto pb-4 pl-2"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Trending Movies</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="trending-movies"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Trending TV Shows</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="trending-tv"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Top rated movies</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="top-rated-movies"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Popular movies</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="popular-movies"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Popular TV shows</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="popular-tv"></div>
        </div>
      </div>
    </div>
  `;
  
  fetchAllCategories(loadingStep);
  initButtonListeners();
}

async function fetchAllCategories(loadingStep) {
  try {
    let totalItemsToLoad = 0;
    let loadedItems = 0;
    
    await loadContinueWatching();
    
    const isMobile = window.innerWidth < 768;
    
    const categories = [
      {
        url: `${TMDB_BASE_URL}/trending/movie/week?language=en-US&append_to_response=images&include_image_language=en`,
        selector: '[data-category="trending-movies"]',
        updateHero: true
      },
      {
        url: `${TMDB_BASE_URL}/trending/tv/week?language=en-US&append_to_response=images&include_image_language=en`,
        selector: '[data-category="trending-tv"]'
      },
      {
        url: `${TMDB_BASE_URL}/movie/top_rated?language=en-US&page=1&append_to_response=images&include_image_language=en`,
        selector: '[data-category="top-rated-movies"]'
      },
      {
        url: `${TMDB_BASE_URL}/movie/popular?language=en-US&page=1&append_to_response=images&include_image_language=en`,
        selector: '[data-category="popular-movies"]'
      },
      {
        url: `${TMDB_BASE_URL}/tv/popular?language=en-US&page=1&append_to_response=images&include_image_language=en`,
        selector: '[data-category="popular-tv"]'
      }
    ];

    for (const category of categories) {
      const options = {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': TMDB_API_KEY
        }
      };

      const response = await fetch(category.url, options);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        if (category.updateHero) {
          const detailUrl = `${TMDB_BASE_URL}/${data.results[0].media_type || 'movie'}/${data.results[0].id}?append_to_response=images&language=en-US&include_image_language=en`;
          const detailResponse = await fetch(detailUrl, options);
          const detailData = await detailResponse.json();
          
          updateHeroSection({...detailData, media_type: data.results[0].media_type || 'movie'});
        }
        
        totalItemsToLoad += Math.min(data.results.length, 10);
        
        const detailedResults = await Promise.all(
          data.results.slice(0, 10).map(async (item) => {
            const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
            const detailUrl = `${TMDB_BASE_URL}/${mediaType}/${item.id}?append_to_response=images&language=en-US&include_image_language=en`;
            const detailResponse = await fetch(detailUrl, options);
            return {...await detailResponse.json(), media_type: mediaType};
          })
        );
        
        const carousel = document.querySelector(category.selector);
        if (carousel) {
          updateMovieCarousel(detailedResults, carousel, isMobile, () => {
            loadedItems++;
            checkAllLoaded(loadedItems, totalItemsToLoad, loadingStep);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    window.splashScreen.completeStep(loadingStep);
    window.splashScreen.hide();
  }
}

function checkAllLoaded(loaded, total, loadingStep) {
  if (loaded >= total) {
    window.splashScreen.completeStep(loadingStep);
    window.splashScreen.hide();
  }
}

async function loadContinueWatching() {
  const continueWatchingContainer = document.querySelector('#continue-watching');
  if (!continueWatchingContainer) return;
  
  const isMobile = window.innerWidth < 768;
  
  const continueWatchingItems = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
  
  const groupedItems = continueWatchingItems.reduce((acc, item) => {
    const key = `${item.id}_${item.mediaType}`;
    if (!acc[key]) {
      acc[key] = item;
    } else {
      // Update if the timestamp is more recent
      if (item.timestamp > acc[key].timestamp) {
        acc[key] = item;
      }
    }
    return acc;
  }, {});

  if (Object.keys(groupedItems).length === 0) {
    const sectionTitle = continueWatchingContainer.previousElementSibling;
    if (sectionTitle) {
      sectionTitle.style.display = 'none';
    }
    continueWatchingContainer.style.display = 'none';
    return;
  }

  const sectionTitle = continueWatchingContainer.previousElementSibling;
  if (sectionTitle) {
    sectionTitle.style.display = 'block';
  }
  continueWatchingContainer.style.display = 'flex';
  
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': TMDB_API_KEY
    }
  };
  
  let index = 0;
  for (const item of Object.values(groupedItems)) {
    const response = await fetch(`${TMDB_BASE_URL}/${item.mediaType}/${item.id}?append_to_response=images&language=en-US&include_image_language=en`, options);
    
    if (response.ok) {
      const detailData = await response.json();
      detailData.media_type = item.mediaType;
      
      // Add progress information to detailData
      detailData.progress = item.watchedDuration / item.fullDuration;
      detailData.timestamp = item.timestamp;
      
      // Use the season and episode directly from continue watching data
      if (item.mediaType === 'tv') {
        detailData.season = item.season || 1;
        detailData.episode = item.episode || 1;
      }
      
      const removeCallback = (id, mediaType) => {
        removeFromContinueWatching(id, mediaType);
        
        if (continueWatchingContainer.contains(carouselItem)) {
          carouselItem.remove();
          
          if (continueWatchingContainer.children.length === 0) {
            const sectionTitle = continueWatchingContainer.previousElementSibling;
            if (sectionTitle) {
              sectionTitle.style.display = 'none';
            }
            continueWatchingContainer.style.display = 'none';
          }
        }
      };
      
      const progressData = {
        percentage: (item.watchedDuration / item.fullDuration) * 100,
        watchedDuration: item.watchedDuration,
        fullDuration: item.fullDuration
      };
      
      if (item.mediaType === 'tv') {
        if (item.watchedDuration > 0) {
          progressData.continueText = `Continue Episode ${item.episode}`;
          progressData.statusText = `${Math.round((item.fullDuration - item.watchedDuration) / 60)}min left`;
        } else {
          progressData.continueText = `Start Episode ${item.episode}`;
        }
      } else {
        if (item.watchedDuration > 0) {
          progressData.continueText = 'Continue Watching';
          const remainingMinutes = Math.round((item.fullDuration - item.watchedDuration) / 60);
          if (remainingMinutes >= 60) {
            const hours = Math.floor(remainingMinutes / 60);
            const minutes = remainingMinutes % 60;
            progressData.statusText = `${hours}h${minutes}m left`;
          } else {
            progressData.statusText = `${remainingMinutes}min left`;
          }
        } else {
          progressData.continueText = 'Play movie';
          progressData.statusText = '';
        }
      }
      
      const episodeInfo = item.mediaType === 'tv' ? 
        { season: detailData.season, episode: detailData.episode } : null;
      
      const carouselItem = createCarouselItem(
        detailData, 
        index === 0, 
        'continue-watching', 
        removeCallback, 
        isMobile,
        null, // onLoaded
        progressData,
        episodeInfo
      );
      
      continueWatchingContainer.appendChild(carouselItem);
      index++;
    }
  }
}

function removeFromContinueWatching(id, mediaType) {
  const continueWatchingItems = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
  const updatedItems = continueWatchingItems.filter(item => { return !(String(item.id) === String(id) && item.mediaType === mediaType); });
  localStorage.setItem('quickwatch-continue', JSON.stringify(updatedItems));
  
  const timestampKeys = Object.keys(localStorage).filter(key => 
    key.startsWith(`quickwatch_timestamp_${String(id)}_`)
  );
  
  timestampKeys.forEach(key => {
    localStorage.removeItem(key);
  });
}

function updateMovieCarousel(items, carousel, usePoster = false, onItemLoaded) {
  carousel.innerHTML = '';
  
  items.forEach((item, index) => {
    const carouselItem = createCarouselItem(item, index === 0, 'carousel', null, usePoster, onItemLoaded);
    if (carouselItem) {
      carousel.appendChild(carouselItem);
    } else {
      if (onItemLoaded) onItemLoaded();
    }
  });
}

async function updateHeroSection(item) {
  const heroBackground = document.querySelector('#herobk');
  const overview = document.querySelector('#overview');
  const studioLogo = document.querySelector('#logo');
  const heroSection = document.querySelector('#hero-section');
  
  const isMobile = window.innerWidth < 768;
  
  try {
    if (item.images && item.images.logos && item.images.logos.length > 0) {
      const logo = item.images.logos.find(l => l.iso_639_1 === 'en') || item.images.logos[0];
      studioLogo.src = `${TMDB_IMAGE_BASE_URL}original${logo.file_path}`;
      studioLogo.style.display = 'block';
    } else {
      studioLogo.style.display = 'none';
      
      const titleElement = document.createElement('h1');
      titleElement.className = 'text-4xl font-bold';
      titleElement.textContent = item.title || item.name;
      
      studioLogo.parentNode.insertBefore(titleElement, studioLogo);
    }
    
    // Use poster for mobile and backdrop for desktop
    if (isMobile && item.poster_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.poster_path}`;
      heroBackground.classList.add('object-contain');
    } else if (item.images && item.images.backdrops && item.images.backdrops.length > 0) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.images.backdrops[0].file_path}`;
      heroBackground.classList.remove('object-contain');
    } else if (item.backdrop_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.backdrop_path}`;
      heroBackground.classList.remove('object-contain');
    } else if (item.poster_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.poster_path}`;
      heroBackground.classList.add('object-contain');
    }
    
    heroBackground.alt = item.title || item.name;
  } catch (error) {
    console.error('Error updating hero section:', error);
    studioLogo.style.display = 'none';
    
    if (isMobile && item.poster_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.poster_path}`;
      heroBackground.classList.add('object-contain');
    } else if (item.backdrop_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.backdrop_path}`;
      heroBackground.classList.remove('object-contain');
    } else if (item.poster_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.poster_path}`;
      heroBackground.classList.add('object-contain');
    }
  }
      
  overview.textContent = item.overview || 'No description available';
  
  heroSection.dataset.mediaType = item.media_type;
  heroSection.dataset.id = item.id;
}

function initButtonListeners() {
  const watchNowButton = document.querySelector('#watch-now-btn');
  if (watchNowButton) {
    watchNowButton.addEventListener('click', () => {
      const heroSection = document.querySelector('#hero-section');
      const mediaType = heroSection.dataset.mediaType;
      const id = heroSection.dataset.id;
      
      if (mediaType && id) {
        window.history.pushState(null, null, `/${mediaType}/${id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  }
  
  const infoButton = document.querySelector('#info-btn');
  if (infoButton) {
    infoButton.addEventListener('click', () => {
      const heroSection = document.querySelector('#hero-section');
      const mediaType = heroSection.dataset.mediaType;
      const id = heroSection.dataset.id;
      
      if (mediaType && id) {
        window.history.pushState(null, null, `/${mediaType}/${id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  }
  
  const addWatchlistButton = document.querySelector('#add-watchlist-btn');
  if (addWatchlistButton) {
    addWatchlistButton.addEventListener('click', () => {
      const heroSection = document.querySelector('#hero-section');
      const mediaType = heroSection.dataset.mediaType;
      const id = heroSection.dataset.id;
      
      if (mediaType && id) {
        const watchlist = JSON.parse(localStorage.getItem('quickwatch-watchlist') || '[]');
        
        const existingItem = watchlist.find(item => item.id === id && item.mediaType === mediaType);
        
        if (!existingItem) {
          const heroBackground = document.querySelector('#herobk');
          const title = document.querySelector('#overview').textContent;
          
          watchlist.push({
            id,
            mediaType,
            title,
            posterPath: heroBackground.src,
            dateAdded: new Date().toISOString()
          });
          
          localStorage.setItem('quickwatch-watchlist', JSON.stringify(watchlist));
          alert('Added to watchlist!');
        } else {
          alert('Already in your watchlist!');
        }
      }
    });
  }
}