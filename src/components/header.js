// Header Component

/**
 * Renders the navigation header with both desktop and mobile versions
 * @returns {string} The header HTML
 */
export function renderHeader() {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || (window.opera && opera.toString() === `[object Opera]`));
  const isStandalone = window.navigator.standalone;
  const showIOSInstall = isIOS && !isStandalone;

  return `
    <div class="fixed left-0 top-0 h-full w-16 flex flex-col items-center py-8 space-y-8 z-10 hidden md:flex justify-center bg-[#000000bf]">
      <a href="/" class="text-zinc-400 hover:text-white">
        <i class="icon-home text-2xl"></i>
      </a>
      <a href="/search" class="text-zinc-400 hover:text-white">
        <i class="icon-search text-2xl"></i>
      </a>
      <a href="/watchlist" class="text-zinc-400 hover:text-white">
        <i class="icon-bookmark text-2xl"></i>
      </a>
      <a href="/download" class="text-zinc-400 hover:text-white">
        <i class="icon-download text-2xl"></i>
      </a>
      ${showIOSInstall ? `
      <a href="/iosapp" class="text-zinc-400 hover:text-white">
        <i class="fab fa-apple text-2xl"></i>
      </a>
      ` : ''}
    </div>
  
    <div class="fixed bottom-0 left-0 w-full flex justify-around items-center py-4 pb-8 z-50 md:hidden bg-zinc-950">
      <a href="/" class="text-zinc-400 hover:text-white">
        <i class="icon-home text-2xl"></i>
      </a>
      <a href="/search" class="text-zinc-400 hover:text-white">
        <i class="icon-search text-2xl"></i>
      </a>
      <a href="/watchlist" class="text-zinc-400 hover:text-white">
        <i class="icon-bookmark text-2xl"></i>
      </a>
      <a href="/download" class="text-zinc-400 hover:text-white">
        <i class="icon-download text-2xl"></i>
      </a>
      ${showIOSInstall ? `
      <a href="/iosapp" class="text-zinc-400 hover:text-white">
        <i class="fab fa-apple text-xl"></i>
      </a>
      ` : ''}
    </div>
  `;
}