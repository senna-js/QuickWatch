// Aniplay Embed

import { renderFullPageSpinner, renderSpinner } from '../../components/misc/loading.js';
import { extractAnimeInfo } from '../../components/anime/animeDetailsData.js';
import './aniplay.css';
import config from '../../config.json';

export async function renderAniplayEmbed(container, params) {
  let { episodeId, episode, type } = params;

  document.body.style.backgroundColor = '#000';
  container.innerHTML = `<div class="flex h-screen w-full items-center justify-center text-4xl font-medium tracking-[-0.015em]" style="font-family: 'Inter';">Loading...</div>`;

  episodeId = decodeURIComponent(episodeId);
  let info = await extractAnimeInfo(episodeId);

  const aniplayData = await fetch(config.proxy, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: `https://aniplay.lol/anime/watch/${info.anilistId}`,
      method: 'POST',
      headers: { 'next-action': '7fc4a247354a4e3e6ded0a1ffb345865628c0c93b5' },
      form_data: `["${info.anilistId}","hika","${info.malId}/${episode}",${episode},"sub"]`
    })
  });

  const responseText = await aniplayData.text();
  const lines = responseText.split('\n');
  const data = lines.map(line => {
    try {
      return JSON.parse(line.split(':').slice(1).join(':').trim());
    } catch (e) {
      return null;
    }
  });
  
  const sources = data[1]?.sources || [];
  let currentlyLoading = false;
  let currentSource = 0;

  if (type) {
    const matchingSourceIndex = sources.findIndex(source => 
      source.quality.toLowerCase() === type.toLowerCase()
    );
    
    if (matchingSourceIndex !== -1) {
      currentSource = matchingSourceIndex;
    }
  }

  container.innerHTML = `
    <div class="flex flex-col h-screen bg-black">
      <div id="player-container" class="flex-grow relative overflow-hidden">
        <iframe 
          id="player-iframe"
          class="w-full h-full border-none"
          src="${sources[currentSource]?.embed_frame || ''}"
          allowfullscreen
        ></iframe>
        <div id="loading-overlay" class="hidden absolute inset-0 bg-black bg-opacity-70 items-center justify-center">
          <div class="animate-ping flex h-screen w-full items-center justify-center text-4xl font-medium tracking-[-0.015em]" style="font-family: 'Inter';">Loading...</div>
        </div>
      </div>
      
      <div id="source-menu" class="absolute top-4 left-4 z-10 transition-all duration-300 ease-in-out">
        <div id="menu-container" class="bg-zinc-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out w-10">
          <button id="source-toggle" class="w-10 h-10 flex items-center justify-center text-text-primary cursor-pointer hover:scale-110 active:scale-90 transition-all duration-300 ease-in-out">
            <i class="icon-tv text-[1.2rem]"></i>
          </button>
          <button id="close-menu" class="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center text-text-primary rounded-full bg-zinc-600 hover:bg-zinc-500 opacity-0 invisible transition-all duration-300 ease-in-out z-10 cursor-pointer hover:scale-110 active:scale-90">
            <i class="icon-x text-[1.3rem]"></i>
          </button>
          <div id="source-options" class="flex flex-col max-h-0 overflow-hidden transition-all duration-300 ease-in-out opacity-0">
            ${sources.map((source, index) => `
              <button
                data-index="${index}"
                class="source-option px-4 py-2 text-text-primary hover:bg-zinc-700 whitespace-nowrap transition-all duration-300 ease-in-out text-left opacity-0 cursor-pointer flex flex-row items-center justify-start gap-1.5 ${index === currentSource ? 'bg-zinc-700' : ''}"
              >
                ${source.embed_name} <span class="bg-text-primary text-black px-1.5 py-0.5 text-xs rounded-full">${source.quality.toUpperCase()}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  const sourceMenu = document.getElementById('source-menu');
  const sourceToggle = document.getElementById('source-toggle');
  const closeMenu = document.getElementById('close-menu');
  const playerIframe = document.getElementById('player-iframe');
  const loadingOverlay = document.getElementById('loading-overlay');
  
  sourceToggle.addEventListener('click', () => {
    sourceMenu.classList.toggle('open');
  });

  closeMenu.addEventListener('click', (event) => {
    sourceMenu.classList.remove('open');
    event.stopPropagation();
  });

  document.addEventListener('click', (event) => {
    if (!sourceMenu.contains(event.target)) {
      sourceMenu.classList.remove('open');
    }
  });

  document.querySelectorAll('.source-option').forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      if (index === currentSource) return;
      
      document.querySelectorAll('.source-option').forEach(btn => {
        btn.classList.remove('bg-zinc-700');
      });
      button.classList.add('bg-zinc-700');
      
      loadingOverlay.classList.remove('hidden');
      playerIframe.classList.add('hidden');
      currentlyLoading = true;
      currentSource = index;
      
      playerIframe.onload = () => {
        loadingOverlay.classList.add('hidden');
        playerIframe.classList.remove('hidden');
        currentlyLoading = false;
      };
      
      playerIframe.src = sources[index].embed_frame;
      
      sourceMenu.classList.remove('open');
    });
  });
}