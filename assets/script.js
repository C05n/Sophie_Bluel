
const galleryContainer = document.querySelector(".gallery");

function fetchWorks() {
   return fetch("http://localhost:5678/api/works")
      .then(response => response.json())
      .then(data => { return data; })
      .catch(error => console.error('Erreur:', error));
}

async function addGallery() {
   const works = await fetchWorks();

   works.forEach(work => {
      const galleryItem = document.createElement('figure');
      galleryItem.classList.add('gallery-item');

      const img = document.createElement('img');
      img.src = work.imageUrl;
      img.alt = work.title;

      const figcaption = document.createElement('figcaption');
      figcaption.textContent = work.title;

      galleryItem.appendChild(img);
      galleryItem.appendChild(figcaption);
      galleryContainer.appendChild(galleryItem);
   });
}

addGallery();