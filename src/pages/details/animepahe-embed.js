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
          renderVideoPlayer(playerContainer, videoUrl, 'Auto', linksData, id, episode);
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
 * @param {string} showId - The show ID for saving timestamp
 * @param {string} episodeNumber - The episode number
 */
function initializeCustomPlayer(playerContainer, linksData, showId, episodeNumber) {
  const isIPhone = /iPhone/i.test(navigator.userAgent);
  const player = playerContainer.querySelector('#custom-player');
  const customPlayer = playerContainer.querySelector('.custom-player');
  const playPauseBtn = playerContainer.querySelector('.play-pause-btn');
  const centerPlayButton = playerContainer.querySelector('.center-play-button');
  const volumeBtn = playerContainer.querySelector('.volume-btn');
  const volumeSlider = playerContainer.querySelector('.volume-slider');
  const volumeLevel = playerContainer.querySelector('.volume-level');
  const progressContainerHitbox = playerContainer.querySelector('.progress-container-hitbox');
  const progressContainer = playerContainer.querySelector('.progress-container');
  const progressBar = playerContainer.querySelector('.progress-bar');
  const progressThumb = playerContainer.querySelector('.progress-thumb');
  const currentTimeEl = playerContainer.querySelector('.current-time');
  const timeDisplay = playerContainer.querySelector('.time-display');
  const fullscreenBtn = playerContainer.querySelector('.fullscreen-btn');
  const qualityToggleBtn = playerContainer.querySelector('.quality-toggle-btn');
  const iphoneQualityMenu = playerContainer.querySelector('.iphone-quality-menu');
  const qualityBtn = playerContainer.querySelector('.quality-btn');
  const qualityMenu = playerContainer.querySelector('.quality-menu');
  const bufferBar = playerContainer.querySelector('.buffer-bar');
  const videoPreview = playerContainer.querySelector('.video-preview');
  const previewTime = playerContainer.querySelector('.preview-time');
  const pipBtn = playerContainer.querySelector('.pip-btn');
  const aspectToggleBtn = playerContainer.querySelector('.aspect-toggle-btn');
  const topControls = playerContainer.querySelector('.top-controls');
  
  if (!player) return;
  let previewReady = false;
  let showTimeRemaining = false;
  let isFilledView = true;

  if (isIPhone) {
    player.addEventListener('click', () => {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    });
    
    customPlayer.addEventListener('click', () => {
      if (topControls) {
        topControls.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('opacity-0');
        });
        
        if (controlsTimeout) {
          clearTimeout(controlsTimeout);
        }
        
        controlsTimeout = setTimeout(() => {
          topControls.querySelectorAll('button').forEach(btn => {
            btn.classList.add('opacity-0');
          });
        }, 2000);
      }
    });
  }

  const savedVolume = localStorage.getItem('quickwatch_player_volume');
  if (savedVolume !== null) {
    player.volume = parseFloat(savedVolume);
    if (volumeLevel) {
      volumeLevel.style.width = `${player.volume * 100}%`;
    }
  }

  const timestampKey = `quickwatch_timestamp_${showId}_${episodeNumber}`;
  const savedTimestamp = localStorage.getItem(timestampKey);
  if (savedTimestamp !== null) {
    const timestamp = parseFloat(savedTimestamp);
    
    player.addEventListener('loadedmetadata', () => {
      if (timestamp > 0 && timestamp < player.duration - 10) {
        player.currentTime = timestamp;
      }
    });
  }

  const saveTimestamp = () => {
    if (player.currentTime > 0 && !player.paused) {
      localStorage.setItem(timestampKey, player.currentTime.toString());
    }
  };

  const cleanupPlayer = () => {
    clearInterval(timestampInterval);
    window.removeEventListener('beforeunload', saveTimestamp);
  };

  const timestampInterval = setInterval(saveTimestamp, 5000);
  player.addEventListener('pause', saveTimestamp);
  window.addEventListener('beforeunload', saveTimestamp);
  window.addEventListener('unload', cleanupPlayer);

  const saveVolume = () => {
    localStorage.setItem('quickwatch_player_volume', player.volume.toString());
  };

  player.addEventListener('volumechange', saveVolume);

  if (centerPlayButton) {
    centerPlayButton.addEventListener('click', () => {
      player.play();
    });
  }

  if (aspectToggleBtn) {
    aspectToggleBtn.addEventListener('click', () => {
      isFilledView = !isFilledView;
      
      if (isFilledView) {
        player.style.objectFit = 'cover';
        aspectToggleBtn.innerHTML = '<i class="icon-shrink"></i>';
      } else {
        player.style.objectFit = 'contain';
        aspectToggleBtn.innerHTML = '<i class="icon-expand"></i>';
      }
    });
  }
  
  customPlayer.addEventListener('mousemove', () => {
    if (topControls) {
      topControls.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('opacity-0');
      });
      
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      
      controlsTimeout = setTimeout(() => {
        topControls.querySelectorAll('button').forEach(btn => {
          btn.classList.add('opacity-0');
        });
      }, 2000);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'j', 'k', 'l', 'm'].includes(e.key)) {
      e.preventDefault();
    }
    
    const isPlayerVisible = customPlayer.offsetWidth > 0 && customPlayer.offsetHeight > 0;
    if (!isPlayerVisible) return;
    
    switch (e.key) {
      case ' ':
      case 'k':
        if (player.paused) {
          player.play();
        } else {
          player.pause();
        }
        break;
      case 'ArrowLeft':
      case 'j':
        player.currentTime = Math.max(0, player.currentTime - 10);
        break;
      case 'ArrowRight':
      case 'l':
        player.currentTime = Math.min(player.duration, player.currentTime + 10);
        break;
      case 'm':
        mute();
        break;
      case 'ArrowUp':
        showVolumeSlider();
        player.volume = Math.min(1, player.volume + 0.1);
        volumeLevel.style.width = `${player.volume * 100}%`;
        updateVolumeIcon();
        break;
      case 'ArrowDown':
        showVolumeSlider();
        player.volume = Math.max(0, player.volume - 0.1);
        volumeLevel.style.width = `${player.volume * 100}%`;
        updateVolumeIcon();
        break;
    }
  });
  
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
    
    if (showTimeRemaining) {
      const timeLeft = player.duration - player.currentTime;
      currentTimeEl.textContent = `-${formatTime(timeLeft)}`;
    } else {
      currentTimeEl.textContent = formatTime(player.currentTime);
    }
    
    updateBufferProgress();
  };
  
  if (timeDisplay) {
    timeDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      showTimeRemaining = !showTimeRemaining;
      updateProgress();
    });
  }
  
  const setupQualityOptions = () => {
    if (linksData && linksData.length > 0) {
      const qualityOptionsHTML = linksData.map((link, index) => {
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
      
      if (qualityMenu) {
        qualityMenu.innerHTML = qualityOptionsHTML;
        setupQualityOptionEvents(qualityMenu);
      }
      
      if (isIPhone && iphoneQualityMenu) {
        iphoneQualityMenu.innerHTML = qualityOptionsHTML;
        setupQualityOptionEvents(iphoneQualityMenu);
      }
    }
  };
  
  const setupQualityOptionEvents = (menuElement) => {
    const qualityOptions = menuElement.querySelectorAll('.quality-option');
    qualityOptions.forEach(option => {
      option.addEventListener('click', async () => {
        const currentTime = player.currentTime;
        const isPaused = player.paused;
        const link = linksData[option.dataset.index];
        
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'absolute inset-0 flex justify-center items-center bg-black bg-opacity-70 z-10';
        loadingOverlay.innerHTML = renderSpinner('large');
        customPlayer.appendChild(loadingOverlay);
        
        try {
          const videoUrl = await fetchVideoUrl(link.link);
          
          if (videoUrl) {
            player.src = videoUrl;
            
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
        
        if (qualityMenu) qualityMenu.classList.add('hidden');
        if (iphoneQualityMenu) iphoneQualityMenu.classList.add('hidden');
      });
    });
  };

  if (qualityBtn) {
    qualityBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      qualityMenu.classList.toggle('hidden');
    });
  }
  
  if (qualityToggleBtn) {
    qualityToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      iphoneQualityMenu.classList.toggle('hidden');
    });
  }
  
  document.addEventListener('click', (e) => {
    if (qualityBtn && !qualityBtn.contains(e.target) && !qualityMenu.contains(e.target)) {
      qualityMenu.classList.add('hidden');
    }
    
    if (qualityToggleBtn && !qualityToggleBtn.contains(e.target) && !iphoneQualityMenu.contains(e.target)) {
      iphoneQualityMenu.classList.add('hidden');
    }
  });

  const mute = () => {
    if (player.muted) {
      player.muted = false;
      volumeBtn.innerHTML = '<i class="icon-volume-2"></i>';
      volumeLevel.style.width = `${player.volume * 100}%`;
    } else {
      player.muted = true;
      volumeBtn.innerHTML = '<i class="icon-volume-x"></i>';
      volumeLevel.style.width = '0%';
    }
  };
    
  playPauseBtn.addEventListener('click', () => {
    if (player.paused) {
      player.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause text-xl"></i>';
      playPauseBtn.style.backgroundColor = '#fff';
      playPauseBtn.style.color = '#000';
    } else {
      player.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play text-xl"></i>';
      playPauseBtn.style.backgroundColor = '';
      playPauseBtn.style.color = '';
    }
  });
  
  player.addEventListener('play', () => {
    playPauseBtn.innerHTML = '<i class="fas fa-pause text-xl"></i>';
    playPauseBtn.style.backgroundColor = '#fff';
    playPauseBtn.style.color = '#000';
    
    if (centerPlayButton) {
      centerPlayButton.classList.add('hidden');
    }
  });
  
  player.addEventListener('pause', () => {
    playPauseBtn.innerHTML = '<i class="fas fa-play text-xl"></i>';
    playPauseBtn.style.backgroundColor = '';
    playPauseBtn.style.color = '';
    
    if (centerPlayButton) {
      centerPlayButton.classList.remove('hidden');
    }
  });
  
  volumeBtn.addEventListener('click', () => {
    mute();
  });
  
  let volumeSliderTimeout;
  const volumeContainer = playerContainer.querySelector('.volume-container');
  
  const showVolumeSlider = () => {
    volumeSlider.classList.remove('hidden');
    volumeSlider.style.width = '0';
    void volumeSlider.offsetWidth;
    volumeSlider.style.width = '5em';
    volumeSlider.classList.remove('opacity-0');
    
    if (volumeSliderTimeout) {
      clearTimeout(volumeSliderTimeout);
      volumeSliderTimeout = null;
    }
    
    volumeSliderTimeout = setTimeout(() => {
      if (!isVolumeDragging && !volumeContainer.matches(':hover')) {
        volumeSlider.style.width = '0';
        volumeSlider.classList.add('opacity-0');
        
        setTimeout(() => {
          if (!volumeContainer.matches(':hover') && !isVolumeDragging) {
            volumeSlider.classList.add('hidden');
          }
        }, 300);
      }
    }, 1500);
  };
  
  volumeContainer.addEventListener('mouseenter', () => {    
    showVolumeSlider();
  });
  
  volumeContainer.addEventListener('mouseleave', () => {
    if (volumeSliderTimeout) {
      clearTimeout(volumeSliderTimeout);
    }
    
    volumeSliderTimeout = setTimeout(() => {
      if (!isVolumeDragging) {
        volumeSlider.style.width = '0';
        volumeSlider.classList.add('opacity-0');
        
        setTimeout(() => {
          if (!volumeContainer.matches(':hover')) {
            volumeSlider.classList.add('hidden');
          }
        }, 300);
      }
    }, 750);
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
      volumeBtn.innerHTML = '<i class="icon-volume-x"></i>';
    } else if (player.volume < 0.6) {
      volumeBtn.innerHTML = '<i class="icon-volume-1"></i>';
    } else {
      volumeBtn.innerHTML = '<i class="icon-volume-2"></i>';
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
  
  fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      fullscreenBtn.innerHTML = '<i class="icon-maximize"></i>';
      fullscreenBtn.style.backgroundColor = '';
      fullscreenBtn.style.color = '';
    } else {
      if (document.pictureInPictureElement === player) {
        return;
      }
      customPlayer.requestFullscreen();
      fullscreenBtn.innerHTML = '<i class="icon-minimize"></i>';
      fullscreenBtn.style.backgroundColor = '#fff';
      fullscreenBtn.style.color = '#000';
    }
  });
  
  qualityBtn.addEventListener('click', () => {
    qualityMenu.classList.toggle('hidden');
  });
  
  if (document.pictureInPictureEnabled) {
    pipBtn.addEventListener('click', () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          fullscreenBtn.innerHTML = '<i class="icon-maximize"></i>';
          fullscreenBtn.style.backgroundColor = '';
          fullscreenBtn.style.color = '';
        }
        player.requestPictureInPicture();
      }
    });
    
    player.addEventListener('enterpictureinpicture', () => {
      pipBtn.style.backgroundColor = '#fff';
      pipBtn.style.color = '#000';
    });
    
    player.addEventListener('leavepictureinpicture', () => {
      pipBtn.style.backgroundColor = '';
      pipBtn.style.color = '';
    });
  } else {
    pipBtn.classList.add('hidden');
  }
  
  setupQualityOptions();
}

