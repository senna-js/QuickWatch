// AnimePahe Embed Page
import { renderFullPageSpinner, renderSpinner } from '../../components/loading.js';
import { renderError } from '../../components/error.js';

/**
 * Renders the AnimePahe embed page for a TV show
 * @param {HTMLElement} container - The container element
 * @param {Object} params - The parameters object containing id and episode
 */
export async function renderAnimePaheEmbed(container, params) {
  const { id, episode } = params;

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
    await loadAnimeContent(id, episode, container);
  } catch (error) {
    console.error('Error loading anime content:', error);
    container.innerHTML = renderError(
      'Error',
      'Failed to load anime content',
      'Close',
      'window.close()'
    );
  }
}

/**
 * Loads anime content from AnimePahe API
 * @param {string} id - The TMDB ID
 * @param {string} episode - The episode number
 * @param {HTMLElement} container - The container element
 */
async function loadAnimeContent(id, episode, container) {
  const tmdbResponse = await fetch(`https://api.themoviedb.org/3/tv/${id}?language=en-US`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q'
    }
  });

  const tmdbData = await tmdbResponse.json();
  const animeName = tmdbData.name;
  const releaseYear = new Date(tmdbData.first_air_date).getFullYear();

  const searchResponse = await fetch(`https://anime.apex-cloud.workers.dev/?method=search&query=${encodeURIComponent(animeName)}`);
  const searchData = await searchResponse.json();

  if (!searchData.data || searchData.data.length === 0) {
    throw new Error('Anime not found');
  }

  let bestMatch = searchData.data[0];
  for (const anime of searchData.data) {
    if (anime.title.toLowerCase() === animeName.toLowerCase() && anime.year === releaseYear) {
      bestMatch = anime;
      break;
    }
  }

  const seriesResponse = await fetch(`https://anime.apex-cloud.workers.dev/?method=series&session=${bestMatch.session}&page=1`);
  const seriesData = await seriesResponse.json();

  if (!seriesData.episodes || seriesData.episodes.length === 0) {
    throw new Error('No episodes found');
  }

  const episodeIndex = parseInt(episode) - 1;
  if (episodeIndex < 0 || episodeIndex >= seriesData.episodes.length) { throw new Error('Episode not found'); }

  const episodeData = seriesData.episodes[episodeIndex];

  const linksResponse = await fetch(`https://anime.apex-cloud.workers.dev/?method=episode&session=${bestMatch.session}&ep=${episodeData.session}`);
  const linksData = await linksResponse.json();

  if (!linksData || linksData.length === 0) {
    throw new Error('No streaming links found');
  }

  const playerContainer = container.querySelector('#player-container');
  if (playerContainer) {
    playerContainer.innerHTML = `
      <div class="flex justify-center items-center h-full">
        ${renderSpinner('large')}
      </div>
    `;

    fetchVideoUrl(linksData[0].link)
      .then(videoUrl => {
        if (videoUrl) {
          renderVideoPlayer(playerContainer, videoUrl, 'Auto', linksData);
        } else {
          playerContainer.innerHTML = `
            <div class="flex justify-center items-center h-full">
              <p class="text-white text-xl">Failed to load video. Please try another source.</p>
            </div>
          `;
        }
      })
      .catch(error => {
        console.error('Error fetching video URL:', error);
        playerContainer.innerHTML = `
          <div class="flex justify-center items-center h-full">
            <p class="text-white text-xl">Failed to load video. Please try another source.</p>
          </div>
        `;
      });
  }
}

/**
 * Fetches the actual video URL from the access-kwik API
 * @param {string} kwikLink - The kwik link to fetch the video URL for
 * @returns {Promise<string|null>} - The video URL or null if not found
 */
