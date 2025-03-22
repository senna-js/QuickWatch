// Download Details
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { renderError, renderAlert } from '../../components/error.js';

/**
 * Renders the download details page for a movie or TV show
 * @param {HTMLElement} container
 * @param {Object} params
 */
let currentLoadingPromise = null;

export function renderDownloadDetailsPage(container, params) {
  if (window.splashScreen) {
    window.splashScreen.show();
  }
  
  container.innerHTML = `
    <div id="backdrop-bg" class="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 z-0 blur-[1rem]"></div>

    ${renderHeader()}
  
    <div class="md:ml-16 p-4 md:p-12 pb-20 md:pb-12 relative z-10" id="details-container">
      <!-- Content will be loaded dynamically -->
    </div>
  `;
  
  currentLoadingPromise = loadMediaDetails(params.type, params.id);
  return currentLoadingPromise;
}

/**
 * Loads and displays download details for a specific movie or TV show
 * @param {string} type - The media type ('movie' or 'tv')
 * @param {string} id - The media ID
 */
async function loadMediaDetails(type, id) {
  try {
    const mediaDetailsStep = window.splashScreen?.addStep('Loading media details...');
    
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': TMDB_API_KEY
      }
    };
    
    const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?language=en-US`, options);
    const data = await response.json();
    
    window.splashScreen?.completeStep(mediaDetailsStep);
    const externalIdsStep = window.splashScreen?.addStep('Fetching external IDs...');
    
    const externalIdsResponse = await fetch(`${TMDB_BASE_URL}/${type}/${id}/external_ids`, options);
    const externalIds = await externalIdsResponse.json();
    
    window.splashScreen?.completeStep(externalIdsStep);
    
    const imdbId = externalIds.imdb_id;
    
    if (!imdbId) {
      throw new Error('IMDB ID not found for this media');
    }
        
    let torrentsData = [];
    try {
      const parser = new DOMParser();
      
      const animeCheckStep = window.splashScreen?.addStep('Checking if media is anime...');
      const animeCheckResponse = await fetch(`https://raw.githubusercontent.com/Fribb/anime-lists/refs/heads/master/anime-list-full.json`);
      const animeList = await animeCheckResponse.json();
      
      let isAnime = false;
      let anilistId = null;
      
      for (const item of animeList) {
        if (item.imdb_id === imdbId) {
          isAnime = true;
          anilistId = item.anilist_id;
          break;
        }
      }
      window.splashScreen?.completeStep(animeCheckStep);

      if (isAnime && anilistId) {
        const nyaaStep = window.splashScreen?.addStep('Searching Nyaa.si for anime torrents...');
        try {
          const nyaaResponse = await fetch(`https://releases.moe/api/collections/entries/records?filter=alID=${anilistId}&expand=trs`);
          const nyaaData = await nyaaResponse.json();
          
          if (nyaaData.items?.[0]?.expand?.trs) {
            for (const result of nyaaData.items[0].expand.trs) {
              if (result.url.includes('nyaa.si')) {
                const tags = [];
                tags.push(`${result.files.length} Episodes`);
                tags.push(result.updated.split(' ')[0]);
                if (result.dualAudio) tags.push("DualAudio");
                
                const baseTrackers = "tr=http%3A%2F%2F125.227.35.196%3A6969%2Fannounce&tr=http%3A%2F%2F210.244.71.25%3A6969%2Fannounce&..."; // Add all trackers
                const magnetUrl = `magnet:?xt=urn:btih:${result.infoHash}&dn=${encodeURIComponent(`${data.title || data.name} (${result.releaseGroup})`)}&${baseTrackers}`;
                
                torrentsData.push({
                  url: magnetUrl,
                  tags,
                  source: "Nyaa.si"
                });
              }
            }
          }
        } catch (nyaaError) {
          console.warn('Failed to fetch Nyaa.si data:', nyaaError);
        }
        window.splashScreen?.completeStep(nyaaStep);
      }
    
      if (type === 'movie') {
        const ytsStep = window.splashScreen?.addStep('Searching Yts.mx for movie torrents...');
        try {
          const ytsResponse = await fetch(`https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}`);
          const ytsData = await ytsResponse.json();
          
          if (ytsData.data?.movie?.torrents) {
            const baseTrackers = "tr=http%3A%2F%2F125.227.35.196%3A6969%2Fannounce&tr=http%3A%2F%2F210.244.71.25%3A6969%2Fannounce&tr=http%3A%2F%2F210.244.71.26%3A6969%2Fannounce&tr=http%3A%2F%2F213.159.215.198%3A6970%2Fannounce&tr=http%3A%2F%2F37.19.5.139%3A6969%2Fannounce&tr=http%3A%2F%2F37.19.5.155%3A6881%2Fannounce&tr=http%3A%2F%2F46.4.109.148%3A6969%2Fannounce&tr=http%3A%2F%2F87.248.186.252%3A8080%2Fannounce&tr=http%3A%2F%2Fasmlocator.ru%3A34000%2F1hfZS1k4jh%2Fannounce&tr=http%3A%2F%2Fbt.evrl.to%2Fannounce&tr=http%3A%2F%2Fbt.rutracker.org%2Fann&tr=https%3A%2F%2Fwww.artikelplanet.nl&tr=http%3A%2F%2Fmgtracker.org%3A6969%2Fannounce&tr=http%3A%2F%2Fpubt.net%3A2710%2Fannounce&tr=http%3A%2F%2Ftracker.baravik.org%3A6970%2Fannounce&tr=http%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.filetracker.pl%3A8089%2Fannounce&tr=http%3A%2F%2Ftracker.grepler.com%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.mg64.net%3A6881%2Fannounce&tr=http%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.torrentyorg.pl%2Fannounce&tr=https%3A%2F%2Finternet.sitelio.me%2F&tr=https%3A%2F%2Fcomputer1.sitelio.me%2F&tr=udp%3A%2F%2F168.235.67.63%3A6969&tr=udp%3A%2F%2F182.176.139.129%3A6969&tr=udp%3A%2F%2F37.19.5.155%3A2710&tr=udp%3A%2F%2F46.148.18.250%3A2710&tr=udp%3A%2F%2F46.4.109.148%3A6969&tr=udp%3A%2F%2Fcomputerbedrijven.bestelinks.nl%2F&tr=udp%3A%2F%2Fcomputerbedrijven.startsuper.nl%2F&tr=udp%3A%2F%2Fcomputershop.goedbegin.nl%2F&tr=udp%3A%2F%2Fc3t.org&tr=udp%3A%2F%2Fallerhandelenlaag.nl&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969";
            
            for (const torrent of ytsData.data.movie.torrents) {
              const magnetUrl = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(ytsData.data.movie.title)}&${baseTrackers}`;
              const formattedDate = torrent.date_uploaded.split(' ')[0];
              
              torrentsData.push({
                url: magnetUrl,
                tags: [
                  torrent.quality,
                  torrent.size,
                  formattedDate
                ],
                source: "YTS.MX"
              });
            }
          }
        } catch (ytsError) {
          console.warn('Failed to fetch YTS.MX data:', ytsError);
        }
        window.splashScreen?.completeStep(ytsStep);
      }
    
      const pbStep = window.splashScreen?.addStep('Searching The Pirate Bay for torrents...');
      const pbCategories = type === 'tv' ? ['205', '208'] : ['201', '207'];
      const qualities = ['SD', 'HD'];
      
      for (let i = 0; i < pbCategories.length; i++) {
        const pbResponse = await fetch('https://varunaditya.xyz/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: `https://1.piratebays.to/s/?q=${encodeURIComponent(data.title || data.name)}&video=on&category=${pbCategories[i]}`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
          })
        });
        const pbHtml = await pbResponse.text();
        const doc = parser.parseFromString(pbHtml, 'text/html');
        const rows = doc.querySelectorAll('#searchResult > tbody > tr');
        
        rows.forEach(row => {
          try {
            const magnetLink = row.querySelector('td a[href^="magnet:"]')?.href;
            const titleElem = row.querySelector('td .detLink');
            const dateElem = row.querySelector('td:nth-of-type(3)');
            const sizeElem = row.querySelector('td:nth-of-type(5)');
            
            if (magnetLink && titleElem && dateElem && sizeElem) {
              torrentsData.push({
                url: magnetLink,
                tags: [ qualities[i], dateElem.textContent.trim(), sizeElem.textContent.trim() ],
                source: "The Pirate Bay"
              });
            }
          } catch (error) { console.error('Error processing Pirate Bay row:', error); }
        });
      }
      window.splashScreen?.completeStep(pbStep);

      const tgStep = window.splashScreen?.addStep('Searching TorrentGalaxy for torrents...');
      const tgResponse = await fetch(`https://torrentgalaxy.one/get-posts/keywords:${imdbId}/`);
      const tgHtml = await tgResponse.text();
      const tgDoc = parser.parseFromString(tgHtml, 'text/html');

      tgDoc.querySelectorAll('div.tgxtablerow').forEach(row => {
        try {
          const magnetElement = row.querySelector('a i.glyphicon-magnet');
          if (!magnetElement) return;

          const magnetLink = magnetElement.closest('a')?.getAttribute('href');
          const size = row.querySelector('div.tgxtablecell span.badge-secondary')?.textContent?.trim().replace('\xa0', ' ');
          
          const dateCells = row.querySelectorAll('div.tgxtablecell');
          const dateCell = dateCells[dateCells.length - 1];
          let dateText = dateCell?.textContent?.trim() || '';
          
          if (dateText.includes('Added')) { dateText = dateText.split('Added')[1].trim(); }

          const today = new Date();
          let estimatedDate = new Date(today);

          if (dateText.includes('year')) {
            const yearsMatch = dateText.match(/(\d+)\s*year/);
            if (yearsMatch) { estimatedDate.setFullYear(estimatedDate.getFullYear() - parseInt(yearsMatch[1])); }
          }
          if (dateText.includes('month')) {
            const monthsMatch = dateText.match(/(\d+)\s*month/);
            if (monthsMatch) { estimatedDate.setMonth(estimatedDate.getMonth() - parseInt(monthsMatch[1])); }
          }
          if (dateText.includes('week')) {
            const weeksMatch = dateText.match(/(\d+)\s*week/);
            if (weeksMatch) { estimatedDate.setDate(estimatedDate.getDate() - (parseInt(weeksMatch[1]) * 7)); }
          }
          if (dateText.includes('day')) {
            const daysMatch = dateText.match(/(\d+)\s*day/);
            if (daysMatch) { estimatedDate.setDate(estimatedDate.getDate() - parseInt(daysMatch[1])); }
          }
          if (dateText.includes('hour')) {
            const hoursMatch = dateText.match(/(\d+)\s*hour/);
            if (hoursMatch) { estimatedDate.setHours(estimatedDate.getHours() - parseInt(hoursMatch[1])); }
          }

          const formattedDate = estimatedDate.toISOString().split('T')[0];

          if (magnetLink) {
            const finalUrl = `https://torrentgalaxy.one${magnetLink}`;
            torrentsData.push({
              url: finalUrl,
              tags: [formattedDate, size].filter(Boolean),
              source: "TorrentGalaxy"
            });
          }
        } catch (error) {
          console.warn('Error processing TorrentGalaxy row:', error);
        }
      });
      window.splashScreen?.completeStep(tgStep);
    } catch (torrentsError) {
      console.warn('Failed to fetch torrent data:', torrentsError);
    }
    
    console.log(torrentsData);
    
    const detailsContainer = document.getElementById('details-container');
    if (!detailsContainer) return;
    
    if (data.backdrop_path) {
      const backdropBg = document.getElementById('backdrop-bg');
      if (backdropBg) {
        backdropBg.style.backgroundImage = `url(${TMDB_IMAGE_BASE_URL}original${data.backdrop_path})`;
      }
    }
    
    detailsContainer.innerHTML = `
      ${renderAlert(
        'You must have a torrenting client installed to download',
        'To download from QuickWatch, you need to have a torrenting client installed. We recommend <a href="https://www.qbittorrent.org/download" class="underline hover:text-zinc-300" target="_blank">qBittorent</a>, as it has a clean interface and is easy to use, but you can use whichever one you like.',
        'warning'
      )}
      ${/iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || (window.opera && opera.toString() === `[object Opera]`)) ? `
      <div class="bg-zinc-800 border-l-4 border-zinc-300 text-zinc-200 p-4 mb-8 rounded shadow-md">
        <div class="flex items-start">
          <div class="flex-shrink-0 mt-0.5">
            <i class="fas fa-info-circle text-zinc-200 text-xl"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium">You seem to be on an iPhone/iPad</h3>
            <p class="mt-1 text-zinc-400">It's really hard to download torrents on iOS, as there aren't any apps that make it easy to do so. However, we will still show you the torrent sources if you have your own method.</p>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div class="md:col-span-1">
          <img src="${TMDB_IMAGE_BASE_URL}w500${data.poster_path}" 
               class="w-full rounded-lg" alt="${data.title || data.name} poster">
        </div>
        
        <div class="md:col-span-3">
          <h1 class="text-4xl font-bold mb-4">${data.title || data.name}</h1>
          
          <div class="flex items-center space-x-4 mb-6">
            <span class="flex items-center"><i class="fas fa-star text-yellow-500 mr-1"></i> ${data.vote_average?.toFixed(1) || 'N/A'}</span>
            <span>${new Date(data.release_date || data.first_air_date).getFullYear() || 'N/A'}</span>
            <span class="px-2 py-1 border border-zinc-500 text-sm">${type === 'movie' ? 'Movie' : 'TV Show'}</span>
          </div>
          
          <h2 class="text-2xl font-bold mb-4">Overview</h2>
          <p class="text-zinc-300 mb-6">${data.overview || 'No overview available'}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-bold mb-4">Torrent Sources</h2>
        ${torrentsData.length > 0 ? `
          <div class="space-y-3">
            ${torrentsData.map(torrent => `
              <a href="${torrent.url}"
                    onclick="(e => {
                      e.preventDefault();
                      try {
                        window.location.href = '${torrent.url}';
                        return true;
                      } catch(e) {
                        alert('You must have a torrenting client installed to download this file');
                        return false;
                      }
                    })(event)"
                    class="block no-underline">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-zinc-800 rounded-lg hover:bg-[#36363c] transition-colors select-none">
                  <div class="flex-grow flex flex-col md:flex-row items-start md:items-center">
                    <span class="text-white mb-2 md:mb-0 md:mr-4">
                      ${torrent.title || data.title || data.name}
                    </span>
                    <div class="flex flex-wrap gap-2 mb-2 md:mb-0">
                      ${torrent.tags.map(tag => `
                        <span class="text-xs px-2 py-1 bg-zinc-600 rounded-full">${tag}</span>
                      `).join('')}
                    </div>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm text-zinc-400 mr-3">
                      ${torrent.source}
                    </span>
                    <div class="flex space-x-2">
                      <button 
                        class="text-zinc-200 hover:text-white bg-zinc-700 hover:bg-zinc-500 p-2 focus:outline-none rounded"
                        onclick="event.stopPropagation(); event.preventDefault(); navigator.clipboard.writeText('${torrent.url}'); alert('Magnet link copied to clipboard');"
                        aria-label="Copy magnet link">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                      <button
                        class="text-zinc-200 hover:text-white bg-zinc-700 hover:bg-zinc-500 p-2 focus:outline-none rounded"
                        onclick="event.stopPropagation(); event.preventDefault(); window.location.href='${torrent.url}';"
                        aria-label="Open magnet link">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      <button
                        class="text-zinc-200 hover:text-white bg-zinc-700 hover:bg-zinc-500 p-2 focus:outline-none rounded"
                        onclick="event.stopPropagation(); event.preventDefault(); window.location.href='/${type}/${id}';"
                        aria-label="Watch media">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
        ` : `
          <div class="text-center py-8 bg-zinc-800 rounded-lg px-2">
            <i class="fas fa-exclamation-circle text-4xl mb-4 text-zinc-500"></i>
            <h3 class="text-xl font-bold mb-2">No downloads found</h3>
            <p class="text-zinc-400">We couldn't find any torrent sources for ${data.title || data.name}. Try checking:
              <a href="https://torrentgalaxy.one/get-posts/keywords:${imdbId}/" class="text-blue-400 hover:underline" target="_blank">TorrentGalaxy</a>, 
              <a href="https://1337x.pro/search/?q=${encodeURIComponent(data.title || data.name)}" class="text-blue-400 hover:underline" target="_blank">1337x</a>, 
              <a href="https://nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(data.title || data.name)}" class="text-blue-400 hover:underline" target="_blank">Nyaa.si</a> or 
              <a href="#" class="text-blue-400 hover:underline" onclick="(() => {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://ww4.thepiratebay3.co/s/';
                form.target = '_blank';
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'q';
                input.value = '${(data.title || data.name).replace(/'/g, "\\'")}';
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);
                return false;
              })()">The Pirate Bay</a>
            </p>
          </div>
        `}
      </div>
    `;
    
    if (window.splashScreen) {
      // Give a moment to see the completed steps before hiding
      setTimeout(() => {
        window.splashScreen.hide();
      }, 800);
    }
    
    return Promise.resolve();
    
  } catch (error) {
    console.error('Error loading media details:', error);
    document.getElementById('details-container').innerHTML = renderError(
      'Error', 
      'Failed to load torrent sources', 
      'Back to Download Search',
      "window.history.pushState(null, null, '/download'); window.dispatchEvent(new PopStateEvent('popstate'))"
    );
    
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
    
    return Promise.resolve();
  }
}