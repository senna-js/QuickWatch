// TV Shows Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { createCarouselItem } from '../../components/carouselItem.js';

export function renderTvPage(container) {
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="pb-32 md:pb-64">
      <div id="hero-section" class="h-[700px] w-full flex items-end justify-end relative">
        <div class="absolute inset-x-0 md:inset-x-auto md:left-[4.4rem] text-white z-[6] flex flex-col items-center md:items-start opacity-0" style="transform: translateY(30px);">
          <img id="logo" class="w-[250px] md:w-[400px] opacity-0" style="transform: translateY(20px);">
          <span id="overview" class="text-[14px] md:text-[18px] mt-4 w-[80%] md:w-[37%] line-clamp-3 md:line-clamp-2 font-light text-center md:text-left">
            Loading TV show information...
          </span>
          <div class="flex flex-row gap-4 mt-4 text-white">
            <button id="watch-now-btn" class="px-4 py-2 md:px-6 md:py-4 rounded-lg bg-[#32363D] text-lg md:text-xl pagebtn font-medium opacity-0">Watch now</button>
            <button id="info-btn" class="w-[2.75rem] h-[2.75rem] md:w-[3.75rem] md:h-[3.75rem] rounded-full bg-[#32363D] text-2xl md:text-3xl flex items-center justify-center pagebtn font-medium opacity-0"><i class="icon-info"></i></button>
            <button id="add-watchlist-btn" class="w-[2.75rem] h-[2.75rem] md:w-[3.75rem] md:h-[3.75rem] rounded-full bg-[#32363D] text-3xl md:text-4xl flex items-center justify-center pagebtn font-medium opacity-0"><i class="icon-plus"></i></button>
          </div>
        </div>
        <div class="absolute inset-y-0 left-0 w-full md:w-[50%] bg-gradient-to-r from-[#00050d] to-transparent z-[3]"></div>
        <div class="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-[#00050d] to-transparent z-[3]"></div>
        <img id="herobk" class="h-[700px] w-full md:w-full object-cover items-center ml-auto opacity-0">
      </div>
      
      <div class="bg-[#00050d]">
        <div class="mt-12 md:mt-24">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Drama Series</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="drama"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Comedy Series</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="comedy"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Crime Series</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="crime"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Sci-Fi & Fantasy</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="sci-fi-fantasy"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Action & Adventure</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="action-adventure"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-white mb-4 ml-4 md:ml-[4.4rem] font-medium">Animation</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="animation"></div>
        </div>
      </div>
    </div>
  `;
  
  fetchPopularTvShow();
  fetchTvGenres();
  initButtonListeners();
}

async function fetchPopularTvShow() {
  try {
    const url = `${TMDB_BASE_URL}/trending/tv/week`;
    
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const topShow = data.results[0];
      
      const detailUrl = `${TMDB_BASE_URL}/tv/${topShow.id}?append_to_response=images,content_ratings,release_dates&language=en-US&include_image_language=en`;
      const detailResponse = await fetch(detailUrl, options);
      const detailedShow = await detailResponse.json();
      
      updateHeroSection({...detailedShow, media_type: 'tv'});
    }
  } catch (error) {
    console.error('Error fetching popular TV show:', error);
  }
}

async function fetchTvGenres() {
  try {
    const genres = [
      { id: 18, name: 'drama' },
      { id: 35, name: 'comedy' },
      { id: 80, name: 'crime' },
      { id: 10765, name: 'sci-fi-fantasy' },
      { id: 10759, name: 'action-adventure' },
      { id: 16, name: 'animation' }
    ];

    for (const genre of genres) {
      const url = `${TMDB_BASE_URL}/discover/tv?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genre.id}&append_to_response=images,content_ratings,release_dates&include_image_language=en`;
      
      const options = {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': TMDB_API_KEY
        }
      };

      const response = await fetch(url, options);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const detailedResults = await Promise.all(
          data.results.slice(0, 10).map(async (item) => {
            const detailUrl = `${TMDB_BASE_URL}/tv/${item.id}?append_to_response=images,content_ratings,release_dates&language=en-US&include_image_language=en`;
            const detailResponse = await fetch(detailUrl, options);
            return {...await detailResponse.json(), media_type: 'tv'};
          })
        );
        
        if (genre.updateHero && detailedResults.length > 0) {
          updateHeroSection(detailedResults[0]);
        }
        
        const carousel = document.querySelector(`[data-category="${genre.name}"]`);
        if (carousel) {
          updateTvCarousel(detailedResults, carousel);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching TV genres:', error);
  }
}

function updateTvCarousel(items, carousel) {
  carousel.innerHTML = '';
  
  items.forEach((item, index) => {
    const carouselItem = createCarouselItem(item, index === 0, 'carousel', null, false);
    if (carouselItem) {
      carouselItem.style.opacity = '0';
      carouselItem.style.transform = 'translateY(20px)';
      carousel.appendChild(carouselItem);
      
      setTimeout(() => {
        carouselItem.style.opacity = '1';
        carouselItem.style.transform = 'translateY(0)';
      }, 50 * index);
    }
  });
}

async function updateHeroSection(item) {
  const heroBackground = document.querySelector('#herobk');
  const overview = document.querySelector('#overview');
  const studioLogo = document.querySelector('#logo');
  const heroSection = document.querySelector('#hero-section');
  const heroContent = heroSection.querySelector('.absolute.inset-x-0');
  const watchNowBtn = document.querySelector('#watch-now-btn');
  const infoBtn = document.querySelector('#info-btn');
  const addWatchlistBtn = document.querySelector('#add-watchlist-btn');
  
  const isMobile = window.innerWidth < 768;
  
  try {
    if (item.images && item.images.logos && item.images.logos.length > 0) {
      const logo = item.images.logos.find(l => l.iso_639_1 === 'en') || item.images.logos[0];
      studioLogo.src = `${TMDB_IMAGE_BASE_URL}original${logo.file_path}`;
      studioLogo.style.display = 'block';
    } else {
      studioLogo.style.display = 'none';
      
      const titleElement = document.createElement('h1');
      titleElement.className = 'text-4xl font-bold opacity-0';
      titleElement.style.transform = 'translateY(20px)';
      titleElement.textContent = item.title || item.name;
      
      studioLogo.parentNode.insertBefore(titleElement, studioLogo);
      
      requestAnimationFrame(() => {
        titleElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        titleElement.style.opacity = '1';
        titleElement.style.transform = 'translateY(0)';
      });
    }
    
    if (isMobile && item.poster_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.poster_path}`;
      heroBackground.classList.add('object-contain');
    } else if (item.images && item.images.backdrops && item.images.backdrops.length > 0) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.backdrop_path}`;
      heroBackground.classList.remove('object-contain');
    } else if (item.backdrop_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.backdrop_path}`;
      heroBackground.classList.remove('object-contain');
    } else if (item.poster_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.poster_path}`;
      heroBackground.classList.add('object-contain');
    }
    
    heroBackground.alt = item.title || item.name;
    
    heroBackground.onload = () => {
      heroBackground.style.transition = 'opacity 0.6s ease';
      heroBackground.style.opacity = '1';
      
      requestAnimationFrame(() => {
        heroContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
        
        if (studioLogo.style.display !== 'none') {
          requestAnimationFrame(() => {
            studioLogo.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            studioLogo.style.opacity = '1';
            studioLogo.style.transform = 'translateY(0)';
          });
        }
        
        if (watchNowBtn) {
          requestAnimationFrame(() => {
            watchNowBtn.style.transition = 'opacity 0.4s ease';
            watchNowBtn.style.opacity = '1';
          });
        }
        
        if (infoBtn) {
          setTimeout(() => {
            infoBtn.style.transition = 'opacity 0.4s ease';
            infoBtn.style.opacity = '1';
          }, 50);
        }
        
        if (addWatchlistBtn) {
          setTimeout(() => {
            addWatchlistBtn.style.transition = 'opacity 0.4s ease';
            addWatchlistBtn.style.opacity = '1';
          }, 100);
        }
      });
    };
    
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
    
    heroBackground.style.transition = 'opacity 0.6s ease';
    heroBackground.style.opacity = '1';
    
    requestAnimationFrame(() => {
      heroContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    });
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