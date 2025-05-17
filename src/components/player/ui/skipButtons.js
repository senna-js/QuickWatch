export function setupSkipButtons(player, backwardBtn, forwardBtn) {
  if (!player) return;
  
  // Setup backward 10s button
  if (backwardBtn) {
    backwardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      player.currentTime = Math.max(0, player.currentTime - 10);
    });
  }
  
  // Setup forward 10s button
  if (forwardBtn) {
    forwardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      player.currentTime = Math.min(player.duration, player.currentTime + 10);
    });
  }
  
  return {
    skipBackward: () => {
      player.currentTime = Math.max(0, player.currentTime - 10);
    },
    skipForward: () => {
      player.currentTime = Math.min(player.duration, player.currentTime + 10);
    }
  };
}