// VidSrc Embed Page
import { renderFullPageSpinner, renderSpinner } from '../../components/loading.js';
import { renderError } from '../../components/error.js';
import { initializeCustomPlayer } from '../../components/player/index.js';

/**
 * Renders the VidSrc embed page
 * @param {HTMLElement} container - The container element
 * @param {Object} params - The parameters object containing id, episode, and season
 */
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

  const providersStep = window.splashScreen?.addStep('Checking available providers...');
  
  try {
    // Get available providers
    const providersResponse = await fetch('http://varunaditya.xyz/api/qw/whvx/status');
    const { providers } = await providersResponse.json();
    if (!providers?.length) {
      throw new Error('No providers available');
    }
    window.splashScreen?.completeStep(providersStep);

    const mediaStep = window.splashScreen?.addStep('Loading media information...');
    // Get token and media details
    const [token, mediaDetails] = await Promise.all([
      (async () => {
        const tokenFormData = new FormData();
        tokenFormData.append('id', id);
        const tokenResponse = await fetch('http://varunaditya.xyz/api/qw/whvx/token', {
          method: 'POST',
          body: tokenFormData
        });
        return tokenResponse.text();
      })(),
      (async () => {
        const tmdbResponse = await fetch(`https://api.themoviedb.org/3/${type}/${id}?append_to_response=external_ids`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q'
          }
        });
        return tmdbResponse.json();
      })()
    ]);
    window.splashScreen?.completeStep(mediaStep);

    // Prepare stream request payload
    const streamQuery = {
      title: mediaDetails.title || mediaDetails.name,
      releaseYear: new Date(mediaDetails.release_date || mediaDetails.first_air_date).getFullYear(),
      tmdbId: mediaDetails.id.toString(),
      imdbId: mediaDetails.external_ids.imdb_id,
      type: type === 'movie' ? 'movie' : 'show',
      season: type === 'movie' ? '' : season,
      episode: type === 'movie' ? '' : episode
    };

    // Create form data for stream request
    const streamFormData = new FormData();
    streamFormData.append('query', JSON.stringify(streamQuery));
    streamFormData.append('provider', providers[0]);
    // Remove quotes from token before appending
    streamFormData.append('token', token.replace(/"/g, ''));

    const sourcesStep = window.splashScreen?.addStep('Getting stream sources...');
    // Get stream sources
    const streamResponse = await fetch('http://varunaditya.xyz/api/qw/whvx/getstream', {
      method: 'POST',
      body: streamFormData
    });
    const streamData = await streamResponse.json();
    const sourceUrl = streamData.url;
    window.splashScreen?.completeStep(sourcesStep);

    const sourceStep = window.splashScreen?.addStep('Processing stream data...');
    // Get final stream URL
    const sourceResponse = await fetch(`http://varunaditya.xyz/api/qw/whvx/getsource?source=${encodeURIComponent(sourceUrl)}&provider=${providers[0]}`);
    const sourceData = await sourceResponse.json();
    window.splashScreen?.completeStep(sourceStep);

    let streamUrl = sourceData?.stream?.[0]?.playlist;
    let subtitles = sourceData?.stream?.[0]?.captions || [];

    const playlistStep = window.splashScreen?.addStep('Verifying stream...');
    // Verify if the playlist URL works
    if (streamUrl) {
      try {
        const playlistResponse = await fetch(streamUrl);
        if (!playlistResponse.ok || !playlistResponse.headers.get('content-type')?.includes('application/vnd.apple.mpegurl')) {
          streamUrl = null;
        }
      } catch (error) {
        console.error('Playlist verification failed:', error);
        streamUrl = null;
      }
    }
    window.splashScreen?.completeStep(playlistStep);

    // If primary stream doesn't work, try mirrors
    if (!streamUrl) {
      const mirrorStep = window.splashScreen?.addStep('Trying Amazon mirror...');
      try {
        // Try Amazon first
        const amznResponse = await fetch(amznUrl);
        const amznData = await amznResponse.json();
        
        if (amznData?.stream?.[0]?.playlist) {
          window.splashScreen?.updateStep(mirrorStep, 'Verifying Amazon stream...');
          // Verify Amazon playlist URL
          const amznPlaylistResponse = await fetch(amznData.stream[0].playlist);
          if (amznPlaylistResponse.ok && amznPlaylistResponse.headers.get('content-type')?.includes('application/vnd.apple.mpegurl')) {
            streamUrl = amznData.stream[0].playlist;
            subtitles = amznData.stream[0].captions || [];
          }
        }
        window.splashScreen?.completeStep(mirrorStep);
      } catch (error) {
        console.error('Amazon mirror failed:', error);
        window.splashScreen?.completeStep(mirrorStep);
      }

      // Only try Netflix if Amazon failed
      if (!streamUrl) {
        const netflixStep = window.splashScreen?.addStep('Trying Netflix mirror...');
        try {
          const ntflxResponse = await fetch(ntflxUrl);
          const ntflxData = await ntflxResponse.json();
          
          if (ntflxData?.stream?.[0]?.playlist) {
            window.splashScreen?.updateStep(netflixStep, 'Verifying Netflix stream...');
            const ntflxPlaylistResponse = await fetch(ntflxData.stream[0].playlist);
            if (ntflxPlaylistResponse.ok && ntflxPlaylistResponse.headers.get('content-type')?.includes('application/vnd.apple.mpegurl')) {
              streamUrl = ntflxData.stream[0].playlist;
              subtitles = ntflxData.stream[0].captions || [];
            }
          }
          window.splashScreen?.completeStep(netflixStep);
        } catch (error) {
          console.error('Netflix mirror failed:', error);
          window.splashScreen?.completeStep(netflixStep);
        }
      }
    }

    if (!streamUrl) {
      throw new Error('No stream URL found');
    }

    window.splashScreen?.completeStep(sourcesStep);

    const playerContainer = container.querySelector('#player-container');
    if (!playerContainer) return;

    renderVideoPlayer(
      playerContainer,
      streamUrl,
      'Auto',
      [],
      id,
      episode,
      subtitles
    );
  } catch (error) {
    console.error('Error loading stream:', error);
    throw new Error('Failed to load stream');
  }
}

function renderVideoPlayer(container, videoUrl, initialQuality, qualityOptions, showId, episodeNumber, subtitles) {
  const isIPhone = /iPhone/i.test(navigator.userAgent);

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
  
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoUrl);
    hls.attachMedia(player);
  }
  else if (player.canPlayType('application/vnd.apple.mpegurl')) {
    player.src = videoUrl;
  }
  
  initializeCustomPlayer(container, qualityOptions, showId, episodeNumber);
}