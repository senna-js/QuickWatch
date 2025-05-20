// Anime Details Page
import { extractAnimeInfo, findTmdbIdForTitle, findTmdbIdForSeason, extractSeasonNumber } from '../../components/anime/animeDetailsData.js';
import { extractEpisodesList } from '../../components/anime/episodeData.js';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { animeSources, getSourceUrl, getDefaultSource } from './sources.js';
import { renderAnimeHeader, initializeSearchFunctionality } from '../../components/anime/ui/header.js';
import { renderAnimeDetailsModal, openAnimeDetailsModal } from '../../components/anime/ui/animeDetailsModal.js';

// Store global states
let currentEpisode = null;
let currentSource = getDefaultSource();
let currentLanguage = 'sub'; 
let currentSeasonId = null;

export async function renderHianimeDetailsPage(container, id) {
  document.body.style.backgroundColor = 'var(--color-anime-background)';

  currentSeasonId = id;
  
  try {
    const [animeData, episodesData] = await Promise.all([
      extractAnimeInfo(id),
      extractEpisodesList(id)
    ]);

    if (!animeData) {
      throw new Error('Failed to fetch anime data');
    }

    if (episodesData?.episodes && episodesData.episodes.length > 0) {
      currentEpisode = episodesData.episodes[0];
    }

    renderDetailsUI(container, animeData, episodesData);

  } catch (error) {
    console.error('Error loading anime details:', error);
    window.splashScreen.hide();
    container.innerHTML = `
      <div class="flex justify-center items-center h-screen w-full flex-col gap-4">
        <h2 class="text-2xl font-bold text-white">Failed to load anime details</h2>
        <p class="text-white/80">${error.message}</p>
        <button onClick="window.history.back()" class="px-4 py-2 bg-anime-card-bg border border-anime-border/10 rounded-lg text-white hover:bg-anime-card-hover transition duration-200 ease">Go Back</button>
      </div>
    `;
  } finally {
    setTimeout(() => window.splashScreen.hide(), 500);
  }

  initializeSearchFunctionality();
}

function updateIframeSrc(episode, animeData, sourceId, language) {
  const iframe = document.querySelector('iframe');
  if (!iframe) return;
  
  animeData.season = animeData.seasons && animeData.seasons.length > 0 
    ? extractSeasonNumber(animeData.seasons[0].name) 
    : '1';
  
  const sourceUrl = getSourceUrl(sourceId, language, episode, animeData);
  iframe.src = sourceUrl;
  
  console.log('Updating iframe source:', sourceUrl);
}

