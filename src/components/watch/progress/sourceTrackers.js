import { saveProgress } from './progressManager.js';


export function setupVidLinkTracking(playerIframe, mediaId, mediaType, season, episode, sourceIndex) {
  const messageHandler = (event) => {
    if (event.origin !== 'https://vidlink.pro') return;
    
    if (event.data?.type === 'MEDIA_DATA') {
      const mediaData = event.data.data;
      console.log('VidLink media data:', mediaData);
      
      // get existing progress from quickwatch-continue
      const continueData = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
      const existingProgress = continueData.find(item => 
        item.id === parseInt(mediaId) && 
        item.mediaType === mediaType &&
        (mediaType === 'movie' || (item.season === season && item.episode === episode))
      );

      console.log('Current progress:', existingProgress);
      
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
            fullDuration: mediaItem.progress.duration || existingProgress?.fullDuration || 0,
            watchedDuration: mediaItem.progress.watched || existingProgress?.watchedDuration || 0,
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
    if (event.origin !== 'https://player.videasy.net') return;
    
    try {
      const eventData = JSON.parse(event.data);
      if (eventData?.type === 'MEDIA_DATA') {
        const mediaData = JSON.parse(eventData.data);
        
        // get existing progress from quickwatch-continue
        const continueData = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
        const existingProgress = continueData.find(item => 
          item.id === parseInt(mediaId) && 
          item.mediaType === mediaType &&
          (mediaType === 'movie' || (item.season === season && item.episode === episode))
        );

        console.log('Current progress:', existingProgress);
        
        Object.entries(mediaData).forEach(([key, mediaItem]) => {
          const id = parseInt(mediaItem.id);
          
          if (mediaItem.mediaType === 'tv' && mediaItem.show_progress) {
            // save all episodes' progress
            Object.entries(mediaItem.show_progress).forEach(([episodeKey, episodeData]) => {
              if (episodeData.progress) {
                saveProgress({
                  id: id,
                  mediaType: 'tv',
                  season: parseInt(episodeData.season),
                  episode: parseInt(episodeData.episode),
                  sourceIndex: sourceIndex,
                  fullDuration: episodeData.progress.duration || 0,
                  watchedDuration: episodeData.progress.watched || 0,
                  timestamp: episodeData.last_updated || Date.now()
                });
              }
            });
          } else if (mediaItem.mediaType === 'movie' && mediaItem.progress) {
            // save movie progress
            saveProgress({
              id: id,
              mediaType: 'movie',
              season: 0,
              episode: 0,
              sourceIndex: sourceIndex,
              fullDuration: mediaItem.progress.duration || existingProgress?.fullDuration || 0,
              watchedDuration: mediaItem.progress.watched || existingProgress?.watchedDuration || 0,
              timestamp: Date.now()
            });
          }
        });
        
        // save the current media being watched
        const currentMediaKey = `${mediaType}-${mediaId}`;
        const currentMediaItem = mediaData[currentMediaKey];
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
                timestamp: episodeData.last_updated || Date.now()
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing Videasy message:', error);
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}