export async function fetchWorks() {
      return fetch("http://localhost:5678/api/works")
            .then(response => response.json())
            .then(data => { return data; })
            .catch(error => console.error('Erreur:', error));
}

export async function fetchCategories() {
      return fetch("http://localhost:5678/api/categories")
            .then(response => response.json())
            .then(data => { return data; })
            .catch(error => console.error('Erreur:', error));
}
