// Episode data component

import * as cheerio from 'cheerio';
import config from '../../config.json';

export async function extractEpisodesList(id, v1_base_url = "hianime.nz") {
  try {
    const showId = id.split("-").pop();
    const seasonMatch = id.match(/season-(\d+)/);
    const season = seasonMatch ? seasonMatch[1] : '1';
    
    const url = `https://hianime.nz/ajax/v2/episode/list/${showId}`;
    const headers = {
      "X-Requested-With": "XMLHttpRequest",
      "Referer": `https://${v1_base_url}/watch/${id}`
    };

    const response = await fetch(config.proxy, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        method: 'GET',
        headers
      })
    });

    const data = await response.json();
    
    if (!data.html) {
      return [];
    }

    const $ = cheerio.load(data.html);
    const episodeLinks = $('.detail-infor-content .ss-list a');
    
    const result = {
      totalEpisodes: episodeLinks.length,
      episodes: []
    };

    episodeLinks.each((_, el) => {
      const element = $(el);
      const episodeNo = parseInt(element.attr('data-number') || '0');
      const href = element.attr('href') || '';
      const epId = href ? href.split('/').pop() : null;
      const title = element.attr('title') ? element.attr('title').trim() : null;
      
      const japaneseTitle = element.find('.ep-name').attr('data-jname') || null;
      const filler = element.attr('class') ? element.attr('class').includes('ssl-item-filler') : false;
      
      result.episodes.push({
        episode_no: episodeNo,
        id: epId,
        epid: epId.includes('?ep=') ? epId.split('?ep=')[1] : epId,
        tmdbid: null,
        season: season,
        episodeid: `${epId}_s${season}`, 
        title,
        japanese_title: japaneseTitle,
        description: null,
        filler
      });
    });

    return result;
  } catch (error) {
    console.error('Error extracting episodes list:', error);
    return [];
  }
}