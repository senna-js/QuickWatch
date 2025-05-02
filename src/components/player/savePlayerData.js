export function setupPlayerData(player, volumeLevel, showId, episodeNumber, mediaType = 'tv') {
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

  const parsedShowId = parseInt(showId);
  if (isNaN(parsedShowId)) {
    console.error('Invalid show ID:', showId);
    return { saveTimestamp: () => {}, cleanupPlayer: () => {} };
  }

  let season = 1;
  let episode = 1;
  
  try {
    const url = window.location.href;
    const animepaheMatch = url.match(/\/embed\/animepahe\/\d+\/(\d+)\/(\d+)/);
    const nativeMatch = url.match(/\/embed\/native\/(\d+)\/(\d+)\/(\d+)\/(\w+)/);
    const nativeMovieMatch = url.match(/\/embed\/native\/(\d+)\/(\w+)/);
    
    if (animepaheMatch && animepaheMatch[1] && animepaheMatch[2]) {
      season = parseInt(animepaheMatch[1]);
      episode = parseInt(animepaheMatch[2]);
      console.log(`Parsed from URL: Season ${season}, Episode ${episode}`);
    } else if (nativeMatch && nativeMatch[2] && nativeMatch[3] && nativeMatch[4]) {
      season = parseInt(nativeMatch[2]);
      episode = parseInt(nativeMatch[3]);
      mediaType = nativeMatch[4];
      console.log(`Parsed from Native URL: Season ${season}, Episode ${episode}, Type ${mediaType}`);
    } else if (nativeMovieMatch && nativeMovieMatch[1] && nativeMovieMatch[2]) {
      mediaType = nativeMovieMatch[2];
      season = 0;
      episode = 0;
      console.log(`Parsed from Native Movie URL: ID ${nativeMovieMatch[1]}, Type ${mediaType}`);
    } else if (episodeNumber) {
      const seasonMatch = episodeNumber.match(/S(\d+)/i);
      const episodeMatch = episodeNumber.match(/E(\d+)/i);
      
      if (seasonMatch && seasonMatch[1]) {
        season = parseInt(seasonMatch[1]);
      }
      
      if (episodeMatch && episodeMatch[1]) {
        episode = parseInt(episodeMatch[1]);
      }
    }
    
    if (isNaN(season) || isNaN(episode)) {
      console.error('Invalid season or episode format');
      season = 1;
      episode = 1;
    }
  } catch (e) {
    console.error('Error parsing season/episode:', e);
  }

  let continueData = [];
  try {
    continueData = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
    
    continueData = continueData.filter(item => 
      item && 
      typeof item === 'object' && 
      item.id !== null
    );
    
    continueData = continueData.map(item => ({
      ...item,
      id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
      mediaType: item.mediaType || 'tv',
      season: item.season || 1,
      episode: item.episode || 1
    }));
  } catch (e) {
    console.error('Error parsing continue data:', e);
  }
  
  const existingProgress = continueData.find(item => 
    item.id === parsedShowId && 
    item.mediaType === mediaType &&
    (mediaType === 'movie' || (item.season === season && item.episode === episode))
  );
  
  if (existingProgress && typeof existingProgress.watchedDuration === 'number') {
    player.addEventListener('loadedmetadata', () => {
      if (existingProgress.watchedDuration > 0 && existingProgress.watchedDuration < player.duration - 10) {
        player.currentTime = existingProgress.watchedDuration;
      }
    });
  }

  const saveTimestamp = () => {
    if (player.currentTime > 0 && player.duration) {
      let continueData = [];
      try {
        continueData = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
        
        continueData = continueData.filter(item => 
          item && 
          typeof item === 'object' && 
          item.id !== null
        ).map(item => ({
          ...item,
          id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
          mediaType: item.mediaType || 'tv'
        }));
      } catch (e) {
        console.error('Error parsing continue data:', e);
      }
      
      const progressData = {
        id: parsedShowId,
        mediaType: mediaType,
        season: mediaType === 'movie' ? 0 : season,
        episode: mediaType === 'movie' ? 0 : episode,
        sourceIndex: 0,
        fullDuration: player.duration || 0,
        watchedDuration: player.currentTime || 0,
        timestamp: Date.now()
      };
      
      const existingIndex = continueData.findIndex(item => 
        item.id === progressData.id && 
        item.mediaType === progressData.mediaType &&
        (mediaType === 'movie' || (item.season === progressData.season && item.episode === progressData.episode))
      );
      
      if (existingIndex >= 0) {
        continueData[existingIndex] = progressData;
      } else {
        continueData.push(progressData);
      }
      
      continueData.sort((a, b) => b.timestamp - a.timestamp);
      if (continueData.length > 50) {
        continueData = continueData.slice(0, 50);
      }
      
      localStorage.setItem('quickwatch-continue', JSON.stringify(continueData));
    }
  };

  const timestampInterval = setInterval(saveTimestamp, 5000);
  player.addEventListener('pause', saveTimestamp);
  player.addEventListener('ended', saveTimestamp);
  window.addEventListener('beforeunload', saveTimestamp);

  const cleanupPlayer = () => {
    clearInterval(timestampInterval);
    window.removeEventListener('beforeunload', saveTimestamp);
    player.removeEventListener('pause', saveTimestamp);
    player.removeEventListener('ended', saveTimestamp);
  };

  window.addEventListener('unload', cleanupPlayer);

  return { saveTimestamp, cleanupPlayer };
}