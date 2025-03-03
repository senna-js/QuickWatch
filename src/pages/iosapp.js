// iOS App Page

import { renderHeader } from '../components/header.js';

/**
 * Renders the iOS app installation instructions page
 * @param {HTMLElement} container
 */
export function renderIOSAppPage(container) {
  container.innerHTML = `
    <div id="header" class="transition-opacity duration-300">
      ${renderHeader()}
    </div>
    
    <div class="md:ml-16 p-4 md:p-12 pb-20 md:pb-12">
      <div class="max-w-2xl mx-auto text-center">
        <i class="fab fa-apple text-6xl mb-6 mt-6"></i>
        <h1 class="text-3xl md:text-4xl font-bold mb-6">Installing QuickWatch on your iPhone/iPad</h1>
        
        <div class="space-y-8 text-left">
          <div class="bg-zinc-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Step 1: Open QuickWatch in Safari</h2>
            <p class="text-zinc-300">Make sure you're using Safari browser. Most other browsers don't support adding apps to the home screen.</p>
          </div>
          
          <div class="bg-zinc-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Step 2: Tap the Share button</h2>
            <p class="text-zinc-300">Tap the Share button (the square with an arrow pointing upward) at the bottom of the browser.</p>
          </div>
          
          <div class="bg-zinc-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Step 3: Add to the Home Screen</h2>
            <p class="text-zinc-300">Scroll down and tap "Add to Home Screen" (it might be a square with a plus sign in it). When clicked, click the blue Add button in the top right.</p>
          </div>
          
          <div class="bg-zinc-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Step 4: Launch as an App</h2>
            <p class="text-zinc-300">Now you can launch QuickWatch from your home screen like it's an actual app!</p>
          </div>
        </div>
      </div>
    </div>
  `;

  let lastScrollY = window.scrollY;
  const header = container.querySelector('#header');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY) { header.style.opacity = '0'; } else { header.style.opacity = '1'; }
    
    lastScrollY = currentScrollY;
  });
}