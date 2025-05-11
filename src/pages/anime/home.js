// Anime Page
import { extractSpotlights } from '../../components/anime/spotlightData.js';
import { renderAnimeHeader } from '../../components/anime/ui/header.js';
import { fetchAnimeData } from '../../components/anime/animeData.js';
import { renderAnimeCard, renderSidebarAnimeItem } from '../../components/anime/ui/card.js';
 
// todo - fix <> buttons in hero section

export async function renderAnimePage(container) {
    document.body.style.backgroundColor = '#080808';
    document.body.style.fontFamily = 'Inter, sans-serif';

    let spotlights = [];
    let currentSpotlightIndex = 0;
    let spotlightInterval;
    const SPOTLIGHT_INTERVAL_DURATION = 7000;

    let currentCategory = 'trending';

    try {
        spotlights = await extractSpotlights();
    } catch (error) {
        console.error("Failed to load spotlight data for hero section:", error);
    }

    function updateHeroUI(index) {
        const heroSection = document.getElementById('anime-hero-section');
        const heroTitleElement = document.getElementById('anime-hero-title');
        const heroDescriptionElement = document.getElementById('anime-hero-description');
        const heroContent = document.getElementById('anime-hero-content');
        const watchNowBtn = document.getElementById('anime-watch-now-btn');
        const detailsBtn = document.getElementById('anime-details-btn');
        const addBtn = document.getElementById('anime-add-btn');

        if (!heroSection || !heroTitleElement || !heroDescriptionElement) {
            console.error("Hero section elements not found");
            return;
        }

        if (spotlights && spotlights.length > 0 && index >= 0 && index < spotlights.length) {
            const heroData = spotlights[index];
            heroTitleElement.textContent = heroData.title || "";
            heroDescriptionElement.textContent = `${heroData.description ? heroData.description.substring(0, 220) : ''}${heroData.description && heroData.description.length > 220 ? '...' : ''}`;
            
            // Set background with opacity 0 first
            const newImage = new Image();
            newImage.onload = () => {
                heroSection.style.backgroundImage = `url('${heroData.poster || 'https://placehold.co/1200x500/0e1117/fff/?text=No%20background%20found&font=poppins'}')`;
                heroSection.style.transition = 'opacity 0.6s ease';
                heroSection.style.opacity = '1';
                
                // Animate content after background loads
                requestAnimationFrame(() => {
                    if (heroContent) {
                        heroContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        heroContent.style.opacity = '1';
                        heroContent.style.transform = 'translateY(0)';
                    }
                    
                    // Stagger button animations
                    if (watchNowBtn) {
                        requestAnimationFrame(() => {
                            watchNowBtn.style.transition = 'opacity 0.4s ease';
                            watchNowBtn.style.opacity = '1';
                        });
                    }
                    
                    if (detailsBtn) {
                        setTimeout(() => {
                            detailsBtn.style.transition = 'opacity 0.4s ease';
                            detailsBtn.style.opacity = '1';
                        }, 50);
                    }
                    
                    if (addBtn) {
                        setTimeout(() => {
                            addBtn.style.transition = 'opacity 0.4s ease';
                            addBtn.style.opacity = '1';
                        }, 100);
                    }
                });
            };
            newImage.src = heroData.poster || 'https://placehold.co/1200x500/0e1117/fff/?text=No%20background%20found&font=poppins';
        } else {
            // Fallback if no spotlights or index is out of bounds
            heroTitleElement.textContent = "Spotlight Unavailable";
            heroDescriptionElement.textContent = "Could not load spotlight content at the moment.";
            heroSection.style.backgroundImage = `url('https://placehold.co/1200x500/0e1117/fff/?text=No%20background%20found&font=poppins')`;
            heroSection.style.opacity = '1';
            
            if (heroContent) {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }
        }
    }

    // Function to show the next spotlight
    function showNextSpotlight() {
        if (spotlights.length === 0) return;
        currentSpotlightIndex = (currentSpotlightIndex + 1) % spotlights.length;
        updateHeroUI(currentSpotlightIndex);
    }

    // Function to show the previous spotlight
    function showPreviousSpotlight() {
        if (spotlights.length === 0) return;
        currentSpotlightIndex = (currentSpotlightIndex - 1 + spotlights.length) % spotlights.length;
        updateHeroUI(currentSpotlightIndex);
    }

    // Function to start the interval
    function startSpotlightInterval() {
        if (spotlights.length > 1) { // Only start interval if there's more than one spotlight
            clearInterval(spotlightInterval); // Clear existing interval if any
            spotlightInterval = setInterval(showNextSpotlight, SPOTLIGHT_INTERVAL_DURATION);
        }
    }

    // Function to update anime grid with animations
    function updateAnimeGrid(container, items) {
        if (!container) return;
        
        items.forEach((item, index) => {
            const animeItem = document.createElement('div');
            animeItem.className = 'bg-[#141414] rounded-lg overflow-hidden shadow-lg aspect-[2/3]';
            animeItem.style.opacity = '0';
            animeItem.style.transform = 'translateY(20px)';
            
            animeItem.innerHTML = `
                <img src="https://placehold.co/300x450/141414/fff/?text=Anime+${index + 1}&font=poppins" alt="Anime Poster ${index + 1}" class="w-full h-full object-cover">
            `;
            
            container.appendChild(animeItem);
            
            // Stagger the animations
            setTimeout(() => {
                animeItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                animeItem.style.opacity = '1';
                animeItem.style.transform = 'translateY(0)';
            }, 50 * index);
        });
    }

    // Function to load anime data for a specific category
    async function loadAnimeData(category) {
        const animeGrid = document.getElementById('anime-grid');
        if (!animeGrid) return;
        
        // Show skeleton loading state instead of spinner
        animeGrid.innerHTML = '';
        
        // Create 12 skeleton items for the grid
        for (let i = 0; i < 12; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'rounded-lg overflow-hidden shadow-lg aspect-[2/3] animate-pulse';
            skeletonItem.innerHTML = `
                <div class="w-full h-full bg-[#141414]"></div>
                <div class="p-3 space-y-2">
                    <div class="h-4 bg-[#141414] rounded w-3/4"></div>
                    <div class="h-3 bg-[#141414] rounded w-1/2"></div>
                </div>
            `;
            animeGrid.appendChild(skeletonItem);
        }
        
        let results = [];
        let categoryEndpoint = '';
        
        // Map category to API endpoint
        switch(category) {
            case 'trending':
                categoryEndpoint = 'top-airing';
                break;
            case 'popular':
                categoryEndpoint = 'most-popular';
                break;
            case 'toprated':
                categoryEndpoint = 'most-favorite';
                break;
            default:
                categoryEndpoint = 'top-airing';
        }
        
        try {
            // Always fetch fresh data, no caching
            const { results: fetchedResults } = await fetchAnimeData(categoryEndpoint);
            results = fetchedResults;
            
            // Clear loading state
            animeGrid.innerHTML = '';
            
            // Render anime cards
            if (results.length > 0) {
                results.forEach((animeData, index) => {
                    const animeItem = document.createElement('div');
                    animeItem.style.opacity = '0';
                    animeItem.style.transform = 'translateY(20px)';
                    animeItem.innerHTML = renderAnimeCard(animeData);
                    
                    animeGrid.appendChild(animeItem);
                    
                    // Stagger the animations
                    setTimeout(() => {
                        animeItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        animeItem.style.opacity = '1';
                        animeItem.style.transform = 'translateY(0)';
                    }, 50 * index);
                });
            } else {
                animeGrid.innerHTML = `
                    <div class="col-span-full text-center py-10 text-gray-400">
                        No anime found for this category.
                    </div>
                `;
            }
        } catch (error) {
            console.error(`Error loading ${category} anime:`, error);
            animeGrid.innerHTML = `
                <div class="col-span-full text-center py-10 text-gray-400">
                    Failed to load anime data. Please try again later.
                </div>
            `;
        }
    }

    // Function to update top upcoming sidebar (previously top airing)
    async function loadTopUpcomingSidebar() {
        const topUpcomingContainer = document.getElementById('top-upcoming-container');
        if (!topUpcomingContainer) return;
        
        // Show skeleton loading state instead of spinner
        topUpcomingContainer.innerHTML = '';
        
        // Create 5 skeleton items for the sidebar
        for (let i = 0; i < 5; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'bg-[#141414] p-3 rounded-lg flex items-center space-x-3 animate-pulse';
            skeletonItem.innerHTML = `
                <div class="flex-shrink-0 w-12 h-16 bg-[#1a1a1a] rounded"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-3 bg-[#1a1a1a] rounded w-3/4"></div>
                    <div class="h-2 bg-[#1a1a1a] rounded w-1/2"></div>
                </div>
            `;
            topUpcomingContainer.appendChild(skeletonItem);
        }
        
        try {
            // Fetch top upcoming anime data
            const { results } = await fetchAnimeData('top-upcoming');
            const topUpcomingData = results;
            
            // Clear loading state
            topUpcomingContainer.innerHTML = '';
            
            // Display top 5 anime
            const topFiveAnime = topUpcomingData.slice(0, 5);
            
            if (topFiveAnime.length > 0) {
                topFiveAnime.forEach((animeData, i) => {
                    const item = document.createElement('div');
                    item.className = 'bg-[#141414] p-3 rounded-lg flex items-center space-x-3';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.setAttribute('data-anime-id', animeData.id);
                    
                    item.innerHTML = renderSidebarAnimeItem(animeData, i);
                    
                    topUpcomingContainer.appendChild(item);
                    
                    // Stagger the animations
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50 * i);
                });
            } else {
                topUpcomingContainer.innerHTML = `
                    <div class="text-center py-5 text-gray-400">
                        No upcoming anime found.
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error loading top upcoming sidebar:", error);
            topUpcomingContainer.innerHTML = `
                <div class="text-center py-5 text-gray-400">
                    Failed to load upcoming anime.
                </div>
            `;
        }
    }

    // Function to load recently added anime
    async function loadRecentlyAddedSidebar() {
        const recentlyAddedContainer = document.getElementById('recently-added-container');
        if (!recentlyAddedContainer) return;
        
        // Show skeleton loading state instead of spinner
        recentlyAddedContainer.innerHTML = '';
        
        // Create 5 skeleton items for the sidebar
        for (let i = 0; i < 5; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'bg-[#141414] p-3 rounded-lg flex items-center space-x-3 animate-pulse';
            skeletonItem.innerHTML = `
                <div class="flex-shrink-0 w-12 h-16 bg-[#1a1a1a] rounded"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-3 bg-[#1a1a1a] rounded w-3/4"></div>
                    <div class="h-2 bg-[#1a1a1a] rounded w-1/2"></div>
                </div>
            `;
            recentlyAddedContainer.appendChild(skeletonItem);
        }
        
        try {
            // Fetch recently added anime data
            const { results } = await fetchAnimeData('recently-added');
            const recentlyAddedData = results;
            
            // Clear loading state
            recentlyAddedContainer.innerHTML = '';
            
            // Display top 5 anime
            const topFiveAnime = recentlyAddedData.slice(0, 5);
            
            if (topFiveAnime.length > 0) {
                topFiveAnime.forEach((animeData, i) => {
                    const item = document.createElement('div');
                    item.className = 'bg-[#141414] p-3 rounded-lg flex items-center space-x-3';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.setAttribute('data-anime-id', animeData.id);
                    
                    item.innerHTML = renderSidebarAnimeItem(animeData, i);
                    
                    recentlyAddedContainer.appendChild(item);
                    
                    // Stagger the animations
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50 * i);
                });
            } else {
                recentlyAddedContainer.innerHTML = `
                    <div class="text-center py-5 text-gray-400">
                        No recently added anime found.
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error loading recently added sidebar:", error);
            recentlyAddedContainer.innerHTML = `
                <div class="text-center py-5 text-gray-400">
                    Failed to load recently added anime.
                </div>
            `;
        }
    }

    // Function to load recently updated anime
    async function loadRecentlyUpdatedSidebar() {
        const recentlyUpdatedContainer = document.getElementById('recently-updated-container');
        if (!recentlyUpdatedContainer) return;
        
        // Show skeleton loading state instead of spinner
        recentlyUpdatedContainer.innerHTML = '';
        
        // Create 5 skeleton items for the sidebar
        for (let i = 0; i < 5; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'bg-[#141414] p-3 rounded-lg flex items-center space-x-3 animate-pulse';
            skeletonItem.innerHTML = `
                <div class="flex-shrink-0 w-12 h-16 bg-[#1a1a1a] rounded"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-3 bg-[#1a1a1a] rounded w-3/4"></div>
                    <div class="h-2 bg-[#1a1a1a] rounded w-1/2"></div>
                </div>
            `;
            recentlyUpdatedContainer.appendChild(skeletonItem);
        }
        
        try {
            // Fetch recently updated anime data
            const { results } = await fetchAnimeData('recently-updated');
            const recentlyUpdatedData = results;
            
            // Clear loading state
            recentlyUpdatedContainer.innerHTML = '';
            
            // Display top 5 anime
            const topFiveAnime = recentlyUpdatedData.slice(0, 5);
            
            if (topFiveAnime.length > 0) {
                topFiveAnime.forEach((animeData, i) => {
                    const item = document.createElement('div');
                    item.className = 'bg-[#141414] p-3 rounded-lg flex items-center space-x-3';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.setAttribute('data-anime-id', animeData.id);
                    
                    item.innerHTML = renderSidebarAnimeItem(animeData, i);
                    
                    recentlyUpdatedContainer.appendChild(item);
                    
                    // Stagger the animations
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50 * i);
                });
            } else {
                recentlyUpdatedContainer.innerHTML = `
                    <div class="text-center py-5 text-gray-400">
                        No recently updated anime found.
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error loading recently updated sidebar:", error);
            recentlyUpdatedContainer.innerHTML = `
                <div class="text-center py-5 text-gray-400">
                    Failed to load recently updated anime.
                </div>
            `;
        }
    }

    // Function to load top airing sidebar
    async function loadTopAiringSidebar() {
        const topAiringContainer = document.getElementById('top-airing-container');
        if (!topAiringContainer) return;
        
        // Show skeleton loading state instead of spinner
        topAiringContainer.innerHTML = '';
        
        // Create 5 skeleton items for the sidebar
        for (let i = 0; i < 5; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'bg-[#141414] p-3 rounded-lg flex items-center space-x-3 animate-pulse';
            skeletonItem.innerHTML = `
                <div class="flex-shrink-0 w-12 h-16 bg-[#1a1a1a] rounded"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-3 bg-[#1a1a1a] rounded w-3/4"></div>
                    <div class="h-2 bg-[#1a1a1a] rounded w-1/2"></div>
                </div>
            `;
            topAiringContainer.appendChild(skeletonItem);
        }
        
        try {
            // Use trending data if already loaded, otherwise fetch it
            let topAiringData = trendingAnime.length > 0 ? trendingAnime : [];
            
            if (topAiringData.length === 0) {
                const { results } = await fetchAnimeData('top-airing');
                topAiringData = results;
                
                // Cache the results if not already cached
                if (trendingAnime.length === 0) {
                    trendingAnime = results;
                }
            }
            
            // Clear loading state
            topAiringContainer.innerHTML = '';
            
            // Display top 5 anime
            const topFiveAnime = topAiringData.slice(0, 5);
            
            if (topFiveAnime.length > 0) {
                topFiveAnime.forEach((animeData, i) => {
                    const item = document.createElement('div');
                    item.className = 'bg-[#141414] p-3 rounded-lg flex items-center space-x-3';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.setAttribute('data-anime-id', animeData.id);
                    
                    item.innerHTML = renderSidebarAnimeItem(animeData, i);
                    
                    topAiringContainer.appendChild(item);
                    
                    // Stagger the animations
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50 * i);
                });
            } else {
                topAiringContainer.innerHTML = `
                    <div class="text-center py-5 text-gray-400">
                        No top airing anime found.
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error loading top airing sidebar:", error);
            topAiringContainer.innerHTML = `
                <div class="text-center py-5 text-gray-400">
                    Failed to load top airing anime.
                </div>
            `;
        }
    }

    // Initial render of the page structure
    container.innerHTML = `
        <div class="min-h-screen text-white">
            ${renderAnimeHeader()}

            <main class="p-2 md:p-4 md:pt-6 mt-16">
                <section id="anime-hero-section" class="relative bg-cover bg-center rounded-2xl overflow-hidden h-[55vh] mb-4 opacity-0" style="background-image: url('https://placehold.co/1200x500/0e1117/fff/?text=Loading...&font=poppins');">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#080808]/90 via-[#080808]/50 to-transparent"></div>
                    <div id="anime-hero-content" class="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-3/5 lg:w-1/2 z-10 opacity-0" style="transform: translateY(30px);">
                        <h1 id="anime-hero-title" class="text-4xl md:text-5xl font-bold mb-3"></h1>
                        <p id="anime-hero-description" class="text-md md:text-lg text-gray-200 mb-6 font-normal leading-6 overflow-hidden line-clamp-3 text-ellipsis"></p>
                        <div class="flex items-center space-x-3">
                            <button id="anime-watch-now-btn" class="bg-white text-black px-[1.2rem] py-[0.5rem] text-[1.1rem] rounded-lg font-semibold hover:bg-gray-200 transition opacity-0">Watch now</button>
                            <button id="anime-details-btn" class="bg-[#535458]/30 border border-[#F5F5F5]/10 text-white px-[1.2rem] py-[0.5rem] text-[1.1rem] rounded-lg font-medium hover:bg-gray-600/70 transition backdrop-blur-sm opacity-0">Details</button>
                            <button id="anime-add-btn" class="bg-[#535458]/30 border border-[#F5F5F5]/10 text-white p-[0.5rem] rounded-lg hover:bg-gray-600/70 transition backdrop-blur-sm opacity-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    </div>
                     <div class="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex space-x-2 z-10">
                        <button id="prev-spotlight-btn" class="text-white p-2 bg-black/50 rounded-md hover:bg-black/70 transition backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button id="next-spotlight-btn" class="text-white p-2 bg-black/50 rounded-md hover:bg-black/70 transition backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </section>

                <!-- Content Sections -->
                <div class="flex flex-col lg:flex-row gap-4">
                    <!-- Main Content Area (Trending, Popular, Top Rated) -->
                    <div class="flex-grow lg:w-3/4 bg-[#0E0E0E] p-6 rounded-2xl">
                        <!-- Tabs -->
                        <div class="flex space-x-1 mb-6 border-b border-[#F5F5F5]/10">
                            <button id="trending-tab" class="px-4 py-2 text-white border-b-2 border-white font-semibold">Trending</button>
                            <button id="popular-tab" class="px-4 py-2 text-gray-400 hover:text-white font-semibold">Popular</button>
                            <button id="toprated-tab" class="px-4 py-2 text-gray-400 hover:text-white font-semibold">Top rated</button>
                        </div>

                        <!-- Anime Grid -->
                        <div id="anime-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            <!-- Grid items will be added with animations -->
                        </div>
                    </div>

                    <!-- Sidebar (Top Airing) -->
                    <aside class="lg:w-2/5 bg-[#0E0E0E] p-6 rounded-2xl h-full">
                        <div class="w-full space-y-6">
                            <!-- Recently Added Section -->
                            <div>
                                <h3 class="text-lg font-medium mb-3 flex items-center">
                                    <i class="icon-plus-circle mr-2"></i>
                                    Recently Added
                                </h3>
                                <div id="recently-added-container" class="space-y-3">
                                    <!-- Recently added anime will be loaded here -->
                                </div>
                            </div>
                            
                            <!-- Recently Updated Section -->
                            <div>
                                <h3 class="text-lg font-medium mb-3 flex items-center">
                                    <i class="icon-refresh-cw mr-2"></i>
                                    Recently Updated
                                </h3>
                                <div id="recently-updated-container" class="space-y-3">
                                    <!-- Recently updated anime will be loaded here -->
                                </div>
                            </div>
                            
                            <!-- Top Upcoming Section -->
                            <div>
                                <h3 class="text-lg font-medium mb-3 flex items-center">
                                    <i class="icon-calendar mr-2"></i>
                                    Top Upcoming
                                </h3>
                                <div id="top-upcoming-container" class="space-y-3">
                                    <!-- Top upcoming anime will be loaded here -->
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    `;

    // Initialize the page
    updateHeroUI(currentSpotlightIndex);
    startSpotlightInterval();
    
    // Load initial anime data
    loadAnimeData(currentCategory);
    
    // Load sidebar data
    loadRecentlyAddedSidebar();
    loadRecentlyUpdatedSidebar();
    loadTopUpcomingSidebar();
    
    // Add event listeners
    const prevSpotlightBtn = document.getElementById('prev-spotlight');
    const nextSpotlightBtn = document.getElementById('next-spotlight');
    
    if (prevSpotlightBtn) {
        prevSpotlightBtn.addEventListener('click', () => {
            showPreviousSpotlight();
            clearInterval(spotlightInterval);
            startSpotlightInterval();
        });
    }
    
    if (nextSpotlightBtn) {
        nextSpotlightBtn.addEventListener('click', () => {
            showNextSpotlight();
            clearInterval(spotlightInterval);
            startSpotlightInterval();
        });
    }
    
    // Tab navigation
    const trendingTab = document.getElementById('trending-tab');
    const popularTab = document.getElementById('popular-tab');
    const topratedTab = document.getElementById('toprated-tab');
    
    if (trendingTab) {
        trendingTab.addEventListener('click', () => {
            currentCategory = 'trending';
            updateTabStyles(trendingTab);
            loadAnimeData(currentCategory);
        });
    }
    
    if (popularTab) {
        popularTab.addEventListener('click', () => {
            currentCategory = 'popular';
            updateTabStyles(popularTab);
            loadAnimeData(currentCategory);
        });
    }
    
    if (topratedTab) {
        topratedTab.addEventListener('click', () => {
            currentCategory = 'toprated';
            updateTabStyles(topratedTab);
            loadAnimeData(currentCategory);
        });
    }
    
    // Function to update tab styles
    function updateTabStyles(activeTab) {
        [trendingTab, popularTab, topratedTab].forEach(tab => {
            tab.classList.remove('text-white', 'border-b-2', 'border-white');
            tab.classList.add('text-gray-400');
        });
        
        activeTab.classList.remove('text-gray-400');
        activeTab.classList.add('text-white', 'border-b-2', 'border-white');
    }
    
    // Optional: Clear interval when the page/component is "destroyed" or navigated away from.
    // This depends on your SPA routing mechanism. For a simple case, you might not need it,
    // but in a larger app, you'd want to clean up to prevent memory leaks.
    // For example, if your router has a "beforeLeave" or "destroy" hook for the page:
    // router.onLeave('/anime', () => clearInterval(spotlightInterval));
}