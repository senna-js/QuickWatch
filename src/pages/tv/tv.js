// TV Shows Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { createCarouselItem } from '../../components/carouselItem.js';

/**
 * Renders the TV shows page
 * @param {HTMLElement} container
 */
export function renderTvPage(container) {
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="pt-24 pb-20 md:pb-0 bg-[#00050d]">
      <div class="px-[4.4rem]">
        <h1 class="text-4xl font-bold mb-8" style="font-family: 'Amazon Ember Medium';">TV Shows</h1>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Drama Series</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="drama"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Comedy Series</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="comedy"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Crime Series</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="crime"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Sci-Fi & Fantasy</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="sci-fi-fantasy"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Action & Adventure</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="action-adventure"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem]" style="font-family: 'Amazon Ember Medium';">Animation</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="animation"></div>
      </div>
    </div>
  `;
  
  fetchTvGenres();
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
      const url = `${TMDB_BASE_URL}/discover/tv?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genre.id}&append_to_response=images&include_image_language=en`;
      
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
            const detailUrl = `${TMDB_BASE_URL}/tv/${item.id}?append_to_response=images&language=en-US&include_image_language=en`;
            const detailResponse = await fetch(detailUrl, options);
            return await detailResponse.json();
          })
        );
        
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
    const carouselItem = createCarouselItem(item, index === 0);
    if (carouselItem) {
      carousel.appendChild(carouselItem);
    }
  });
}