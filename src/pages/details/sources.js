export const sources = [
    {
      name: 'Native',
      movieUrl: `/embed/native/{id}`,
      tvUrl: `/embed/native/{id}/{season}/{episode}`
    },
    {
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
      movieUrl: `https://vidsrc.su/embed/movie/{id}?serverselector=false`,
      tvUrl: `https://vidsrc.su/embed/tv/{id}/{season}/{episode}?serverselector=false`
    },
    {
      name: 'Vidora',
      movieUrl: `https://vidora.su/movie/{id}?autoplay=true&colour=2392EE&autonextepisode=true&pausescreen=false`,
      tvUrl: `https://vidora.su/tv/{id}/{season}/{episode}?autoplay=true&colour=2392EE&autonextepisode=true&pausescreen=false`,
    },
    {
      name: 'VidsrcCC',
      movieUrl: `https://vidsrc.cc/v3/embed/movie/{id}?autoPlay=false&poster=false`,
      tvUrl: `https://vidsrc.cc/v3/embed/tv/{id}/{season}/{episode}?autoPlay=false&poster=false`
    },
    {
      name: 'VidFast',
      movieUrl: `https://vidfast.pro/movie/{id}?autoPlay=false&theme=2392EE&poster=false`,
      tvUrl: `https://vidfast.pro/tv/{id}/{season}/{episode}?autoPlay=false&theme=2392EE&poster=false`
    },
    {
      name: 'Videasy',
      movieUrl: `https://player.videasy.net/movie/{id}?color=2392EE`,
      tvUrl: `https://player.videasy.net/tv/{id}/{season}/{episode}?color=2392EE&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=false`
    },
    {
      name: 'Pahe (Anime)',
      tvOnly: true,
      tvUrl: `/embed/animepahe/{id}/{season}/{episode}`
    }
  ];