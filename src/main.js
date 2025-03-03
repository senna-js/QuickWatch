import './style.css'
import './spinner.css'
import './splash.css'
import { initRouter } from './router.js'

window.splashScreen = {
  element: null,
  show: function() {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.className = 'splash-screen';
      this.element.innerHTML = `
        <div class="splash-container">
          <img src="/logo_transparent.png" alt="QuickWatch" class="splash-logo">
          <div class="splash-spinner"></div>
        </div>
      `;
      document.body.appendChild(this.element);
    } else {
      this.element.classList.remove('hidden');
    }
  },
  hide: function() {
    if (this.element) {
      this.element.classList.add('hidden');
      setTimeout(() => {
        if (this.element.classList.contains('hidden')) {
          this.element.remove();
          this.element = null;
        }
      }, 500);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  if (currentPath !== '/download' && currentPath !== '/search' && currentPath !== '/watchlist') {
    window.splashScreen.show();
  }

  const router = initRouter();
  window.addEventListener('load', async () => {
    try {
      await router.getCurrentPagePromise();
    } catch (error) {
      console.error('Error waiting for page to load:', error);
    }
    
    if (currentPath !== '/download' && currentPath !== '/search' && currentPath !== '/watchlist') {
      window.splashScreen.hide();
    }
  });
});
