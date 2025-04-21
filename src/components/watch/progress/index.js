import { saveProgress, getProgress, getAllProgress } from './progressManager.js';
import {
  setupVidLinkTracking,
  setupVidsrcCCTracking,
  setupVidzeeTracking,
  setupVidFastTracking,
  setupVideasyTracking,
  setupVidsrcXYZTracking
} from './sourceTrackers.js';

export function initializeSourceTracking(playerIframe, source, mediaId, mediaType, season, episode, sourceIndex) {
  const sourceTrackers = {
    'VidLink': setupVidLinkTracking,
    'VidsrcXYZ': setupVidsrcXYZTracking,
    'VidsrcCC': setupVidsrcCCTracking,
    'Vidzee': setupVidzeeTracking,
    'VidFast': setupVidFastTracking,
    'Videasy': setupVideasyTracking,
  };
  
  const trackerSetup = sourceTrackers[source.name];
  
  if (trackerSetup) {
    console.log(`Initializing progress tracking for ${source.name}`);
    return trackerSetup(playerIframe, mediaId, mediaType, season, episode, sourceIndex);
  } else {
    console.log(`No progress tracking available for ${source.name}`);
    return () => {};
  }
}

export function injectVidLinkListener() {
  const script = document.createElement('script');
  script.id = 'vidlink-listener';
  script.textContent = `
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://vidlink.pro') return;
      
      if (event.data?.type === 'MEDIA_DATA') {
        const mediaData = event.data.data;
        console.log('VidLink media data received:', mediaData);
      }
    });
  `;
  
  if (!document.getElementById('vidlink-listener')) {
    document.head.appendChild(script);
  }
}

export function getProgressPercentage(mediaId, mediaType, season = 0, episode = 0) {
  const progress = getProgress(mediaId, mediaType, season, episode);
  
  if (progress && progress.fullDuration > 0) {
    return Math.min(100, Math.round((progress.watchedDuration / progress.fullDuration) * 100));
  }
  
  return 0;
}

export function hasStartedWatching(mediaId, mediaType, season = 0, episode = 0) {
  const progress = getProgress(mediaId, mediaType, season, episode);
  return progress !== null && progress.watchedDuration > 0;
}

export function hasCompletedWatching(mediaId, mediaType, season = 0, episode = 0) {
  const progressPercent = getProgressPercentage(mediaId, mediaType, season, episode);
  return progressPercent >= 90;
}

export function getMostRecentEpisode(mediaId) {
  const allProgress = getAllProgress(mediaId, 'tv');
  
  if (allProgress.length === 0) return null;
  return allProgress[allProgress.length - 1];
}

export { saveProgress, getProgress, getAllProgress };