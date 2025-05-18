// Anime Details Page
import { extractAnimeInfo, findTmdbIdForTitle, findTmdbIdForSeason, extractSeasonNumber } from '../../components/anime/animeDetailsData.js';
import { extractEpisodesList } from '../../components/anime/episodeData.js';
import { fetchEpisodeThumbnails, updateEpisodeListWithThumbnails, fetchTmdbThumbnails } from '../../components/anime/episodeThumbnails.js';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { animeSources, getSourceUrl, getDefaultSource } from './sources.js';
import { renderAnimeHeader, initializeSearchFunctionality } from '../../components/anime/ui/header.js';
import { renderAnimeDetailsModal, openAnimeDetailsModal } from '../../components/anime/ui/animeDetailsModal.js';

// Store global states
let currentEpisode = null;
let currentSource = getDefaultSource();
let currentLanguage = 'sub'; 
let currentSeasonId = null;

export async function renderAnimeDetailsPage(container, id) {
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
          return fetchTmdbThumbnails(tmdbId, episodes.length, seasonNumber);
        }
        throw new Error('No TMDB match found');
      })
      .then(thumbnails => {
        if (thumbnails) {
          const episodesContainer = document.getElementById('episodes-container');
          if (episodesContainer) {
            updateEpisodeListWithThumbnails(episodesContainer, episodes, thumbnails);
          }
          
          if (currentEpisode) {
            updateIframeSrc(currentEpisode, animeData, currentSource.id, currentLanguage);
          }
        }
      })
      .catch(error => {
        console.error('Error loading episode thumbnails:', error);
      });
  }

  container.innerHTML = `
    ${renderAnimeHeader()}
    ${renderAnimeDetailsModal()}
    <div class="flex flex-col xl:flex-row gap-4 w-full h-screen pt-20 p-4 transition duration-600 ease" id="anime-details-content" style="opacity: 0; transform: translateY(20px);">
      <div class="w-full h-full flex flex-col gap-4">
        <div class="w-full h-full">
          <iframe class="w-full h-[40rem] xl:h-full rounded-xl border border-anime-border/10" src="about:blank"></iframe>
        </div>
        <div class="w-full">
          <div class="h-full flex flex-row gap-4">
            <div class="bg-anime-modal-bg border border-anime-border/10 rounded-xl w-full h-full p-6 flex flex-col justify-between gap-2">
              <h2 class="text-3xl font-bold">${title}</h2>
              <p class="text-white/80 overflow-hidden line-clamp-3 text-ellipsis mb-2">${animeInfo.Overview || 'No description available'}</p>
              <button id="more-info-btn" class="w-full py-2 bg-anime-card-bg border border-anime-border/10 rounded-lg text-center cursor-pointer hover:bg-anime-card-hover transition duration-200 ease">More info</button>
            </div>
            <div class="w-[45rem] bg-anime-modal-bg border border-anime-border/10 rounded-xl h-full p-4 overflow-y-auto">
              <div class="flex flex-col gap-2" id="servers-container">
                <!-- SUB Section -->
                <div class="flex items-center w-full">
                  <div class="flex-grow h-px bg-anime-border/10"></div>
                  <span class="px-2 text-sm text-anime-border/50">SUB</span>
                  <div class="flex-grow h-px bg-anime-border/10"></div>
                </div>
                <div>
                  <div class="grid grid-cols-3 gap-2" id="sub-servers">
                    ${animeSources.map((source, index) => 
                      `<button data-source-id="${source.id}" data-language="sub" onclick="handleServerClick(this)" class="${source.id === currentSource.id && currentLanguage === 'sub' ? '!bg-white text-anime-card-bg' : 'bg-anime-card-bg'} border border-anime-border/10 rounded-lg px-2 py-1 text-center text-sm cursor-pointer hover:bg-anime-card-hover transition duration-200 ease active:scale-90" style="opacity: 0; transform: translateY(10px);">${source.name}</button>`
                    ).join('')}
                  </div>
                </div>
                
                <!-- DUB Section -->
                <div class="flex items-center w-full mt-2">
                  <div class="flex-grow h-px bg-anime-border/10"></div>
                  <span class="px-2 text-sm text-anime-border/50">DUB</span>
                  <div class="flex-grow h-px bg-anime-border/10"></div>
                </div>
                <div>
                  <div class="grid grid-cols-3 gap-2" id="dub-servers">
                    ${animeSources.map((source, index) => 
                      `<button data-source-id="${source.id}" data-language="dub" onclick="handleServerClick(this)" class="${source.id === currentSource.id && currentLanguage === 'dub' ? '!bg-white text-anime-card-bg' : 'bg-anime-card-bg'} border border-anime-border/10 rounded-lg px-2 py-1 text-center text-sm cursor-pointer hover:bg-anime-card-hover transition duration-200 ease" style="opacity: 0; transform: translateY(10px);">${source.name}</button>`
                    ).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-anime-modal-bg w-full xl:w-[45rem] h-full rounded-xl border border-anime-border/10 p-4 overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Episodes</h2>
          <div class="relative">
            <select id="season-selector" class="appearance-none bg-anime-card-bg border border-anime-border/10 rounded-lg px-4 py-2 pr-8 text-white cursor-pointer outline-none">
              ${renderSeasonOptions(animeData.seasons)}
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="space-x-4 xl:space-y-4 xl:space-x-0 flex flex-row xl:flex-col overflow-visible" id="episodes-container">
          ${renderEpisodesList(episodes)}
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
      episodeElement.classList.add('border-anime-border/15', '!bg-anime-border/10', 'border-1');
      
      if (tmdbId) {
        animeData.tmdbId = tmdbId;
        updateIframeSrc(currentEpisode, animeData, currentSource.id, currentLanguage);
      }
    }
  }
  
  window.currentAnimeData = animeData;
  addSeasonOptionListener(animeData);
  
  const episodeItems = document.querySelectorAll('.EP_ITEM');
  episodeItems.forEach((item, index) => {
    setTimeout(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, 75 * index);
  });
  
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
  
  return episodes.map((episode, index) => {
    const isCurrentEpisode = currentEpisode && episode.id === currentEpisode.id;
    return `
      <div class="EP_ITEM bg-anime-card-bg border border-anime-border/10 rounded-xl xl:*:overflow-hidden hover:bg-anime-card-hover hover:scale-[1.02] active:scale-[0.98] transition duration-200 ease cursor-pointer ${isCurrentEpisode ? 'border-anime-border/15 !bg-anime-border/10 border-1' : ''}" 
           data-episode-id="${episode.id}" data-epid="${episode.epid}" data-episode-no="${episode.episode_no}" data-episodeid="${episode.episodeid || ''}"
           data-tmdbid="${window.currentAnimeData?.tmdbId || ''}"
           onclick="handleEpisodeClick('${episode.id}', '${episode.epid}', '${episode.episode_no}', '${episode.episodeid || ''}')"
           style="opacity: 0; transform: translateY(20px);">
        <div class="flex flex-col xl:flex-row">
          <div class="aspect-video p-2 pr-0 w-80">
            <div class="w-full h-full object-cover aspect-video rounded-md bg-anime-modal-bg flex items-center justify-center">
              <span class="text-xl font-bold">${episode.episode_no}</span>
            </div>
          </div>
          <div class="w-2/3 p-3 pr-0 flex flex-col gap-1 justify-center">
            <h3 class="font-medium line-clamp-2">${episode.title || `Episode ${episode.episode_no}`}</h3>
            <p class="text-sm text-white/70 line-clamp-3 leading-tight">${episode.description || episode.japanese_title || ''}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.handleEpisodeClick = function (episodeId, epid, episodeNo, episodeid = '') {
  if (!episodeId || !epid || !episodeNo) return;

  const episode = { id: episodeId, epid, episode_no: episodeNo, episodeid };
  currentEpisode = episode;

  document.querySelectorAll('[data-episode-id]').forEach(el =>
    el.classList.remove('border-anime-border/15', '!bg-anime-border/10', 'border-1')
  );
  const el = document.querySelector(`[data-episode-id="${episodeId}"]`);
  if (el) {
    el.classList.add('border-anime-border/15', '!bg-anime-border/10', 'border-1');
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
    el.classList.add('bg-anime-card-bg');
  });
  button.classList.remove('bg-anime-card-bg');
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
            const skeletonItems = Array(10).fill().map(() => `
              <div class="EP_ITEM bg-anime-card-bg border border-anime-border/10 rounded-xl xl:*:overflow-hidden transition duration-200 ease animate-pulse" 
                   style="opacity: 1; transform: translateY(0);">
                <div class="flex flex-col xl:flex-row">
                  <div class="aspect-video p-2 pr-0 w-80">
                    <div class="w-full object-cover aspect-video h-full rounded-md bg-anime-card-hover flex items-center justify-center">
                    </div>
                  </div>
                  <div class="w-2/3 p-3 pr-0 flex flex-col gap-2 justify-center">
                    <div class="h-4 bg-anime-card-hover rounded w-3/4"></div>
                    <div class="h-3 bg-anime-card-hover rounded w-full"></div>
                    <div class="h-3 bg-anime-card-hover rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            `).join('');
            
            episodesContainer.innerHTML = `
              <div class="space-x-4 xl:space-y-4 xl:space-x-0 flex flex-row xl:flex-col overflow-visible">
                ${skeletonItems}
              </div>
            `;
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
              
              const episodeItems = document.querySelectorAll('.EP_ITEM');
              episodeItems.forEach((item, index) => {
                setTimeout(() => {
                  item.style.opacity = '1';
                  item.style.transform = 'translateY(0)';
                }, 75 * index);
              });
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
                let seasonNumberInTmdb = 1;
                
                if (animeResults.length > 0) {
                  console.log(`Found TMDB match for "${searchQuery}":`, animeResults[0].name);
                  tmdbId = animeResults[0].id;
                } 
                else if (results.length > 0) {
                  console.log(`Found possible TMDB match for "${searchQuery}":`, results[0].name);
                  tmdbId = results[0].id;
                }
                
                if (tmdbId) {
                  const thumbnails = await fetchTmdbThumbnails(
                    tmdbId, 
                    newEpisodes.length, 
                    seasonNumberInTmdb
                  );
                  
                  if (thumbnails && thumbnails.length > 0) {
                    updateEpisodeListWithThumbnails(episodesContainer, newEpisodes, thumbnails);
                    
                    if (currentEpisode) {
                      const episodeElement = document.querySelector(`[data-episode-id="${currentEpisode.id}"]`);
                      if (episodeElement) {
                        episodeElement.classList.add('border-anime-border/15', '!bg-anime-border/10', 'border-1');
                      }

                      const episodes = document.querySelectorAll('[data-episode-id]');
                      episodes.forEach(episode => {
                        episode.setAttribute('data-tmdbid', tmdbId);
                      });
                      
                      updateIframeSrc(currentEpisode, animeData, currentSource.id, currentLanguage);
                    }
                  } else {
                    console.warn('No thumbnails found for this season in TMDB');
                  }
                } else {
                  console.warn(`No TMDB match found for "${searchQuery}"`);
                }
              } catch (error) {
                console.error('Error fetching season-specific TMDB data:', error);
              }
            }
          } catch (error) {
            console.error('Error loading season episodes:', error);
            if (episodesContainer) {
              episodesContainer.innerHTML = `<div class="text-center py-4">Failed to load episodes for this season</div>`;
            }
          }
        }
      });
    }
  }
