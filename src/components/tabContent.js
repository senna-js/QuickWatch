// Tab Functions

import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../router.js';
import { createCarouselItem } from './carouselItem.js';

/**
 * Load and display related content for a media item
 * @param {string} type - The media type ('movie' or 'tv')
 * @param {string} id - The media ID
 * @param {HTMLElement} container - The container element
 */
export async function loadRelatedContent(type, id, container) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };

    const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/similar?language=en-US&page=1`, options);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      container.innerHTML = `
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6" id="related-grid"></div>
      `;
      
      const relatedGrid = document.getElementById('related-grid');
      
      const detailedResults = await Promise.all(
        data.results.slice(0, 12).map(async (item) => {
          try {
            const detailUrl = `${TMDB_BASE_URL}/${type}/${item.id}?append_to_response=images&language=en-US&include_image_language=en`;
            const detailResponse = await fetch(detailUrl, options);
            return {...await detailResponse.json(), media_type: type};
          } catch (error) {
            console.error(`Error fetching details for ${item.id}:`, error);
            return item;
          }
        })
      );
      
      detailedResults.forEach(item => {
        const carouselItem = createCarouselItem(item, false, 'grid');
        if (carouselItem) {
          carouselItem.classList.remove('w-[300px]', 'w-[140px]');
          carouselItem.classList.add('w-full');
          if (!carouselItem.style.aspectRatio) {
            carouselItem.classList.add('aspect-video');
          }
          
          relatedGrid.appendChild(carouselItem);
        }
      });
    } else {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
          <p class="text-xl text-zinc-400">No related content found</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading related content:', error);
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <p class="text-xl text-zinc-400">Failed to load related content</p>
      </div>
    `;
  }
}

/**
 * Load and display related content for a media item on mobile
 * @param {string} type - The media type ('movie' or 'tv')
 * @param {string} id - The media ID
 * @param {HTMLElement} container - The container element
 */
export async function loadRelatedContentMobile(type, id, container) {
  try {    
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };

    const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/similar?language=en-US&page=1`, options);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      container.innerHTML = `
        <div class="grid grid-cols-2 gap-3 mt-2" id="related-grid-mobile"></div>
      `;
      
      const relatedGrid = document.getElementById('related-grid-mobile');
      const limitedResults = data.results.slice(0, 8);
      
      limitedResults.forEach(item => {
        const posterUrl = `${TMDB_IMAGE_BASE_URL}w342${item.poster_path}`

        const mediaType = item.media_type || type;
        const title = item.title || item.name || 'Unknown';
        const year = item.release_date || item.first_air_date 
          ? new Date(item.release_date || item.first_air_date).getFullYear() 
          : '';
        
        const itemElement = document.createElement('div');
        itemElement.className = 'mb-4';
        itemElement.innerHTML = `
          <a href="/${mediaType}/${item.id}" class="block">
            <div class="relative rounded-lg overflow-hidden aspect-[2/3]">
              <img src="${posterUrl}" alt="${title}" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
              <div class="absolute bottom-0 left-0 p-2">
                <h3 class="text-sm font-medium line-clamp-1">${title}</h3>
                <p class="text-xs text-zinc-400">${year}</p>
              </div>
            </div>
          </a>
        `;
        
        relatedGrid.appendChild(itemElement);
      });
    } else {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-8">
          <p class="text-base text-zinc-400">No related content found</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading related content:', error);
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-8">
        <p class="text-base text-zinc-400">Failed to load related content</p>
      </div>
    `;
  }
}

/**
 * Load and display details content for a media item
 * @param {string} type - The media type ('movie' or 'tv')
 * @param {Object} data - The media data object
 * @param {HTMLElement} container - The container element
 */
