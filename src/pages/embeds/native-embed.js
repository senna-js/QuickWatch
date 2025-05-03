// Native Embed Page
import { renderFullPageSpinner, renderSpinner } from '../../components/misc/loading.js';
import { renderError } from '../../components/misc/error.js';
import { initializeCustomPlayer } from '../../components/player/index.js';
import { fetchVidSrcContent } from '../../components/player/videoUtils.js';

export async function renderNativeEmbed(container, params) {
  const { id, episode, season, type } = params;

  if (window.splashScreen) {
    window.splashScreen.show();
  }

  container.innerHTML = `
    <div class="flex flex-col h-screen bg-black">
      <div id="player-container" class="flex-grow relative overflow-hidden">
        <div class="flex justify-center items-center h-full">
          ${renderFullPageSpinner()}
        </div>
      </div>
    </div>
  `;

  try {
    await loadVideoContent(id, episode, season, type, container);
  } catch (error) {
    console.error('Error loading video content:', error);
    container.innerHTML = renderError(
      'Error',
      error.message || 'Failed to load video content',
      '',
      '',
      false
    );
    
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
  }
}

async function loadVideoContent(id, episode, season, type, container) {
  const detailsStep = window.splashScreen?.addStep('Loading media details...');
  
  window.splashScreen?.completeStep(detailsStep);
  const streamStep = window.splashScreen?.addStep('Fetching streaming source...');
  
  try {
    const streamData = await fetchVidSrcContent(id, episode, season, type);
    window.splashScreen?.completeStep(streamStep);
    
    const playerContainer = container.querySelector('#player-container');
    if (playerContainer) {
      playerContainer.innerHTML = `
        <div class="flex justify-center items-center h-full">
          ${renderSpinner('large')}
        </div>
      `;
      
      const videoStep = window.splashScreen?.addStep('Preparing video player...');
      
      try {
        const videoUrl = streamData.url;
        const subtitleTracks = streamData.tracks || [];
        
        const hasMultiQuality = streamData.hasMultiQuality === true;
        const qualityOptions = streamData.quality || [];
        
        window.splashScreen?.completeStep(videoStep);
        if (window.splashScreen) {
          window.splashScreen.hide();
        }
        
        if (videoUrl) {
          renderVideoPlayer(
            playerContainer, 
            videoUrl, 
            hasMultiQuality && qualityOptions.length > 0 ? qualityOptions[qualityOptions.length - 1].quality : 'Auto', 
            hasMultiQuality ? qualityOptions : [], 
            id, 
            episode, 
            subtitleTracks
          );
        } else {
          playerContainer.innerHTML = `
            <div class="flex justify-center items-center h-full">
              <p class="text-white text-xl">Failed to load video. Please try another source.</p>
            </div>
          `;
        }
      } catch (error) {
        window.splashScreen?.completeStep(videoStep);
        if (window.splashScreen) {
          window.splashScreen.hide();
        }
        
        console.error('Error preparing video player:', error);
        playerContainer.innerHTML = `
          <div class="flex justify-center items-center h-full">
            <p class="text-white text-xl">Failed to load video. Please try another source.</p>
          </div>
        `;
      }
    }
  } catch (error) {
    window.splashScreen?.completeStep(streamStep);
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
    throw error;
  }
}

