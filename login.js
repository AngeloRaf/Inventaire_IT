/*login */
// Helpers
function qs(sel){ return document.querySelector(sel); }

// Identifiants hardcodés
const VALID_USER = "admin";
const VALID_PASS = "1234";

qs('#loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  const user = qs('#loginUsername').value.trim();
  const pass = qs('#loginPassword').value.trim();

  if(user === VALID_USER && pass === VALID_PASS){
    // Sauvegarde de l'état connecté
    localStorage.setItem("authUser", user);

    qs('#loginMessage').textContent = "Connexion réussie ✅";
    qs('#loginMessage').hidden = false;

    setTimeout(function(){
      window.location.href = "index.html"; // redirection vers inventaire
    }, 1000);
  } else {
    qs('#loginMessage').textContent = "Identifiants invalides ❌";
    qs('#loginMessage').hidden = false;
  }
});
