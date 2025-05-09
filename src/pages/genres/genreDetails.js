// Genre Details Page
import { renderHeader } from '../../components/header.js';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../../router.js';
import { createCarouselItem } from '../../components/carouselItem.js';

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

export function renderGenreDetailsPage(container, params) {
  const { id } = params;
  
  const getGenreName = () => {
    const movieGenre = movieGenres.find(g => g.id.toString() === id.toString());
    const tvGenre = tvGenres.find(g => g.id.toString() === id.toString());
    return movieGenre?.name || tvGenre?.name || 'Unknown Genre';
  };
  
  const genreName = getGenreName();
  document.title = `${genreName} - QuickWatch`;
  
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="pt-24 pb-20 md:pb-0 bg-[#00050d] min-h-screen">
      <div class="px-[4.4rem]">
        <div class="flex items-center mb-8">
          <h1 class="text-xl md:text-2xl text-white font-medium">${genreName}</h1>
        </div>
        
        <div id="content-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
      </div>
    </div>
  `;

  const contentGrid = document.getElementById('content-grid');
  
  const loadContent = async () => {
    const isMovieGenre = movieGenres.some(g => g.id.toString() === id.toString());
    const isTvGenre = tvGenres.some(g => g.id.toString() === id.toString());
    
    let type = 'movie';
    if (isTvGenre && !isMovieGenre) {
      type = 'tv';
    }
    
    try {
      const url = `${TMDB_BASE_URL}/discover/${type}?with_genres=${id}&sort_by=popularity.desc&page=1&append_to_response=images,content_ratings,release_dates&include_image_language=en`;
      
      const options = {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': TMDB_API_KEY
        }
      };
      
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const detailedResults = await Promise.all(
          data.results.slice(0, 20).map(async (item) => {
            const detailUrl = `${TMDB_BASE_URL}/${type}/${item.id}?append_to_response=images,content_ratings,release_dates&language=en-US&include_image_language=en`;
            const detailResponse = await fetch(detailUrl, {
              headers: {
                'Authorization': TMDB_API_KEY,
                'Content-Type': 'application/json'
              }
            });
            const detailData = await detailResponse.json();
            detailData.media_type = type;
            return detailData;
          })
        );
        
        detailedResults.forEach((item, index) => {
          const carouselItem = createCarouselItem(item, false, 'grid', null, false);
          
          if (carouselItem) {
            carouselItem.classList.remove('w-[300px]', 'w-[140px]');
            carouselItem.classList.add('w-full', 'opacity-0', 'translate-y-4', 'transition-all', 'duration-500');
            if (!carouselItem.style.aspectRatio) {
              carouselItem.classList.add('aspect-video');
            }
            
            contentGrid.appendChild(carouselItem);
            
            setTimeout(() => {
              carouselItem.classList.add('opacity-100', 'translate-y-0');
              carouselItem.classList.remove('opacity-0', 'translate-y-4');
            }, 30 * index);
          }
        });
      } else {
        contentGrid.innerHTML = `<p class="text-white col-span-full">No content found for this genre.</p>`;
      }
    } catch (error) {
      console.error(`Error fetching content for genre:`, error);
      contentGrid.innerHTML = `<p class="text-red-500 col-span-full">Error loading content. Please try again later.</p>`;
    }
  };
  
  loadContent();
}