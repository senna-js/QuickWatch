export function setupTopControls(topControls, aspectToggleBtn, player) {
  let isFilledView = true;
  let controlsTimeout;
  
  if (aspectToggleBtn) {
    aspectToggleBtn.addEventListener('click', () => {
      isFilledView = !isFilledView;
      
      if (isFilledView) {
        player.style.objectFit = 'cover';
        aspectToggleBtn.innerHTML = '<i class="icon-shrink"></i>';
      } else {
        player.style.objectFit = 'contain';
        aspectToggleBtn.innerHTML = '<i class="icon-expand"></i>';
      }
    });
  }
  
  const showTopControls = () => {
    if (topControls) {
      topControls.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('opacity-0');
      });
      
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      
      controlsTimeout = setTimeout(() => {
        topControls.querySelectorAll('button').forEach(btn => {
          btn.classList.add('opacity-0');
        });
      }, 2000);
    }
  };
  
  return { 
    showTopControls, 
    isFilledView,
    controlsTimeout
  };
}