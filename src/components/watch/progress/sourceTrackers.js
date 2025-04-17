import { saveProgress } from './progressManager.js';


export function setupVidLinkTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
    if (event.origin !== 'https://vidlink.pro') return;
    
    if (event.data?.type === 'MEDIA_DATA') {
      const mediaData = event.data.data;
      console.log('VidLink media data:', mediaData);
      
      // process all media items in the received data
      Object.entries(mediaData).forEach(([id, mediaItem]) => {
        if (mediaItem.type === 'tv' && mediaItem.show_progress) {
          // save all episodes' progress
          Object.entries(mediaItem.show_progress).forEach(([episodeKey, episodeData]) => {
            if (episodeData.progress) {
              saveProgress({
                id: parseInt(id),
                mediaType: 'tv',
                season: parseInt(episodeData.season),
                episode: parseInt(episodeData.episode),
                sourceIndex: sourceIndex,
                fullDuration: episodeData.progress.duration || 0,
                watchedDuration: episodeData.progress.watched || 0,
                timestamp: Date.now()
              });
            }
          });
        } else if (mediaItem.type === 'movie' && mediaItem.progress) {
          // save movie progress
          saveProgress({
            id: parseInt(id),
            mediaType: 'movie',
            season: 0,
            episode: 0,
            sourceIndex: sourceIndex,
            fullDuration: mediaItem.progress.duration || 0,
            watchedDuration: mediaItem.progress.watched || 0,
            timestamp: mediaItem.last_updated || Date.now()
          });
        }
      });
      
      // save the current media being watched
      const currentMediaItem = mediaData[mediaId];
      if (currentMediaItem) {
        if (mediaType === 'tv') {
          const episodeKey = `s${season}e${episode}`;
          const episodeData = currentMediaItem.show_progress?.[episodeKey];
          if (episodeData?.progress) {
            saveProgress({
              id: parseInt(mediaId),
              mediaType: mediaType,
              season: parseInt(season),
              episode: parseInt(episode),
              sourceIndex: sourceIndex,
              fullDuration: episodeData.progress.duration || 0,
              watchedDuration: episodeData.progress.watched || 0,
              timestamp: Date.now()
            });
          }
        }
      }
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}

export function setupVidsrcCCTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
    // add later
  };
  
  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}

export function setupVidzeeTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
    // add later
  };
  
  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}

export function setupVidFastTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
    // add later
  };
  
  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}

export function setupVideasyTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
    // add later
  };
  
  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}