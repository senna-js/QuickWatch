// Toast Component

export function renderToast(message = '', type = 'success', duration = 3000) {
  const toastId = `toast-${Date.now()}`;
  
  const toastTypes = {
    success: {
      icon: 'fa-check-circle',
      bgColor: 'bg-[#141920cc]'
    },
    error: {
      icon: 'fa-exclamation-circle',
      bgColor: 'bg-[#141920cc]'
    },
    warning: {
      icon: 'fa-exclamation-triangle',
      bgColor: 'bg-[#141920cc]'
    },
    info: {
      icon: 'fa-info-circle',
      bgColor: 'bg-[#141920cc]'
    }
  };
  
  const toastType = toastTypes[type] || toastTypes.success;
  
  return `
    <div id="${toastId}" class="fixed bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg ${toastType.bgColor} backdrop-blur-sm text-white flex items-center gap-2 shadow-lg z-[9999] opacity-0 translate-y-4 transition-all duration-300">
      <i class="fas ${toastType.icon}"></i>
      <span>${message}</span>
    </div>
  `;
}

export function showToast(message, type = 'success', duration = 850) {
  
  const toastHTML = renderToast(message, type, duration);
  const toastContainer = document.createElement('div');
  toastContainer.innerHTML = toastHTML;
  const toastElement = toastContainer.firstElementChild;
  document.body.appendChild(toastElement);
  
  setTimeout(() => {
    if (toastElement) {
      toastElement.classList.remove('opacity-0', 'translate-y-4');
    }
  }, 10);
  
  setTimeout(() => {
    if (toastElement && toastElement.parentNode) {
      toastElement.classList.add('opacity-0', 'translate-y-4');
      
      setTimeout(() => {
        if (toastElement && toastElement.parentNode) {
          toastElement.parentNode.removeChild(toastElement);
        }
      }, 300);
    }
  }, duration);
}