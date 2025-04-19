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
        <a href="/" class="text-2xl mr-6 hover:text-[#2392EE]" style="font-family: 'Instrument Serif';">quickwatch</a>
        <a href="/" class="px-4 py-2 rounded-lg pagebtn ${isHome ? 'active' : ''}">Home</a>
        <a href="/movies" class="px-4 py-2 rounded-lg pagebtn ${isMovies ? 'active' : ''}">Movies</a>
        <a href="/tv" class="px-4 py-2 rounded-lg pagebtn ${isTv ? 'active' : ''}">TV shows</a>
      </div>
      <div class="flex items-center flex-row gap-2">
        <a href="/search" class="px-3 py-2 rounded-full pagebtn ${isSearch ? 'active' : ''}"><i class="fas fa-search aspect-square"></i></a>
        <a href="/genres" class="p-2 rounded-full pagebtn ${isSearch ? 'active' : ''}">
          <svg width="24" height="24" class="scale-[80%]" xmlns="http://www.w3.org/2000/svg"><path d="M4.580 3.047 C 3.859 3.185,3.199 3.848,3.044 4.592 C 2.905 5.257,3.105 5.912,3.596 6.404 C 4.393 7.200,5.607 7.200,6.404 6.404 C 7.200 5.607,7.200 4.393,6.404 3.596 C 5.913 3.106,5.277 2.914,4.580 3.047 M11.580 3.047 C 10.859 3.185,10.199 3.848,10.044 4.592 C 9.789 5.816,10.751 7.000,12.000 7.000 C 13.080 7.000,14.000 6.080,14.000 5.000 C 14.000 4.477,13.790 3.983,13.404 3.596 C 12.913 3.106,12.277 2.914,11.580 3.047 M18.580 3.047 C 17.859 3.185,17.199 3.848,17.044 4.592 C 16.789 5.816,17.751 7.000,19.000 7.000 C 19.920 7.000,20.768 6.310,20.956 5.408 C 21.095 4.743,20.895 4.088,20.404 3.596 C 19.913 3.106,19.277 2.914,18.580 3.047 M4.580 10.047 C 4.236 10.113,3.883 10.310,3.596 10.596 C 2.800 11.393,2.800 12.607,3.596 13.404 C 4.393 14.200,5.607 14.200,6.404 13.404 C 7.200 12.607,7.200 11.393,6.404 10.596 C 5.913 10.106,5.277 9.914,4.580 10.047 M11.580 10.047 C 10.707 10.214,10.000 11.087,10.000 12.000 C 10.000 12.920,10.690 13.768,11.592 13.956 C 12.816 14.211,14.000 13.249,14.000 12.000 C 14.000 11.477,13.790 10.983,13.404 10.596 C 12.913 10.106,12.277 9.914,11.580 10.047 M18.580 10.047 C 17.707 10.214,17.000 11.087,17.000 12.000 C 17.000 12.920,17.690 13.768,18.592 13.956 C 19.816 14.211,21.000 13.249,21.000 12.000 C 21.000 11.477,20.790 10.983,20.404 10.596 C 19.913 10.106,19.277 9.914,18.580 10.047 M4.580 17.047 C 3.859 17.185,3.199 17.848,3.044 18.592 C 2.789 19.816,3.751 21.000,5.000 21.000 C 5.920 21.000,6.768 20.310,6.956 19.408 C 7.095 18.743,6.895 18.088,6.404 17.596 C 5.913 17.106,5.277 16.914,4.580 17.047 M11.580 17.047 C 10.859 17.185,10.199 17.848,10.044 18.592 C 9.789 19.816,10.751 21.000,12.000 21.000 C 13.080 21.000,14.000 20.080,14.000 19.000 C 14.000 18.477,13.790 17.983,13.404 17.596 C 12.913 17.106,12.277 16.914,11.580 17.047 M18.580 17.047 C 17.859 17.185,17.199 17.848,17.044 18.592 C 16.789 19.816,17.751 21.000,19.000 21.000 C 20.080 21.000,21.000 20.080,21.000 19.000 C 21.000 18.477,20.790 17.983,20.404 17.596 C 19.913 17.106,19.277 16.914,18.580 17.047 " fill="currentColor" stroke="none" fill-rule="evenodd"></path></svg>
        </a>
        <a href="/watchlist" class="p-2 rounded-full pagebtn ${isWatchlist ? 'active' : ''}">
          <svg width="24" height="24" class="scale-[80%]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.120 2.060 C 5.795 2.140,5.568 2.248,5.300 2.452 C 4.948 2.720,4.755 2.990,4.593 3.440 L 4.500 3.700 4.489 12.237 C 4.482 17.760,4.493 20.850,4.518 20.989 C 4.626 21.574,5.032 21.943,5.620 21.990 C 5.817 22.006,5.910 21.991,6.102 21.913 C 6.233 21.860,7.613 21.103,9.170 20.230 L 12.000 18.645 14.830 20.230 C 16.386 21.103,17.767 21.860,17.898 21.913 C 18.090 21.991,18.183 22.006,18.380 21.990 C 18.968 21.943,19.374 21.574,19.482 20.989 C 19.507 20.850,19.518 17.760,19.511 12.237 L 19.500 3.700 19.407 3.442 C 19.171 2.789,18.725 2.342,18.080 2.113 L 17.820 2.020 12.080 2.013 C 7.380 2.007,6.300 2.016,6.120 2.060 M17.120 11.560 C 17.120 15.542,17.109 18.800,17.097 18.800 C 17.084 18.800,16.071 18.239,14.847 17.553 C 13.622 16.868,12.542 16.272,12.446 16.230 C 12.208 16.125,11.789 16.126,11.547 16.233 C 11.447 16.277,10.367 16.872,9.146 17.556 C 7.926 18.240,6.916 18.800,6.903 18.800 C 6.891 18.800,6.880 15.542,6.880 11.560 L 6.880 4.320 12.000 4.320 L 17.120 4.320 17.120 11.560 " fill="currentColor" stroke="none" fill-rule="evenodd"></path></svg>
        </a>
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