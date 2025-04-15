// carousel item

import { TMDB_IMAGE_BASE_URL } from '../router.js';

/**
 * Renders a carousel item for movies or TV shows
 * @param {Object} item - The movie or TV show data
 * @param {boolean} isFirstItem - Whether this is the first item in the carousel
 * @param {string} context - The context where the item is used ('carousel' or 'grid')
 * @param {Function} onRemove - Optional callback when remove button is clicked
 * @returns {HTMLElement} - The carousel item element
 */
export function createCarouselItem(item, isFirstItem = false, context = 'carousel', onRemove = null) {
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const formattedDate = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : '';
  
  const backdropPath = item.images && item.images.backdrops && item.images.backdrops.length > 0 
    ? item.images.backdrops[0].file_path 
    : item.backdrop_path;
    
  if (!backdropPath) return null;
  
  const card = document.createElement('div');
  
  if (context === 'grid') {
    card.className = 'carousel-item w-full aspect-video bg-[#32363D] rounded-lg transition-all duration-300 ease-in-out relative cursor-pointer';
  } else {
    card.className = isFirstItem 
      ? 'carousel-item w-[300px] aspect-video bg-[#32363D] flex-shrink-0 rounded-lg ml-[4.4rem] transition-all duration-300 ease-in-out relative cursor-pointer' 
      : 'carousel-item w-[300px] aspect-video bg-[#32363D] flex-shrink-0 rounded-lg transition-all duration-300 ease-in-out relative cursor-pointer';
  }
  
  card.dataset.id = item.id;
  card.dataset.mediaType = mediaType;
  
  // bg image
  card.style.backgroundImage = `url(${TMDB_IMAGE_BASE_URL}w500${backdropPath})`;
  card.style.backgroundSize = 'cover';
  card.style.backgroundPosition = 'center';
  
  // overlay with details
  const overlay = document.createElement('div');
  overlay.className = 'w-full h-full flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300';
  
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
  
  overlay.appendChild(titleElement);
  overlay.appendChild(detailsContainer);
  
  // check for watch progress
  const progressData = getWatchProgress(item.id);
  if (progressData) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'mt-3';
    
    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'w-full h-1 bg-zinc-700 rounded-full';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'h-full bg-red-600 rounded-full';
    progressBar.style.width = `${progressData.percentage}%`;
    
    progressBarContainer.appendChild(progressBar);
    progressContainer.appendChild(progressBarContainer);
    
    const remainingTimeText = document.createElement('div');
    remainingTimeText.className = 'text-xs text-zinc-400 mt-1';
    remainingTimeText.textContent = `${progressData.remainingMinutes} minutes remaining`;
    
    progressContainer.appendChild(remainingTimeText);
    overlay.appendChild(progressContainer);
  }
  
  card.appendChild(overlay);
  
  if (onRemove) {
    const removeButton = document.createElement('button');
    removeButton.className = 'absolute top-2 right-2 bg-black bg-opacity-70 rounded-full w-6 h-6 flex items-center justify-center text-white z-20 opacity-0 transition-opacity duration-300';
    removeButton.innerHTML = '×';
    removeButton.style.fontSize = '18px';
    
    removeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove(item.id, mediaType);
    });
    
    card.appendChild(removeButton);
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.05)';
      card.style.zIndex = '10';
      card.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
      removeButton.classList.remove('opacity-0');
      removeButton.classList.add('opacity-100');
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
      card.style.zIndex = '1';
      card.style.boxShadow = 'none';
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0');
      removeButton.classList.remove('opacity-100');
      removeButton.classList.add('opacity-0');
    });
  } else {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.05)';
      card.style.zIndex = '10';
      card.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
      card.style.zIndex = '1';
      card.style.boxShadow = 'none';
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0');
    });
  }
  
  card.addEventListener('click', () => {
    setTimeout(() => {
      window.history.pushState(null, null, `/${mediaType}/${item.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 200);
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