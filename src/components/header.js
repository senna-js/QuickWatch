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
  const isMovies = currentPath.startsWith('/movies');
  const isTv = currentPath.startsWith('/tv');
  const isWatchlist = currentPath.startsWith('/watchlist');
  const isSearch = currentPath.startsWith('/search');

  return `
    <header class="absolute top-0 left-0 w-full z-10 py-4 px-[4.4rem] text-white items-center text-md flex flex-row gap-2">
      <a href="/" class="text-2xl mr-6 logo" style="font-family: 'Instrument Serif';">quickwatch</a>
      <a href="/" class="px-4 py-2 rounded-lg pagebtn ${isHome ? 'active' : ''}">Home</a>
      <a href="/movies" class="px-4 py-2 rounded-lg pagebtn ${isMovies ? 'active' : ''}">Movies</a>
      <a href="/tv" class="px-4 py-2 rounded-lg pagebtn ${isTv ? 'active' : ''}">TV shows</a>
      <a href="/watchlist" class="px-4 py-2 rounded-lg pagebtn ${isWatchlist ? 'active' : ''}">Watchlist</a>
      <a href="/search" class="px-4 py-2 rounded-lg pagebtn ${isSearch ? 'active' : ''}">Search</a>
    </header>
    
    <div class="fixed bottom-0 left-0 w-full flex justify-around items-center py-4 pb-8 z-50 md:hidden bg-zinc-950">
      <a href="/" class="text-zinc-400 hover:text-white ${isHome ? 'text-white' : ''}">
        <i class="icon-home text-2xl"></i>
      </a>
      <a href="/search" class="text-zinc-400 hover:text-white ${isSearch ? 'text-white' : ''}">
        <i class="icon-search text-2xl"></i>
      </a>
      <a href="/watchlist" class="text-zinc-400 hover:text-white ${isWatchlist ? 'text-white' : ''}">
        <i class="icon-bookmark text-2xl"></i>
      </a>
      ${showIOSInstall ? `
      <a href="/iosapp" class="text-zinc-400 hover:text-white">
        <i class="fab fa-apple text-xl"></i>
      </a>
      ` : ''}
    </div>
  `;
}