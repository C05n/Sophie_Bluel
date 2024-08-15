async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            updateLoginButton();
            window.location.href = 'index.html';
        } else {
            alert("Erreur dans l'identifiant ou le mot de passe");
        }
    } catch (error) {
        console.log('Statut de la réponse:', error.response?.status);
        console.log("Message d'erreur:", error.message);
    }
}
function updateLoginButton() {
    const loginButton = document.querySelector('.li_login');
    if (localStorage.getItem('token')) {
        loginButton.textContent = 'Logout';
        loginButton.addEventListener('click', handleLogout);
    } else {
        loginButton.textContent = 'Login';
        loginButton.addEventListener('click', () => window.location.href = 'login.html');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
document.addEventListener('DOMContentLoaded', updateLoginButton);
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
} else {
    console.log("Le formulaire de connexion n'est pas présent sur cette page.");
}

export { updateLoginButton };