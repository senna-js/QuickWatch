/**
 * Loading Components
 * Reusable loading components for the QuickWatch application
 */

export function renderSpinner(size = 'medium', centered = true) {
  const spinnerSize = size === 'large' ? 'ispinner-large' : 
                     size === 'small' ? '' : 'ispinner-medium';
  
  const centerClass = centered ? 'flex justify-center items-center' : '';
  
  return `
    <div class="${centerClass}">
      <div class="spinner-container active text-center">
        <div class="ispinner ${spinnerSize} mx-auto">
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
        </div>
      </div>
    </div>
  `;
}

export function renderFullPageSpinner() {
  return `
    <div class="flex justify-center items-center h-screen">
      ${renderSpinner('large')}
    </div>
  `;
}