export const sources = [
    { // add event listeners (for progress tracking. check source documentation)
      name: 'VidLink',
      movieUrl: `https://vidlink.pro/movie/{id}?primaryColor=FFFFFF&secondaryColor=2392EE&title=true&poster=false&autoplay=false`,
      tvUrl: `https://vidlink.pro/tv/{id}/{season}/{episode}?primaryColor=2392EE&secondaryColor=FFFFFF&title=true&poster=false&autoplay=false&nextbutton=true`
    },
    {
      name: 'VidsrcXYZ',
      movieUrl: `https://vidsrc.xyz/embed/movie?tmdb={id}`,
      tvUrl: `https://vidsrc.xyz/embed/tv/{id}/{season}-{episode}`
    },
    {
      name: 'VidsrcSU',
      movieUrl: `https://vidsrc.su/embed/movie/{id}`,
      tvUrl: `https://vidsrc.su/embed/tv/{id}/{season}/{episode}`
    },
    // {
    //   name: 'VidsrcCC',
    //   movieUrl: `https://vidsrc.cc/v2/embed/movie/{id}?autoPlay=false&poster=false`,
    //   tvUrl: `https://vidsrc.cc/v2/embed/tv/{id}/{season}/{episode}?autoPlay=false&poster=false`
    // },
    // {
    //   name: 'Vidzee',
    //   movieUrl: `https://vidzee.wtf/movie/{id}`,
    //   tvUrl: `https://vidzee.wtf/tv/{id}/{season}/{episode}`
    // },
    { // add event listeners
      name: 'VidFast',
      movieUrl: `https://vidfast.pro/movie/{id}?autoPlay=false&theme=2392EE&poster=false`,
      tvUrl: `https://vidfast.pro/tv/{id}/{season}/{episode}?autoPlay=false&theme=2392EE&poster=false`
    },
    { // add event listeners
      name: 'Videasy',
      movieUrl: `https://player.videasy.net/movie/{id}?color=2392EE`,
      tvUrl: `https://player.videasy.net/tv/{id}/{season}/{episode}?color=2392EE&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=false`
    },
    {
      name: 'EmbedSU',
      movieUrl: `https://embed.su/embed/movie/{id}`,
      tvUrl: `https://embed.su/embed/tv/{id}/{season}/{episode}`
    },
    {
      name: '🤩 AnimePahe',
      tvOnly: true,
      tvUrl: `/embed/animepahe/{id}/{season}/{episode}`
    }
  ];