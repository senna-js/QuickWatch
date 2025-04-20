// Trailer Modal Component
import { renderSpinner } from '../misc/loading.js';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../../router.js';

/**
 * Renders the trailer modal for movies and TV shows
 * @param {string} mediaTitle - Title of the media
 * @param {Object} trailer - Trailer data object
 * @returns {string} HTML for the trailer modal
 */
export function renderTrailerModal(mediaTitle, trailer) {
  if (!trailer) {
    return `
      <div id="trailer-modal" class="fixed inset-0 bg-[#00050d] bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div class="relative w-full max-w-6xl">
          <button id="close-trailer-modal" class="absolute -top-3 -right-3 text-white text-3xl z-[8]"><i class="icon-x"></i></button>
          
          <div class="iframe-container rounded-t-lg p-4 bg-[#111419]">
            <div class="flex flex-col items-center justify-center h-[700px]">
              <p class="text-xl text-zinc-400 mb-4">No trailer available</p>
            </div>
          </div>
          
          <div class="bg-[#181c23] p-4 rounded-b-lg">
            <h3 class="text-xl font-medium">No trailer found</h3>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div id="trailer-modal" class="fixed inset-0 bg-[#00050d] bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div class="relative w-full max-w-6xl">
        <button id="close-trailer-modal" class="absolute -top-3 -right-3 text-white text-3xl z-[8]"><i class="icon-x"></i></button>
        
        <div class="iframe-container rounded-t-lg p-4 bg-[#111419]">
          <iframe 
            width="100%" 
            height="700" 
            src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" 
            title="${trailer.name}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="w-full rounded-xl">
          </iframe>
        </div>
        
        <div class="bg-[#181c23] p-4 rounded-b-lg">
          <h3 class="text-xl font-medium">${trailer.name}</h3>
        </div>
      </div>
    </div>
  `;
}

/**
 * Fetches trailer data from TMDB API
 * @param {string} type - The media type ('movie' or 'tv')
 * @param {string} id - The media ID
 * @returns {Promise<Object|null>} - The trailer data or null if not found
 */
export async function fetchTrailerData(type, id) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };
    
    const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/videos?language=en-US`, options);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return null;
    }
    
    let videos = data.results.filter(video => video.site === 'YouTube');
    
    let trailer = null;
    
    // 1. English, Official Trailer
    trailer = videos.find(video => video.iso_639_1 === 'en' && video.type === 'Trailer' && video.official === true);
    // 2. English, Unofficial Trailer
    if (!trailer) { trailer = videos.find(video => video.iso_639_1 === 'en' && video.type === 'Trailer' && video.official === false); }
    // 3. English, Official Teaser
    if (!trailer) { trailer = videos.find(video => video.iso_639_1 === 'en' && video.type === 'Teaser' && video.official === true); }
    // 4. English, Unofficial Teaser
    if (!trailer) { trailer = videos.find(video => video.iso_639_1 === 'en' && video.type === 'Teaser' && video.official === false); }
    // 5. Any language, Official Trailer
    if (!trailer) { trailer = videos.find(video => video.type === 'Trailer' && video.official === true); }
    // 6. Any language, Unofficial Trailer
    if (!trailer) { trailer = videos.find(video => video.type === 'Trailer' && video.official === false); }
    // 7. Any language, Official Teaser
    if (!trailer) { trailer = videos.find(video => video.type === 'Teaser' && video.official === true); }
    // 8. Any language, Unofficial Teaser
    if (!trailer) { trailer = videos.find(video => video.type === 'Teaser' && video.official === false); }
    // 9. Just take the first video if nothing else matched
    if (!trailer && videos.length > 0) { trailer = videos[0]; }
    
    return trailer;
  } catch (error) {
    console.error('Error fetching trailer data:', error);
    return null;
  }
}

/**
 * Initializes the trailer button functionality
 * @param {string} type - The media type ('movie' or 'tv')
 * @param {string} id - The media ID
 * @param {string} mediaTitle - Title of the media
 */
export function initTrailerButton(type, id, mediaTitle) {
  const trailerButton = document.getElementById('trailer-button');
  
  if (trailerButton) {
    trailerButton.addEventListener('click', async () => {
      try {
        trailerButton.innerHTML = `<div class="w-8 h-8 flex items-center justify-center">${renderSpinner('small')}</div>`;
        
        const trailer = await fetchTrailerData(type, id);
        
        trailerButton.innerHTML = `<i class="icon-film text-3xl"></i>`;
        
        if (!trailer) {
          alert('No trailer available for this title.');
          return;
        }
        
        const trailerModalHTML = renderTrailerModal(mediaTitle, trailer);
        
        const trailerModalContainer = document.createElement('div');
        trailerModalContainer.innerHTML = trailerModalHTML;
        
        document.body.appendChild(trailerModalContainer.firstElementChild);
        
        document.getElementById('close-trailer-modal').addEventListener('click', () => {
          const trailerModal = document.getElementById('trailer-modal');
          if (trailerModal) {
            document.body.removeChild(trailerModal);
          }
        });
        
      } catch (error) {
        console.error('Error loading trailer:', error);
        trailerButton.innerHTML = `<i class="icon-film text-3xl"></i>`;
        alert('Failed to load trailer. Please try again later.');
      }
    });
  }
}