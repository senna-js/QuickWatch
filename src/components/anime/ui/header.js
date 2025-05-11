// Anime Header Component

export function renderAnimeHeader() {
  return `
    <header class="h-16 fixed top-0 left-0 bg-[#0E0E0E] border-b border-[#F5F5F5]/10 transition-all duration-200 ease z-50 py-3 px-4 text-white items-center text-md flex-row justify-between hidden md:flex w-full">
      
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/" class="text-2xl hover:text-[#2392EE] transition duration-200 ease active:scale-90" style="font-family: 'Instrument Serif';">quickwatch anime</a>
      </div>

      <!-- Search Box -->
      <div class="flex-1 flex justify-center items-center pl-6 pr-2">
        <div class="relative w-full group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="icon-search text-gray-400 group-focus-within:text-[#2392EE]"></i>
          </div>
          <input
            type="text"
            placeholder="Search anime"
            class="block w-full bg-[#141414] border border-[#F5F5F5]/10 rounded-md py-2 pl-10 pr-3 text-sm placeholder-[#F5F5F5]/20 text-white focus:outline-none focus:border-[#2392EE] focus:placeholder-[#2392EE]/40 transition duration-200 ease-in-out"
          />
        </div>
      </div>

      <!-- Icons -->
      <div class="flex items-center flex-row gap-2">
        <button aria-label="Search" class="p-2 w-10 h-10 bg-[#141414] border border-[#F5F5F5]/10 rounded-md hover:bg-[#1f1f1f] cursor-pointer active:scale-90 focus:outline-none focus:border-[#2392EE] focus:text-[#2392EE]">
          <i class="icon-search"></i>
        </button>
        <button aria-label="Watchlist" class="p-2 w-10 h-10 bg-[#141414] border border-[#F5F5F5]/10 rounded-md hover:bg-[#1f1f1f] cursor-pointer active:scale-90 focus:outline-none focus:border-[#2392EE] focus:text-[#2392EE]">
          <i class="icon-bookmark"></i>
        </button>
      </div>
      
    </header>
  `;
}