// Episode List Component
import { TMDB_IMAGE_BASE_URL } from '../../../router.js';
import { getProgress } from '../../watch/progress/index.js';

function getEpisodeProgress(id, season, episode) {
  const savedItem = getProgress(parseInt(id), 'tv', parseInt(season), parseInt(episode));
  
  if (savedItem) {
    // calculate progress
    const progress = savedItem.fullDuration > 0 ? 
      savedItem.watchedDuration / savedItem.fullDuration : 0;
    
    return {
      progress: progress,
      duration: savedItem.fullDuration || 0,
      fullDuration: savedItem.fullDuration || 0,
      watchedDuration: savedItem.watchedDuration || 0,
      remaining: savedItem.fullDuration ? 
        Math.round((savedItem.fullDuration - savedItem.watchedDuration) / 60) : 0
    };
  }
  
  return null;
}

export function renderEpisodeList(episodes, contentRating, isMobile = false) {
  const urlPath = window.location.pathname;
  const idMatch = urlPath.match(/\/tv\/(\d+)/);
  const showId = idMatch ? idMatch[1] : '';
  
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
              ${(() => {
                const progress = getEpisodeProgress(showId, episode.season_number, episode.episode_number);
                if (progress) {
                  return `
                  <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent h-12"></div>
                  <div class="absolute inset-x-0 bottom-0 h-1 bg-gray-800">
                    <div class="h-full bg-[#2392EE]" style="width: ${progress.progress * 100}%"></div>
                  </div>
                  `;
                }
                return '';
              })()}
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
              ${(() => {
                const progress = getEpisodeProgress(showId, episode.season_number, episode.episode_number);
                if (progress) {
                  return `
                  <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent h-16"></div>
                  <div class="absolute inset-x-0 bottom-0 h-1.5 bg-gray-800">
                    <div class="h-full bg-[#2392EE]" style="width: ${progress.progress * 100}%"></div>
                  </div>
                  `;
                }
                return '';
              })()}
            </div>
          </div>
          <div class="flex flex-col justify-start">
            <h3 class="text-xl font-medium mb-2">S${episode.season_number} E${episode.episode_number} - ${episode.name}</h3>
            <div class="flex flex-row gap-3 mb-3 font-medium text-lg opacity-[95%]">
              <span>${new Date(episode.air_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>${episode.runtime || 0} min</span>
              <span class="px-2 bg-[#32363D] rounded-[0.275rem]">${contentRating}</span>
            </div>

            <p class="text-[#aaa] text-xl font-light max-w-3xl mb-3 overflow-hidden line-clamp-2 text-ellipsis">${episode.overview || 'No overview available'}</p>

            <span class="text-base font-normal"><i class="fas fa-circle-check mr-1.5 text-[#2392EE]"></i> Available on QuickWatch</span>
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
export function initEpisodeList(id, initialSeason, initialEpisode, sources, initialSourceIndex, episodes = []) {
  const episodeItems = document.querySelectorAll('.episode-item');
  
  updateProgressIndicators(id, initialSeason);
  
  episodeItems.forEach(item => {
    item.addEventListener('click', () => {
      const episodeNumber = item.dataset.episode;
      if (episodeNumber) {
        // set the current episode in the global state
        window.currentPlayerSeason = initialSeason;
        window.currentPlayerEpisode = parseInt(episodeNumber);
        
        const selectedSource = sources[initialSourceIndex];
        const newUrl = selectedSource.tvUrl
          .replace('{id}', id)
          .replace('{season}', initialSeason)
          .replace('{episode}', episodeNumber);
        
        const playerModal = document.getElementById('player-modal');
        if (playerModal) {
          playerModal.classList.remove('hidden');
          
          const iframeContainer = document.getElementById('iframe-container');
          if (iframeContainer) {
            while (iframeContainer.querySelector('iframe')) {
              iframeContainer.querySelector('iframe').remove();
            }
            
            const iframe = document.createElement('iframe');
            iframe.id = 'media-player';
            iframe.src = newUrl;
            iframe.className = window.innerWidth <= 768 ? 'w-full h-full rounded-none' : 'w-full rounded-xl';
            if (window.innerWidth > 768) iframe.height = '700';
            iframe.frameBorder = '0';
            iframe.allowFullscreen = true;
            
            iframeContainer.insertBefore(iframe, iframeContainer.firstChild);
            iframeContainer.classList.add('loading');
            
            iframe.addEventListener('load', () => {
              iframeContainer.classList.remove('loading');
            });

            import('../progress/index.js').then(module => {
              const { initializeSourceTracking } = module;
              const cleanup = initializeSourceTracking(
                iframe,
                selectedSource,
                id,
                'tv',
                initialSeason,
                parseInt(episodeNumber),
                initialSourceIndex
              );

              // clean up previous tracking
              const closeModal = document.getElementById('close-modal');
              if (closeModal) {
                const closeHandler = () => {
                  cleanup();
                  closeModal.removeEventListener('click', closeHandler);
                };
                closeModal.addEventListener('click', closeHandler);
              }
            });
          }
        }
        
        // Save progress
        const continueWatching = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
        
        const existingIndex = continueWatching.findIndex(item => 
          item.id === id && item.mediaType === 'tv'
        );
        
        if (existingIndex !== -1) {
          continueWatching.splice(existingIndex, 1);
        }
        
        // Find episode duration from episodes array if available
        let episodeDuration = 1800; // Default to 30 minutes
        if (episodes && episodes.length > 0) {
          const episode = episodes.find(ep => ep.episode_number === parseInt(episodeNumber));
          if (episode && episode.runtime) {
            episodeDuration = episode.runtime * 60;
          }
        }
        
        continueWatching.unshift({
          id: id,
          mediaType: 'tv',
          season: initialSeason,
          episode: parseInt(episodeNumber),
          sourceIndex: initialSourceIndex,
          progress: 0,
          duration: episodeDuration,
          fullDuration: episodeDuration,
          watchedDuration: 0,
          timestamp: Date.now()
        });
        
        if (continueWatching.length > 10) {
          continueWatching.pop();
        }
        
        localStorage.setItem('quickwatch-continue', JSON.stringify(continueWatching));
      }
    });
  });
}

function updateProgressIndicators(id, season) {
  console.log(`Updating progress indicators for show ${id}, season ${season}`);
  const episodeItems = document.querySelectorAll('.episode-item');
  
  episodeItems.forEach(item => {
    const episodeNumber = parseInt(item.dataset.episode);
    const progress = getEpisodeProgress(id, season, episodeNumber);
        
    let progressBar = item.querySelector('.progress-bar');
    let progressOverlay = item.querySelector('.progress-overlay');
    let remainingTime = item.querySelector('.remaining-time');
    
    if (progressBar) progressBar.remove();
    if (progressOverlay) progressOverlay.remove();
    if (remainingTime) remainingTime.remove();
    
    if (progress) {
      console.log(`Adding progress for episode ${episodeNumber}`);
      const thumbnailContainer = item.querySelector('.bg-zinc-600');
      if (thumbnailContainer) {
        progressOverlay = document.createElement('div');
        progressOverlay.className = 'progress-overlay absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent';
        progressOverlay.style.height = '16px';
        thumbnailContainer.appendChild(progressOverlay);
        
        progressBar = document.createElement('div');
        progressBar.className = 'progress-bar absolute inset-x-0 bottom-0 h-1.5 bg-gray-800';
        
        const progressValue = typeof progress.progress === 'number' ? 
          Math.min(Math.max(progress.progress, 0), 1) : 0;
        
        progressBar.innerHTML = `<div class="h-full bg-[#2392EE]" style="width: ${progressValue * 100}%"></div>`;
        thumbnailContainer.appendChild(progressBar);
        
        remainingTime = document.createElement('div');
        remainingTime.className = 'remaining-time absolute bottom-2 right-3 text-sm text-white font-medium';
        remainingTime.textContent = `${progress.remaining || 0}m left`;
        thumbnailContainer.appendChild(remainingTime);
      }
    }
  });
}