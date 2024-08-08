const galleryContainer = document.querySelector(".gallery");
let categories = [];
let works = [];

import { fetchWorks } from './fetch.js';
import { fetchCategories } from './fetch.js';

async function initFilters() {
    works = await fetchWorks();
    categories = await fetchCategories();
    
    const filterContainer = document.createElement('div');
    filterContainer.classList.add('filter-container');
    
    const allButton = createFilterButton('Tous');
    filterContainer.appendChild(allButton);
    
    categories.forEach(category => {
        const button = createFilterButton(category.name);
        filterContainer.appendChild(button);
    });
    
    galleryContainer.parentNode.insertBefore(filterContainer, galleryContainer);
}

function createFilterButton(name) {
    const button = document.createElement('button');
    button.textContent = name;
    button.addEventListener('click', () => filterWorks(name, button));
    return button;
}

function filterWorks(category, clickedButton) {
   document.querySelectorAll('.filter-container button').forEach(btn => {
       btn.classList.remove('buttonActive');
   });

   clickedButton.classList.add('buttonActive');

    galleryContainer.innerHTML = '';
    
    const filteredWorks = category === 'Tous' 
        ? works 
        : works.filter(work => work.category.name === category);
    
    filteredWorks.forEach(work => {
        const galleryItem = createGalleryItem(work);
        galleryContainer.appendChild(galleryItem);
    });
}

function createGalleryItem(work) {
    const galleryItem = document.createElement('figure');
    galleryItem.classList.add('gallery-item');

    const img = document.createElement('img');
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement('figcaption');
    figcaption.textContent = work.title;

    galleryItem.appendChild(img);
    galleryItem.appendChild(figcaption);
    
    return galleryItem;
}

async function addGallery() {
    works = await fetchWorks();
    works.forEach(work => {
        const galleryItem = createGalleryItem(work);
        galleryContainer.appendChild(galleryItem);
    });
}

initFilters();
addGallery();