import { renderSpinner } from '../misc/loading.js';
import { fetchVideoUrl } from '../../pages/embeds/animepahe-embed.js';

export function setupQualityOptions(qualityMenu, iphoneQualityMenu, qualityBtn, qualityToggleBtn, player, customPlayer, linksData, isIPhone) {
  if (!linksData || linksData.length === 0) return;
  
  // generate quality options HTML
  const qualityOptionsHTML = linksData.map((link, index) => {
    const cleanedName = link.name.replace(/\s*\([^)]*\)/g, '');
    
    return `
    <button 
      class="quality-option w-full text-left px-3 py-1.5 text-white text-sm hover:bg-zinc-700 rounded transition"
      data-link="${link.link}"
      data-index="${index}"
    >
      ${cleanedName}
    </button>
  `}).join('');
  
  // set quality options in menu
  if (qualityMenu) {
    qualityMenu.innerHTML = qualityOptionsHTML;
    setupQualityOptionEvents(qualityMenu, player, customPlayer, linksData);
  }
  
  if (isIPhone && iphoneQualityMenu) {
    iphoneQualityMenu.innerHTML = qualityOptionsHTML;
    setupQualityOptionEvents(iphoneQualityMenu, player, customPlayer, linksData);
  }
  
  // setup quality button click events
  if (qualityBtn) {
    qualityBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      qualityMenu.classList.toggle('hidden');
    });
  }
  
  if (qualityToggleBtn) {
    qualityToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      iphoneQualityMenu.classList.toggle('hidden');
    });
  }
  
  document.addEventListener('click', (e) => {
    if (qualityBtn && !qualityBtn.contains(e.target) && !qualityMenu.contains(e.target)) {
      qualityMenu.classList.add('hidden');
    }
    
    if (qualityToggleBtn && !qualityToggleBtn.contains(e.target) && !iphoneQualityMenu.contains(e.target)) {
      iphoneQualityMenu.classList.add('hidden');
    }
  });
}

function setupQualityOptionEvents(menuElement, player, customPlayer, linksData) {
  const qualityOptions = menuElement.querySelectorAll('.quality-option');
  qualityOptions.forEach(option => {
    option.addEventListener('click', async () => {
      const currentTime = player.currentTime;
      const isPaused = player.paused;
      const link = linksData[option.dataset.index];
      
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'absolute inset-0 flex justify-center items-center bg-black bg-opacity-70 z-10';
      loadingOverlay.innerHTML = renderSpinner('large');
      customPlayer.appendChild(loadingOverlay);
      
      try {
        const videoUrl = await fetchVideoUrl(link.link);
        
        if (videoUrl) {
          player.src = videoUrl;
          
          player.addEventListener('canplay', function onCanPlay() {
            if (loadingOverlay.parentNode) {
              loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
            
            player.currentTime = currentTime;
            
            if (!isPaused) {
              player.play();
            }
            
            player.removeEventListener('canplay', onCanPlay);
          }, { once: true });
        } else {
          throw new Error('Failed to load video URL');
        }
      } catch (error) {
        console.error('Error changing quality:', error);
        if (loadingOverlay.parentNode) {
          loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
        
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center';
        errorOverlay.textContent = 'Failed to load video. Please try another quality.';
        customPlayer.appendChild(errorOverlay);
        
        setTimeout(() => {
          if (errorOverlay.parentNode) {
            errorOverlay.parentNode.removeChild(errorOverlay);
          }
        }, 3000);
      }
      
      // hide quality menus
      const qualityMenu = document.querySelector('.quality-menu');
      const iphoneQualityMenu = document.querySelector('.iphone-quality-menu');
      if (qualityMenu) qualityMenu.classList.add('hidden');
      if (iphoneQualityMenu) iphoneQualityMenu.classList.add('hidden');
    });
  });
}