/**
 * Sets up saving and loading player data (volume and timestamp)
 * @param {HTMLVideoElement} player - The video player element
 * @param {HTMLElement} volumeLevel - The volume level element
 * @param {string} showId - The show ID for saving timestamp
 * @param {string} episodeNumber - The episode number
 * @returns {Object} - Functions for saving timestamps and cleaning up
 */
export function setupPlayerData(player, volumeLevel, showId, episodeNumber) {
  const savedVolume = localStorage.getItem('quickwatch_player_volume');
  if (savedVolume !== null) {
    player.volume = parseFloat(savedVolume);
    if (volumeLevel) {
      volumeLevel.style.width = `${player.volume * 100}%`;
    }
  }

  const saveVolume = () => {
    localStorage.setItem('quickwatch_player_volume', player.volume.toString());
  };
  player.addEventListener('volumechange', saveVolume);

  const timestampKey = `quickwatch_timestamp_${showId}_${episodeNumber}`;
  const savedTimestampData = localStorage.getItem(timestampKey);
    
  if (savedTimestampData !== null) {
    try {
      const timestampData = JSON.parse(savedTimestampData);
      if (timestampData && typeof timestampData.current === 'number') {
        player.addEventListener('loadedmetadata', () => {
          if (timestampData.current > 0 && timestampData.current < player.duration - 10) {
            player.currentTime = timestampData.current;
          }
        });
      }
    } catch (e) {
      console.error('Error parsing saved timestamp data:', e);
    }
  }

  const saveTimestamp = () => {
    if (player.currentTime > 0 && !player.paused && player.duration) {
      const timestampData = {
        current: player.currentTime,
        full: player.duration,
        id: showId,
        mediaType: 'tv'
      };
      localStorage.setItem(timestampKey, JSON.stringify(timestampData));
    }
  };

  const timestampInterval = setInterval(saveTimestamp, 5000);
  player.addEventListener('pause', saveTimestamp);
  window.addEventListener('beforeunload', saveTimestamp);

  const cleanupPlayer = () => {
    clearInterval(timestampInterval);
    window.removeEventListener('beforeunload', saveTimestamp);
  };

  window.addEventListener('unload', cleanupPlayer);

  return { saveTimestamp, cleanupPlayer };
}