// Player Modal Component
import { renderSpinner } from '../misc/loading.js';

/**
 * Renders the player modal for watching movies and TV shows
 * @param {string} type - The media type ('movie' or 'tv')
 * @param {string} id - The media ID
 * @param {Array} sources - Array of video sources
 * @param {number} initialSourceIndex - Index of the initially selected source
 * @param {number} initialSeason - Initial season number (for TV shows)
 * @param {number} initialEpisode - Initial episode number (for TV shows)
 * @param {string} mediaTitle - Title of the media
 * @param {boolean} isMobile - Whether the modal is for mobile view
 * @returns {string} HTML for the player modal
 */
export function renderPlayerModal(type, id, sources, initialSourceIndex, initialSeason, initialEpisode, mediaTitle, isMobile = false) {
  const filteredSources = sources.filter(source => type === 'movie' ? !source.tvOnly : true);
  
  if (isMobile) {
    return `
      <div id="player-modal" class="fixed inset-0 bg-[#00050d] bg-opacity-90 z-50 hidden flex flex-col items-center justify-between p-0">
        <div class="relative w-full h-full flex flex-col">
          <div class="iframe-container loading rounded-none flex-grow" id="iframe-container">
            <!-- iframe goes here -->
            <div class="iframe-loader">
              ${renderSpinner('large')}
            </div>
          </div>
          
          <div class="w-full bg-[#12161c] p-3 flex flex-col">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-medium truncate">${mediaTitle}</h3>
              <button id="close-modal" class="text-white px-3 py-1 rounded-lg bg-[#32363D]">
                <i class="icon-x"></i> Close
              </button>
            </div>
            
            <div class="source-selector-container overflow-x-auto pb-1">
              <div class="flex gap-2 min-w-max">
                ${filteredSources
                  .map((source, index) => `
                    <button class="source-button px-4 py-2 rounded-lg whitespace-nowrap ${index === initialSourceIndex ? 'bg-[#2392EE]' : 'bg-[#272c36]'}" data-index="${index}">
                      ${source.name}
                    </button>
                  `).join('')}
                <button id="popup-blocker" class="px-4 py-2 rounded-lg bg-[#272c36] whitespace-nowrap hover:bg-[#313845]">
                  <i class="fas fa-shield-alt mr-2"></i>Disable Popups
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    return `
      <div id="player-modal" class="fixed inset-0 bg-[#00050d] bg-opacity-90 z-50 hidden flex items-center justify-center p-4">
        <div class="relative w-full max-w-6xl">
          <button id="close-modal" class="absolute -top-3 -right-3 text-white text-3xl z-[8]"><i class="icon-x"></i></button>
          
          <div class="iframe-container loading rounded-t-lg p-4 bg-[#111419]" id="iframe-container">
            <!-- iframe goes here -->
            <div class="iframe-loader">
              ${renderSpinner('large')}
            </div>
          </div>
          
          <div class="bg-[#181c23] p-4 rounded-b-lg">
            <div class="relative flex justify-between items-center gap-3 overflow-auto">
              <div class="h-10 flex items-center gap-3">
                ${filteredSources
                  .map((source, index) => `
                    <button class="source-button px-4 py-2 rounded-lg whitespace-nowrap ${index === initialSourceIndex ? 'bg-[#2392EE]' : 'bg-[#272c36]'}" data-index="${index}">
                      ${source.name}
                    </button>
                  `).join('')}
              </div>
              <span class="text-[#474b52]">｜</span>
              <button id="popup-blocker" class="px-4 py-2 rounded-lg bg-[#272c36] whitespace-nowrap hover:bg-[#313845]">
                <i class="fas fa-shield-alt mr-2"></i>Disable Popups
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Initializes the player modal functionality
 * @param {string} type - The media type ('movie' or 'tv')
 * @param {string} id - The media ID
 * @param {Array} sources - Array of video sources
 * @param {number} initialSourceIndex - Index of the initially selected source
 * @param {number} initialSeason - Initial season number (for TV shows)
 * @param {number} initialEpisode - Initial episode number (for TV shows)
 * @param {boolean} isMobile - Whether the modal is for mobile view
 */
export function initPlayerModal(id, type, sources, initialSourceIndex, initialSeason, initialEpisode, isMobile = false) {
  // play button and modal
  const playButton = document.getElementById('play-button');
  const playerModal = document.getElementById('player-modal');
  const closeModal = document.getElementById('close-modal');
  let mediaPlayer = null;
  let currentTrackerCleanup = null;
  
  // track current episode and season
  let currentSeason = initialSeason;
  let currentEpisode = initialEpisode;
  
  // make currentSeason and currentEpisode globally accessible
  window.currentPlayerSeason = currentSeason;
  window.currentPlayerEpisode = currentEpisode;
  
  const createIframe = (sourceIndex) => {
    const iframeContainer = document.getElementById('iframe-container');
    if (!iframeContainer) return null;
    
    while (iframeContainer.querySelector('iframe')) {
      iframeContainer.querySelector('iframe').remove();
    }
    
    // use current values from global state
    const selectedSource = sources[sourceIndex];
    const iframeUrl = type === 'movie' 
      ? selectedSource.movieUrl.replace('{id}', id)
      : selectedSource.tvUrl
          .replace('{id}', id)
          .replace('{season}', window.currentPlayerSeason)
          .replace('{episode}', window.currentPlayerEpisode);
    
    const iframe = document.createElement('iframe');
    iframe.id = 'media-player';
    iframe.src = iframeUrl;
    iframe.className = isMobile ? 'w-full h-full rounded-none' : 'w-full rounded-xl';
    if (!isMobile) iframe.height = '700';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    
    iframeContainer.insertBefore(iframe, iframeContainer.firstChild);
    iframeContainer.classList.add('loading');
    
    iframe.addEventListener('load', () => {
      iframeContainer.classList.remove('loading');
    });
    
    return iframe;
};
  
  import('../watch/progress/index.js').then(module => {
    const { initializeSourceTracking, getProgress } = module;
    
    if (playButton && playerModal && closeModal) {
      playButton.addEventListener('click', () => {
        playerModal.classList.remove('hidden');
        
        // update global current values to initial values when play button clicked
        window.currentPlayerSeason = initialSeason;
        window.currentPlayerEpisode = initialEpisode;
        
        mediaPlayer = createIframe(initialSourceIndex);
        
        if (mediaPlayer) {
          const currentSource = sources[initialSourceIndex];
          // get existing progress before initializing new tracking
          const existingProgress = getProgress(parseInt(id), type, window.currentPlayerSeason, window.currentPlayerEpisode);
          
          currentTrackerCleanup = initializeSourceTracking(
            mediaPlayer,
            currentSource,
            parseInt(id),
            type,
            window.currentPlayerSeason,
            window.currentPlayerEpisode,
            initialSourceIndex,
            existingProgress
          );
        }
      });
      
      closeModal.addEventListener('click', () => {
        playerModal.classList.add('hidden');
        
        if (currentTrackerCleanup) {
          currentTrackerCleanup();
          currentTrackerCleanup = null;
        }
        
        const iframeContainer = document.getElementById('iframe-container');
        if (iframeContainer && iframeContainer.querySelector('iframe')) {
          iframeContainer.querySelector('iframe').remove();
          mediaPlayer = null;
        }
      });
    }
  
    // source selection
    const sourceButtons = document.querySelectorAll('.source-button');
    sourceButtons.forEach(button => {
      button.addEventListener('click', () => {
        const sourceIndex = parseInt(button.dataset.index);
        if (isNaN(sourceIndex) || sourceIndex < 0 || sourceIndex >= sources.length) return;
        
        initialSourceIndex = sourceIndex;
        const selectedSource = sources[sourceIndex];
        
        // update active button styling
        sourceButtons.forEach(btn => {
          btn.classList.remove('bg-[#2392EE]');
          btn.classList.add('bg-[#272c36]');
        });
        button.classList.remove('bg-[#272c36]');
        button.classList.add('bg-[#2392EE]');
        
        if (currentTrackerCleanup) {
          currentTrackerCleanup();
          currentTrackerCleanup = null;
        }
        
        mediaPlayer = createIframe(sourceIndex);
        
        if (mediaPlayer) {
          currentTrackerCleanup = initializeSourceTracking(
            mediaPlayer,
            selectedSource,
            id,
            type,
            window.currentPlayerSeason,
            window.currentPlayerEpisode,
            sourceIndex
          );
        }
        
        // replace the progress data section in the source button click handler
        import('../watch/progress/index.js').then(module => {
          const { saveProgress } = module;
          
          const existingProgress = module.getProgress(parseInt(id), type, 
            parseInt(window.currentPlayerSeason), parseInt(window.currentPlayerEpisode));
          
          saveProgress({
            id: parseInt(id),
            mediaType: type,
            season: parseInt(window.currentPlayerSeason) || 0,
            episode: parseInt(window.currentPlayerEpisode) || 0,
            sourceIndex: sourceIndex,
            fullDuration: existingProgress?.fullDuration || 0,
            watchedDuration: existingProgress?.watchedDuration || 0,
            timestamp: Date.now()
          });
        });
        
        initialSourceIndex = sourceIndex;
      });
    });
  });

  const popupBlocker = document.getElementById('popup-blocker');
  let popupBlockerEnabled = false;
  
  if (popupBlocker) {
    popupBlocker.addEventListener('click', () => {
      popupBlockerEnabled = !popupBlockerEnabled;
      
      const mediaPlayer = document.getElementById('media-player');
      const iframeContainer = document.getElementById('iframe-container');
      
      if (!mediaPlayer || !iframeContainer) return;
      
      if (popupBlockerEnabled) {
        mediaPlayer.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
        popupBlocker.classList.remove('bg-[#272c36]', 'hover:bg-[#313845]');
        popupBlocker.classList.add('bg-[#2392EE]');
        popupBlocker.innerHTML = '<i class="fas fa-shield-alt mr-2"></i>Popups Disabled';
      } else {
        mediaPlayer.removeAttribute('sandbox');
        popupBlocker.classList.remove('bg-[#2392EE]');
        popupBlocker.classList.add('bg-[#272c36]', 'hover:bg-[#313845]');
        popupBlocker.innerHTML = '<i class="fas fa-shield-alt mr-2"></i>Disable Popups';
      }
      
      const currentSrc = mediaPlayer.src;
      mediaPlayer.src = currentSrc;
      iframeContainer.classList.add('loading');
    });
  }
}