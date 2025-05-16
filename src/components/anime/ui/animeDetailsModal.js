// Anime Details Modal Component

export function renderAnimeDetailsModal() {
  return `
    <div id="anime-details-modal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center hidden">
      <div class="bg-anime-modal-bg border border-anime-border/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 transform transition-all duration-300 ease-in-out scale-95 opacity-0" id="modal-content">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold" id="modal-title">Anime Details</h2>
          <button id="close-modal-btn" class="p-2 bg-anime-card-bg border border-anime-border/10 rounded-lg hover:bg-anime-card-hover transition duration-200 ease active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div id="modal-content-container" class="flex flex-col gap-6">
          <!-- Content will be dynamically inserted here -->
        </div>
      </div>
    </div>
  `;
}

function generateModalContent(animeData) {
  if (!animeData) return '<p>No data available</p>';
  
  const {
    title,
    japanese_title,
    poster,
    backdrop_image,
    animeInfo,
    seasons,
    recommended_data,
    related_data,
    anilistId,
    malId
  } = animeData;
  
  let content = `
    <div class="flex flex-col md:flex-row gap-6">
      <div class="w-full md:w-1/3 flex flex-col gap-3">
        <img src="${poster || ''}" alt="${title}" class="w-full rounded-lg border border-anime-border/10">
        
        <!-- External Links -->
        <div class="flex gap-2">
          ${anilistId ? `
            <a href="https://anilist.co/anime/${anilistId}" target="_blank" class="flex-1 flex items-center justify-center h-10 px-4 bg-[#18212C] border border-anime-border/10 rounded-lg hover:bg-[#202b39] transition duration-200 ease text-center">
              <svg fill="#01ABFF" stroke-width="0" role="img" viewBox="0 0 24 24" height="1.4rem" width="1.4rem" xmlns="http://www.w3.org/2000/svg"><path d="M24 17.53v2.421c0 .71-.391 1.101-1.1 1.101h-5l-.057-.165L11.84 3.736c.106-.502.46-.788 1.053-.788h2.422c.71 0 1.1.391 1.1 1.1v12.38H22.9c.71 0 1.1.392 1.1 1.101zM11.034 2.947l6.337 18.104h-4.918l-1.052-3.131H6.019l-1.077 3.131H0L6.361 2.948h4.673zm-.66 10.96-1.69-5.014-1.541 5.015h3.23z"></path></svg>
            </a>` : ''}
          ${malId ? `
            <a href="https://myanimelist.net/anime/${malId}" target="_blank" class="flex-1 flex items-center justify-center px-4 h-10 bg-[#2E51A2] border border-anime-border/10 rounded-lg hover:bg-[#3963c5] transition duration-200 ease text-center">
              <svg fill="#fff" stroke-width="0" role="img" viewBox="0 7 24 9" height="1rem" xmlns="http://www.w3.org/2000/svg"><path d="M8.273 7.247v8.423l-2.103-.003v-5.216l-2.03 2.404-1.989-2.458-.02 5.285H.001L0 7.247h2.203l1.865 2.545 2.015-2.546 2.19.001zm8.628 2.069l.025 6.335h-2.365l-.008-2.871h-2.8c.07.499.21 1.266.417 1.779.155.381.298.751.583 1.128l-1.705 1.125c-.349-.636-.622-1.337-.878-2.082a9.296 9.296 0 0 1-.507-2.179c-.085-.75-.097-1.471.107-2.212a3.908 3.908 0 0 1 1.161-1.866c.313-.293.749-.5 1.1-.687.351-.187.743-.264 1.107-.359a7.405 7.405 0 0 1 1.191-.183c.398-.034 1.107-.066 2.39-.028l.545 1.749H14.51c-.593.008-.878.001-1.341.209a2.236 2.236 0 0 0-1.278 1.92l2.663.033.038-1.81h2.309zm3.992-2.099v6.627l3.107.032-.43 1.775h-4.807V7.187l2.13.03z"></path></svg>
            </a>` : ''}
        </div>
      </div>
      <div class="w-full md:w-2/3 flex flex-col gap-4">
        <div>
          <h3 class="text-xl font-bold">${title || 'Unknown Title'}</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  `;
  
  if (animeInfo) {
    if (animeInfo.Overview) {
      content += `
        <div class="col-span-1 md:col-span-2">
          <div class="relative">
            <p class="text-white/80 overflow-hidden line-clamp-4 text-ellipsis" id="overview-text">${animeInfo.Overview}</p>
            <button id="show-more-btn" class="text-blue-400 hover:text-blue-300 transition duration-200 ease mt-1">Show more</button>
          </div>
        </div>
      `;
    }
    
    const infoFields = [
      { key: 'Genres', label: 'Genres' },
      { key: 'Status', label: 'Status' },
      { key: 'Studios', label: 'Studios' },
      { key: 'Producers', label: 'Producers' },
      { key: 'Released', label: 'Released' },
      { key: 'Type', label: 'Type' }
    ];
    
    infoFields.forEach(({ key, label }) => {
      if (animeInfo[key]) {
        const value = Array.isArray(animeInfo[key]) 
          ? animeInfo[key].join(', ') 
          : animeInfo[key];
        
        content += `
          <div>
            <h4 class="font-semibold mb-1">${label}</h4>
            <p class="text-white/80">${value}</p>
          </div>
        `;
      }
    });
  }
  
  content += `
        </div>
      </div>
    </div>
  `;
  
  // Seasons section
  if (seasons && seasons.length > 0) {
    content += `
      <div class="mt-4">
        <h3 class="text-xl font-bold mb-3">Seasons</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    `;
    
    seasons.forEach(season => {
      content += `
        <a href="/anime/${season.route}" class="relative bg-anime-card-bg border border-anime-border/10 rounded-lg p-4 py-5 hover:bg-anime-card-hover transition duration-200 ease overflow-hidden">
          ${season.background ? `
            <div class="absolute inset-0 z-0">
              <img src="${season.background}" alt="" class="w-full h-full object-cover opacity-30">
            </div>
          ` : ''}
          <div class="relative z-10 flex items-center justify-center">
            <h4 class="font-medium text-lg">${season.name}</h4>
          </div>
        </a>
      `;
    });
    
    content += `
        </div>
      </div>
    `;
  }
  
  // Related anime section
  if (related_data && related_data.length > 0) {
    content += `
      <div class="mt-4">
        <h3 class="text-xl font-bold mb-3">Related Anime</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    `;
    
    related_data.slice(0, 6).forEach(anime => {
      content += `
        <a href="/anime/${anime.id}" class="bg-anime-card-bg border border-anime-border/10 rounded-lg p-4 hover:bg-anime-card-hover transition duration-200 ease">
          <div class="flex items-center gap-3">
            <div class="w-16 h-24 rounded overflow-hidden">
              <img src="${anime.poster}" alt="${anime.title}" class="w-full h-full object-cover">
            </div>
            <div>
              <h4 class="font-semibold">${anime.title}</h4>
              <p class="text-sm text-white/70">${anime.tvInfo?.showType || ''}</p>
            </div>
          </div>
        </a>
      `;
    });
    
    content += `
        </div>
      </div>
    `;
  }
  
  // Recommended anime section
  if (recommended_data && recommended_data.length > 0) {
    content += `
      <div class="mt-4">
        <h3 class="text-xl font-bold mb-3">Recommended Anime</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    `;
    
    recommended_data.slice(0, 6).forEach(anime => {
      content += `
        <a href="/anime/${anime.id}" class="bg-anime-card-bg border border-anime-border/10 rounded-lg p-4 hover:bg-anime-card-hover transition duration-200 ease">
          <div class="flex items-center gap-3">
            <div class="w-16 h-24 rounded overflow-hidden">
              <img src="${anime.poster}" alt="${anime.title}" class="w-full h-full object-cover">
            </div>
            <div>
              <h4 class="font-semibold">${anime.title}</h4>
              <p class="text-sm text-white/70">${anime.tvInfo?.showType || ''}</p>
            </div>
          </div>
        </a>
      `;
    });
    
    content += `
        </div>
      </div>
    `;
  }
  
  return content;
}