function renderVideoPlayer(container, videoUrl, initialQuality, qualityOptions, showId, episodeNumber, subtitleTracks = []) {
  const isIPhone = /iPhone/i.test(navigator.userAgent);
  const hasQualityOptions = qualityOptions && qualityOptions.length > 0;
  
  container.innerHTML = `
    <div class="custom-player relative w-full h-full bg-black">
      <video 
        id="custom-player"
        src="${videoUrl}"
        class="w-full h-full" 
        style="object-fit: cover; object-position: center"
        autoplay
        x-webkit-airplay="allow"
      ></video>

      <div class="center-play-button absolute inset-0 flex items-center justify-center z-10 ${isIPhone ? 'hidden' : 'hidden'}">
        <button class="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110">
          <i class="fas fa-play text-black text-2xl ml-[2.5px]"></i>
        </button>
      </div>

      <div class="top-controls absolute top-4 right-4 flex space-x-2 z-20">
        ${isIPhone ? `
        <button class="subtitle-toggle-btn bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-opacity duration-300 opacity-0 w-8 h-8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-captions-icon lucide-captions"><rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/></svg>
        </button>
        <div class="iphone-subtitle-menu absolute top-10 right-0 bg-zinc-900 rounded shadow-lg p-2 hidden z-30">
        </div>
        ` : ''}
        <button class="aspect-toggle-btn bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-opacity duration-300 opacity-0 w-8 h-8 flex items-center justify-center">
          <i class="icon-shrink"></i>
        </button>
      </div>
      
      <div class="video-preview hidden opacity-0 absolute bg-black border border-gray-700 rounded shadow-lg z-20 transition-opacity duration-300 pointer-events-none" style="width: 160px; height: 90px; transform: translateX(-50%) translateY(-100%) translateY(-10px); bottom: 50px;">
        <canvas id="preview-canvas" width="160" height="90"></canvas>
        <div class="preview-time text-white text-xs text-center py-1 bg-black bg-opacity-75"></div>
      </div>
      
      <div class="player-controls absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 m-2.5 p-2.5 rounded-[0.6rem] transition-opacity duration-300 z-20 ${isIPhone ? 'hidden' : 'opacity-0'}">
        <style>
          .quality-selector, .subtitle-selector {
            transition: margin-left 0.3s ease;
          }
        </style>
        <div class="flex items-center space-x-1">
          <button class="play-pause-btn text-zinc-300 hover:text-white transition text-xl mr-3">
            <i class="fas fa-play text-xl"></i>
          </button>
          
          <div class="progress-container-hitbox flex-grow cursor-pointer relative mx-2 py-2.5">
            <div class="progress-container w-full h-[6px] bg-zinc-800 rounded-full relative">
              <div class="buffer-bar h-full bg-zinc-600 rounded-full" style="width: 0%"></div>
              <div class="progress-bar h-full bg-white rounded-full mt-[-6px]" style="width: 0%"></div>
              <div class="progress-thumb absolute w-4 h-4 bg-white rounded-full mt-[-10px] hidden shadow-md" style="left: 0%"></div>
            </div>
          </div>
          
          <div class="time-display text-white text-xs font-medium cursor-pointer select-none min-w-[40px] !ml-3">
            <span class="current-time">0:00</span>
          </div>
          
          <div class="volume-container relative flex items-center">
            <button class="volume-btn text-zinc-300 hover:text-white transition text-lg">
              <i class="icon-volume-2"></i>
            </button>
            <div class="volume-slider h-[6px] bg-zinc-800 rounded-full cursor-pointer hidden transition-all duration-300" style="width: 0">
              <div class="volume-level h-full bg-white rounded-full" style="width: 100%"></div>
            </div>
          </div>
          
          <div class="quality-selector relative ${hasQualityOptions ? '' : 'hidden'}">
            <button class="quality-btn text-zinc-300 hover:text-white transition text-lg">
              <i class="icon-sliders"></i>
            </button>
            <div class="quality-menu absolute bottom-12 right-0 bg-zinc-900 rounded shadow-lg p-2 hidden">
            </div>
          </div>
          
          <div class="subtitle-selector relative">
            <button class="subtitle-btn text-zinc-300 hover:text-white transition text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-captions-icon lucide-captions"><rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/></svg>
            </button>
            <div class="subtitle-menu absolute bottom-12 right-0 bg-zinc-900 rounded shadow-lg p-2 hidden">
            </div>
          </div>
          
          <button class="download-btn text-zinc-300 hover:text-white transition h-8 w-8" title="Download">
            <i class="icon-download text-lg"></i>
          </button>
          
          <button class="pip-btn text-zinc-300 hover:text-white transition text-lg" title="Picture in Picture">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="m-[0.4rem]" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-picture-in-picture-2"><path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4"/><rect width="10" height="7" x="12" y="13" rx="2"/></svg>
          </button>
          
          <button class="fullscreen-btn text-zinc-300 hover:text-white transition text-lg">
            <i class="icon-maximize"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  const url = window.location.href;
  const typeMatch = url.match(/\/embed\/native\/\d+\/\d+\/\d+\/(\w+)/);
  const mediaType = typeMatch ? typeMatch[1] : 'tv';
  
  const customQualityOptions = hasQualityOptions ? qualityOptions.map(q => ({
    url: q.url,
    name: q.quality
  })) : [];
  
  const playerInstance = initializeCustomPlayer(container, customQualityOptions, showId, episodeNumber, true, subtitleTracks, mediaType);
  
  container.playerCleanup = playerInstance?.cleanup;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === container && container.playerCleanup) {
          container.playerCleanup();
          observer.disconnect();
        }
      });
    });
  });
  
  if (container.parentNode) {
    observer.observe(container.parentNode, { childList: true });
  }
}