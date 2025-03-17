// Vite Router

import { renderHomePage } from './pages/home/home.js';
import { renderWatchlistPage } from './pages/watchlist/watchlist.js';
import { renderSearchPage } from './pages/search/search.js';
import { renderDetailsPage } from './pages/details/details.js';
import { render404Page } from './pages/404.js';
import { renderDownloadDetailsPage } from './pages/download/download-details.js';
import { renderIOSAppPage } from './pages/iosapp.js';
import { renderAnimePaheEmbed } from './pages/details/animepahe-embed.js';

export const TMDB_API_KEY = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

let currentPagePromise = Promise.resolve();

export function initRouter() {
  const appContainer = document.querySelector('#app');
  if (!appContainer) return;
  
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) {
      return;
    }
    
    e.preventDefault();
    navigateTo(href);
  });
  
  window.addEventListener('popstate', () => {
    handleRoute();
  });
  
  handleRoute();
  
  return {
    getCurrentPagePromise: () => currentPagePromise
  };
}

export function navigateTo(path) {
  if (path.match(/^\/dl\/movie\/[\d]+$/) || path.match(/^\/dl\/tv\/[\d]+$/)) {
    if (window.splashScreen && !path.match(/^\/download/) && !path.match(/^\/search/) && !path.match(/^\/watchlist/)) {
      window.splashScreen.show();
    }
  }
  
  history.pushState(null, null, path);
  handleRoute();
}

function handleRoute() {
  const path = window.location.pathname;
  const appContainer = document.querySelector('#app');
  
  if (path === '/search' || path === '/watchlist') {
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
  }
  
  if (path === '/') {
    document.title = 'QuickWatch';
    currentPagePromise = Promise.resolve(renderHomePage(appContainer));
  } 
  else if (path === '/watchlist') {
    document.title = 'QW Watchlist';
    currentPagePromise = Promise.resolve(renderWatchlistPage(appContainer));
  } 
  else if (path === '/search') {
    document.title = 'QW Search';
    currentPagePromise = Promise.resolve(renderSearchPage(appContainer));
  }
  else if (path.match(/^\/movie\/[\d]+$/)) {
    document.title = 'QW Movie';
    const id = path.split('/')[2];
    currentPagePromise = Promise.resolve(renderDetailsPage(appContainer, { type: 'movie', id }));
  } 
  else if (path.match(/^\/tv\/[\d]+$/)) {
    document.title = 'QW TV';
    const id = path.split('/')[2];
    currentPagePromise = Promise.resolve(renderDetailsPage(appContainer, { type: 'tv', id }));
  } 
  else if (path.match(/^\/dl\/movie\/[\d]+$/) || path.match(/^\/dl\/tv\/[\d]+$/)) {
    document.title = 'QW Download';
    const parts = path.split('/');
    const type = parts[2];
    const id = parts[3];
    currentPagePromise = renderDownloadDetailsPage(appContainer, { type, id });
  }
  else if (path === '/iosapp') {
    document.title = 'QW iOS App';
    currentPagePromise = Promise.resolve(renderIOSAppPage(appContainer));
  }
  else if (path.match(/^\/embed\/animepahe\/[\d]+\/[\d]+$/)) {
    document.title = 'AnimePahe Embed';
    const parts = path.split('/');
    const id = parts[3];
    const episode = parts[4];
    currentPagePromise = Promise.resolve(renderAnimePaheEmbed(appContainer, { id, episode }));
  }
  else {
    document.title = 'QW 404';
    currentPagePromise = Promise.resolve(render404Page(appContainer));
  }
  
  return currentPagePromise;
}