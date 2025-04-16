// Header Component

/**
 * Renders the navigation header with both desktop and mobile versions
 * @returns {string} The header HTML
 */
export function renderHeader() {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || (window.opera && opera.toString() === `[object Opera]`));
  const isStandalone = window.navigator.standalone;
  const showIOSInstall = isIOS && !isStandalone;
  
  const currentPath = window.location.pathname;
  const isHome = currentPath === '/' || currentPath === '/index.html';
  const isMovies = currentPath === '/movies';
  const isTv = currentPath === '/tv';
  const isWatchlist = currentPath === '/watchlist';
  const isSearch = currentPath === '/search';

  setTimeout(() => {
    const header = document.querySelector('header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 10) { header.classList.add('scrolled'); }
        else { header.classList.remove('scrolled'); }
      });
    }
  }, 100);

  return `
    <header class="fixed top-0 left-0 mx-[4rem] bg-transparent transition-all duration-200 rounded-b-2xl z-50 py-3 px-[1rem] pl-[2rem] text-white items-center text-md flex flex-row justify-between hidden md:flex" style="width: calc(100% - 8rem)">
      <div class="flex items-center flex-row gap-2">
        <a href="/" class="text-2xl mr-6 logo" style="font-family: 'Instrument Serif';">quickwatch</a>
        <a href="/" class="px-4 py-2 rounded-lg pagebtn ${isHome ? 'active' : ''}">Home</a>
        <a href="/movies" class="px-4 py-2 rounded-lg pagebtn ${isMovies ? 'active' : ''}">Movies</a>
        <a href="/tv" class="px-4 py-2 rounded-lg pagebtn ${isTv ? 'active' : ''}">TV shows</a>
      </div>
      <div class="flex items-center flex-row gap-2">
        <a href="/watchlist" class="px-4 py-2 rounded-lg pagebtn ${isWatchlist ? 'active' : ''}">Watchlist</a>
        <a href="/search" class="px-4 py-2 rounded-lg pagebtn ${isSearch ? 'active' : ''}">Search</a>
      </div>
    </header>
    
    <style>
      header.scrolled {
        background-color: rgba(25,30,37,.8);
        backdrop-filter: blur(16px);
      }
    </style>
    
    <div class="fixed bottom-[-2px] left-0 w-full flex justify-around items-center py-4 pb-8 z-50 md:hidden bg-zinc-950">
      <a href="/" class="text-zinc-400 hover:text-white ${isHome ? 'text-white' : ''} flex flex-col items-center">
        <i class="icon-home text-2xl"></i>
        <span class="text-xs mt-1">Home</span>
      </a>
      <a href="/search" class="text-zinc-400 hover:text-white ${isSearch ? 'text-white' : ''} flex flex-col items-center">
        <i class="icon-search text-2xl"></i>
        <span class="text-xs mt-1">Search</span>
      </a>
      <a href="/watchlist" class="text-zinc-400 hover:text-white ${isWatchlist ? 'text-white' : ''} flex flex-col items-center">
        <i class="icon-bookmark text-2xl"></i>
        <span class="text-xs mt-1">Watchlist</span>
      </a>
      ${showIOSInstall ? `
      <a href="/iosapp" class="text-zinc-400 hover:text-white flex flex-col items-center">
        <i class="fab fa-apple text-xl"></i>
        <span class="text-xs mt-1">Install</span>
      </a>
      ` : ''}
    </div>
  `;
}