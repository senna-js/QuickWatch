/**
 * Error Components
 * Reusable error message components for the QuickWatch application
 */

/**
 * Renders an error message
 * @param {string} title - The error title
 * @param {string} message - The error message
 * @param {string} buttonText - The text for the action button
 * @param {string} buttonAction - The JavaScript action for the button
 * @returns {string} The HTML for the error message
 */
export function renderError(title = 'Error', message = 'Something went wrong', buttonText = '', buttonAction = "window.history.pushState(null, null, '/'); window.dispatchEvent(new PopStateEvent('popstate'))") {
  const buttonHtml = buttonText ? `
    <button onclick="${buttonAction}" 
        class="px-6 py-3 bg-white text-black rounded-md hover:bg-zinc-200 transition">
        ${buttonText}
    </button>
  ` : '';

  return `
    <div class="flex flex-col items-center justify-center h-screen">
      <i class="fas fa-exclamation-circle text-4xl mb-4 text-red-500"></i>
      <h1 class="text-4xl font-bold mb-4">${title}</h1>
      <p class="text-xl mb-8">${message}</p>
      ${buttonHtml}
    </div>
  `;
}

/**
 * Renders a search error message
 * @param {string} message - The error message
 * @returns {string} The HTML for the search error message
 */
export function renderSearchError(message = 'Something went wrong. Please try again later.') {
  return `
    <div class="col-span-5 text-center py-12">
      <i class="fas fa-exclamation-circle text-4xl mb-4 text-red-500"></i>
      <h2 class="text-2xl font-bold mb-2">Search Error</h2>
      <p class="text-zinc-400">${message}</p>
    </div>
  `;
}

/**
 * Renders an alert message
 * @param {string} title - The alert title
 * @param {string} message - The alert message
 * @param {string} type - The alert type ('info', 'warning', 'error', or 'success')
 * @returns {string} The HTML for the alert message
 */
export function renderAlert(title, message, type = 'info') {
  const alertStyles = {
    info: {
      border: 'border-zinc-300',
      text: 'text-zinc-200',
      icon: 'fa-info-circle text-zinc-200'
    },
    warning: {
      border: 'border-amber-500',
      text: 'text-amber-400',
      icon: 'fa-exclamation-triangle text-amber-400'
    },
    error: {
      border: 'border-red-500',
      text: 'text-red-400',
      icon: 'fa-exclamation-circle text-red-400'
    },
    success: {
      border: 'border-green-500',
      text: 'text-green-400',
      icon: 'fa-check-circle text-green-400'
    }
  };
  
  const style = alertStyles[type] || alertStyles.info;
  
  return `
    <div class="bg-zinc-800 border-l-4 ${style.border} ${style.text} p-4 mb-8 rounded shadow-md">
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-0.5">
          <i class="fas ${style.icon} text-xl"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-medium">${title}</h3>
          <p class="mt-1 text-zinc-400">${message}</p>
        </div>
      </div>
    </div>
  `;
}