function renderDetailsUI(container, animeData, episodesData) {
  const { title, japanese_title, animeInfo, poster } = animeData;
  const episodes = episodesData?.episodes || [];
  
  animeData.name = title;
  
  if (episodes.length > 0 && !currentEpisode) {
    currentEpisode = episodes[0];
  }
  
  let tmdbId = null;
  
  if (episodes.length > 0 && title) {
    let seasonNumber = 1;
    
    if (animeData.seasons && animeData.seasons.length > 0) {
      const currentSeasonName = animeData.seasons[0].name || '';
      seasonNumber = extractSeasonNumber(currentSeasonName);
    }
    
    const searchQuery = animeData.seasons && animeData.seasons.length > 0 ? 
      animeData.seasons[0].name : animeData.title;
    
    findTmdbIdForTitle(searchQuery)
      .then(tmdbId => {
        if (tmdbId) {
          animeData.tmdbId = tmdbId;
          if (currentEpisode) {
            updateIframeSrc(currentEpisode, animeData, currentSource.id, currentLanguage);
          }
        }
        throw new Error('No TMDB match found');
      })
      .catch(error => {
        console.error('Error loading episode data:', error);
      });
  }

  container.innerHTML = `
    ${renderAnimeHeader()}
    ${renderAnimeDetailsModal()}
    <div class="flex flex-col w-full h-screen pt-24 p-4 transition duration-600 ease" id="anime-details-content" style="opacity: 0; transform: translateY(20px);">
      <div class="flex flex-col gap-4 w-full h-full">
        <!-- Main Content Area -->
        <div class="flex flex-row h-full">
          <!-- Left Side: Episodes List -->
          <div class="w-full lg:w-1/4 bg-anime-modal-bg border border-anime-border/10 rounded-r-none rounded-xl p-4 flex flex-col h-full">
            <h2 class="text-xl font-bold mb-4">Episodes</h2>
            <div class="flex flex-col gap-2 flex-grow overflow-y-auto pr-2" id="episodes-container">
              ${renderEpisodesList(episodes)}
            </div>
          </div>
          
          <!-- Center: Player + Controls -->
          <div class="w-full lg:w-2/4 flex flex-col gap-4 mr-4 h-full">
            <!-- Player Section -->
            <div class="w-full bg-anime-modal-bg border border-anime-border/10 border-l-0 rounded-l-none rounded-xl p-4 flex flex-col h-full">
              <div class="w-full aspect-video mb-4">
                <iframe class="w-full h-full rounded-xl border border-anime-border/10" src="about:blank"></iframe>
              </div>
              
              <!-- Controls Section -->
              <div class="flex flex-col gap-4 mt-4 flex-grow">
                <!-- Language Selection -->
                <div class="flex flex-col gap-2">
                  <div class="flex flex-row gap-2 p-2 pl-4 overflow-x-auto bg-gray-500/10 rounded-lg" id="sub-servers">
                    <div class="text-white py-1 rounded-lg text-sm font-medium mr-4">SUB</div>
                    ${animeSources.map((source, index) => 
                      `<button data-source-id="${source.id}" data-language="sub" onclick="handleServerClick(this)" class="${source.id === currentSource.id && currentLanguage === 'sub' ? '!bg-white text-anime-card-bg' : 'bg-white/10'} rounded-lg px-2 py-1 text-center text-sm cursor-pointer hover:bg-white/20 transition duration-200 ease active:scale-90 whitespace-nowrap flex-shrink-0" style="opacity: 0; transform: translateY(10px);">${source.name}</button>`
                    ).join('')}
                  </div>

                  <div class="flex flex-row gap-2 p-2 pl-4 overflow-x-auto bg-gray-500/10 rounded-lg" id="dub-servers">
                    <div class="text-white py-1 rounded-lg text-sm font-medium mr-4">DUB</div>
                    ${animeSources.map((source, index) => 
                      `<button data-source-id="${source.id}" data-language="dub" onclick="handleServerClick(this)" class="${source.id === currentSource.id && currentLanguage === 'dub' ? '!bg-white text-anime-card-bg' : 'bg-white/10'} rounded-lg px-2 py-1 text-center text-sm cursor-pointer hover:bg-white/20 transition duration-200 ease whitespace-nowrap flex-shrink-0" style="opacity: 0; transform: translateY(10px);">${source.name}</button>`
                    ).join('')}
                  </div>
                </div>
                
                <!-- Season Selection -->
                ${animeData.seasons && animeData.seasons.length > 0 ? `
                <div class="flex items-center w-full mt-4">
                  <div class=" text-white rounded-lg text-lg font-medium mr-4">Watch more seasons of this anime</div>
                  <div class="flex-grow h-px bg-anime-border/10"></div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                  ${animeData.seasons.map((season, index) => `
                    <a href="/anime/${season.route}" class="relative bg-anime-card-bg border border-anime-border/10 rounded-lg p-4 pt-[1.1rem] py-5 max-h-16 hover:bg-anime-card-hover transition duration-200 ease overflow-hidden">
                      ${season.background ? `
                        <div class="absolute inset-0 z-0">
                          <img src="${season.background}" alt="" class="w-full h-full object-cover opacity-30">
                        </div>
                      ` : ''}
                      <div class="relative z-10 flex items-center justify-center">
                        <h4 class="font-medium text-lg">${season.name}</h4>
                      </div>
                    </a>
                  `).join('')}
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          
          <!-- Right Side: Anime Info -->
          <div class="w-full lg:w-1/4 rounded-xl p-4 py-2 flex flex-col h-full">
            <div class="flex flex-col h-full">
              <div class="mb-4">
                <img src="${poster}" alt="${title}" class="w-1/2 h-auto rounded-lg mb-3">
                <h2 class="text-xl font-bold">${title}</h2>
                <div class="flex flex-wrap gap-2 my-2.5 text-black font-bold">
                    <span class="text-xs bg-[#FEFEFE]/80 border border-[#ffffff]/50 px-1.5 py-0.5 rounded-md">${animeInfo.tvInfo.rating}</span>
                    <span class="text-xs bg-[#FCB8DB]/80 border border-[#ffd7ec]/50 px-1.5 py-0.5 rounded-md">${animeInfo.tvInfo.quality}</span>
                    <span class="text-xs bg-[#AFE3AE]/80 border border-[#d1f3d1]/50 px-1.5 py-0.5 rounded-md"><i class="fas fa-closed-captioning"></i> ${animeInfo.tvInfo.sub}</span>
                    <span class="text-xs bg-[#B9E7FF]/80 border border-[#dcf3ff]/50 px-1.5 py-0.5 rounded-md"><i class="fas fa-microphone"></i> ${animeInfo.tvInfo.dub}</span>
                    <span class="text-xs text-white font-normal bg-[#1C1D21] border border-[#24262B] px-1.5 py-0.5 rounded-md">${animeInfo.tvInfo.showType}</span>
                    <span class="text-xs text-white font-normal bg-[#1C1D21] border border-[#24262B] px-1.5 py-0.5 rounded-md">${animeInfo.tvInfo.duration}</span>
                </div>
              </div>
              
              <div class="overflow-y-auto mb-8">
                <p class="text-sm text-white/70 mb-4 line-clamp-8 overflow-hidden">${animeInfo.Overview || 'No description available'}</p>
                
                <div class="flex flex-col gap-2">
                  ${animeInfo.Genres ? `
                  <div class="flex flex-wrap gap-1">
                    ${animeInfo.Genres.map(genre => 
                      `<span class="text-xs bg-anime-badge-bg border border-anime-badge-border px-1.5 py-0.5 rounded-md">${genre}</span>`
                    ).join('')}
                  </div>` : ''}
                </div>
              </div>
              
              <button id="more-info-btn" class="w-full py-2 bg-anime-modal-bg border border-anime-border/10 rounded-lg text-center cursor-pointer hover:bg-anime-card-bg transition duration-200 ease mt-4">More info</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const detailsContent = document.getElementById('anime-details-content');
    if (detailsContent) {
      detailsContent.style.opacity = '1';
      detailsContent.style.transform = 'translateY(0)';
    }
    
    const animateButtons = (selector) => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach((button, index) => {
        setTimeout(() => {
          button.style.opacity = '1';
          button.style.transform = 'translateY(0)';
        }, 50 * index);
      });
    };
    
    animateButtons('#sub-servers button');
    setTimeout(() => {
      animateButtons('#dub-servers button');
    }, 200);
  }, 100);
  
  if (episodes.length > 0) {
    if (currentEpisode) {
      const foundEpisode = episodes.find(ep => ep.id === currentEpisode.id);
      if (foundEpisode) {
        currentEpisode = foundEpisode;
      } else {
        const foundByNumber = episodes.find(ep => ep.episode_no === currentEpisode.episode_no);
        if (foundByNumber) {
          currentEpisode = foundByNumber;
        } else {
          currentEpisode = episodes[0];
        }
      }
    } else {
      currentEpisode = episodes[0];
    }
    
    const episodeElement = document.querySelector(`[data-episode-id="${currentEpisode.id}"]`);
    if (episodeElement) {
      episodeElement.classList.add('!bg-white', 'text-anime-card-bg');
      
      if (tmdbId) {
        animeData.tmdbId = tmdbId;
        updateIframeSrc(currentEpisode, animeData, currentSource.id, currentLanguage);
      }
    }
  }
  
  window.currentAnimeData = animeData;
  addSeasonOptionListener(animeData);
  
  const moreInfoBtn = document.getElementById('more-info-btn');
  if (moreInfoBtn) {
    moreInfoBtn.addEventListener('click', () => {
      openAnimeDetailsModal(animeData);
    });
  }
}

