// Season Selector Component
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../../router.js';

/**
 * Renders the season selector for TV shows
 * @param {Object} data - The TV show data
 * @param {number} initialSeason - Initial season number
 * @param {boolean} isMobile - Whether the selector is for mobile view
 * @returns {string} HTML for the season selector
 */
export function renderSeasonSelector(data, initialSeason, isMobile = false) {
  if (isMobile) {
    return `
      <div class="relative mb-3 mx-[1.3rem]">
        <div id="custom-select" class="w-full px-4 py-3 rounded-lg bg-[#292D3C] text-lg font-medium cursor-pointer flex items-center justify-between">
          <span id="selected-season">Season ${initialSeason}</span>
          <i class="icon-chevron-down transition-transform duration-200"></i>
        </div>
        <div id="season-options" class="absolute w-full mt-2 bg-[#292D3C] rounded-lg shadow-lg hidden z-10 max-h-60 overflow-y-auto">
          ${data.seasons.map((season, i) => 
            `<div class="season-option px-4 py-2 hover:bg-[#464b5e] cursor-pointer transition-colors duration-150 ${i+1 === initialSeason ? 'bg-[#464b5e]' : ''}" data-value="${season.season_number}">${season.name}</div>`
          ).join('')}
        </div>
      </div>
    `;
  } else {
    return `
      <div class="relative inline-block w-48 mb-4">
        <div id="custom-select" class="w-full px-4 py-3 rounded-lg bg-[#32363D] text-lg md:text-xl font-medium cursor-pointer flex items-center justify-between">
          <span id="selected-season">Season ${initialSeason}</span>
          <i class="icon-chevron-down transition-transform duration-200"></i>
        </div>
        <div id="season-options" class="absolute w-full mt-2 bg-[#32363D] rounded-lg shadow-lg hidden z-10 max-h-60 overflow-y-auto">
          ${data.seasons.map((season, i) => 
            `<div class="season-option px-4 py-2 hover:bg-[#454950] cursor-pointer transition-colors duration-150 ${i+1 === initialSeason ? 'bg-[#454950]' : ''}" data-value="${season.season_number}">${season.name}</div>`
          ).join('')}
        </div>
      </div>
    `;
  }
}

/**
 * Initializes the season selector functionality
 * @param {string} id - The TV show ID
 * @param {Object} data - The TV show data
 * @param {Object} seasonData - The current season data
 * @param {number} initialSeason - Initial season number
 * @param {number} initialEpisode - Initial episode number
 * @param {Array} sources - Array of video sources
 * @param {number} initialSourceIndex - Index of the initially selected source
 * @param {string} contentRating - Content rating of the TV show
 * @param {boolean} isMobile - Whether the selector is for mobile view
 * @param {Function} onSeasonChange - Callback function when season changes
 */
export async function initSeasonSelector(id, data, seasonData, initialSeason, initialEpisode, sources, initialSourceIndex, contentRating, isMobile = false, onSeasonChange = null) {
  const customSelect = document.getElementById('custom-select');
  const seasonOptions = document.getElementById('season-options');
  const selectedSeasonText = document.getElementById('selected-season');
  const chevronIcon = customSelect?.querySelector('.icon-chevron-down');
  
  if (customSelect && seasonOptions) {
    customSelect.addEventListener('click', () => {
      seasonOptions.classList.toggle('hidden');
      chevronIcon?.classList.toggle('rotate-180');
    });
    
    document.addEventListener('click', (e) => {
      if (!customSelect.contains(e.target)) {
        seasonOptions.classList.add('hidden');
        chevronIcon?.classList.remove('rotate-180');
      }
    });
    
    const seasonOptionElements = document.querySelectorAll('.season-option');
    seasonOptionElements.forEach((option, index) => {
      option.addEventListener('click', async () => {
        const selectedSeason = parseInt(option.dataset.value);
        initialSeason = selectedSeason;
        selectedSeasonText.textContent = data.seasons[index].name;
        
        seasonOptionElements.forEach(opt => opt.classList.remove(isMobile ? 'bg-[#464b5e]' : 'bg-[#454950]'));
        option.classList.add(isMobile ? 'bg-[#464b5e]' : 'bg-[#454950]');
        
        seasonOptions.classList.add('hidden');
        chevronIcon?.classList.remove('rotate-180');
        
        initialEpisode = 1;

        try {
          const options = {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': TMDB_API_KEY
            }
          };
          
          const seasonResponse = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${selectedSeason}?language=en-US`, options);
          seasonData = await seasonResponse.json();
          
          // Update episodes list
          const episodesList = document.getElementById('episodes-list');
          if (episodesList && seasonData.episodes) {
            if (isMobile) {
              episodesList.innerHTML = seasonData.episodes.map(episode => `
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
              `).join('');
            } else {
              episodesList.innerHTML = seasonData.episodes.map(episode => `
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
              `).join('');
            }
            
            // Add event listeners to new episode items
            const newEpisodeItems = episodesList.querySelectorAll('.episode-item');
            newEpisodeItems.forEach(item => {
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
                  }));
                }
              });
            });
          }
          
          // Call the callback function if provided
          if (onSeasonChange) {
            onSeasonChange(selectedSeason, seasonData);
          }
        } catch (error) {
          console.error('Error fetching season data:', error);
        }
      });
    });
  }
}