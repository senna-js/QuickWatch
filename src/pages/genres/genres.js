// Movies Page
import { renderHeader } from '../../components/header.js';

const movieGenres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" }
];

const tvGenres = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" }
];

const genreColors = {
  "action": "from-red-600 to-red-900",
  "adventure": "from-green-600 to-green-900",
  "animation": "from-blue-400 to-blue-700",
  "comedy": "from-yellow-400 to-yellow-700",
  "crime": "from-gray-700 to-gray-900",
  "documentary": "from-teal-500 to-teal-800",
  "drama": "from-purple-500 to-purple-800",
  "family": "from-pink-400 to-pink-700",
  "fantasy": "from-indigo-500 to-indigo-800",
  "history": "from-amber-700 to-amber-900",
  "horror": "from-black to-gray-800",
  "music": "from-violet-500 to-violet-800",
  "mystery": "from-slate-600 to-slate-900",
  "romance": "from-rose-400 to-rose-700",
  "science fiction": "from-cyan-500 to-cyan-800",
  "tv movie": "from-orange-400 to-orange-700",
  "thriller": "from-zinc-600 to-zinc-900",
  "war": "from-stone-600 to-stone-900",
  "western": "from-amber-600 to-amber-900",
  "action & adventure": "from-red-500 to-orange-700",
  "kids": "from-emerald-400 to-emerald-700",
  "news": "from-blue-600 to-blue-900",
  "reality": "from-fuchsia-500 to-fuchsia-800",
  "sci-fi & fantasy": "from-cyan-400 to-blue-800",
  "soap": "from-pink-300 to-pink-600",
  "talk": "from-purple-300 to-purple-600",
  "war & politics": "from-red-700 to-gray-900"
};

/**
 * Renders the genres page
 * @param {HTMLElement} container
 */
export function renderGenresPage(container) {  
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="pt-24 pb-20 md:pb-0 bg-[#00050d] min-h-screen">
      <div class="px-[4.4rem]">
        <h1 class="text-4xl font-bold mb-8 font-medium">Genres</h1>
        
        <div class="mb-6">
          <div class="flex items-center space-x-4 mb-4">
            <button id="movies-tab" class="px-4 py-2 rounded-lg bg-[#32363D] font-medium text-white">Movies</button>
            <button id="tv-tab" class="px-4 py-2 rounded-lg font-medium text-white">TV Shows</button>
          </div>
        </div>
        
        <div id="genres-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
      </div>
    </div>
  `;

  const moviesTab = document.getElementById('movies-tab');
  const tvTab = document.getElementById('tv-tab');
  const genresGrid = document.getElementById('genres-grid');
  
  const displayGenres = (genres) => {
    genresGrid.innerHTML = '';
    
    genres.forEach((genre, index) => {
      const genreName = genre.name.toLowerCase();
      const colorClass = genreColors[genreName] || 'from-gray-600 to-gray-900';
      
      const genreCard = document.createElement('div');
      genreCard.className = `bg-gradient-to-br ${colorClass} rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:scale-105 shadow-lg`;
      genreCard.style.opacity = '0';
      genreCard.style.transform = 'translateY(16px)';
      genreCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      genreCard.innerHTML = `
        <h3 class="text-xl md:text-2xl font-bold text-white text-center px-4">${genre.name}</h3>
      `;
      
      genreCard.addEventListener('click', () => {
        window.history.pushState(null, null, `/genre/${genre.id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      
      genresGrid.appendChild(genreCard);
      
      requestAnimationFrame(() => {
        setTimeout(() => {
          genreCard.style.opacity = '1';
          genreCard.style.transform = 'translateY(0)';
        }, 30 * index);
      });
    });
  };
  
  moviesTab.addEventListener('click', () => {
    moviesTab.classList.add('bg-[#32363D]');
    tvTab.classList.remove('bg-[#32363D]');
    displayGenres(movieGenres);
  });
  
  tvTab.addEventListener('click', () => {
    tvTab.classList.add('bg-[#32363D]');
    moviesTab.classList.remove('bg-[#32363D]');
    displayGenres(tvGenres);
  });
  
  displayGenres(movieGenres);
}