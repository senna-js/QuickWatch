// Season Selector Component
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../../router.js';
import { renderEpisodeList, initEpisodeList } from './episodeList.js';

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
            episodesList.innerHTML = isMobile ? 
              renderEpisodeList(seasonData.episodes, contentRating, true) :
              renderEpisodeList(seasonData.episodes, contentRating);

            // Initialize episode list with new season data
            initEpisodeList(id, selectedSeason, initialEpisode, sources, initialSourceIndex, seasonData.episodes);
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