async function fetchVideoUrl(kwikLink) {
  try {
    const response = await fetch('https://access-kwik.apex-cloud.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "service": "kwik",
        "action": "fetch",
        "content": {
          "kwik": kwikLink
        },
        "auth": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.O0FKaqhJjEZgCAVfZoLz6Pjd7Gs9Kv6qi0P8RyATjaE"
      })
    });

    const data = await response.json();

    if (data.status && data.content && data.content.url) {
      return data.content.url;
    } else {
      console.error('Invalid response from access-kwik API:', data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching video URL:', error);
    return null;
  }
}

/**
 * Initializes the custom video player controls
 * @param {HTMLElement} playerContainer - The player container element
 * @param {Array} linksData - The available video sources
 */
function initializeCustomPlayer(playerContainer, linksData) {
  const player = playerContainer.querySelector('#custom-player');
  const customPlayer = playerContainer.querySelector('.custom-player');
  const playPauseBtn = playerContainer.querySelector('.play-pause-btn');
  const volumeBtn = playerContainer.querySelector('.volume-btn');
  const volumeSlider = playerContainer.querySelector('.volume-slider');
  const volumeLevel = playerContainer.querySelector('.volume-level');
  const progressContainerHitbox = playerContainer.querySelector('.progress-container-hitbox');
  const progressContainer = playerContainer.querySelector('.progress-container');
  const progressBar = playerContainer.querySelector('.progress-bar');
  const progressThumb = playerContainer.querySelector('.progress-thumb');
  const currentTimeEl = playerContainer.querySelector('.current-time');
  const totalTimeEl = playerContainer.querySelector('.total-time');
  const fullscreenBtn = playerContainer.querySelector('.fullscreen-btn');
  const qualityBtn = playerContainer.querySelector('.quality-btn');
  const qualityMenu = playerContainer.querySelector('.quality-menu');
  const bufferBar = playerContainer.querySelector('.buffer-bar');
  const videoPreview = playerContainer.querySelector('.video-preview');
  const previewTime = playerContainer.querySelector('.preview-time');
  
  if (!player) return;
  let previewReady = false;
  
  const previewVideo = document.createElement('video');
  previewVideo.muted = true;
  previewVideo.preload = 'metadata';
  previewVideo.crossOrigin = player.crossOrigin;
  previewVideo.style.width = '100%';
  previewVideo.style.height = '100%';
  previewVideo.style.objectFit = 'cover';
  
  videoPreview.querySelector('#preview-canvas').replaceWith(previewVideo);
  
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
    const previewTime = player.duration * pos;
    
    showPreview(e.clientX, previewTime);
  });
  
  progressContainerHitbox.addEventListener('mouseleave', () => {
    videoPreview.classList.add('opacity-0');
    setTimeout(() => {
      if (!isHoveringProgressContainer) {
        videoPreview.classList.add('hidden');
      }
    }, 300);
  });
  
  let controlsTimeout;
  
  const showControls = () => {
    const playerControls = playerContainer.querySelector('.player-controls');
    playerControls.classList.remove('opacity-0');
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    controlsTimeout = setTimeout(() => {
      playerControls.classList.add('opacity-0');
    }, 2000);
  };
  
  customPlayer.addEventListener('mousemove', showControls);
  
  showControls();
  
  const updateBufferProgress = () => {
    if (!player.duration) return;
    
    if (player.buffered.length > 0) {
      const bufferedEnd = player.buffered.end(player.buffered.length - 1);
      const duration = player.duration;
      const bufferedPercent = (bufferedEnd / duration) * 100;
      bufferBar.style.width = `${bufferedPercent}%`;
    }
  };
  
  player.addEventListener('progress', updateBufferProgress);
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const updateProgress = () => {
    if (!player.duration) return;
    
    const progress = (player.currentTime / player.duration) * 100;
    progressBar.style.width = `${progress}%`;
    progressThumb.style.left = `${progress}%`;
    currentTimeEl.textContent = formatTime(player.currentTime);
    
    updateBufferProgress();
  };
  
  const setupQualityOptions = () => {
    if (linksData && linksData.length > 0) {
      qualityMenu.innerHTML = linksData.map((link, index) => {
        const cleanedName = link.name.replace(/\s*\([^)]*\)/g, '');
        
        return `
        <button 
          class="quality-option w-full text-left px-3 py-1.5 text-white text-sm hover:bg-zinc-700 rounded transition"
          data-link="${link.link}"
          data-index="${index}"
        >
          ${cleanedName}
        </button>
      `}).join('');
      const qualityOptions = qualityMenu.querySelectorAll('.quality-option');
      qualityOptions.forEach(option => {
        option.addEventListener('click', async () => {
          const currentTime = player.currentTime;
          const isPaused = player.paused;
          const link = linksData[option.dataset.index];
          const cleanedName = link.name.replace(/\s*\([^)]*\)/g, '');
          
          const loadingOverlay = document.createElement('div');
          loadingOverlay.className = 'absolute inset-0 flex justify-center items-center bg-black bg-opacity-70 z-10';
          loadingOverlay.innerHTML = renderSpinner('large');
          customPlayer.appendChild(loadingOverlay);
          
          try {
            const videoUrl = await fetchVideoUrl(link.link);
            
            if (videoUrl) {
              player.src = videoUrl;
              
              const qualityText = playerContainer.querySelector('.quality-text');
              if (qualityText) {
                qualityText.textContent = cleanedName;
              }
              
              player.addEventListener('canplay', function onCanPlay() {
                if (loadingOverlay.parentNode) {
                  loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
                
                player.currentTime = currentTime;
                
                if (!isPaused) {
                  player.play();
                }
                
                player.removeEventListener('canplay', onCanPlay);
              }, { once: true });
            } else {
              throw new Error('Failed to load video URL');
            }
          } catch (error) {
            console.error('Error changing quality:', error);
            if (loadingOverlay.parentNode) {
              loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
            
            const errorOverlay = document.createElement('div');
            errorOverlay.className = 'absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center';
            errorOverlay.textContent = 'Failed to load video. Please try another quality.';
            customPlayer.appendChild(errorOverlay);
            
            setTimeout(() => {
              if (errorOverlay.parentNode) {
                errorOverlay.parentNode.removeChild(errorOverlay);
              }
            }, 3000);
          }
          
          qualityMenu.classList.add('hidden');
        });
      });
    }
  };
    
  playPauseBtn.addEventListener('click', () => {
    if (player.paused) {
      player.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      player.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  });
  
  player.addEventListener('play', () => {
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  });
  
  player.addEventListener('pause', () => {
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  });
  
  volumeBtn.addEventListener('click', () => {
    if (player.muted) {
      player.muted = false;
      volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
      volumeLevel.style.width = `${player.volume * 100}%`;
    } else {
      player.muted = true;
      volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
      volumeLevel.style.width = '0%';
    }
  });
  
  volumeSlider.addEventListener('click', (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.volume = Math.max(0, Math.min(1, pos));
    volumeLevel.style.width = `${player.volume * 100}%`;
    updateVolumeIcon();
  });
  
  let isVolumeDragging = false;
  volumeSlider.addEventListener('mousedown', () => {
    isVolumeDragging = true;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isVolumeDragging) {
      const rect = volumeSlider.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      volumeLevel.style.width = `${pos * 100}%`;
      player.volume = pos;
      updateVolumeIcon();
    }
  });
  
  document.addEventListener('mouseup', () => {
    isVolumeDragging = false;
  });
  
  const updateVolumeIcon = () => {
    if (player.muted || player.volume === 0) {
      volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (player.volume < 0.5) {
      volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
      volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
  };
  
  progressContainerHitbox.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.currentTime = pos * player.duration;
  });
  
  let isDragging = false;
  progressContainerHitbox.addEventListener('mousedown', () => {
    isDragging = true;
    progressThumb.classList.remove('hidden');
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const rect = progressContainer.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      progressBar.style.width = `${pos * 100}%`;
      progressThumb.style.left = `${pos * 100}%`;
      player.currentTime = pos * player.duration;
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    if (!isHoveringProgressContainer) {
      progressThumb.classList.add('hidden');
    }
  });
  
  let isHoveringProgressContainer = false;
  progressContainerHitbox.addEventListener('mouseenter', () => {
    isHoveringProgressContainer = true;
    progressThumb.classList.remove('hidden');
  });
  
  progressContainerHitbox.addEventListener('mouseleave', () => {
    isHoveringProgressContainer = false;
    if (!isDragging) {
      progressThumb.classList.add('hidden');
    }
  });
  
  player.addEventListener('timeupdate', updateProgress);
  
  player.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(player.duration);
  });
  
  fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    } else {
      customPlayer.requestFullscreen();
      fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    }
  });
  
  qualityBtn.addEventListener('click', () => {
    qualityMenu.classList.toggle('hidden');
  });
  
  document.addEventListener('click', (e) => {
    if (!qualityBtn.contains(e.target) && !qualityMenu.contains(e.target)) {
      qualityMenu.classList.add('hidden');
    }
  });
  
  setupQualityOptions();
}

