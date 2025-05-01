// AnimePahe Embed Page
import { renderFullPageSpinner, renderSpinner } from '../../components/misc/loading.js';
import { renderError } from '../../components/misc/error.js';
import { initializeCustomPlayer } from '../../components/player/index.js';

export async function renderAnimePaheEmbed(container, params) {
  const { id, episode , season } = params;

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
    const isAnime = await checkIfAnime(id);
    if (!isAnime) {
      container.innerHTML = renderError(
        'Not an Anime',
        'This show is not an anime. Use a different source.',
        '',
        '',
        false
      );
      return false;
    }
    
    await loadAnimeContent(id, episode, container, params); // Pass params here
  } catch (error) {
    console.error('Error loading anime content:', error);
    container.innerHTML = renderError(
      'Error',
      error.message || 'Failed to load anime content',
      '',
      '',
      false
    );
    
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
  }
}

async function checkIfAnime(tmdbId) {
  try {
    const tmdbResponse = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/external_ids`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q'
      }
    });
    
    const externalIds = await tmdbResponse.json();
    const imdbId = externalIds.imdb_id;
    
    if (!imdbId) {
      console.warn('IMDB ID not found for this media');
      return false;
    }
    
    const animeCheckResponse = await fetch(`https://raw.githubusercontent.com/Fribb/anime-lists/refs/heads/master/anime-list-full.json`);
    const animeList = await animeCheckResponse.json();
    
    for (const item of animeList) {
      if (item.imdb_id === imdbId) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if content is anime:', error);
    return false;
  }
}

async function loadAnimeContent(id, episode, container, params) {
  const tmdbStep = window.splashScreen?.addStep('Loading anime details...');
  
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
  
  window.splashScreen?.completeStep(tmdbStep);
  const searchStep = window.splashScreen?.addStep('Searching for anime sources...');
  
  const seasonNumber = params.season || '1';
  const searchQuery = seasonNumber === '1' ? animeName : `${animeName} Season ${seasonNumber}`;

  const searchResponse = await fetch('https://varunaditya.xyz/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: `https://animepahe.ru/api?m=search&q=${encodeURIComponent(searchQuery)}`,
      method: 'GET',
      headers: {
        'cookie': '__ddg2_=;'
      }
    })
  });
  const searchData = await searchResponse.json();

  if (!searchData.data || searchData.data.length === 0) {
    window.splashScreen?.hide();
    throw new Error('Anime not found');
  }

  let bestMatch = searchData.data[0];
  for (const anime of searchData.data) {
    if (anime.title.toLowerCase() === animeName.toLowerCase() && anime.year === releaseYear) {
      bestMatch = anime;
      break;
    }
  }
  
  window.splashScreen?.completeStep(searchStep);
  const episodesStep = window.splashScreen?.addStep('Loading episode list...');

  const seriesResponse = await fetch('https://varunaditya.xyz/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: `https://animepahe.ru/api?m=release&id=${bestMatch.session}&sort=episode_asc&page=1`,
      method: 'GET',
      headers: {
        'cookie': '__ddg2_=;'
      }
    })
  });
  const seriesData = await seriesResponse.json();

  if (!seriesData.data || seriesData.data.length === 0) {
    window.splashScreen?.hide();
    throw new Error('No episodes found');
  }

  const episodeIndex = parseInt(episode) - 1;
  if (episodeIndex < 0 || episodeIndex >= seriesData.data.length) { throw new Error('Episode not found'); }

  const episodeData = seriesData.data[episodeIndex];
  
  window.splashScreen?.completeStep(episodesStep);
  const linksStep = window.splashScreen?.addStep('Fetching streaming links...');

  const linksResponse = await fetch(`https://anime.apex-cloud.workers.dev/?method=episode&session=${bestMatch.session}&ep=${episodeData.session}`);
  const linksData = await linksResponse.json();

  window.splashScreen?.completeStep(linksStep);

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

    const m3u8Step = window.splashScreen?.addStep('Preparing video stream...');
    
    fetchVideoUrl(linksData[0].link)
      .then(videoUrl => {
        window.splashScreen?.completeStep(m3u8Step);
        if (window.splashScreen) {
          window.splashScreen.hide();
        }
        
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
        window.splashScreen?.completeStep(m3u8Step);
        if (window.splashScreen) {
          window.splashScreen.hide();
        }
        
        console.error('Error fetching video URL:', error);
        playerContainer.innerHTML = `
          <div class="flex justify-center items-center h-full">
            <p class="text-white text-xl">Failed to load video. Please try another source.</p>
          </div>
        `;
      });
  }
}

export async function fetchVideoUrl(kwikLink) {
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

      <div class="center-play-button absolute inset-0 flex items-center justify-center z-10 ${isIPhone ? 'hidden' : 'hidden'}">
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
      
      <div class="player-controls absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 m-2.5 p-2.5 rounded-[0.6rem] transition-opacity duration-300 z-20 ${isIPhone ? 'hidden' : 'opacity-0'}">
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
  
  initializeCustomPlayer(container, qualityOptions, showId, episodeNumber, false);
}