import * as cheerio from "cheerio";

export async function fetchAnimeData(category = 'top-airing', page = 1) {
  try {
    const resp = fetch('https://varunaditya.xyz/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: `https://hianime.nz/${category}?page=${page}`,
        method: 'GET'
      })
    });
    
    const response = await resp;
    const $ = cheerio.load(await response.text());
    
    // Extract total pages
    let totalPages = 1;
    const lastPage = $('.pre-pagination nav .pagination > .page-item a[title="Last"]');
    const nextPage = $('.pre-pagination nav .pagination > .page-item a[title="Next"]');
    const activePage = $('.pre-pagination nav .pagination > .page-item.active a');
    
    if (lastPage.length && lastPage.attr('href')) {
      const href = lastPage.attr('href');
      totalPages = parseInt(href.split('=').pop()) || 1;
    } else if (nextPage.length && nextPage.attr('href')) {
      const href = nextPage.attr('href');
      totalPages = parseInt(href.split('=').pop()) || 1;
    } else if (activePage.length) {
      totalPages = parseInt(activePage.text().trim()) || 1;
    }
    
    // Extract results
    const elements = $('#main-content .film_list-wrap .flw-item');
    const results = [];
    
    elements.each((_, element) => {
      const $element = $(element);
      
      // Get title, ID, and description
      const filmName = $element.find('.film-detail .film-name .dynamic-name');
      let animeId = null;
      
      if (filmName.length && filmName.attr('href')) {
        const href = filmName.attr('href');
        animeId = href.substring(1).split('?ref=search')[0];
      }
      
      // Get poster
      const poster = $element.find('.film-poster .film-poster-img');
      const posterUrl = poster.attr('data-src')?.trim() || null;
      
      // Get duration
      const duration = $element.find('.film-detail .fd-infor .fdi-item.fdi-duration');
      const durationText = duration.length ? duration.text().trim() : null;
      
      // Get show type
      const showType = $element.find('.film-detail .fd-infor .fdi-item:nth-of-type(1)');
      const showTypeText = showType.length ? showType.text().trim() : 'Unknown';
      
      // Get rating
      const rating = $element.find('.film-poster .tick-rate');
      const ratingText = rating.length ? rating.text().trim() : null;
      
      // Get sub count
      const subElement = $element.find('.film-poster .tick-sub');
      let subCount = null;
      if (subElement.length && subElement.text().trim()) {
        const subText = subElement.text().trim();
        subCount = parseInt(subText.split(' ').pop()) || null;
      }
      // Get dub count
      const dubElement = $element.find('.film-poster .tick-dub');
      let dubCount = null;
      if (dubElement.length && dubElement.text().trim()) {
        const dubText = dubElement.text().trim();
        dubCount = parseInt(dubText.split(' ').pop()) || null;
      }
      
      // Get episode count
      const epsElement = $element.find('.film-poster .tick-eps');
      let epsCount = null;
      if (epsElement.length && epsElement.text().trim()) {
        const epsText = epsElement.text().trim();
        epsCount = parseInt(epsText.split(' ').pop()) || null;
      }
      
      // Get Japanese title
      let japaneseTitle = null;
      if (filmName.length && filmName.attr('data-jname')) {
        japaneseTitle = filmName.attr('data-jname').trim();
      }
      
      // Create result object
      const result = {
        id: animeId,
        title: filmName.length ? filmName.text().trim() : null,
        japanese_title: japaneseTitle,
        poster: posterUrl,
        duration: durationText,
        tvInfo: {
          showType: showTypeText,
          rating: ratingText,
          sub: subCount,
          dub: dubCount,
          eps: epsCount
        }
      };
      
      results.push(result);
    });
    
    return { totalPages, results };
  } catch (error) {
    console.error(`Error fetching ${category} anime data:`, error);
    return { totalPages: 0, results: [] };
  }
}