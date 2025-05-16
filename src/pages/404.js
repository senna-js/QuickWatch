// 404 Not Found Page

export function render404Page(container) {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-6xl font-bold mb-4">404</h1>
      <p class="text-xl mb-8">Page not found</p>
      <button class="px-6 py-3 bg-text-primary text-black rounded-md hover:bg-gray-200 transition"
        onclick="window.history.pushState(null, null, '/'); window.dispatchEvent(new PopStateEvent('popstate'))">
        Back to Home
      </button>
    </div>
  `;
}