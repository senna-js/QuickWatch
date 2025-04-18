// TV Shows Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { createCarouselItem } from '../../components/carouselItem.js';

/**
 * Renders the TV shows page
 * @param {HTMLElement} container
 */
export function renderTvPage(container) {
  window.splashScreen.show();
  const dramaStep = window.splashScreen.addStep('Loading Drama series...');
  const comedyStep = window.splashScreen.addStep('Loading Comedy series...');
  const crimeStep = window.splashScreen.addStep('Loading Crime series...');
  const scifiFantasyStep = window.splashScreen.addStep('Loading Sci-Fi & Fantasy series...');
  const actionAdventureStep = window.splashScreen.addStep('Loading Action & Adventure series...');
  const animationStep = window.splashScreen.addStep('Loading Animation series...');
  const imagesStep = window.splashScreen.addStep('Loading TV show images...');
  
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="pt-24 pb-20 md:pb-0 bg-[#00050d]">
      <div class="px-[4.4rem]">
        <h1 class="text-4xl font-bold mb-8 font-medium">TV Shows</h1>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Drama Series</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="drama"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Comedy Series</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="comedy"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Crime Series</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="crime"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Sci-Fi & Fantasy</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="sci-fi-fantasy"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Action & Adventure</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="action-adventure"></div>
      </div>
      
      <div class="mt-6">
        <h2 class="text-2xl text-white mb-4 ml-[4.4rem] font-normal">Animation</h2>
        <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4" data-category="animation"></div>
      </div>
    </div>
  `;
  
  fetchTvGenres({
    drama: dramaStep,
    comedy: comedyStep,
    crime: crimeStep,
    scifiFantasy: scifiFantasyStep,
    actionAdventure: actionAdventureStep,
    animation: animationStep,
    images: imagesStep
  });
}

async function fetchTvGenres(loadingSteps) {
  try {
    const genres = [
      { id: 18, name: 'drama', loadingStep: loadingSteps.drama },
      { id: 35, name: 'comedy', loadingStep: loadingSteps.comedy },
      { id: 80, name: 'crime', loadingStep: loadingSteps.crime },
      { id: 10765, name: 'sci-fi-fantasy', loadingStep: loadingSteps.scifiFantasy },
      { id: 10759, name: 'action-adventure', loadingStep: loadingSteps.actionAdventure },
      { id: 16, name: 'animation', loadingStep: loadingSteps.animation }
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
        const totalImages = Math.min(data.results.length, 10);
        let imagesLoaded = 0;
        
        const detailedResults = await Promise.all(
          data.results.slice(0, 10).map(async (item) => {
            const detailUrl = `${TMDB_BASE_URL}/tv/${item.id}?append_to_response=images,content_ratings,release_dates&language=en-US&include_image_language=en`;
            const detailResponse = await fetch(detailUrl, options);
            return await detailResponse.json();
          })
        );
        
        const carousel = document.querySelector(`[data-category="${genre.name}"]`);
        if (carousel) {
          updateTvCarousel(detailedResults, carousel, () => {
            imagesLoaded++;
            
            if (imagesLoaded === totalImages) {
              window.splashScreen.completeStep(genre.loadingStep);
            }
            
            const imageProgress = Math.round((imagesLoaded / (totalImages * genres.length)) * 100);
            if (imageProgress % 10 === 0) {
              window.splashScreen.updateStepProgress(loadingSteps.images, imageProgress);
            }
            
            if (imagesLoaded === totalImages && genre === genres[genres.length - 1]) {
              window.splashScreen.completeStep(loadingSteps.images);
              window.splashScreen.hide();
            }
          });
        }
      } else {
        window.splashScreen.completeStep(genre.loadingStep);
      }
    }
  } catch (error) {
    console.error('Error fetching TV genres:', error);
    for (const genre of genres) {
      window.splashScreen.completeStep(genre.loadingStep);
    }
    window.splashScreen.completeStep(loadingSteps.images);
    window.splashScreen.hide();
  }
}

function updateTvCarousel(items, carousel, onItemLoaded) {
  carousel.innerHTML = '';
  
  items.forEach((item, index) => {
    const carouselItem = createCarouselItem(item, index === 0, 'carousel', null, false, onItemLoaded);
    if (carouselItem) {
      carousel.appendChild(carouselItem);
    } else {
      if (onItemLoaded) onItemLoaded();
    }
  });
}