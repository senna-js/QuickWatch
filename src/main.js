import './style.css'
import './spinner.css'
import './splash.css'
import { initRouter } from './router.js'

window.splashScreen = {
  element: null,
  stepsContainer: null,
  steps: [],
  progressBar: null,
  progressFill: null,
  totalSteps: 0,
  completedSteps: 0,
  isHiding: false,
  
  show: function() {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.className = 'splash-screen';
      this.element.innerHTML = `
        <div class="splash-container">
          <div class="splash-spinner"></div>
          <div class="splash-progress-container">
            <div class="splash-progress-bar">
              <div class="splash-progress-fill"></div>
            </div>
            <div class="splash-progress-text">Loading...</div>
          </div>
          <div class="splash-steps hidden"></div>
        </div>
      `;
      document.body.appendChild(this.element);
      this.stepsContainer = this.element.querySelector('.splash-steps');
      this.progressBar = this.element.querySelector('.splash-progress-bar');
      this.progressFill = this.element.querySelector('.splash-progress-fill');
      this.progressText = this.element.querySelector('.splash-progress-text');
    } else {
      this.element.classList.remove('hidden');
    }
    
    this.totalSteps = 0;
    this.completedSteps = 0;
    this.updateProgress();
  },
  
  hide: function() {
    if (this.isHiding) return;
    
    if (this.totalSteps > 0 && this.completedSteps < this.totalSteps) {
      this.isHiding = true;
      this.completedSteps = this.totalSteps;
      this.updateProgress();
      
      setTimeout(() => {
        this._performHide();
      }, 500);
    } else {
      this._performHide();
    }
  },
  
  _performHide: function() {
    if (this.element && document.body.contains(this.element)) {
      this.element.classList.add('hidden');
      setTimeout(() => {
        if (this.element && document.body.contains(this.element) && 
            this.element.classList.contains('hidden')) {
          this.element.remove();
          this.element = null;
          this.stepsContainer = null;
          this.progressBar = null;
          this.progressFill = null;
          this.progressText = null;
          this.steps = [];
          this.totalSteps = 0;
          this.completedSteps = 0;
          this.isHiding = false;
        }
      }, 500);
    }
  },
  
  updateProgress: function() {
    if (!this.progressFill) return;
    
    const percent = this.totalSteps > 0 ? (this.completedSteps / this.totalSteps) * 100 : 0;
    this.progressFill.style.width = `${percent}%`;
    
    if (this.progressText) {
      if (this.totalSteps === 0) {
        this.progressText.textContent = 'Loading...';
      } else {
        this.progressText.textContent = `Fully loaded`;
      }
    }
  },
  
  addStep: function(stepText) {
    this.totalSteps++;
    this.updateProgress();
    
    const stepId = `step-${this.steps.length}`;
    const step = { 
      id: stepId, 
      text: stepText, 
      completed: false,
      failed: false,
      timeout: setTimeout(() => this.failStep(stepId), 7000)
    };
    this.steps.push(step);
    
    if (this.progressText) {
      this.progressText.textContent = stepText;
    }
    
    return stepId;
  },
  
  completeStep: function(stepId) {
    const stepIndex = this.steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      // Clear the timeout since the step completed successfully
      clearTimeout(this.steps[stepIndex].timeout);
      this.steps[stepIndex].completed = true;
      
      this.completedSteps++;
      this.updateProgress();
    }
  },
  
  failStep: function(stepId) {
    const stepIndex = this.steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      this.steps[stepIndex].failed = true;
      
      setTimeout(() => this.hide(), 500);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  if (currentPath !== '/' && currentPath !== '/tv' && currentPath !== '/movies' && currentPath !== '/download' && currentPath !== '/search' && currentPath !== '/watchlist') {
    window.splashScreen.show();
  }

  const router = initRouter();
  window.addEventListener('load', async () => {
    try {
      await router.getCurrentPagePromise();
    } catch (error) {
      console.error('Error waiting for page to load:', error);
    }
    
    if (currentPath !== '/' && currentPath !== '/tv' && currentPath !== '/movies' !== '/download' && currentPath !== '/search' && currentPath !== '/watchlist') {
      window.splashScreen.hide();
    }
  });
});
