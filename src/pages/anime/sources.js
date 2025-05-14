// Anime Sources

export const animeSources = [
  {
    id: 'megaplaybz-1',
    name: 'megaplaybz-1',
    subUrl: 'https://megaplay.buzz/stream/s-2/{epid}/sub',
    dubUrl: 'https://megaplay.buzz/stream/s-2/{epid}/dub'
  },
  {
    id: 'animepahe',
    name: 'animepahe',
    subUrl: '/embed/animepahe/{tmdbId}/{season}/{episode}',
    dubUrl: '/embed/animepahe/{tmdbId}/{season}/{episode}'
  },
  {
    id: 'aniplay',
    name: 'aniplay',
    subUrl: '/embed/aniplay/{urlepisodeId}/{episode}/sub',
    dubUrl: '/embed/aniplay/{urlepisodeId}/{episode}/dub'
  },
  {
    id: 'flames-1',
    name: 'flames-1',
    subUrl: '/embed/flames1/{tmdbId}/{season}/{episode}',
    dubUrl: '/embed/flames1/{tmdbId}/{season}/{episode}'
  },
  {
    id: 'flames-2',
    name: 'flames-2',
    subUrl: '/embed/flames2sub/{tmdbId}/{season}/{episode}',
    dubUrl: '/embed/flames2/{tmdbId}/{season}/{episode}'
  },
  {
    id: 'anitummy',
    name: 'anitummy',
    subUrl: 'https://anitummy.com/src/player/sub.php?id={episodeId}&server=hd-1&embed=true&ep={episode}&skip=true',
    dubUrl: 'https://anitummy.com/src/player/dub.php?id={episodeId}&server=hd-1&embed=true&ep={episode}&skip=true'
  }
];

export function getSourceUrl(sourceId, language, episodeData, animeData) {
  const source = animeSources.find(src => src.id === sourceId);
  if (!source) return 'about:blank';

  const template = language === 'dub' ? source.dubUrl : source.subUrl;

  if (animeData.tmdbId) {
    console.log('Using TMDB ID:', animeData.tmdbId);
  }

  return template
    .replace('{epid}',        episodeData.epid)
    .replace('{episodeId}',   episodeData.episodeid || '')
    .replace('{urlepisodeId}', encodeURIComponent(episodeData.episodeid || ''))
    .replace('{tmdbId}',      animeData.tmdbId || '')
    .replace('{season}',      animeData.season   || '1')
    .replace('{episode}',     episodeData.episode_no);
}

export function getDefaultSource() {
  return animeSources[0];
}