// Share Modal Component
import { TMDB_IMAGE_BASE_URL } from '../../router.js';

export function renderShareModal(type, id, title, posterPath) {
  const shareUrl = `${window.location.origin}/${type}/${id}`;
  const fullUrl = `${window.location.href}`;
  
  return `
    <div id="share-modal" class="fixed inset-0 bg-background-primary bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div class="relative w-full max-w-md bg-background-tertiary rounded-lg">
        <button id="close-share-modal" class="absolute -top-3 -right-3 text-text-primary text-3xl z-[8]">
          <i class="icon-x"></i>
        </button>
        
        <div class="p-6">
          <h3 class="text-xl font-medium mb-4">Share "${title}"</h3>
          
          <div class="flex items-center mb-6">
            <div class="w-16 h-24 rounded overflow-hidden mr-4">
              <img src="${TMDB_IMAGE_BASE_URL}w185${posterPath}" alt="${title}" class="w-full h-full object-cover">
            </div>
            <div>
              <p class="text-lg font-medium">${title}</p>
              <p class="text-sm text-zinc-400">${type === 'movie' ? 'Movie' : 'TV Series'}</p>
            </div>
          </div>
          
          <div class="mb-6">
            <label for="share-url" class="block text-sm font-medium text-zinc-400 mb-2">Share link</label>
            <div class="flex">
              <input type="text" id="share-url" value="${shareUrl}" class="flex-grow px-3 py-2 bg-[#272c36] rounded-l-lg text-text-primary focus:outline-none" readonly>
              <button id="copy-url" class="bg-accent px-4 pb-1 pt-2 rounded-r-lg">
                <i class="icon-copy"></i>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-4 gap-4">
            <button class="share-platform-btn flex flex-col items-center justify-center p-3 bg-[#272c36] rounded-lg hover:bg-[#313845]" data-platform="facebook">
              <i class="fab fa-facebook-f text-xl mb-2"></i>
              <span class="text-xs">Facebook</span>
            </button>
            <button class="share-platform-btn flex flex-col items-center justify-center p-3 bg-[#272c36] rounded-lg hover:bg-[#313845]" data-platform="x">
              <i class="fab fa-x-twitter text-xl mb-2"></i>
              <span class="text-xs">X (Twitter)</span>
            </button>
            <button class="share-platform-btn flex flex-col items-center justify-center p-3 bg-[#272c36] rounded-lg hover:bg-[#313845]" data-platform="whatsapp">
              <i class="fab fa-whatsapp text-2xl mb-2"></i>
              <span class="text-xs">WhatsApp</span>
            </button>
            <button class="share-platform-btn flex flex-col items-center justify-center p-3 bg-[#272c36] rounded-lg hover:bg-[#313845]" data-platform="telegram">
              <i class="fab fa-telegram-plane text-xl mb-2"></i>
              <span class="text-xs">Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initShareModal(type, id, title) {
  const shareButton = document.getElementById('share-button');
  
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      const shareModalHTML = renderShareModal(type, id, title, document.querySelector('.object-cover')?.src);
      
      const shareModalContainer = document.createElement('div');
      shareModalContainer.innerHTML = shareModalHTML;
      
      document.body.appendChild(shareModalContainer.firstElementChild);
      
      document.getElementById('close-share-modal').addEventListener('click', () => {
        const shareModal = document.getElementById('share-modal');
        if (shareModal) {
          document.body.removeChild(shareModal);
        }
      });
      
      document.getElementById('copy-url').addEventListener('click', () => {
        const shareUrl = document.getElementById('share-url');
        shareUrl.select();
        document.execCommand('copy');
        
        const copyButton = document.getElementById('copy-url');
        const originalContent = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="icon-check"></i>';
        
        setTimeout(() => {
          copyButton.innerHTML = originalContent;
        }, 2000);
      });
      
      document.querySelectorAll('.share-platform-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const platform = btn.dataset.platform;
          const shareUrl = document.getElementById('share-url').value;
          const encodedUrl = encodeURIComponent(shareUrl);
          const encodedTitle = encodeURIComponent(`Check out ${title} on QuickWatch`);
          
          let shareLink = '';
          
          switch (platform) {
            case 'facebook':
              shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
              break;
            case 'twitter':
              shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
              break;
            case 'whatsapp':
              shareLink = `https://wa.me/?text=${encodedTitle} ${encodedUrl}`;
              break;
            case 'telegram':
              shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
              break;
          }
          
          if (shareLink) {
            window.open(shareLink, '_blank');
          }
        });
      });
    });
  }
}