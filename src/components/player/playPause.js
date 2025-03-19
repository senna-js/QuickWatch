/**
 * Sets up play/pause functionality for the player
 * @param {HTMLVideoElement} player - The video player element
 * @param {HTMLElement} playPauseBtn - The play/pause button element
 * @param {HTMLElement} centerPlayButton - The center play button element
 * @returns {Object} - Play/pause control functions
 */
export function setupPlayPause(player, playPauseBtn, centerPlayButton) {
  // toggle play/pause on click
  playPauseBtn.addEventListener('click', () => {
    if (player.paused) {
      player.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause text-xl"></i>';
      playPauseBtn.style.backgroundColor = '#fff';
      playPauseBtn.style.color = '#000';
    } else {
      player.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play text-xl"></i>';
      playPauseBtn.style.backgroundColor = '';
      playPauseBtn.style.color = '';
    }
  });
  
  // update button on play
  player.addEventListener('play', () => {
    playPauseBtn.innerHTML = '<i class="fas fa-pause text-xl"></i>';
    playPauseBtn.style.backgroundColor = '#fff';
    playPauseBtn.style.color = '#000';
    
    if (centerPlayButton) {
      centerPlayButton.classList.add('hidden');
    }
  });
  
  // update button on pause
  player.addEventListener('pause', () => {
    playPauseBtn.innerHTML = '<i class="fas fa-play text-xl"></i>';
    playPauseBtn.style.backgroundColor = '';
    playPauseBtn.style.color = '';
    
    if (centerPlayButton) {
      centerPlayButton.classList.remove('hidden');
    }
  });
  
  // set center play button
  if (centerPlayButton) {
    centerPlayButton.addEventListener('click', () => {
      player.play();
    });
  }
  
  return {
    togglePlayPause: () => {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    }
  };
}