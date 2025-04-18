import './style.css'
import './spinner.css'
import './splash.css'
import { initRouter } from './router.js'

window.splashScreen = {
  element: null,
  stepsContainer: null,
  steps: [],
  show: function() {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.className = 'splash-screen';
      this.element.innerHTML = `
        <div class="splash-container">
          <h1 class="splash-title text-6xl mb-4" style="font-family: 'Instrument Serif';">quickwatch</h1>
          <div class="splash-spinner"></div>
          <div class="splash-steps"></div>
        </div>
      `;
      document.body.appendChild(this.element);
      this.stepsContainer = this.element.querySelector('.splash-steps');
    } else {
      this.element.classList.remove('hidden');
    }
  },
  hide: function() {
    if (this.element && document.body.contains(this.element)) {
      this.element.classList.add('hidden');
      setTimeout(() => {
        if (this.element && document.body.contains(this.element) && 
            this.element.classList.contains('hidden')) {
          this.element.remove();
          this.element = null;
          this.stepsContainer = null;
          this.steps = [];
        }
      }, 500);
    }
  },
  addStep: function(stepText) {
    if (!this.stepsContainer) return;
    
    const stepId = `step-${this.steps.length}`;
    const stepElement = document.createElement('div');
    stepElement.className = 'splash-step';
    stepElement.id = stepId;
    stepElement.innerHTML = `
      <div class="step-loader"></div>
      <span>${stepText}</span>
    `;
    
    this.stepsContainer.appendChild(stepElement);
    const step = { 
      id: stepId, 
      text: stepText, 
      completed: false,
      failed: false,
      timeout: setTimeout(() => this.failStep(stepId), 7000)
    };
    this.steps.push(step);
    
    return stepId;
  },
  completeStep: function(stepId) {
    if (!this.stepsContainer) return;
    
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      const loader = stepElement.querySelector('.step-loader');
      if (loader) {
        loader.innerHTML = '<i class="fas fa-check"></i>';
        loader.classList.add('completed');
      }
      
      const stepIndex = this.steps.findIndex(step => step.id === stepId);
      if (stepIndex !== -1) {
        // Clear the timeout since the step completed successfully
        clearTimeout(this.steps[stepIndex].timeout);
        this.steps[stepIndex].completed = true;
      }
    }
  },
  failStep: function(stepId) {
    if (!this.stepsContainer) return;
    
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      const loader = stepElement.querySelector('.step-loader');
      if (loader) {
        loader.innerHTML = '<i class="fas fa-times"></i>'; // Use X icon
        loader.classList.add('failed');                    // Add failed class
      }
      
      const stepIndex = this.steps.findIndex(step => step.id === stepId);
      if (stepIndex !== -1) {
        this.steps[stepIndex].failed = true;
      }
      
      // Add this: Hide splash screen after a short delay when a step fails
      setTimeout(() => this.hide(), 500);
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