export function openAnimeDetailsModal(animeData) {
  const modal = document.getElementById('anime-details-modal');
  const modalContent = document.getElementById('modal-content');
  const modalTitle = document.getElementById('modal-title');
  const modalContentContainer = document.getElementById('modal-content-container');
  
  if (!modal || !modalContent || !modalTitle || !modalContentContainer) return;
  
  modalTitle.textContent = animeData.title || 'Anime Details';
  
  modalContentContainer.innerHTML = generateModalContent(animeData);
  
  modal.classList.remove('hidden');
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 10);
  
  const closeBtn = document.getElementById('close-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAnimeDetailsModal);
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAnimeDetailsModal();
    }
  });
  
  document.addEventListener('keydown', handleEscapeKey);
  
  const showMoreBtn = document.getElementById('show-more-btn');
  const overviewText = document.getElementById('overview-text');
  
  if (showMoreBtn && overviewText) {
    showMoreBtn.addEventListener('click', () => {
      if (overviewText.classList.contains('line-clamp-4')) {
        overviewText.classList.remove('line-clamp-4');
        showMoreBtn.textContent = 'Show less';
      } else {
        overviewText.classList.add('line-clamp-4');
        showMoreBtn.textContent = 'Show more';
      }
    });
  }
}

function closeAnimeDetailsModal() {
  const modal = document.getElementById('anime-details-modal');
  const modalContent = document.getElementById('modal-content');
  
  if (!modal || !modalContent) return;
  
  modalContent.classList.remove('scale-100', 'opacity-100');
  modalContent.classList.add('scale-95', 'opacity-0');
  
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
  
  document.removeEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    closeAnimeDetailsModal();
  }
}