/**
 * Sets up the top controls for the player
 * @param {HTMLElement} topControls - The top controls container
 * @param {HTMLElement} aspectToggleBtn - The aspect ratio toggle button
 * @param {HTMLVideoElement} player - The video player element
 * @returns {Object} - Control functions and state
 */
export function setupTopControls(topControls, aspectToggleBtn, player) {
  let isFilledView = true;
  let controlsTimeout;
  
  if (aspectToggleBtn) {
    aspectToggleBtn.addEventListener('click', () => {
      isFilledView = !isFilledView;
      
      if (isFilledView) {
        player.style.objectFit = 'cover';
        aspectToggleBtn.innerHTML = '<i class="icon-shrink"></i>';
      } else {
        player.style.objectFit = 'contain';
        aspectToggleBtn.innerHTML = '<i class="icon-expand"></i>';
      }
    });
  }
  
  const showTopControls = () => {
    if (topControls) {
      topControls.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('opacity-0');
      });
      
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      
      controlsTimeout = setTimeout(() => {
        topControls.querySelectorAll('button').forEach(btn => {
          btn.classList.add('opacity-0');
        });
      }, 2000);
    }
  };
  
  return { 
    showTopControls, 
    isFilledView,
    controlsTimeout
  };
}