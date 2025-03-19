/**
 * Sets up progress bar functionality
 * @param {HTMLVideoElement} player - The video player element
 * @param {HTMLElement} progressContainerHitbox - The progress container hitbox
 * @param {HTMLElement} progressContainer - The progress container
 * @param {HTMLElement} progressBar - The progress bar element
 * @param {HTMLElement} progressThumb - The progress thumb element
 * @param {HTMLElement} currentTimeEl - The current time element
 * @param {HTMLElement} timeDisplay - The time display element
 * @param {HTMLElement} bufferBar - The buffer bar element
 * @param {Function} formatTime - Function to format time
 * @returns {Object} - Progress state and functions
 */
export function setupProgressBar(player, progressContainerHitbox, progressContainer, progressBar, progressThumb, currentTimeEl, timeDisplay, bufferBar, formatTime) {
  let isDragging = false;
  let isHoveringProgressContainer = false;
  let showTimeRemaining = false;
  
  // Update buffer progress
  const updateBufferProgress = () => {
    if (!player.duration) return;
    
    if (player.buffered.length > 0) {
      const bufferedEnd = player.buffered.end(player.buffered.length - 1);
      const duration = player.duration;
      const bufferedPercent = (bufferedEnd / duration) * 100;
      bufferBar.style.width = `${bufferedPercent}%`;
    }
  };
  
  const updateProgress = () => {
    if (!player.duration) return;
    
    const progress = (player.currentTime / player.duration) * 100;
    progressBar.style.width = `${progress}%`;
    progressThumb.style.left = `${progress}%`;
    
    if (showTimeRemaining) {
      const timeLeft = player.duration - player.currentTime;
      currentTimeEl.textContent = `-${formatTime(timeLeft)}`;
    } else {
      currentTimeEl.textContent = formatTime(player.currentTime);
    }
    
    updateBufferProgress();
  };
  
  // setup time display click to toggle remaining/elapsed time
  if (timeDisplay) {
    timeDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      showTimeRemaining = !showTimeRemaining;
      updateProgress();
    });
  }
  
  // setup progress bar click
  progressContainerHitbox.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.currentTime = pos * player.duration;
  });
  
  // setup progress bar dragging
  progressContainerHitbox.addEventListener('mousedown', () => {
    isDragging = true;
    progressThumb.classList.remove('hidden');
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const rect = progressContainer.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      progressBar.style.width = `${pos * 100}%`;
      progressThumb.style.left = `${pos * 100}%`;
      player.currentTime = pos * player.duration;
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    if (!isHoveringProgressContainer) {
      progressThumb.classList.add('hidden');
    }
  });
  
  progressContainerHitbox.addEventListener('mouseenter', () => {
    isHoveringProgressContainer = true;
    progressThumb.classList.remove('hidden');
  });
  
  progressContainerHitbox.addEventListener('mouseleave', () => {
    isHoveringProgressContainer = false;
    if (!isDragging) {
      progressThumb.classList.add('hidden');
    }
  });
  
  // set timeupdate event
  player.addEventListener('timeupdate', updateProgress);
  player.addEventListener('progress', updateBufferProgress);
  
  return {
    updateProgress,
    updateBufferProgress,
    isHoveringProgressContainer,
    showTimeRemaining,
    isDragging
  };
}

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}