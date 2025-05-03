export function setupVolumeControls(player, volumeBtn, volumeSlider, volumeLevel, volumeContainer) {
  let isVolumeDragging = false;
  let volumeSliderTimeout;
  
  const mute = () => {
    if (player.muted) {
      player.muted = false;
      volumeBtn.innerHTML = '<i class="icon-volume-2"></i>';
      volumeLevel.style.width = `${player.volume * 100}%`;
    } else {
      player.muted = true;
      volumeBtn.innerHTML = '<i class="icon-volume-x"></i>';
      volumeLevel.style.width = '0%';
    }
  };
  
  const updateVolumeIcon = () => {
    if (player.muted || player.volume === 0) {
      volumeBtn.innerHTML = '<i class="icon-volume-x"></i>';
    } else if (player.volume < 0.6) {
      volumeBtn.innerHTML = '<i class="icon-volume-1"></i>';
    } else {
      volumeBtn.innerHTML = '<i class="icon-volume-2"></i>';
    }
  };
  
  const showVolumeSlider = () => {
    volumeSlider.classList.remove('hidden');
    volumeSlider.style.width = '0';
    void volumeSlider.offsetWidth;
    volumeSlider.style.width = '5em';
    volumeSlider.classList.remove('opacity-0');
    
    if (volumeSliderTimeout) {
      clearTimeout(volumeSliderTimeout);
      volumeSliderTimeout = null;
    }
    
    volumeSliderTimeout = setTimeout(() => {
      if (!isVolumeDragging && !volumeContainer.matches(':hover')) {
        volumeSlider.style.width = '0';
        volumeSlider.classList.add('opacity-0');
        
        setTimeout(() => {
          if (!volumeContainer.matches(':hover') && !isVolumeDragging) {
            volumeSlider.classList.add('hidden');
          }
        }, 300);
      }
    }, 1500);
  };
  
  volumeBtn.addEventListener('click', () => {
    mute();
  });
  
  volumeContainer.addEventListener('mouseenter', () => {    
    showVolumeSlider();
  });
  
  volumeContainer.addEventListener('mouseleave', () => {
    if (volumeSliderTimeout) {
      clearTimeout(volumeSliderTimeout);
    }
    
    volumeSliderTimeout = setTimeout(() => {
      if (!isVolumeDragging) {
        volumeSlider.style.width = '0';
        volumeSlider.classList.add('opacity-0');
        
        setTimeout(() => {
          if (!volumeContainer.matches(':hover')) {
            volumeSlider.classList.add('hidden');
          }
        }, 300);
      }
    }, 750);
  });
  
  volumeSlider.addEventListener('click', (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.volume = Math.max(0, Math.min(1, pos));
    volumeLevel.style.width = `${player.volume * 100}%`;
    updateVolumeIcon();
  });
  
  volumeSlider.addEventListener('mousedown', () => {
    isVolumeDragging = true;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isVolumeDragging) {
      const rect = volumeSlider.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      volumeLevel.style.width = `${pos * 100}%`;
      player.volume = pos;
      updateVolumeIcon();
    }
  });
    
  document.addEventListener('mouseup', () => {
    isVolumeDragging = false;
  });
  
  updateVolumeIcon();
  
  return {
    mute,
    updateVolumeIcon,
    showVolumeSlider,
    isVolumeDragging
  };
}