export function initializeProgressTracking(playerIframe, sourceType, mediaId, mediaType, season, episode, sourceIndex) {
  switch (sourceType) {
    case 'VidLink':
      setupVidLinkTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex);
      break;
    case 'vidsrcCC':
      // Will be implemented when format is provided
      break;
    case 'Vidzee':
      // Will be implemented when format is provided
      break;
    case 'VidFast':
      // Will be implemented when format is provided
      break;
    case 'Videasy':
      // Will be implemented when format is provided
      break;
    default:
      console.log(`Progress tracking not implemented for ${sourceType}`);
  }
}

function setupVidLinkTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
    if (event.origin !== 'https://vidlink.pro') return;
    
    if (event.data?.type === 'MEDIA_DATA') {
      const mediaData = event.data.data;
      console.log('VidLink media data:', mediaData);
      
      if (mediaData && mediaType === 'tv') {
        const episodeKey = `s${season}e${episode}`;
        const episodeData = mediaData.show_progress?.[episodeKey];
        
        if (episodeData && episodeData.progress) {
          saveProgress({
            id: mediaId,
            mediaType: mediaType,
            season: season,
            episode: episode,
            sourceIndex: sourceIndex,
            fullDuration: episodeData.progress.duration || 0,
            watchedDuration: episodeData.progress.watched || 0
          });
        }
      } else if (mediaData && mediaType === 'movie') {
        if (mediaData.progress) {
          saveProgress({
            id: mediaId,
            mediaType: 'movie',
            season: 0,
            episode: 0,
            sourceIndex: sourceIndex,
            fullDuration: mediaData.progress.duration || 0,
            watchedDuration: mediaData.progress.watched || 0
          });
        }
      }
    }
  };
  
  window.addEventListener('message', messageHandler);

  return () => {
    window.removeEventListener('message', messageHandler);
  };
}


export function saveProgress(progressData) {
  try {
    let continueData = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
    
    const existingIndex = continueData.findIndex(item => 
      item.id === progressData.id && 
      item.mediaType === progressData.mediaType &&
      (progressData.mediaType === 'movie' || 
       (item.season === progressData.season && item.episode === progressData.episode))
    );
    
    if (existingIndex >= 0) {
      continueData[existingIndex] = progressData;
    } else {
      continueData.push(progressData);
    }
    
    if (continueData.length > 50) {
      continueData = continueData.slice(-50);
    }
    
    localStorage.setItem('quickwatch-continue', JSON.stringify(continueData));
    
    if (progressData.mediaType === 'tv') {
      const oldKey = `tv-progress-${progressData.id}`;
      if (localStorage.getItem(oldKey)) {
        localStorage.removeItem(oldKey);
      }
    }
    
    console.log('Progress saved:', progressData);
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

export function getProgress(mediaId, mediaType, season = 0, episode = 0) {
  try {
    const continueData = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
    
    return continueData.find(item => 
      item.id === mediaId && 
      item.mediaType === mediaType &&
      (mediaType === 'movie' || 
       (item.season === season && item.episode === episode))
    ) || null;
  } catch (error) {
    console.error('Error getting progress:', error);
    return null;
  }
}

export function getAllProgress(mediaId, mediaType) {
  try {
    const continueData = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
    
    return continueData.filter(item => 
      item.id === mediaId && 
      item.mediaType === mediaType
    );
  } catch (error) {
    console.error('Error getting all progress:', error);
    return [];
  }
}