// 1. Imports et fonctions utilitaires
import { fetchWorks } from "./fetch.js";
import { fetchCategories } from "./fetch.js";
import { addGallery } from "./script.js";

function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// 2. Configuration initiale
function initializeModalFeatures() {
  if (!isLoggedIn()) return;

  const editMode = document.createElement('div');
  editMode.classList.add('edit-mode');
  editMode.innerHTML = '<p><i class="fa-regular fa-pen-to-square"></i>Mode édition</p>';
  document.body.appendChild(editMode);

  // 3. Création et gestion de la modale principale
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Galerie photo</h2>
        <div class="modal-gallery"></div>
        <button id="addProjectBtn" class="add-project-btn">Ajouter une photo</button>
      </div>
    `;

  document.body.appendChild(modal);

  const iconElement = document.createElement('i');
  iconElement.classList.add('fa-regular', 'fa-pen-to-square');

  const modifyBtn = document.createElement('button');
  modifyBtn.classList.add('modifyBtn');
  modifyBtn.textContent = 'modifier';
  document.querySelector('#portfolio h2').appendChild(modifyBtn);
  modifyBtn.insertBefore(iconElement, modifyBtn.firstChild);
  modifyBtn.addEventListener('click', openModal)

  const closeBtn = modal.querySelector('.close');

  function openModal() {
    modal.classList.add('modal-show');
    populateModal();
  }

  function closeModal() {
    modal.classList.remove('modal-show');
  }

  async function populateModal() {
    const works = await fetchWorks();
    const modalGallery = modal.querySelector('.modal-gallery');
    modalGallery.innerHTML = '';

    works.forEach(work => {
      const figure = document.createElement('figure');
      figure.innerHTML = `
          <img src="${work.imageUrl}" alt="${work.title}">
          <button class="delete-btn" data-id="${work.id}"><i class="fa-solid fa-trash-can"></i></button>
        `;
      modalGallery.appendChild(figure);
    });

    modalGallery.addEventListener('click', async (event) => {
      const deleteBtn = event.target.closest('.delete-btn');
      if (deleteBtn) {
        await deleteWork(event);
      }
    });
  }

  // 4. Gestion des événements de la modale principale
  modifyBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  const addProjectBtn = modal.querySelector('#addProjectBtn');
  const addProjectModal = createAddProjectModal();

  addProjectBtn.addEventListener('click', () => {
    modal.classList.remove('modal-show');
    addProjectModal.classList.add('modal-show');
  });

  const closeAddProjectBtn = addProjectModal.querySelector('.close');
  closeAddProjectBtn.addEventListener('click', () => {
    addProjectModal.classList.remove('modal-show');
    resetAddProjectForm();
  });

  // 5. Fonctionnalités de suppression
  async function deleteWork(event) {
    const workId = event.target.closest('.delete-btn').dataset.id;
    try {
      await deleteWorkFromAPI(workId);
      event.target.closest('figure').remove();
      await refreshGallery();
    }
    catch (error) {
      console.error('Error:', error);
    }
  }

  async function deleteWorkFromAPI(workId) {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete work: ${response.statusText}');
    }

    return response;
  }

  async function refreshGallery() {
    const galleryElement = document.querySelector('.gallery');
    galleryElement.innerHTML = '';
    await addGallery();
  }

  // 6. Création et gestion de la modale d'ajout de projet
  function createAddProjectModal() {
    const addProjectModal = document.createElement('div');
    addProjectModal.classList.add('modal', 'add-project-modal');
    addProjectModal.innerHTML = `
       <div class="modal-content">
         <span class="close">&times;</span>
         <span class="modal-return"><i class="fa-solid fa-arrow-left"></i></span>
         <h2>Ajout Photo</h2>
         <form id="addProjectForm">
           <div class="form-content">
             <div class="form-group group-img">
               <label for="projectImage"><i class="fa-regular fa-image"></i></label>
               <label for="projectImage" class="custom-file-upload">+ Ajouter photo</label>
               <input type="file" id="projectImage" name="image" accept="image/*" required>
                <img class="preview-image" src="#" alt="Preview">
               <p>jpg, png : 4mo max</p>
             </div>
             <div class="form-group">
               <label for="projectTitle">Titre</label>
               <input type="text" id="projectTitle" name="title" required>
             </div>
             <div class="form-group">
               <label for="projectCategory">Catégorie</label>
               <select id="projectCategory" name="category" required>
                 <option value=""></option>
               </select>
             </div>
           </div>
           <input type="submit" value="Valider" class="add-img-btn">
         </form>
       </div>
     `;
    document.body.appendChild(addProjectModal);

    populateCategories();

    const modalReturn = document.querySelector('.modal-return');
    modalReturn.addEventListener('click', () => {
      addProjectModal.classList.remove('modal-show');
      modal.classList.add('modal-show');
      resetAddProjectForm();
    });

    const form = addProjectModal.querySelector('#addProjectForm');
    form.addEventListener('submit', handleAddProject);

    const fileInput = addProjectModal.querySelector('#projectImage');
    fileInput.addEventListener('change', previewImage);

    return addProjectModal;
  }

  async function populateCategories() {
    const categories = await fetchCategories();
    const select = document.querySelector('#projectCategory');
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
  }

  // 8. Fonctionnalités d'ajout de projet
  async function handleAddProject(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
      const response = await fetch('http://localhost:5678/api/works', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        document.querySelector('.gallery').innerHTML = '';
        addGallery();

        document.querySelector('.add-project-modal').classList.remove('modal-show');

        document.querySelector('.modal').classList.add('modal-show');

        await populateModal();

        event.target.reset();
        resetPreviewImage();
      } else {
        console.error('Échec de l\'ajout du projet');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  }

  window.addEventListener('click', (event) => {
    if (event.target === addProjectModal) {
      addProjectModal.classList.remove('modal-show');
      resetAddProjectForm();
    }
  });

  // 9. Gestion des images
  function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      const previewImg = document.querySelector('.preview-image');

      reader.onload = function (e) {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
      }

      reader.readAsDataURL(file);
    }
  }

  function resetPreviewImage() {
    const previewImg = document.querySelector('.preview-image');
    const fileInput = document.querySelector('#projectImage');
    previewImg.src = '#';
    previewImg.style.display = 'none';
    fileInput.value = '';
  }
}

function resetAddProjectForm() {
  const form = document.querySelector('#addProjectForm');
  form.reset();
  resetPreviewImage();
}

// 10. Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', initializeModalFeatures);