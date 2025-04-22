// VidSrc Embed Page
import { renderFullPageSpinner, renderSpinner } from '../../components/misc/loading.js';
import { renderError } from '../../components/misc/error.js';
import { initializeCustomPlayer } from '../../components/player/index.js';

export async function renderVidSrcEmbed(container, params) {
  const { id, season, episode, type } = params;

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
    await loadContent(id, episode, season, type, container);
  } catch (error) {
    console.error('Error loading content:', error);
    container.innerHTML = renderError(
      'Error',
      'Failed to load content',
      '',
      '',
      false
    );
    
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
  }
}

async function loadHls() {
  if (window.Hls) return window.Hls;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = () => resolve(window.Hls);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadContent(id, episode, season, type, container) {
  try {
    const loadingHlsStep = window.splashScreen?.addStep('Loading player...');
    await loadHls();
    window.splashScreen?.completeStep(loadingHlsStep);
  } catch (error) {
    console.error('Failed to load HLS.js:', error);
  }

  const contentParams = { id, episode, season, type };
  
  await loadContentWithSource('all', contentParams, container);
}

async function loadContentWithSource(source, contentParams, container) {
  const { id, episode, season, type } = contentParams;
  const streamStep = window.splashScreen?.addStep(`Getting ${source} stream data...`);
  
  try {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('source', source);
    formData.append('id', id);
    
    if (type === 'movie') {
      formData.append('season', '0');
      formData.append('episode', '0');
    } else {
      formData.append('season', season);
      formData.append('episode', episode);
    }

    console.log('Sending request with params:', {
      type, id, season: type === 'movie' ? '0' : season, 
      episode: type === 'movie' ? '0' : episode,
      source
    });

    const response = await fetch('https://api.varunaditya.xyz/api/uira', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    window.splashScreen?.completeStep(streamStep);
    
    if (!data) {
      throw new Error('Empty response from API');
    }
    
    let streamUrl = null;
    let subtitles = data.captions || [];
    
    if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
      const sortedSources = [...data.sources].sort((a, b) => 
        (a.priority || 999) - (b.priority || 999)
      );
      
      streamUrl = sortedSources[0].url;
    } 
    else if (data.stream && data.stream.playlist) {
      streamUrl = data.stream.playlist;
      subtitles = data.stream.captions || subtitles;
    }
    else if (data.stream && Array.isArray(data.stream) && data.stream[0]?.playlist) {
      streamUrl = data.stream[0].playlist;
      subtitles = data.stream[0].captions || subtitles;
    }
    
    if (!streamUrl) {
      throw new Error('No stream URL found in response');
    }
    
    const playerContainer = container.querySelector('#player-container');
    if (!playerContainer) return;

    renderVideoPlayer(
      playerContainer,
      streamUrl,
      'Auto',
      [],
      id,
      episode,
      subtitles,
      source,
      contentParams,
      container
    );
    
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
    
  } catch (error) {
    console.error('Error loading stream:', error);
    throw new Error('Failed to load stream');
  }
}

function renderVideoPlayer(container, videoUrl, initialQuality, qualityOptions, showId, episodeNumber, subtitles, currentSource, contentParams, mainContainer) {
  const isIPhone = /iPhone/i.test(navigator.userAgent);
  const isMP4 = videoUrl.toLowerCase().endsWith('.mp4');
  
  const sources = [
    { id: 'all', name: 'Source 1' },
    { id: '4k', name: 'Source 2' },
    { id: 'moviebox', name: 'Source 3' }
  ];

  container.innerHTML = `
    <div class="custom-player relative w-full h-full bg-black">
      <video 
        id="custom-player"
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
        <button class="aspect-toggle-btn bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-opacity duration-300 opacity-0 w-8 h-8 flex items-center justify-center">
          <i class="icon-shrink"></i>
        </button>
      </div>
      
      <div class="video-preview hidden opacity-0 absolute bg-black border border-gray-700 rounded shadow-lg z-20 transition-opacity duration-300 pointer-events-none" style="width: 160px; height: 90px; transform: translateX(-50%) translateY(-100%) translateY(-10px); bottom: 50px;">
        <canvas id="preview-canvas" width="160" height="90"></canvas>
        <div class="preview-time text-white text-xs text-center py-1 bg-black bg-opacity-75"></div>
      </div>
      
      <div class="player-controls absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 m-2.5 p-2.5 rounded-[0.6rem] transition-opacity duration-300 z-20 ${isIPhone ? 'hidden' : 'opacity-0'}">
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
          
          <div class="source-selector relative">
            <button class="source-btn text-zinc-300 hover:text-white transition text-lg">
              <i class="icon-layers"></i>
            </button>
            <div class="source-menu absolute bottom-12 right-0 bg-zinc-900 rounded shadow-lg p-2 hidden">
              ${sources.map(source => `
                <div class="source-option py-1 px-2 text-sm text-white hover:bg-zinc-700 rounded cursor-pointer ${source.id === currentSource ? 'bg-zinc-700' : ''}" 
                     data-source="${source.id}">
                  ${source.name}
                </div>
              `).join('')}
            </div>
          </div>
          
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
  
  const player = container.querySelector('#custom-player');
  
  if (isMP4) {
    console.log('Setting up MP4 with partial content requests');
    
    const customFetch = async (url, start, end) => {
      const headers = new Headers();
      if (start !== undefined && end !== undefined) {
        headers.append('Range', `bytes=${start}-${end}`);
      }
      
      try {
        const response = await fetch(url, { headers });
        if (!response.ok && response.status !== 206) {
          throw new Error(`Failed to fetch video segment: ${response.status}`);
        }
        return response;
      } catch (error) {
        console.error('Error fetching video segment:', error);
        throw error;
      }
    };
    
    const mediaSource = new MediaSource();
    player.src = URL.createObjectURL(mediaSource);
    
    mediaSource.addEventListener('sourceopen', async () => {
      try {
        const headResponse = await customFetch(videoUrl);
        const contentLength = headResponse.headers.get('Content-Length');
        console.log(`Total content length: ${contentLength} bytes`);
        
        const mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
        const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
        
        const initialSegmentSize = 1024 * 1024;
        const initialResponse = await customFetch(videoUrl, 0, initialSegmentSize - 1);
        const initialData = await initialResponse.arrayBuffer();
        sourceBuffer.appendBuffer(initialData);
        
        player.addEventListener('seeking', async () => {
          const currentTime = player.currentTime;
          console.log(`Seeking to ${currentTime}`);
          
          const estimatedByteOffset = Math.floor(currentTime / player.duration * contentLength);
          const segmentSize = 2 * 1024 * 1024;
          
          try {
            const seekResponse = await customFetch(
              videoUrl, 
              estimatedByteOffset, 
              estimatedByteOffset + segmentSize - 1
            );
            const seekData = await seekResponse.arrayBuffer();
            
            if (sourceBuffer.updating) {
              await new Promise(resolve => {
                sourceBuffer.addEventListener('updateend', resolve, { once: true });
              });
            }
            
            sourceBuffer.remove(0, player.duration);
            sourceBuffer.appendBuffer(seekData);
          } catch (error) {
            console.error('Error during seek operation:', error);
          }
        });
        
        sourceBuffer.addEventListener('updateend', () => {
          if (!player.paused && player.readyState < 3) {
            player.play().catch(err => console.error('Error playing video:', err));
          }
        });
      } catch (error) {
        console.error('Error setting up MediaSource:', error);
        
        player.src = videoUrl;
        player.setAttribute('preload', 'metadata');
        player.load();
        player.play().catch(err => console.error('Error playing video:', err));
      }
    });
  } else if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoUrl);
    hls.attachMedia(player);
  } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
    player.src = videoUrl;
  }
  
  initializeCustomPlayer(container, qualityOptions, showId, episodeNumber, subtitles);
  
  const sourceBtn = container.querySelector('.source-btn');
  const sourceMenu = container.querySelector('.source-menu');
  const sourceOptions = container.querySelectorAll('.source-option');
  
  sourceBtn.addEventListener('click', () => {
    sourceMenu.classList.toggle('hidden');
  });
  
  document.addEventListener('click', (event) => {
    if (!sourceBtn.contains(event.target) && !sourceMenu.contains(event.target)) {
      sourceMenu.classList.add('hidden');
    }
  });
  
  sourceOptions.forEach(option => {
    option.addEventListener('click', async () => {
      const selectedSource = option.getAttribute('data-source');
      sourceMenu.classList.add('hidden');
      
      if (selectedSource !== currentSource) {
        container.innerHTML = `
          <div class="flex justify-center items-center h-full">
            ${renderFullPageSpinner()}
          </div>
        `;
        
        try {
          await loadContentWithSource(selectedSource, contentParams, mainContainer);
        } catch (error) {
          console.error('Error switching source:', error);
          container.innerHTML = renderError(
            'Error',
            'Failed to load source',
            '',
            '',
            false
          );
        }
      }
    });
  });
}