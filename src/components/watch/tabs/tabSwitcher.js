// Tab Switcher

import { loadRelatedContent, loadDetailsContent, loadRelatedContentMobile, loadDetailsContentMobile } from './tabContent.js';

export function initTabSwitcher(type, id, data) {
  const tabItems = document.querySelectorAll('.tab-item');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.dataset.tab;
      
      tabItems.forEach(t => {
        if (t.dataset.tab === tabName) {
          t.classList.add('active', 'border-b-2', 'border-white', 'pb-2');
          t.classList.remove('text-zinc-400');
        } else {
          t.classList.remove('active', 'border-b-2', 'border-white', 'pb-2');
          t.classList.add('text-zinc-400');
        }
      });
      
      tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
          content.classList.remove('hidden');
          if (tabName === 'related') {
            const container = content.querySelector('.related-content-container');
            if (container) loadRelatedContent(type, id, container);
          } else if (tabName === 'details') {
            const container = content.querySelector('.details-content-container');
            if (container) loadDetailsContent(type, data, container);
          }
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });
}

export function initTabSwitcherMobile(type, id, data) {
  const tabItems = document.querySelectorAll('.tab-item');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.dataset.tab;
      
      tabItems.forEach(t => {
        if (t.dataset.tab === tabName) {
          t.classList.add('active', 'border-b-2', 'border-white', 'pb-2');
          t.classList.remove('text-zinc-400');
        } else {
          t.classList.remove('active', 'border-b-2', 'border-white', 'pb-2');
          t.classList.add('text-zinc-400');
        }
      });
      
      tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
          content.classList.remove('hidden');
          
          if (tabName === 'related') {
            const container = content.querySelector('.related-content-container');
            if (container) loadRelatedContentMobile(type, id, container);
          } else if (tabName === 'details') {
            const container = content.querySelector('.details-content-container');
            if (container) loadDetailsContentMobile(type, data, container);
          }
        } else {
          content.classList.add('hidden');
        }
      });
      
      window.scrollTo({
        top: document.querySelector('.tab-item').getBoundingClientRect().top + window.scrollY - 60,
        behavior: 'smooth'
      });
    });
  });
}