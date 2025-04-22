// empty state

export function renderNoResults(title = 'No results found', message = 'Try a different search term', icon = 'fa-search') {
  return `
    <div class="col-span-5 text-center py-12">
      <i class="fas ${icon} text-4xl mb-4 text-zinc-500"></i>
      <h2 class="text-2xl font-bold mb-2">${title}</h2>
      <p class="text-zinc-400">${message}</p>
    </div>
  `;
}

export function renderEmptyList(title = 'Nothing here yet', message = 'Items you add will appear here', icon = 'fa-list') {
  return `
    <div class="text-center py-16">
      <i class="fas ${icon} text-4xl mb-4 text-zinc-500"></i>
      <h2 class="text-2xl font-bold mb-2">${title}</h2>
      <p class="text-zinc-400">${message}</p>
    </div>
  `;
}

export function renderEmptyWithAction(title, message, buttonText, buttonAction, icon = 'fa-plus-circle') {
  return `
    <div class="text-center py-16">
      <i class="fas ${icon} text-4xl mb-4 text-zinc-500"></i>
      <h2 class="text-2xl font-bold mb-2">${title}</h2>
      <p class="text-zinc-400 mb-6">${message}</p>
      <button onclick="${buttonAction}" 
          class="px-6 py-3 bg-white text-black rounded-md hover:bg-zinc-200 transition">
          ${buttonText}
      </button>
    </div>
  `;
}