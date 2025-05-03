import { renderSpinner } from '../misc/loading.js';
import { fetchKwikVideoUrl } from './videoUtils.js';

export function setupQualityOptions(qualityMenu, iphoneQualityMenu, qualityBtn, qualityToggleBtn, player, customPlayer, linksData, isIPhone, isNativeEmbed = false) {
  if (!linksData || linksData.length === 0) {
    if (qualityBtn) {
      qualityBtn.parentElement.classList.add('hidden');
    }
    if (qualityToggleBtn) {
      qualityToggleBtn.classList.add('hidden');
    }
    return;
  }
  
  let qualityOptionsHTML = '';
  
  qualityOptionsHTML = linksData.map((quality, index) => {
    return `
      <div class="quality-option cursor-pointer hover:bg-zinc-800 p-2 rounded text-white text-sm" data-index="${index}">
        ${quality.name || 'Auto'}
      </div>
    `;
  }).join('');
  
  if (qualityMenu) {
    qualityMenu.innerHTML = qualityOptionsHTML;
    setupQualityOptionEvents(qualityMenu, player, customPlayer, linksData, isNativeEmbed);
  }
  
  if (isIPhone && iphoneQualityMenu) {
    iphoneQualityMenu.innerHTML = qualityOptionsHTML;
    setupQualityOptionEvents(iphoneQualityMenu, player, customPlayer, linksData, isNativeEmbed);
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

function setupQualityOptionEvents(menuElement, player, customPlayer, linksData, isNativeEmbed = false) {
  const qualityOptions = menuElement.querySelectorAll('.quality-option');
  qualityOptions.forEach(option => {
    option.addEventListener('click', async () => {
      const currentTime = player.currentTime;
      const isPaused = player.paused;
      const index = option.dataset.index;
      
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'absolute inset-0 flex justify-center items-center bg-black bg-opacity-70 z-10';
      loadingOverlay.innerHTML = renderSpinner('large');
      customPlayer.appendChild(loadingOverlay);
      
      try {
        let videoUrl;
        
        if (isNativeEmbed) {
          // For native embed, use the URL directly
          videoUrl = linksData[index].url;
        } else {
          // For other embeds like AnimePahe, fetch the URL
          const link = linksData[index];
          videoUrl = await fetchKwikVideoUrl(link.link);
        }
        
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