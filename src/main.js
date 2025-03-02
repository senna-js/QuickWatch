import './style.css'
import './spinner.css'
import './splash.css'
import { initRouter } from './router.js'

document.addEventListener('DOMContentLoaded', () => {
  const splashScreen = document.createElement('div');
  splashScreen.className = 'splash-screen';
  splashScreen.innerHTML = `
    <div class="splash-container">
      <img src="/src/logo_transparent.png" alt="QuickWatch" class="splash-logo">
      <div class="splash-spinner"></div>
    </div>
  `;
  document.body.appendChild(splashScreen);

  const router = initRouter();
  window.addEventListener('load', async () => {
    // Check if we're on the download details page
    const isDownloadDetails = window.location.pathname.startsWith('/download/');
    
    if (isDownloadDetails) {
      // Wait for the download details to finish loading
      try {
        await router.getCurrentPagePromise();
      } catch (error) {
        console.error('Error waiting for download details:', error);
      }
    }
    
    // Hide splash screen
    splashScreen.classList.add('hidden');
    setTimeout(() => splashScreen.remove(), 500);
  });
});
