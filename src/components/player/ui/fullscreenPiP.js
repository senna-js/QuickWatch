export function setupFullscreenPiP(player, customPlayer, fullscreenBtn, pipBtn) {
  // toggle fullscreen
  fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      fullscreenBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 448 512"><path fill="currentColor" d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"></path></svg>';
      fullscreenBtn.style.backgroundColor = '';
      fullscreenBtn.style.color = '';
    } else {
      if (document.pictureInPictureElement === player) {
        return;
      }
      customPlayer.requestFullscreen();
      fullscreenBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 448 512"><path fill="currentColor" d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"></path></svg>';
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
          fullscreenBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 448 512"><path fill="currentColor" d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"></path></svg>';
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