// QuickWatch - Main Entry Point
import './style.css'
import './spinner.css'
import { initRouter } from './router.js'

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the router
  initRouter();
});
