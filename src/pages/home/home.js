// Home Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';

/**
 * Renders the home page
 * @param {HTMLElement} container
 */
export function renderHomePage(container) {
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="md:ml-16 pb-20 md:pb-0">
      <div id="hero-section" class="h-[550px] w-full flex items-end justify-end relative">
        <div class="absolute left-[4.4rem] text-white z-[6] flex flex-col">
          <img id="logo" class="w-[400px]">
          <span id="overview" class="text-[20px] mt-4 w-[37%] line-clamp-2" style="font-family: 'Amazon Ember Light';">
            Peter Parker is on his way to becoming a hero, but his path to get there is anything but ordinary.
          </span>
          <div class="flex flex-row gap-4 mt-4 text-white">
            <button id="watch-now-btn" class="px-6 py-4 rounded-lg bg-[#32363D] text-xl pagebtn" style="font-family: 'Amazon Ember Medium';">Watch now</button>
            <button id="info-btn" class="w-[3.75rem] h-[3.75rem] rounded-full bg-[#32363D] text-3xl flex items-center justify-center pagebtn" style="font-family: 'Amazon Ember Medium';"><i class="icon-info"></i></button>
            <button id="add-watchlist-btn" class="w-[3.75rem] h-[3.75rem] rounded-full bg-[#32363D] text-4xl flex items-center justify-center pagebtn" style="font-family: 'Amazon Ember Medium';"><i class="icon-plus"></i></button>
          </div>
        </div>
        <div class="absolute inset-y-0 left-[30%] w-[40%] bg-gradient-to-r from-[#00050d] to-transparent z-[3]"></div>
        <div class="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-[#00050d] to-transparent z-[3]"></div>
        <img id="herobk" class="h-[550px] w-[70%] object-cover items-center">
      </div>
      
      <div class="bg-[#00050d]">
        <div class="mt-24">
          <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Continue watching</h2>
          <div id="continue-watching" class="flex flex-row gap-4 overflow-x-auto pb-4"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Trending Movies</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="trending-movies"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Trending TV Shows</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="trending-tv"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Top rated movies</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="top-rated-movies"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Popular movies</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="popular-movies"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Popular TV shows</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="popular-tv"></div>
        </div>
      </div>
    </div>
  `;
  
  fetchAllCategories();
  initButtonListeners();
}

async function fetchAllCategories() {
  try {
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
          updateMovieCarousel(detailedResults, carousel);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

function updateMovieCarousel(items, carousel) {
  carousel.innerHTML = '';
  
  items.forEach(item => {
    const backdropPath = item.images && item.images.backdrops && item.images.backdrops.length > 0 
      ? item.images.backdrops[0].file_path 
      : item.backdrop_path;
      
    if (backdropPath) {
      const movieCard = document.createElement('div');
      
      if (carousel.children.length === 0) { movieCard.className = 'w-[300px] aspect-video bg-[#32363D] flex-shrink-0 rounded-lg ml-[4.4rem]';
      } else { movieCard.className = 'w-[300px] aspect-video bg-[#32363D] flex-shrink-0 rounded-lg'; }
      
      movieCard.dataset.id = item.id;
      movieCard.dataset.mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      
      movieCard.style.backgroundImage = `url(${TMDB_IMAGE_BASE_URL}w500${backdropPath})`;
      movieCard.style.backgroundSize = 'cover';
      movieCard.style.backgroundPosition = 'center';
      
      const overlay = document.createElement('div');
      overlay.className = 'w-full h-full flex items-end p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300';
      
      const title = document.createElement('h3');
      title.className = 'text-white font-semibold';
      title.textContent = item.title || item.name;
      
      overlay.appendChild(title);
      movieCard.appendChild(overlay);
      
      movieCard.addEventListener('click', () => {
        const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        window.history.pushState(null, null, `/${mediaType}/${item.id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      
      carousel.appendChild(movieCard);
    }
  });
}

async function updateHeroSection(item) {
  const heroBackground = document.querySelector('#herobk');
  const overview = document.querySelector('#overview');
  const studioLogo = document.querySelector('#logo');
  const heroSection = document.querySelector('#hero-section');
  
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
    
    if (item.images && item.images.backdrops && item.images.backdrops.length > 0) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.images.backdrops[0].file_path}`;
    } else if (item.backdrop_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.backdrop_path}`;
    }
    
    heroBackground.alt = item.title || item.name;
  } catch (error) {
    console.error('Error updating hero section:', error);
    studioLogo.style.display = 'none';
    
    if (item.backdrop_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.backdrop_path}`;
      heroBackground.alt = item.title || item.name;
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