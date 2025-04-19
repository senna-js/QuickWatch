// Movies Page
import { renderHeader } from '../../components/header.js';

/**
 * Renders the genres page
 * @param {HTMLElement} container
 */
export function renderGenresPage(container) {  
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="pt-24 pb-20 md:pb-0 bg-[#00050d]">
      <div class="px-[4.4rem]">
        <h1 class="text-4xl font-bold mb-8 font-medium">Genres</h1>
        <p class="text-lg">Coming soon. This page will display all the genres.</p>
      </div>
    </div>
  `;
}