function renderSeasonOptions(seasons) {
  if (!seasons || seasons.length === 0) {
    return '<option value="current">Season 1</option>';
  }
  
  return seasons.map((season, index) => {
    return `<option value="${season.route}" ${season.route === currentSeasonId ? 'selected' : ''}>${season.name}</option>`;
  }).join('');
}

function renderEpisodesList(episodes) {
  if (!episodes || episodes.length === 0) {
    return `<div class="text-center py-4">No episodes found</div>`;
  }
  
  if (episodes.length > 50) {
    return `
      <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        ${episodes.map((episode, index) => {
          const isCurrentEpisode = currentEpisode && episode.id === currentEpisode.id;
          return `
            <button 
              class="EP_ITEM aspect-square bg-anime-card-bg border border-anime-border/10 rounded-lg hover:bg-anime-card-hover active:scale-95 transition duration-200 ease cursor-pointer flex items-center justify-center ${isCurrentEpisode ? '!bg-white text-anime-card-bg' : ''}" 
              data-episode-id="${episode.id}" 
              data-epid="${episode.epid}" 
              data-episode-no="${episode.episode_no}" 
              data-episodeid="${episode.episodeid || ''}"
              data-tmdbid="${window.currentAnimeData?.tmdbId || ''}"
              onclick="handleEpisodeClick('${episode.id}', '${episode.epid}', '${episode.episode_no}', '${episode.episodeid || ''}')"
            >
              <span class="text-sm font-medium">${episode.episode_no}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }
  
  return episodes.map((episode, index) => {
    const isCurrentEpisode = currentEpisode && episode.id === currentEpisode.id;
    return `
      <button 
        class="EP_ITEM bg-anime-card-bg border border-anime-border/10 rounded-lg px-3 hover:bg-anime-card-hover active:scale-95 transition duration-200 ease cursor-pointer ${isCurrentEpisode ? '!bg-white text-anime-card-bg' : ''} flex items-center" 
        data-episode-id="${episode.id}" 
        data-epid="${episode.epid}" 
        data-episode-no="${episode.episode_no}" 
        data-episodeid="${episode.episodeid || ''}"
        data-tmdbid="${window.currentAnimeData?.tmdbId || ''}"
        onclick="handleEpisodeClick('${episode.id}', '${episode.epid}', '${episode.episode_no}', '${episode.episodeid || ''}')"
      >
        <div class="flex items-center w-full py-2 gap-4 ">
            <span class="text-sm font-bold">${episode.episode_no}</span>
            <div class="truncate text-sm text-left">${episode.title || `Episode ${episode.episode_no}`}</div>
        </div>
      </button>
    `;
  }).join('');
}

