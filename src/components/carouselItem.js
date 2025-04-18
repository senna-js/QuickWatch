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
  const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : '';
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

  infoPanel.className = 'carousel-info-popup bg-[#1A1D21] text-white p-3 rounded-b-lg opacity-0 transition-opacity duration-300 pointer-events-none'; 
  infoPanel.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
  infoPanel.style.transform = 'translateY(-10px)';
  infoPanel.style.position = 'absolute';
  infoPanel.style.zIndex = '50';

  if (onLoaded) {
    requestAnimationFrame(() => {
      onLoaded();
    });
  }
  
  // title
  const titleElement = document.createElement('h3');
  titleElement.className = 'text-white font-semibold text-lg';
  titleElement.textContent = title;
  
  // details container
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'flex flex-row items-center gap-2 mt-1 text-sm text-zinc-300';
  
  // year
  if (formattedDate) {
    const yearElement = document.createElement('span');
    yearElement.textContent = formattedDate;
    detailsContainer.appendChild(yearElement);
    
    if (rating) {
      const separator = document.createElement('span');
      separator.textContent = '•';
      detailsContainer.appendChild(separator);
    }
  }
  
  // rating
  if (rating) {
    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'flex items-center gap-1';
    
    const starIcon = document.createElement('i');
    starIcon.className = 'icon-star text-yellow-400';
    
    const ratingText = document.createElement('span');
    ratingText.textContent = rating;
    
    ratingContainer.appendChild(starIcon);
    ratingContainer.appendChild(ratingText);
    detailsContainer.appendChild(ratingContainer);
  }
  
  // genre
  if (item.genres && item.genres.length > 0) {
    if (formattedDate || rating) {
      const separator = document.createElement('span');
      separator.textContent = '•';
      detailsContainer.appendChild(separator);
    }
    
    const genreElement = document.createElement('span');
    genreElement.textContent = item.genres[0].name;
    detailsContainer.appendChild(genreElement);
  }
  
  infoPanel.appendChild(titleElement);
  infoPanel.appendChild(detailsContainer);
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'flex items-center gap-3 mt-4';
  
  const playButton = document.createElement('button');
  playButton.className = 'px-4 py-2 rounded-lg bg-[#32363D] font-medium flex flex-row items-center justify-center gap-2';
  playButton.innerHTML = `
    <i class="fas fa-play text-lg"></i>
    <span>${displayProgressData?.continueText || 'Play'}</span>
  `;
  
  const watchlistButton = document.createElement('button');
  watchlistButton.className = 'bg-[#32363D] w-8 h-8 rounded-full flex items-center justify-center';
  watchlistButton.innerHTML = '<i class="icon-plus text-lg"></i>';
  
  const closeButton = document.createElement('button'); 
  closeButton.className = 'bg-[#32363D] w-8 h-8 rounded-full flex items-center justify-center';
  closeButton.innerHTML = '<i class="icon-close text-lg"></i>';
  
  playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    window.history.pushState(null, null, `/${mediaType}/${item.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  
  watchlistButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const watchlist = JSON.parse(localStorage.getItem('quickwatch-watchlist') || '[]');
    const existingItem = watchlist.find(i => i.id === item.id && i.mediaType === mediaType);
    
    if (!existingItem) {
      watchlist.push({
        id: item.id,
        mediaType: mediaType,
        title: title,
        posterPath: TMDB_IMAGE_BASE_URL + 'w500' + imagePath,
        dateAdded: new Date().toISOString()
      });
      localStorage.setItem('quickwatch-watchlist', JSON.stringify(watchlist));
      alert('Added to watchlist!');
    } else {
      alert('Already in your watchlist!');
    }
  });
  
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    hideInfoPanel();
  });
  
  buttonsContainer.appendChild(playButton);
  buttonsContainer.appendChild(watchlistButton);
  buttonsContainer.appendChild(closeButton);
  
  if (item.networks && item.networks.length > 0 && item.networks[0].logo_path) {
    const networkInfo = document.createElement('div');
    networkInfo.className = 'mt-3 flex items-center gap-2 text-sm text-zinc-300';
    networkInfo.innerHTML = `
      <i class="icon-check text-blue-400"></i>
      <span>Included with subscription</span>
    `;
    infoPanel.appendChild(networkInfo);
  }
  
  infoPanel.appendChild(buttonsContainer);
  
  infoPanel.className = 'carousel-info-popup bg-[#121416] text-white p-4 rounded-b-lg opacity-0 transition-opacity duration-300 pointer-events-none shadow-lg';
  
  if (displayProgressData) {
    
    if (displayProgressData.continueText) {
      const continueTextElement = document.createElement('div');
      continueTextElement.className = 'text-sm font-bold text-white absolute m-2 bottom-0 z-[3]';
      continueTextElement.style.textShadow = '0 0 0.5rem #000';
      continueTextElement.innerHTML = displayProgressData.statusText 
        ? `${displayProgressData.continueText} <span class="font-light">(${displayProgressData.statusText})</span>`
        : displayProgressData.continueText;
      card.appendChild(continueTextElement);
    }
    
  }
  
  if (displayProgressData) {
    const progressBar = document.createElement('div');
    progressBar.className = 'absolute inset-x-0 bottom-0 h-1.5 bg-gray-800 rounded-b-lg';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'h-full bg-[#2392EE] rounded-b-lg';
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