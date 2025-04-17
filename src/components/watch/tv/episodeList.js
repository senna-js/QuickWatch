// Episode List Component
import { TMDB_IMAGE_BASE_URL } from '../../../router.js';

/**
 * Renders the episode list for TV shows
 * @param {Array} episodes - Array of episode data
 * @param {string} contentRating - Content rating of the TV show
 * @param {boolean} isMobile - Whether the list is for mobile view
 * @returns {string} HTML for the episode list
 */
export function renderEpisodeList(episodes, contentRating, isMobile = false) {
  if (isMobile) {
    return `
      <div class="flex flex-col" id="episodes-list">
        ${episodes.map(episode => `
        <div class="flex flex-row gap-3 p-3 px-5 transition duration-200 ease hover:bg-[#191E25] rounded-lg cursor-pointer episode-item" data-episode="${episode.episode_number}">
          <div class="relative">
            <div class="bg-zinc-600 w-[8rem] aspect-video rounded-md overflow-hidden relative">
              <img class="object-cover w-full h-full" src="${episode.still_path ? `${TMDB_IMAGE_BASE_URL}original${episode.still_path}` : 'https://placehold.co/600x400/0e1117/fff/?text=No%20thumbnail%20found&font=poppins'}">
              <div class="absolute inset-0 flex items-end justify-start">
                <div class="w-10 h-10 rounded-full flex items-center justify-center">
                  <i class="fas fa-play text-white text-lg" style="filter: drop-shadow(2px 2px 8px black);"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col justify-center flex-1">
            <div class="flex justify-between items-start">
              <h3 class="text-base font-medium text-white leading-tight w-[90%]">${episode.episode_number}. ${episode.name}</h3>
            </div>
            <div class="flex flex-row gap-2 text-sm text-zinc-400 font-light">
              <span>${episode.runtime || 0}m</span>
              <span>${new Date(episode.air_date).getFullYear()}</span>
              <span>${contentRating}</span>
            </div>
          </div>
        </div>
        <p class="text-[0.95] mx-2 mb-2 leading-tight text-[#ADACAC] font-light px-3 -mt-1 overflow-hidden line-clamp-2 text-ellipsis">${episode.overview || 'No overview available'}</p>
        `).join('')}
      </div>
    `;
  } else {
    return `
      <div class="flex flex-col gap-0" id="episodes-list">
        ${episodes.map(episode => `
        <div class="flex flex-row gap-6 -mx-4 p-4 transition duration-200 ease hover:bg-[#191E25] rounded-xl cursor-pointer episode-item" data-episode="${episode.episode_number}">
          <div class="relative">
            <div class="bg-zinc-600 h-44 aspect-video rounded-lg overflow-hidden relative">
              <img class="object-cover w-full h-full" src="${episode.still_path ? `${TMDB_IMAGE_BASE_URL}original${episode.still_path}` : 'https://placehold.co/600x400/0e1117/fff/?text=No%20thumbnail%20found&font=poppins'}">
            </div>
          </div>
          <div class="flex flex-col justify-start">
            <h3 class="text-xl font-medium mb-2">S${episode.season_number} E${episode.episode_number} - ${episode.name}</h3>
            <div class="flex flex-row gap-3 mb-3 font-medium text-lg opacity-[95%]">
              <span>${new Date(episode.air_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>${episode.runtime || 0} min</span>
              <span class="px-2 bg-[#32363D] rounded-[0.275rem]">${contentRating}</span>
            </div>

            <p class="text-zinc-400 text-xl font-light max-w-3xl mb-3 overflow-hidden line-clamp-2 text-ellipsis">${episode.overview || 'No overview available'}</p>

            <span class="text-sm font-medium text-[#2392EE]"><i class="fas fa-circle-check mr-2"></i> Available on QuickWatch</span>
          </div>
        </div>
      `).join('')}
      </div>
    `;
  }
}

/**
 * Initializes the episode list functionality
 * @param {string} id - The TV show ID
 * @param {number} initialSeason - Current season number
 * @param {number} initialEpisode - Initial episode number
 * @param {Array} sources - Array of video sources
 * @param {number} initialSourceIndex - Index of the initially selected source
 */
export function initEpisodeList(id, initialSeason, initialEpisode, sources, initialSourceIndex) {
  const episodeItems = document.querySelectorAll('.episode-item');
  episodeItems.forEach(item => {
    item.addEventListener('click', () => {
      const episodeNumber = item.dataset.episode;
      if (episodeNumber) {
        initialEpisode = parseInt(episodeNumber);
        const selectedSource = sources[initialSourceIndex];
        const newUrl = selectedSource.tvUrl
          .replace('{season}', initialSeason)
          .replace('{episode}', episodeNumber);
        
        // Update player and show modal
        const mediaPlayer = document.getElementById('media-player');
        if (mediaPlayer) {
          mediaPlayer.src = newUrl;
          document.getElementById('player-modal').classList.remove('hidden');
        }
        
        // Save progress
        localStorage.setItem(`tv-progress-${id}`, JSON.stringify({
          season: initialSeason,
          episode: parseInt(episodeNumber),
          sourceIndex: initialSourceIndex,
          timestamp: new Date().toISOString()
        }));
      }
    });
  });
}