/**
 * Renders a custom video player
 * @param {HTMLElement} container - The container element
 * @param {string} videoUrl - The URL of the video to play
 * @param {string} initialQuality - The initial quality to display
 * @param {Array} qualityOptions - Array of quality options
 * @returns {void}
 */
function renderVideoPlayer(container, videoUrl, initialQuality, qualityOptions) {
  container.innerHTML = `
    <div class="custom-player relative w-full h-full bg-black">
      <video 
        id="custom-player"
        src="${videoUrl}"
        class="w-full h-full" 
        autoplay
      ></video>
      
      <div class="video-preview hidden opacity-0 absolute bg-black border border-gray-700 rounded shadow-lg z-20 transition-opacity duration-300 pointer-events-none" style="width: 160px; height: 90px; transform: translateX(-50%) translateY(-100%) translateY(-10px); bottom: 50px;">
        <canvas id="preview-canvas" width="160" height="90"></canvas>
        <div class="preview-time text-white text-xs text-center py-1 bg-black bg-opacity-75"></div>
      </div>
      
      <div class="player-controls absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-3 transition-opacity duration-300 opacity-0">
        <div class="progress-container-hitbox w-full h-[20px] cursor-pointer mb-3 flex items-center">
          <div class="progress-container w-full h-[6px] bg-zinc-700 rounded-full relative">
            <div class="buffer-bar h-full bg-zinc-500 rounded-full" style="width: 0%"></div>
            <div class="progress-bar h-full bg-indigo-500 rounded-full mt-[-6px]" style="width: 0%"></div>
            <div class="progress-thumb absolute w-4 h-4 bg-white rounded-full mt-[-10px] hidden shadow-md" style="left: 0%"></div>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button class="play-pause-btn text-white hover:text-indigo-400 transition text-xl">
              <i class="fas fa-play"></i>
            </button>
            
            <div class="volume-container flex items-center space-x-2">
              <button class="volume-btn text-white hover:text-indigo-400 transition text-lg">
                <i class="fas fa-volume-up"></i>
              </button>
              <div class="volume-slider w-20 h-2 bg-zinc-700 rounded-full cursor-pointer hidden md:block">
                <div class="volume-level h-full bg-indigo-500 rounded-full" style="width: 100%"></div>
              </div>
            </div>
            
            <div class="time-display text-white text-sm font-medium">
              <span class="current-time">0:00</span>
              <span>/</span>
              <span class="total-time">0:00</span>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="quality-selector relative">
              <button class="quality-btn text-white hover:text-indigo-400 transition text-sm font-medium flex items-center px-4 rounded-full w-full">
                <i class="fas fa-cog mr-2 text-lg"></i><span class="quality-text">${initialQuality}</span>
              </button>
              <div class="quality-menu absolute bottom-10 right-0 bg-zinc-900 rounded shadow-lg p-2 hidden">
              </div>
            </div>
            
            <button class="fullscreen-btn text-white hover:text-indigo-400 transition text-lg">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  initializeCustomPlayer(container, qualityOptions);
}
