// carousel item

import { TMDB_IMAGE_BASE_URL } from '../router.js';

/**
 * Renders a carousel item for movies or TV shows
 * @param {Object} item - The movie or TV show data
 * @param {boolean} isFirstItem - Whether this is the first item in the carousel
 * @param {string} context - The context where the item is used ('carousel' or 'grid')
 * @param {Function} onRemove - Optional callback when remove button is clicked
 * @param {boolean} usePoster - Whether to use poster instead of backdrop
 * @param {Function} onLoaded - Optional callback when the image has loaded
 * @param {Object} progressData - Optional progress data {percentage, watchedDuration, fullDuration}
 * @param {Object} episodeInfo - Optional episode info for TV shows {season, episode}
 * @returns {HTMLElement} - The carousel item element
 */
export function createCarouselItem(item, isFirstItem = false, context = 'carousel', onRemove = null, usePoster = false, onLoaded = null, progressData = null, episodeInfo = null) {
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const formattedDate = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const user_rating = (item.vote_average / 2).toFixed(1);
  let rating = '';
  if (mediaType === 'tv' && item.content_ratings && item.content_ratings.results) {
    const usRating = item.content_ratings.results.find(r => r.iso_3166_1 === 'US');
    rating = usRating ? usRating.rating : '';
  } else if (mediaType === 'movie' && item.release_dates && item.release_dates.results) {
    const usRelease = item.release_dates.results.find(r => r.iso_3166_1 === 'US');
    rating = usRelease && usRelease.release_dates && usRelease.release_dates.length > 0 
      ? usRelease.release_dates[0].certification 
      : '';
  }
  
  const storedProgressData = getWatchProgress(item.id);
  const displayProgressData = progressData || storedProgressData;
  
  let imagePath;
  
  if (usePoster) {
    imagePath = item.poster_path;
  } else {
    imagePath = item.images && item.images.backdrops && item.images.backdrops.length > 0 
      ? item.images.backdrops[0].file_path 
      : item.backdrop_path;
  }
    
  if (!imagePath) {
    if (onLoaded) onLoaded();
    return null;
  }
  
  const card = document.createElement('div');
  
  if (context === 'grid') {
    card.className = 'carousel-item w-full bg-[#32363D] rounded-lg transition-all duration-300 ease-in-out relative cursor-pointer';
  } else {
    card.className = isFirstItem 
      ? 'carousel-item flex-shrink-0 bg-[#32363D] rounded-lg ml-2 transition-all duration-300 ease-in-out relative cursor-pointer'
      : 'carousel-item flex-shrink-0 bg-[#32363D] rounded-lg transition-all duration-300 ease-in-out relative cursor-pointer';
  }
  
  if (usePoster) {
    card.classList.add('w-[140px]');
    card.style.aspectRatio = '2/3';
  } else {
    card.classList.add('w-[300px]');
    card.classList.add('aspect-video');
  }
  
  card.dataset.id = item.id;
  card.dataset.mediaType = mediaType;
  
  // bg image
  card.style.backgroundImage = `url(${TMDB_IMAGE_BASE_URL}w500${imagePath})`;
  card.style.backgroundColor = '#1a1a1a';
  card.style.backgroundSize = 'cover';
  card.style.backgroundPosition = 'center';

  const infoPanel = document.createElement('div');

  infoPanel.className = 'carousel-info-popup hidden md:block bg-[#1A1D21] text-white p-3 rounded-b-lg opacity-0 transition-opacity duration-300 pointer-events-none'; 
  infoPanel.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
  infoPanel.style.transform = 'translateY(-10px)';
  infoPanel.style.position = 'absolute';
  infoPanel.style.zIndex = '50';

  if (onLoaded) {
    requestAnimationFrame(() => {
      onLoaded();
    });
  }
      
  infoPanel.innerHTML = `
    <h3 class="text-white font-semibold text-xl">${title}</h3>
    <button class="play-button px-4 py-3 text-lg my-2 w-full rounded-lg bg-[#32363D] font-medium flex flex-row items-center justify-center gap-2">
        <i class="fas fa-play text-xl mr-0.5"></i>
        <span>${displayProgressData?.continueText || 'Play'}</span>
    </button>
    <span class="text-sm font-normal"><i class="fas fa-circle-check mr-1 text-[#2392EE]"></i> Available on QuickWatch</span>
    <div class="flex flex-row items-center gap-2 mt-1 text-[0.9rem] text-zinc-300">
      <span class="mr-[0.2rem]">${formattedDate}</span>
      <span class="mr-[0.2rem]">${user_rating} <i class="fas fa-star text-[#2392EE]"></i></span>
      ${rating ? `<div class="flex items-center bg-gray-700 px-1.5 py-0.5 rounded text-xs">${rating}</div>` : ''}
    </div>
  `;
  
  infoPanel.className = 'carousel-info-popup hidden md:block bg-[#1A1D21] text-white p-4 rounded-b-lg opacity-0 transition-opacity duration-300 pointer-events-none shadow-lg';
  
  const playButton = infoPanel.querySelector('.play-button');
  
  playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    window.history.pushState(null, null, `/${mediaType}/${item.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  
  if (displayProgressData) {
    
    if (displayProgressData.continueText) {
      const continueTextElement = document.createElement('div');
      continueTextElement.className = 'hidden md:block text-sm font-bold text-white absolute m-2 bottom-0 z-[3]';
      continueTextElement.style.textShadow = '0 0 0.5rem #000';
      continueTextElement.innerHTML = displayProgressData.statusText 
        ? `${displayProgressData.continueText} <span class="font-light">(${displayProgressData.statusText})</span>`
        : displayProgressData.continueText;
      card.appendChild(continueTextElement);
    }
    
  }
  
  if (displayProgressData) {
    const progressBar = document.createElement('div');
    progressBar.className = 'absolute inset-x-0 bottom-0 h-1.5 bg-[#666] rounded-b-lg';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'h-full bg-[#fff] rounded-b-lg';
    progressFill.style.width = `${displayProgressData.percentage}%`;
    
    progressBar.appendChild(progressFill);
    card.appendChild(progressBar);
  }
  
  let hoverTimeout;
  let currentInfoPanel = null;

  const showInfoPanel = () => {
    clearTimeout(hoverTimeout);

    document.querySelectorAll('.carousel-info-popup.visible').forEach(panel => {
      if (panel !== infoPanel) {
        panel.classList.remove('visible');
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(-10px)';
        panel.style.pointerEvents = 'none';
        panel.addEventListener('transitionend', () => panel.remove(), { once: true });
      }
    });

    card.style.transform = 'scale(1.05)';
    card.style.zIndex = '10';
    card.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';

    if (!document.body.contains(infoPanel)) {
      const rect = card.getBoundingClientRect();
      infoPanel.style.width = `${rect.width * 1.05}px`;
      infoPanel.style.left = `${rect.left + window.scrollX - (rect.width * 0.05 / 2)}px`;
      infoPanel.style.top = `${rect.bottom + window.scrollY}px`;
      document.body.appendChild(infoPanel);
      currentInfoPanel = infoPanel;
    }

    infoPanel.classList.add('visible');
    infoPanel.style.opacity = '1';
    infoPanel.style.transform = 'translateY(0)';
    infoPanel.style.pointerEvents = 'auto';

    if (removeButton) {
        removeButton.classList.remove('opacity-0');
        removeButton.classList.add('opacity-100');
    }
  };

  const hideInfoPanel = () => {
     hoverTimeout = setTimeout(() => {
        card.style.transform = 'scale(1)';
        card.style.zIndex = '1';
        card.style.boxShadow = 'none';

        if (currentInfoPanel) {
          currentInfoPanel.classList.remove('visible');
          currentInfoPanel.style.opacity = '0';
          currentInfoPanel.style.transform = 'translateY(-10px)';
          currentInfoPanel.style.pointerEvents = 'none';
          
          const panelToRemove = currentInfoPanel;
          panelToRemove.addEventListener('transitionend', () => {
              if (!panelToRemove.classList.contains('visible')) {
                  panelToRemove.remove();
              }
          }, { once: true });
          currentInfoPanel = null;
        }

        if (removeButton) {
            removeButton.classList.remove('opacity-100');
            removeButton.classList.add('opacity-0');
        }
    }, 150);
  };

  let removeButton = null;
  if (onRemove) {
    removeButton = document.createElement('button');
    removeButton.className = 'absolute top-2 right-2 bg-black bg-opacity-70 rounded-full w-6 h-6 flex items-center justify-center text-white z-20 opacity-0 transition-opacity duration-300';
    removeButton.innerHTML = '×';
    removeButton.style.fontSize = '18px';
    
    removeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove(item.id, mediaType);
    });
    
    card.appendChild(removeButton);
    
  }

  card.addEventListener('mouseenter', showInfoPanel);
  card.addEventListener('mouseleave', hideInfoPanel);
  
  const attachPanelListeners = () => {
    infoPanel.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
    });
    infoPanel.addEventListener('mouseleave', hideInfoPanel);
  };

  attachPanelListeners();

  card.addEventListener('click', () => {
    if (!currentInfoPanel || !document.body.contains(currentInfoPanel) || infoPanel.style.opacity === '0') {
      setTimeout(() => {
        window.history.pushState(null, null, `/${mediaType}/${item.id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 50);
    }
  });
  
  return card;
}

/**
 * Gets the watch progress for a show or movie
 * @param {string} id - The show or movie ID
 * @returns {Object|null} - The progress data or null if not found
 */
function getWatchProgress(id) {
  // look for any timestamp keys for the anime
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith(`quickwatch_timestamp_${id}_`)
  );
  
  if (keys.length === 0) return null;
  
  const key = keys[0];
  
  try {
    const data = JSON.parse(localStorage.getItem(key));
    
    if (data && typeof data.current === 'number' && typeof data.full === 'number') {
      const percentage = Math.min(Math.round((data.current / data.full) * 100), 100);
      const remainingSeconds = Math.max(0, data.full - data.current);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      
      return {
        percentage,
        remainingMinutes,
        current: data.current,
        full: data.full
      };
    }
  } catch (e) {
    console.error('Error parsing watch progress:', e);
  }
  
  return null;
}