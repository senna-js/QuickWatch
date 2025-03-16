/**
 * Loading Components
 * Reusable loading components for the QuickWatch application
 */

/**
 * Renders a loading spinner
 * @param {string} size - The size of the spinner ('small', 'medium', or 'large')
 * @param {boolean} centered - Whether to center the spinner in its container
 * @returns {string} The HTML for the spinner
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

/**
 * Renders a full-page loading spinner
 * @returns {string} The HTML for the full-page spinner
 */
export function renderFullPageSpinner() {
  return `
    <div class="flex justify-center items-center h-screen">
      ${renderSpinner('large')}
    </div>
  `;
}