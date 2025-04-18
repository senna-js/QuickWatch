// Movies Page
import { renderHeader } from '../../components/header.js';

/**
 * Renders the streaming page
 * @param {HTMLElement} container
 */
export function renderStreamingPage(container) {  
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="pt-24 pb-20 md:pb-0 bg-[#00050d]">
      <div class="px-[4.4rem]">
        <h1 class="text-4xl font-bold mb-8 font-medium">Streaming</h1>
        <p class="text-lg">Coming soon. This page will display the best sites to watch movies for free.</p>
      </div>
    </div>
  `;
}