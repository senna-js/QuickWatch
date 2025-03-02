// Home Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';

/**
 * Renders the home page
 * @param {HTMLElement} container
 */
export function renderHomePage(container) {
  container.innerHTML = `
    <div class="fixed left-0 top-0 h-full w-16 bg-zinc-900 flex flex-col items-center py-8 space-y-8 hidden md:flex">
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
    
    <div class="md:ml-16 pb-20 md:pb-0">
      <div id="hero-section" class="relative h-screen md:h-[80vh]">
        <div class="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
        
        <img id="herobk" class="w-full h-full object-cover">
        
        <div class="absolute inset-0 z-20 flex flex-col justify-end p-12">
          <div class="flex items-center mb-4">
            <img id="logo" class="mr-2 max-h-40 max-w-2xl">
          </div>
          
          <div class="flex items-center space-x-4 mb-4">
            <span class="flex items-center"><i class="fas fa-star text-yellow-500 mr-1"></i></span>
            <span class="px-2 py-1 border border-zinc-500 text-sm">PG</span>
            <span id="yr">2025</span>
            <span class="text-zinc-300 text-sm">MOVIE</span>
          </div>
          
          <p class="text-zinc-300 max-w-xl mb-6">
            Peter Parker is on his way to becoming a hero, but his path to get there is anything but ordinary.
          </p>
          
          <div class="flex space-x-4 mb-12">
            <button class="flex items-center px-6 py-3 bg-white text-black rounded-md hover:bg-zinc-200 transition">
              <i class="fas fa-play mr-2"></i> Play
            </button>
            <button class="flex items-center px-6 py-3 bg-transparent border border-white rounded-md hover:bg-zinc-800 transition">
              <i class="fas fa-plus mr-2"></i> Add to Watchlist
            </button>
          </div>
        </div>
      </div>
      
      <div class="px-4 md:px-12 py-8 bg-black">
        <div class="movie-section mb-8">
          <h2 class="text-3xl font-bold mb-6">Trending Movies</h2>
          <div class="movie-carousel flex space-x-4 overflow-x-auto pb-4" data-category="trending-movies"></div>
        </div>
        
        <div class="movie-section mb-8">
          <h2 class="text-3xl font-bold mb-6">Trending TV Shows</h2>
          <div class="movie-carousel flex space-x-4 overflow-x-auto pb-4" data-category="trending-tv"></div>
        </div>
        
        <div class="movie-section mb-8">
          <h2 class="text-3xl font-bold mb-6">Top Rated Movies</h2>
          <div class="movie-carousel flex space-x-4 overflow-x-auto pb-4" data-category="top-rated-movies"></div>
        </div>
        
        <div class="movie-section mb-8">
          <h2 class="text-3xl font-bold mb-6">Popular Movies</h2>
          <div class="movie-carousel flex space-x-4 overflow-x-auto pb-4" data-category="popular-movies"></div>
        </div>
        
        <div class="movie-section mb-8">
          <h2 class="text-3xl font-bold mb-6">Popular TV Shows</h2>
          <div class="movie-carousel flex space-x-4 overflow-x-auto pb-4" data-category="popular-tv"></div>
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
        url: `${TMDB_BASE_URL}/trending/movie/week?language=en-US`,
        selector: '[data-category="trending-movies"]',
        updateHero: true
      },
      {
        url: `${TMDB_BASE_URL}/trending/tv/week?language=en-US`,
        selector: '[data-category="trending-tv"]'
      },
      {
        url: `${TMDB_BASE_URL}/movie/top_rated?language=en-US&page=1`,
        selector: '[data-category="top-rated-movies"]'
      },
      {
        url: `${TMDB_BASE_URL}/movie/popular?language=en-US&page=1`,
        selector: '[data-category="popular-movies"]'
      },
      {
        url: `${TMDB_BASE_URL}/tv/popular?language=en-US&page=1`,
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
          updateHeroSection({...data.results[0], media_type: 'movie'});
        }
        
        const carousel = document.querySelector(category.selector);
        if (carousel) {
          updateMovieCarousel(data.results, carousel);
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
    if (item.poster_path) {
      const movieCard = document.createElement('div');
      movieCard.className = 'movie-card flex-shrink-0 w-32 md:w-48 p-2 md:p-3 rounded-lg overflow-hidden transition-all duration-300 hover:bg-zinc-800 hover:border-zinc-700 border-2 border-transparent';
      movieCard.dataset.id = item.id;
      movieCard.dataset.mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'transition-transform duration-300 hover:scale-95 active:scale-90';
      
      const img = document.createElement('img');
      img.src = `${TMDB_IMAGE_BASE_URL}w500${item.poster_path}`;
      img.alt = item.title || item.name;
      img.className = 'w-full object-cover rounded-lg';
      
      const titleDiv = document.createElement('div');
      titleDiv.className = 'mt-3';
      
      const title = document.createElement('h3');
      title.className = 'text-white font-semibold text-sm';
      title.textContent = item.title || item.name;
      
      const info = document.createElement('p');
      info.className = 'text-zinc-400 text-xs mt-1';
      const mediaType = item.media_type || (item.first_air_date ? 'TV Show' : 'Movie');
      const year = new Date(item.release_date || item.first_air_date).getFullYear();
      info.textContent = `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} • ${year}`;
      
      titleDiv.appendChild(title);
      titleDiv.appendChild(info);
      contentWrapper.appendChild(img);
      contentWrapper.appendChild(titleDiv);
      movieCard.appendChild(contentWrapper);
      
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
  const description = document.querySelector('.text-zinc-300.max-w-xl');
  const rating = document.querySelector('.fas.fa-star').parentNode;
  const year = document.querySelector('#yr');
  const mediaType = document.querySelector('.text-zinc-300.text-sm');
  const studioLogo = document.querySelector('#logo');
  const heroSection = document.querySelector('#hero-section');
  
  try {
    const logoUrl = `${TMDB_BASE_URL}/${item.media_type}/${item.id}/images`;
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };
    
    const response = await fetch(logoUrl, options);
    const imageData = await response.json();
    
    if (imageData.logos && imageData.logos.length > 0) {
      const logo = imageData.logos.find(l => l.height <= 160) || imageData.logos[0];
      studioLogo.src = `${TMDB_IMAGE_BASE_URL}original${logo.file_path}`;
      studioLogo.style.display = 'block';
    } else {
      studioLogo.style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching logo:', error);
    studioLogo.style.display = 'none';
  }

  if (item.backdrop_path) {
    heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.backdrop_path}`;
    heroBackground.alt = item.title || item.name;
  }
      
  description.textContent = item.overview || 'No description available';
  
  if (item.vote_average) {
    rating.innerHTML = `<i class="fas fa-star text-yellow-500 mr-1"></i> ${item.vote_average.toFixed(1)}`;
  }
  
  const releaseDate = item.release_date || item.first_air_date;
  if (releaseDate) {
    year.textContent = new Date(releaseDate).getFullYear();
  }
  
  mediaType.textContent = item.media_type === 'movie' ? 'MOVIE' : 'TV SERIES';
  
  heroSection.dataset.mediaType = item.media_type;
  heroSection.dataset.id = item.id;
}

function initButtonListeners() {
  const playButton = document.querySelector('.flex.space-x-4.mb-12 button:first-child');
  if (playButton) {
    playButton.addEventListener('click', () => {
      const heroSection = document.querySelector('#hero-section');
      const mediaType = heroSection.dataset.mediaType;
      const id = heroSection.dataset.id;
      
      if (mediaType && id) {
        window.history.pushState(null, null, `/${mediaType}/${id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  }
  
  const watchlistButton = document.querySelector('.flex.space-x-4.mb-12 button:last-child');
  if (watchlistButton) {
    watchlistButton.addEventListener('click', () => {
      const heroSection = document.querySelector('#hero-section');
      const mediaType = heroSection.dataset.mediaType;
      const id = heroSection.dataset.id;
      
      if (mediaType && id) {
        const watchlist = JSON.parse(localStorage.getItem('quickwatch-watchlist') || '[]');
        
        const existingItem = watchlist.find(item => item.id === id && item.mediaType === mediaType);
        
        if (!existingItem) {
          const heroBackground = document.querySelector('#herobk');
          const title = document.querySelector('.text-zinc-300.max-w-xl').textContent;
          
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