/**
 * Handles iPhone-specific player functionality
 * @param {HTMLVideoElement} player - The video player element
 * @param {HTMLElement} customPlayer - The custom player container
 * @param {HTMLElement} topControls - The top controls container
 * @returns {boolean} - Whether the device is an iPhone
 */
export function setupIPhoneSupport(player, customPlayer, topControls) {
  const isIPhone = /iPhone/i.test(navigator.userAgent);
  
  if (!isIPhone) return false;
  
  player.addEventListener('click', () => {
    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
  });
  
  let controlsTimeout;
  
  customPlayer.addEventListener('click', () => {
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
  });
  
  return isIPhone;
}