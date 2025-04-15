// Movies Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { createCarouselItem } from '../../components/carouselItem.js';

/**
 * Renders the movies page
 * @param {HTMLElement} container
 */
export function renderMoviesPage(container) {
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="pt-24 pb-20 md:pb-0 bg-[#00050d]">
      <div class="px-[4.4rem]">
        <h1 class="text-4xl font-bold mb-8 font-medium">Movies</h1>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Action Movies</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="action"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Comedy Movies</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="comedy"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Drama Movies</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="drama"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Sci-Fi Movies</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="sci-fi"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Horror Movies</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="horror"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Animation Movies</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="animation"></div>
      </div>
    </div>
  `;
  
  fetchMovieGenres();
}

async function fetchMovieGenres() {
  try {
    const genres = [
      { id: 28, name: 'action' },
      { id: 35, name: 'comedy' },
      { id: 18, name: 'drama' },
      { id: 878, name: 'sci-fi' },
      { id: 27, name: 'horror' },
      { id: 16, name: 'animation' }
    ];

    for (const genre of genres) {
      const url = `${TMDB_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genre.id}&append_to_response=images&include_image_language=en`;
      
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
            const detailUrl = `${TMDB_BASE_URL}/movie/${item.id}?append_to_response=images&language=en-US&include_image_language=en`;
            const detailResponse = await fetch(detailUrl, options);
            return await detailResponse.json();
          })
        );
        
        const carousel = document.querySelector(`[data-category="${genre.name}"]`);
        if (carousel) {
          updateMovieCarousel(detailedResults, carousel);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching movie genres:', error);
  }
}

function updateMovieCarousel(items, carousel) {
  carousel.innerHTML = '';
  
  items.forEach((item, index) => {
    const carouselItem = createCarouselItem(item, index === 0);
    if (carouselItem) {
      carousel.appendChild(carouselItem);
    }
  });
}