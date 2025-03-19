/**
 * Sets up fullscreen and picture-in-picture functionality
 * @param {HTMLVideoElement} player - The video player element
 * @param {HTMLElement} customPlayer - The custom player container
 * @param {HTMLElement} fullscreenBtn - The fullscreen button element
 * @param {HTMLElement} pipBtn - The picture-in-picture button element
 * @returns {Object} - Fullscreen and PiP control functions
 */
export function setupFullscreenPiP(player, customPlayer, fullscreenBtn, pipBtn) {
  // toggle fullscreen
  fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      fullscreenBtn.innerHTML = '<i class="icon-maximize"></i>';
      fullscreenBtn.style.backgroundColor = '';
      fullscreenBtn.style.color = '';
    } else {
      if (document.pictureInPictureElement === player) {
        return;
      }
      customPlayer.requestFullscreen();
      fullscreenBtn.innerHTML = '<i class="icon-minimize"></i>';
      fullscreenBtn.style.backgroundColor = '#fff';
      fullscreenBtn.style.color = '#000';
    }
  });
  
  // setup picture-in-picture if possible
  if (document.pictureInPictureEnabled) {
    pipBtn.addEventListener('click', () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          fullscreenBtn.innerHTML = '<i class="icon-maximize"></i>';
          fullscreenBtn.style.backgroundColor = '';
          fullscreenBtn.style.color = '';
        }
        player.requestPictureInPicture();
      }
    });
    
    player.addEventListener('enterpictureinpicture', () => {
      pipBtn.style.backgroundColor = '#fff';
      pipBtn.style.color = '#000';
    });
    
    player.addEventListener('leavepictureinpicture', () => {
      pipBtn.style.backgroundColor = '';
      pipBtn.style.color = '';
    });
  } else {
    pipBtn.classList.add('hidden');
  }
  
  return {
    toggleFullscreen: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        customPlayer.requestFullscreen();
      }
    },
    togglePiP: () => {
      if (document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
        } else {
          player.requestPictureInPicture();
        }
      }
    }
  };
}