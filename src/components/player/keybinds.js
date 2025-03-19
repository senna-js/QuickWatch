/**
 * Sets up keyboard shortcuts for the player
 * @param {HTMLVideoElement} player - The video player element
 * @param {HTMLElement} customPlayer - The custom player container
 * @param {Function} mute - The mute function
 * @param {Function} showVolumeSlider - The function to show volume slider
 * @param {HTMLElement} volumeLevel - The volume level element
 * @param {Function} updateVolumeIcon - The function to update volume icon
 */
export function setupKeybinds(player, customPlayer, mute, showVolumeSlider, volumeLevel, updateVolumeIcon) {
  document.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'j', 'k', 'l', 'm'].includes(e.key)) {
      e.preventDefault();
    }
    
    const isPlayerVisible = customPlayer.offsetWidth > 0 && customPlayer.offsetHeight > 0;
    if (!isPlayerVisible) return;
    
    switch (e.key) {
      case ' ':
      case 'k':
        if (player.paused) {
          player.play();
        } else {
          player.pause();
        }
        break;
      case 'ArrowLeft':
      case 'j':
        player.currentTime = Math.max(0, player.currentTime - 10);
        break;
      case 'ArrowRight':
      case 'l':
        player.currentTime = Math.min(player.duration, player.currentTime + 10);
        break;
      case 'm':
        mute();
        break;
      case 'ArrowUp':
        showVolumeSlider();
        player.volume = Math.min(1, player.volume + 0.1);
        volumeLevel.style.width = `${player.volume * 100}%`;
        updateVolumeIcon();
        break;
      case 'ArrowDown':
        showVolumeSlider();
        player.volume = Math.max(0, player.volume - 0.1);
        volumeLevel.style.width = `${player.volume * 100}%`;
        updateVolumeIcon();
        break;
    }
  });
}