window.handleEpisodeClick = function (episodeId, epid, episodeNo, episodeid = '') {
  if (!episodeId || !epid || !episodeNo) return;

  const episode = { id: episodeId, epid, episode_no: episodeNo, episodeid };
  currentEpisode = episode;

  document.querySelectorAll('[data-episode-id]').forEach(el =>
    el.classList.remove('!bg-white', 'text-anime-card-bg')
  );
  const el = document.querySelector(`[data-episode-id="${episodeId}"]`);
  if (el) {
    el.classList.add('!bg-white', 'text-anime-card-bg');
    const tmdbId = el.getAttribute('data-tmdbid');
    if (tmdbId && window.currentAnimeData) {
      window.currentAnimeData.tmdbId = tmdbId;
    }
  }

  const animeData = window.currentAnimeData || {};
  updateIframeSrc(episode, animeData, currentSource.id, currentLanguage);
};

window.handleServerClick = function(button) {
  if (!button) return;
  
  const sourceId = button.dataset.sourceId;
  const language = button.dataset.language;
  
  if (!sourceId || !language) return;
  
  currentSource = animeSources.find(src => src.id === sourceId) || currentSource;
  currentLanguage = language;
  
  document.querySelectorAll('#sub-servers button, #dub-servers button').forEach(el => {
    el.classList.remove('!bg-white', 'text-anime-card-bg');
    el.classList.add('bg-white/10');
  });
  button.classList.remove('bg-white/10');
  button.classList.add('!bg-white', 'text-anime-card-bg');
  
  if (currentEpisode) {
    const animeData = window.currentAnimeData;
    updateIframeSrc(currentEpisode, animeData, sourceId, language);
  }
}