/**
 * Renders a custom video player
 * @param {HTMLElement} container - The container element
 * @param {string} videoUrl - The URL of the video to play
 * @param {string} initialQuality - The initial quality to display
 * @param {Array} qualityOptions - Array of quality options
 * @param {string} showId - The show ID for saving timestamp
 * @param {string} episodeNumber - The episode number
 * @returns {void}
 */
function renderVideoPlayer(container, videoUrl, initialQuality, qualityOptions, showId, episodeNumber) {
  const isIPhone = /iPhone/i.test(navigator.userAgent);
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

      <div class="center-play-button absolute inset-0 flex items-center justify-center z-20 ${isIPhone ? 'hidden' : 'hidden'}">
        <button class="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110">
          <i class="fas fa-play text-black text-2xl ml-[2.5px]"></i>
        </button>
      </div>

      <div class="top-controls absolute top-4 right-4 flex space-x-2 z-20">
        ${isIPhone ? `
        <button class="quality-toggle-btn bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-opacity duration-300 opacity-0 w-8 h-8 flex items-center justify-center">
          <i class="icon-sliders"></i>
        </button>
        <div class="iphone-quality-menu absolute top-10 right-0 bg-zinc-900 rounded shadow-lg p-2 hidden z-30">
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
      
      <div class="player-controls absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 m-2.5 p-2.5 rounded-[0.6rem] transition-opacity duration-300 ${isIPhone ? 'hidden' : 'opacity-0'}">
        <style>
          .quality-selector {
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
          
          <div class="quality-selector relative">
            <button class="quality-btn text-zinc-300 hover:text-white transition text-lg">
              <i class="icon-sliders"></i>
            </button>
            <div class="quality-menu absolute bottom-12 right-0 bg-zinc-900 rounded shadow-lg p-2 hidden">
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
  
  initializeCustomPlayer(container, qualityOptions, showId, episodeNumber);
}