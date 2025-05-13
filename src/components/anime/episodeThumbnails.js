// Episode Thumbnails Component

import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { findTmdbIdForTitle } from './animeDetailsData.js';

export async function fetchEpisodeThumbnails(episodeCount, seasonNumber = 1, title = '') {
  if (!episodeCount) {
    console.error('Missing required parameters for fetching thumbnails');
    return null;
  }

  try {
    if (title) {
      const tmdbId = await findTmdbIdForTitle(title);
      
      if (tmdbId) {
        return await fetchTmdbThumbnails(tmdbId, episodeCount, seasonNumber);
      }
    }
    
    console.error('Could not find TMDB ID');
    return null;
  } catch (error) {
    console.error('Error fetching episode thumbnails:', error);
    return null;
  }
}

export async function fetchTmdbThumbnails(tmdbId, episodeCount, seasonNumber = 1) {
  try {
    if (!tmdbId) {
      console.error('No TMDB ID provided for fetching thumbnails');
      return null;
    }
    
    console.log(`Fetching TMDB thumbnails for ID: ${tmdbId}, Season: ${seasonNumber}, Episodes: ${episodeCount}`);
    
    const response = await fetch(`${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}`, {
      headers: {
        Authorization: TMDB_API_KEY
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch TMDB data: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const episodes = data.episodes || [];
    
    const thumbnails = [];
    
    for (let episodeNo = 1; episodeNo <= episodeCount; episodeNo++) {
      const tmdbEpisode = episodes.find(ep => ep.episode_number === episodeNo) || {};
      
      thumbnails.push({
        episode_no: episodeNo,
        thumbnail: tmdbEpisode.still_path ? `${TMDB_IMAGE_BASE_URL}w300${tmdbEpisode.still_path}` : null,
        name: tmdbEpisode.name || `Episode ${episodeNo}`,
        description: tmdbEpisode.overview || null,
        air_date: tmdbEpisode.air_date || null
      });
    }
    
    return thumbnails;
  } catch (error) {
    console.error('Error fetching TMDB thumbnails:', error);
    return null;
  }
}

export function updateEpisodeListWithThumbnails(container, episodes, thumbnails) {
  if (!container || !episodes || !thumbnails) {
    console.error('Missing required parameters for updating episode list');
    return;
  }

  const episodeElements = container.querySelectorAll('[data-episode-id]');
  
  episodeElements.forEach((element) => {
    const episodeId = element.dataset.episodeId;
    if (!episodeId) return;
    
    const episode = episodes.find(ep => ep.id === episodeId);
    if (!episode) return;
    
    const episodeNo = episode.episode_no;
    if (!episodeNo) return;
    
    const thumbnail = thumbnails.find(thumb => thumb.episode_no === episodeNo);
    if (!thumbnail) return;
    
    const thumbnailContainer = element.querySelector('.aspect-video');
    if (thumbnailContainer && thumbnail.thumbnail) {
      thumbnailContainer.innerHTML = `
        <img src="${thumbnail.thumbnail}" 
             alt="${thumbnail.name || `Episode ${episodeNo}`}" 
             class="w-full h-full object-cover rounded-md">
      `;
    }
    
    const descriptionElement = element.querySelector('.text-sm.text-white\\/70');
    if (descriptionElement && thumbnail.description) {
      descriptionElement.textContent = thumbnail.description;
      
      element.setAttribute('data-description', thumbnail.description);
    }
  });
  
  return episodes.map((episode) => {
    const thumbnail = thumbnails.find(t => t.episode_no === episode.episode_no);
    if (thumbnail && thumbnail.description) {
      episode.description = thumbnail.description;
    }
    return episode;
  });
}