export async function loadDetailsContent(type, data, container) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };
    
    const creditsResponse = await fetch(`${TMDB_BASE_URL}/${type}/${data.id}/credits`, options);
    const creditsData = await creditsResponse.json();
    
    const reviewsResponse = await fetch(`${TMDB_BASE_URL}/${type}/${data.id}/reviews`, options);
    const reviewsData = await reviewsResponse.json();
    
    let runtimeText = '';
    if (type === 'movie' && data.runtime) {
      const hours = Math.floor(data.runtime / 60);
      const minutes = data.runtime % 60;
      runtimeText = `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`;
    }
    
    const cast = creditsData.cast || [];
    const castList = cast.slice(0, 10).map(person => 
      `<div class="cast-item flex flex-col items-center mr-4 mb-4">
        <div class="w-20 h-20 rounded-full overflow-hidden mb-2">
          <img src="${`${TMDB_IMAGE_BASE_URL}w185${person.profile_path}`}" 
              alt="${person.name}" 
              class="w-full h-full object-cover">
        </div>
        <p class="text-center text-sm font-medium">${person.name}</p>
        <p class="text-center text-xs text-zinc-400">${person.character}</p>
      </div>`
    ).join('');
    
    const crew = creditsData.crew || [];
    const directors = crew.filter(person => person.job === 'Director');
    const writers = crew.filter(person => ['Writer', 'Screenplay'].includes(person.job));
    
    const reviews = reviewsData.results || [];
    const reviewsList = reviews.slice(0, 3).map(review => {
      const reviewDate = new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      let reviewContent = review.content;
      if (reviewContent.length > 300) {
        reviewContent = reviewContent.substring(0, 300) + '...';
      }
      
      return `
      <div class="review-item mb-6 p-4 bg-[#1a1f27] rounded-lg">
        <div class="flex items-center mb-2">
          <div class="w-10 h-10 rounded-full overflow-hidden mr-3 bg-[#32363D] flex items-center justify-center">
            ${review.author_details.avatar_path ? 
              `<img src="${review.author_details.avatar_path.startsWith('/http') ? 
                review.author_details.avatar_path.substring(1) : 
                `${TMDB_IMAGE_BASE_URL}w185${review.author_details.avatar_path}`}" 
                alt="${review.author}" class="w-full h-full object-cover">` : 
              `<span class="text-xl">${review.author.charAt(0).toUpperCase()}</span>`}
          </div>
          <div>
            <p class="font-medium">${review.author}</p>
            <p class="text-xs text-zinc-400">${reviewDate}</p>
          </div>
          ${review.author_details.rating ? 
            `<div class="ml-auto flex items-center">
              <i class="icon-star text-yellow-400 mr-1"></i>
              <span>${review.author_details.rating}/10</span>
            </div>` : ''}
        </div>
        <p class="text-sm text-zinc-300">${reviewContent}</p>
      </div>`;
    }).join('');
    
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="md:col-span-2">
          <h2 class="text-2xl font-bold mb-4">About ${type === 'movie' ? 'Movie' : 'Show'}</h2>
          <p class="mb-6 text-zinc-300">${data.overview || 'No overview available.'}</p>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            ${data.release_date || data.first_air_date ? `
            <div>
              <p class="text-zinc-400 text-sm">Release Date</p>
              <p>${new Date(data.release_date || data.first_air_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>` : ''}
            
            ${runtimeText ? `
            <div>
              <p class="text-zinc-400 text-sm">Runtime</p>
              <p>${runtimeText}</p>
            </div>` : ''}
            
            ${type === 'tv' && data.number_of_seasons ? `
            <div>
              <p class="text-zinc-400 text-sm">Seasons</p>
              <p>${data.number_of_seasons} (${data.number_of_episodes} episodes)</p>
            </div>` : ''}
            
            ${data.status ? `
            <div>
              <p class="text-zinc-400 text-sm">Status</p>
              <p>${data.status}</p>
            </div>` : ''}
            
            ${data.genres && data.genres.length > 0 ? `
            <div>
              <p class="text-zinc-400 text-sm">Genres</p>
              <p>${data.genres.map(g => g.name).join(', ')}</p>
            </div>` : ''}
            
            ${data.vote_average ? `
            <div>
              <p class="text-zinc-400 text-sm">Rating</p>
              <p><i class="icon-star text-yellow-400 mr-1"></i>${data.vote_average.toFixed(1)}/10</p>
            </div>` : ''}

            ${data.homepage ? `
                <div>
                    <p class="text-zinc-400 text-sm">Official website <i class="fas fa-external-link-alt ml-2 text-xs"></i></p>
                    <a href="${data.homepage}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${data.homepage.length > 30 ? data.homepage.substring(0, 30) + '...' : data.homepage}</a>
                </div>` : ''}
          </div>
          
          ${directors.length > 0 ? `
          <div class="mb-6">
            <p class="text-zinc-400 text-sm mb-2">Director${directors.length > 1 ? 's' : ''}</p>
            <p>${directors.map(d => d.name).join(', ')}</p>
          </div>` : ''}
          
          ${writers.length > 0 ? `
          <div class="mb-6">
            <p class="text-zinc-400 text-sm mb-2">Writer${writers.length > 1 ? 's' : ''}</p>
            <p>${writers.map(w => w.name).join(', ')}</p>
          </div>` : ''}
          
          ${cast.length > 0 ? `
          <h2 class="text-2xl font-bold mb-4">Cast</h2>
          <div class="flex flex-wrap mb-8">
            ${castList}
          </div>` : ''}
          
          ${reviews.length > 0 ? `
          <h2 class="text-2xl font-bold mb-4">Reviews</h2>
          <div class="reviews-container">
            ${reviewsList}
          </div>` : ''}
        </div>
        
        <div class="md:col-span-1">
          <div class="sticky top-24">
            <img src="${TMDB_IMAGE_BASE_URL}w500${data.poster_path}" 
                alt="${data.title || data.name}" 
                class="w-full rounded-lg shadow-lg mb-4">
            
            ${data.production_companies && data.production_companies.length > 0 ? `
            <div class="mb-6">
              <p class="text-zinc-400 text-sm mb-2">Production</p>
              <p>${data.production_companies.map(c => c.name).join(', ')}</p>
            </div>` : ''}
            
            ${data.networks && data.networks.length > 0 ? `
            <div class="mb-6">
              <p class="text-zinc-400 text-sm mb-2">Network${data.networks.length > 1 ? 's' : ''}</p>
              <div class="flex flex-wrap gap-4">
                ${data.networks.map(network => 
                  `<img src="${TMDB_IMAGE_BASE_URL}w500${network.logo_path}" class="h-8 object-contain" style="filter: invert(50%) brightness(10000%);">`
                ).join('')}
              </div>
            </div>` : ''}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading details content:', error);
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <p class="text-xl text-zinc-400">Failed to load details</p>
      </div>
    `;
  }
}

/**
 * Load and display details content for a media item on mobile
 * @param {string} type - The media type ('movie' or 'tv')
 * @param {Object} data - The media data object
 * @param {HTMLElement} container - The container element
 */
export async function loadDetailsContentMobile(type, data, container) {
  try {    
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };
    
    const creditsResponse = await fetch(`${TMDB_BASE_URL}/${type}/${data.id}/credits`, options);
    const creditsData = await creditsResponse.json();
    
    let runtimeText = '';
    if (type === 'movie' && data.runtime) {
      const hours = Math.floor(data.runtime / 60);
      const minutes = data.runtime % 60;
      runtimeText = `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`;
    }
    
    const cast = creditsData.cast || [];
    const castList = cast.slice(0, 6).map(person => 
      `<div class="cast-item flex flex-col items-center mr-3 mb-3">
        <div class="w-16 h-16 rounded-full overflow-hidden mb-1">
          <img src="${`${TMDB_IMAGE_BASE_URL}w185${person.profile_path}`}" 
              alt="${person.name}" 
              class="w-full h-full object-cover">
        </div>
        <p class="text-center text-xs font-medium line-clamp-1 w-16">${person.name}</p>
        <p class="text-center text-[10px] text-zinc-400 line-clamp-1 w-16">${person.character}</p>
      </div>`
    ).join('');
    
    const crew = creditsData.crew || [];
    const directors = crew.filter(person => person.job === 'Director');
    const writers = crew.filter(person => ['Writer', 'Screenplay'].includes(person.job));
    
    container.innerHTML = `
      <div class="mt-2">
        <div class="mb-6">
          <h2 class="text-lg font-bold mb-2">About ${type === 'movie' ? 'Movie' : 'Show'}</h2>
          <p class="text-sm text-zinc-300 mb-4">${data.overview || 'No overview available.'}</p>
          
          <div class="grid grid-cols-2 gap-3 mb-4">
            ${data.release_date || data.first_air_date ? `
            <div>
              <p class="text-zinc-400 text-xs">Release Date</p>
              <p class="text-sm">${new Date(data.release_date || data.first_air_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>` : ''}
            
            ${runtimeText ? `
            <div>
              <p class="text-zinc-400 text-xs">Runtime</p>
              <p class="text-sm">${runtimeText}</p>
            </div>` : ''}
            
            ${type === 'tv' && data.number_of_seasons ? `
            <div>
              <p class="text-zinc-400 text-xs">Seasons</p>
              <p class="text-sm">${data.number_of_seasons} (${data.number_of_episodes} episodes)</p>
            </div>` : ''}
            
            ${data.status ? `
            <div>
              <p class="text-zinc-400 text-xs">Status</p>
              <p class="text-sm">${data.status}</p>
            </div>` : ''}
            
            ${data.genres && data.genres.length > 0 ? `
            <div>
              <p class="text-zinc-400 text-xs">Genres</p>
              <p class="text-sm">${data.genres.map(g => g.name).join(', ')}</p>
            </div>` : ''}
            
            ${data.vote_average ? `
            <div>
              <p class="text-zinc-400 text-xs">Rating</p>
              <p class="text-sm"><i class="icon-star text-yellow-400 mr-1"></i>${data.vote_average.toFixed(1)}/10</p>
            </div>` : ''}
          </div>
        </div>
        
        ${directors.length > 0 ? `
        <div class="mb-4">
          <p class="text-zinc-400 text-xs mb-1">Director${directors.length > 1 ? 's' : ''}</p>
          <p class="text-sm">${directors.map(d => d.name).join(', ')}</p>
        </div>` : ''}
        
        ${writers.length > 0 ? `
        <div class="mb-4">
          <p class="text-zinc-400 text-xs mb-1">Writer${writers.length > 1 ? 's' : ''}</p>
          <p class="text-sm">${writers.map(w => w.name).join(', ')}</p>
        </div>` : ''}
        
        ${cast.length > 0 ? `
        <div class="mb-6">
          <h2 class="text-lg font-bold mb-2">Cast</h2>
          <div class="flex flex-wrap">${castList}</div>
        </div>` : ''}
        
        ${data.production_companies && data.production_companies.length > 0 ? `
        <div class="mb-4">
          <p class="text-zinc-400 text-xs mb-1">Production</p>
          <p class="text-sm">${data.production_companies.map(c => c.name).slice(0, 3).join(', ')}</p>
        </div>` : ''}
        
        ${data.networks && data.networks.length > 0 ? `
        <div class="mb-6">
          <p class="text-zinc-400 text-xs mb-1">Network${data.networks.length > 1 ? 's' : ''}</p>
          <div class="flex flex-wrap gap-3 mt-1">
            ${data.networks.map(network => 
              `<img src="${TMDB_IMAGE_BASE_URL}w500${network.logo_path}" class="h-6 object-contain" style="filter: invert(50%) brightness(10000%);">`
            ).join('')}
          </div>
        </div>` : ''}
      </div>
    `;
  } catch (error) {
    console.error('Error loading details content:', error);
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-8">
        <p class="text-base text-zinc-400">Failed to load details</p>
      </div>
    `;
  }
}

/**
 * Checks if the current device is mobile
 * @returns {boolean} True if the device is mobile
 */
export function isMobileDevice() {
  return window.innerWidth <= 768;
}