import { saveProgress } from './progressManager.js';


export function setupVidLinkTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
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
            season: parseInt(season),
            episode: parseInt(episode),
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

export function setupVidsrcCCTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
  };
  
  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}

export function setupVidzeeTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
  };
  
  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}

export function setupVidFastTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
  };
  
  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}

export function setupVideasyTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
  };
  
  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}