function addSeasonOptionListener(animeData) {
    const seasonSelector = document.getElementById('season-selector');
    if (seasonSelector && animeData.seasons && animeData.seasons.length > 0) {
      seasonSelector.addEventListener('change', async () => {
        const selectedRoute = seasonSelector.value;
        
        if (selectedRoute) {
          const seasonId = selectedRoute.replace(/^\//, '');
          currentSeasonId = seasonId;
          
          const episodesContainer = document.getElementById('episodes-container');
          if (episodesContainer) {
            const skeletonItems = Array(24).fill().map(() => `
              <div class="bg-anime-card-bg border border-anime-border/10 rounded-lg py-2 px-3 animate-pulse">
                &nbsp;
              </div>
            `).join('');
            
            episodesContainer.innerHTML = skeletonItems;
          }
          
          try {
            const episodesData = await extractEpisodesList(seasonId);
            const newEpisodes = episodesData.episodes || [];
            
            const newSeasonAnimeData = await extractAnimeInfo(seasonId);
            
            if (newSeasonAnimeData) {
              Object.assign(animeData, newSeasonAnimeData);
            }
            
            currentEpisode = null;
  
            if (currentEpisode) {
              const matchingEpisode = newEpisodes.find(ep => 
                ep.epid === currentEpisode.epid || 
                ep.episodeid === currentEpisode.episodeid
              );
              currentEpisode = matchingEpisode || newEpisodes[0];
            } else {
              currentEpisode = newEpisodes[0];
            }
  
            if (currentEpisode) {
              updateIframeSrc(
                currentEpisode, 
                animeData, 
                currentSource.id, 
                currentLanguage
              );
            }
            
            let matchingEpisodeIndex = 0;
            if (currentEpisode) {
              const matchByNumber = newEpisodes.findIndex(ep => ep.episode_no === currentEpisode.episode_no);
              if (matchByNumber !== -1) {
                matchingEpisodeIndex = matchByNumber;
              }
            }
            
            if (newEpisodes.length > 0) {
              currentEpisode = newEpisodes[matchingEpisodeIndex];
              if (currentEpisode) {
                updateIframeSrc(currentEpisode, animeData, currentSource.id, currentLanguage);
              }
            } else {
              currentEpisode = null;
            }
            
            if (episodesContainer) {
              episodesContainer.innerHTML = renderEpisodesList(newEpisodes);
            }
            
            if (newEpisodes.length > 0) {
              const selectedOption = seasonSelector.options[seasonSelector.selectedIndex];
              const selectedSeasonName = selectedOption ? selectedOption.text : '';
              
              const seasonNumber = extractSeasonNumber(selectedSeasonName);
              
              try {
                const searchQuery = selectedSeasonName;
                
                const encodedQuery = encodeURIComponent(searchQuery);
                const searchUrl = `${TMDB_BASE_URL}/search/tv?query=${encodedQuery}&language=en-US&page=1`;
                
                const response = await fetch(searchUrl, {
                  headers: {
                    Authorization: TMDB_API_KEY
                  }
                });
                
                if (!response.ok) {
                  throw new Error(`Failed to search TMDB: ${response.status}`);
                }
                
                const data = await response.json();
                const results = data.results || [];
                
                const animeResults = results.filter(result => {
                  const isJapanese = result.origin_country && result.origin_country.includes('JP');
                  const hasAnimationGenre = result.genre_ids && result.genre_ids.includes(16);
                  return isJapanese || hasAnimationGenre;
                });
                
                let tmdbId = null;
                
                if (animeResults.length > 0) {
                  console.log(`Found TMDB match for "${searchQuery}":`, animeResults[0].name);
                  tmdbId = animeResults[0].id;
                } 
                else if (results.length > 0) {
                  console.log(`Found possible TMDB match for "${searchQuery}":`, results[0].name);
                  tmdbId = results[0].id;
                }
                
                if (tmdbId) {
                  animeData.tmdbId = tmdbId;
                }
              } catch (error) {
                console.error('Error finding TMDB match:', error);
              }
            }
            
          } catch (error) {
            console.error('Error loading season data:', error);
            if (episodesContainer) {
              episodesContainer.innerHTML = `<div class="text-center py-4 col-span-full">Failed to load episodes</div>`;
            }
          }
        }
      });
    }
}
