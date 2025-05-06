export function setupVolumeControls(player, volumeBtn, volumeSlider, volumeLevel, volumeContainer) {
  let isVolumeDragging = false;
  let volumeSliderTimeout;
  
  const mute = () => {
    if (player.muted) {
      player.muted = false;
      volumeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 512"><path fill="currentColor" d="M473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"></path></svg>';
      volumeLevel.style.width = `${player.volume * 100}%`;
    } else {
      player.muted = true;
      volumeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 512"><path fill="currentColor" d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"></path></svg>';
      volumeLevel.style.width = '0%';
    }
  };
  
  const updateVolumeIcon = () => {
    if (player.muted || player.volume === 0) {
      volumeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 512"><path fill="currentColor" d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"></path></svg>';
    } else if (player.volume < 0.32) {
      volumeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 512"><path fill="currentColor" d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zm105.5 145.2C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5z"></path></svg>';
    } else if (player.volume < 0.64) {
      volumeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 512"><path fill="currentColor" d="M473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"></path></svg>';
    } else {
      volumeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 512"><path fill="currentColor" d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"></path></svg>';
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