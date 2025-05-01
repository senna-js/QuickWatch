export function setupSubtitles(player, subtitleBtn, subtitleMenu) {
  if (!subtitleBtn || !subtitleMenu) return;
  
  let currentTrack = null;
  let subtitles = [];
  
  // load subtitles from tracks data
  const loadSubtitles = (tracks) => {
    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      subtitleBtn.parentElement.classList.add('hidden');
      return [];
    }
    
    subtitles = tracks;
    renderSubtitleOptions();
    return tracks;
  };
  
  // render subtitle options in the menu
  const renderSubtitleOptions = () => {
    let subtitleOptionsHTML = `
      <button 
        class="subtitle-option w-full text-left px-3 py-1.5 text-white text-sm hover:bg-zinc-700 rounded transition"
        data-index="-1"
      >
        Off
      </button>
    `;
    
    // Add all available subtitles
    subtitleOptionsHTML += subtitles.map((subtitle, index) => {
      return `
        <button 
          class="subtitle-option w-full text-left px-3 py-1.5 text-white text-sm hover:bg-zinc-700 rounded transition"
          data-index="${index}"
          data-url="${subtitle.url}"
          data-lang="${subtitle.lang}"
        >
          ${subtitle.lang}
        </button>
      `;
    }).join('');
    
    subtitleMenu.innerHTML = subtitleOptionsHTML;
    setupSubtitleOptionEvents();
  };
  
  const setupSubtitleOptionEvents = () => {
    const options = subtitleMenu.querySelectorAll('.subtitle-option');
    options.forEach(option => {
      option.addEventListener('click', () => {
        const index = parseInt(option.dataset.index);
        
        while (player.textTracks.length > 0) {
          const track = player.textTracks[0];
          if (track.mode) track.mode = 'disabled';
          player.removeChild(player.querySelector('track'));
        }
        
        if (index === -1) {
          currentTrack = null;
          subtitleBtn.innerHTML = '<i class="icon-type"></i>';
          subtitleBtn.style.backgroundColor = '';
          subtitleBtn.style.color = '';
        } else {
          const subtitle = subtitles[index];
          const track = document.createElement('track');
          track.kind = 'subtitles';
          track.label = subtitle.lang;
          track.srclang = subtitle.lang.split(' ')[0].toLowerCase();
          track.src = subtitle.url;
          track.default = true;
          
          player.appendChild(track);
          currentTrack = track;
          
          subtitleBtn.innerHTML = '<i class="icon-type"></i>';
          subtitleBtn.style.backgroundColor = '#fff';
          subtitleBtn.style.color = '#000';
          
          setTimeout(() => {
            if (player.textTracks && player.textTracks[0]) {
              player.textTracks[0].mode = 'showing';
            }
          }, 100);
        }
        
        subtitleMenu.classList.add('hidden');
      });
    });
  };
  
  subtitleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    subtitleMenu.classList.toggle('hidden');
  });
  
  document.addEventListener('click', (e) => {
    if (subtitleBtn && !subtitleBtn.contains(e.target) && !subtitleMenu.contains(e.target)) {
      subtitleMenu.classList.add('hidden');
    }
  });
  
  return {
    loadSubtitles,
    renderSubtitleOptions,
    setupSubtitleOptionEvents
  };
}