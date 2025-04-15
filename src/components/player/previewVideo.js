import { fetchVideoUrl } from '../../pages/embeds/animepahe-embed.js';

/**
 * Sets up video preview functionality
 * @param {HTMLElement} videoPreview - The video preview container
 * @param {HTMLVideoElement} player - The video player element
 * @param {HTMLElement} progressContainerHitbox - The progress container hitbox
 * @param {HTMLElement} progressContainer - The progress container
 * @param {HTMLElement} previewTime - The preview time element
 * @param {Array} linksData - The available video sources
 * @returns {Object} - Preview state and functions
 */
export function setupPreviewVideo(videoPreview, player, progressContainerHitbox, progressContainer, previewTime, linksData) {
  let previewReady = false;
  let isHoveringProgressContainer = false;
  
  const previewVideo = document.createElement('video');
  previewVideo.muted = true;
  previewVideo.preload = 'metadata';
  previewVideo.crossOrigin = player.crossOrigin;
  previewVideo.style.width = '100%';
  previewVideo.style.height = '100%';
  previewVideo.style.objectFit = 'cover';
  
  // replace canvas with video element
  videoPreview.querySelector('#preview-canvas').replaceWith(previewVideo);
  
  // format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const getLowestSizeVideoLink = () => {
    if (!linksData || linksData.length === 0) return null;
    
    let lowestSizeLink = linksData[0];
    let lowestSize = Infinity;
    
    for (const link of linksData) {
      const sizeMatch = link.name.match(/\((\d+)MB\)/);
      if (sizeMatch && sizeMatch[1]) {
        const size = parseInt(sizeMatch[1]);
        if (size < lowestSize) {
          lowestSize = size;
          lowestSizeLink = link;
        }
      }
    }
    
    return lowestSizeLink.link;
  };
  
  const loadPreviewVideo = async () => {
    try {
      const lowestSizeLink = getLowestSizeVideoLink();
      if (lowestSizeLink) {
        const previewVideoUrl = await fetchVideoUrl(lowestSizeLink);
        if (previewVideoUrl) {
          previewVideo.src = previewVideoUrl;
          previewVideo.addEventListener('loadedmetadata', () => {
            previewReady = true;
          });
        }
      }
    } catch (error) {
      console.error('Error loading preview video:', error);
    }
  };
  
  loadPreviewVideo();
  
  const showPreview = (posX, time) => {
    videoPreview.classList.remove('hidden');
    setTimeout(() => {
      videoPreview.classList.remove('opacity-0');
    }, 10);
    
    videoPreview.style.left = `${posX}px`;
    videoPreview.style.bottom = `10px`;
    previewTime.textContent = formatTime(time);
    
    if (previewReady && previewVideo.readyState >= 2) {
      previewVideo.currentTime = time;
    }
  };
  
  progressContainerHitbox.addEventListener('mousemove', (e) => {
    if (!player.duration) return;
    
    const rect = progressContainer.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const previewTimeValue = player.duration * pos;
    
    showPreview(e.clientX, previewTimeValue);
  });
  
  progressContainerHitbox.addEventListener('mouseleave', () => {
    videoPreview.classList.add('opacity-0');
    setTimeout(() => {
      if (!isHoveringProgressContainer) {
        videoPreview.classList.add('hidden');
      }
    }, 300);
  });
  
  progressContainerHitbox.addEventListener('mouseenter', () => {
    isHoveringProgressContainer = true;
  });
  
  progressContainerHitbox.addEventListener('mouseleave', () => {
    isHoveringProgressContainer = false;
  });
  
  return {
    previewReady,
    isHoveringProgressContainer,
    formatTime
  };
}