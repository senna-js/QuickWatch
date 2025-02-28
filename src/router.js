// QuickWatch Vite Router

// Import page components
import { renderHomePage } from './pages/home/home.js';
import { renderWatchlistPage } from './pages/watchlist/watchlist.js';
import { renderSearchPage } from './pages/search/search.js';
import { renderDetailsPage } from './pages/details/details.js';
import { render404Page } from './pages/404.js';

// TMDB API configuration
export const TMDB_API_KEY = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// Main router function
export function initRouter() {
  // Get the app container
  const appContainer = document.querySelector('#app');
  if (!appContainer) return;
  
  // Handle navigation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    // Only handle internal links
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) {
      return;
    }
    
    // Prevent default link behavior and handle routing
    e.preventDefault();
    navigateTo(href);
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    handleRoute();
  });
  
  // Initial route handling
  handleRoute();
}

// Navigate to a specific path
export function navigateTo(path) {
  history.pushState(null, null, path);
  handleRoute();
}

// Handle current route
function handleRoute() {
  const path = window.location.pathname;
  const appContainer = document.querySelector('#app');
  
  // Match route patterns
  if (path === '/') {
    document.title = 'QuickWatch - Movie Streaming';
    renderHomePage(appContainer);
  } 
  else if (path === '/watchlist') {
    document.title = 'QuickWatch - Watchlist';
    renderWatchlistPage(appContainer);
  } 
  else if (path === '/search') {
    document.title = 'QuickWatch - Search';
    renderSearchPage(appContainer);
  } 
  else if (path.match(/^\/movie\/[\d]+$/)) {
    document.title = 'QuickWatch - Movie Details';
    const id = path.split('/')[2];
    renderDetailsPage(appContainer, { type: 'movie', id });
  } 
  else if (path.match(/^\/tv\/[\d]+$/)) {
    document.title = 'QuickWatch - TV Show Details';
    const id = path.split('/')[2];
    renderDetailsPage(appContainer, { type: 'tv', id });
  } 
  else {
    document.title = 'QuickWatch - Page Not Found';
    render404Page(appContainer);
  }
}