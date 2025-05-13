export function renderAnimeCard(animeData) {
    if (!animeData || !animeData.id) {
      return '';
    }
    console.log(animeData);
    const posterUrl = animeData.poster || `https://placehold.co/300x450/141414/fff/?text=${encodeURIComponent(animeData.title || 'Anime')}&font=poppins`;
    const title = animeData.title || 'Unknown Anime';
    const tags = renderAnimeTags(animeData);
    
    return `
      <a class="overflow-hidden shadow-lg" data-anime-id="${animeData.id}" href="/anime/${animeData.id}">
        <div class="relative">
          <div class="aspect-[2/3] relative">
            <img src="${posterUrl}" alt="${title}" class="w-full h-full object-cover rounded-lg cursor-pointer">
          </div>
          <div class="pt-1 flex flex-wrap gap-1">
            <span class="text-base font-medium text-white block w-full truncate">${title}</span>
            ${tags}
          </div>
        </div>
      </a>
    `;
}

export function renderAnimeTags(animeData) {
    const tags = [];

    // Add HD tag
    tags.push(`
      <span class="text-xs bg-[#1C1D21] border border-[#24262B] px-1.5 py-0.5 rounded-md hover:bg-white hover:text-[#1C1D21] transition duration-200 ease cursor-pointer">HD</span>
    `);

    // Add sub count
    if (animeData.tvInfo.sub) {
        tags.push(`
          <span class="text-xs bg-[#1C1D21] border border-[#24262B] px-1.5 py-0.5 rounded-md flex items-center justify-center group hover:bg-white hover:text-[#1C1D21] transition duration-200 ease cursor-pointer">
            <span class="bg-white text-black px-1 pt-[0.08rem] pb-[0.03rem] rounded-sm mr-1 text-[0.5rem] group-hover:bg-[#1C1D21] group-hover:text-white">CC</span>
            ${animeData.tvInfo.sub}
          </span>
        `);
    }

    // Add dub count
    if (animeData.tvInfo.dub) {
        tags.push(`
          <span class="text-xs bg-[#1C1D21] border border-[#24262B] px-1.5 py-0.5 rounded-md flex items-center justify-center group hover:bg-white hover:text-[#1C1D21] transition duration-200 ease cursor-pointer">
            <span class="bg-white text-black px-1 pt-[0.08rem] pb-[0.03rem] rounded-sm mr-1 text-[0.5rem] group-hover:bg-[#1C1D21] group-hover:text-white">DUB</span>
            ${animeData.tvInfo.dub}
          </span>
        `);
    }

    // Add duration
    if (animeData.duration) {
        tags.push(`
          <span class="text-xs bg-[#1C1D21] border border-[#24262B] px-1.5 py-0.5 rounded-md hover:bg-white hover:text-[#1C1D21] transition duration-200 ease cursor-pointer">
            ${animeData.duration}
          </span>
        `);
    }

    // Max 4 tags
    return tags.slice(0, 4).join('');
}

export function renderSidebarAnimeItem(animeData, index) {
    const posterUrl = animeData.poster || `https://placehold.co/80x120/141414/fff/?text=${encodeURIComponent(animeData.title || `Item ${index + 1}`)}&font=poppins`;
    const title = animeData.title || `Anime Title ${index + 1}`;
    
    const tags = [];
    
    // Add HD tag
    tags.push(`
      <span class="text-xs bg-[#1C1D21] border border-[#24262B] px-1.5 py-0.5 rounded-md hover:bg-white hover:text-[#1C1D21] transition duration-200 ease cursor-pointer">HD</span>
    `);
    
    // Add sub count
    if (animeData.tvInfo.sub) {
        tags.push(`
          <span class="text-xs bg-[#1C1D21] border border-[#24262B] px-1.5 py-0.5 rounded-md group hover:bg-white hover:text-[#1C1D21] transition duration-200 ease cursor-pointer">
            <span class="bg-white text-black px-1 rounded-sm mr-1 group-hover:bg-[#1C1D21] group-hover:text-white">CC</span>
            ${animeData.tvInfo.sub}
          </span>
        `);
    }
    
    // Add dub count
    if (animeData.tvInfo.dub) {
        tags.push(`
          <span class="text-xs bg-[#1C1D21] border border-[#24262B] px-1.5 py-0.5 rounded-md group hover:bg-white hover:text-[#1C1D21] transition duration-200 ease cursor-pointer">
            <span class="bg-white text-black px-1 rounded-sm mr-1 group-hover:bg-[#1C1D21] group-hover:text-white">DUB</span>
            ${animeData.tvInfo.dub}
          </span>
        `);
    }
    
    // Add duration
    if (animeData.duration) {
        tags.push(`
          <span class="text-xs bg-[#1C1D21] border border-[#24262B] px-1.5 py-0.5 rounded-md hover:bg-white hover:text-[#1C1D21] transition duration-200 ease cursor-pointer">
            ${animeData.duration}
          </span>
        `);
    }
    
    // Max 4 tags
    const tagsHTML = tags.slice(0, 4).join('');
    
    return `
        <img src="${posterUrl}" alt="${title}" class="w-16 h-24 object-cover rounded-md cursor-pointer">
        <div class="flex flex-col">
            <h3 class="font-semibold text-sm mb-1">${title}</h3>
            <div class="pt-1 flex flex-row flex-wrap gap-1">${tagsHTML}</div>
        </div>
    `;
}