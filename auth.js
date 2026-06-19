/* ============================================================
   LOGICA PENTRU PAGINA DE AUTENTIFICARE
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Luăm clientul creat deja în script.js
    const client = window.supabaseClient; 

    const authForm = document.getElementById('auth-form-internal');
    const toggleBtn = document.getElementById('toggle-btn');
    const mainBtn = document.getElementById('main-btn');
    const authTitle = document.getElementById('auth-title');
    const authDesc = document.getElementById('auth-desc');
    const switchMsg = document.getElementById('switch-msg');
    const successBanner = document.getElementById('success-banner');
    const errorMsg = document.getElementById('error-msg');

    let isLoginMode = true;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            errorMsg.style.display = "none";
            if (isLoginMode) {
                authTitle.innerText = "Conectare";
                authDesc.innerText = "Bine ai revenit la Blog Aeon.";
                mainBtn.innerText = "Intră în cont";
                switchMsg.innerText = "Nu ai un cont?";
                toggleBtn.innerText = "Creează unul";
            } else {
                authTitle.innerText = "Creare Cont";
                authDesc.innerText = "Alătură-te comunității noastre teologice.";
                mainBtn.innerText = "Înregistrare";
                switchMsg.innerText = "Ai deja un cont?";
                toggleBtn.innerText = "Conectează-te";
            }
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = "none";
            mainBtn.disabled = true;
            mainBtn.innerText = "Se procesează...";

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                if (isLoginMode) {
                    const { error } = await client.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    window.location.href = "index.html";
                } else {
                    const { error } = await client.auth.signUp({ email, password });
                    if (error) throw error;
                    if (successBanner) successBanner.style.display = "block";
                    setTimeout(() => window.location.reload(), 3000);
                }
            } catch (err) {
                errorMsg.innerText = err.message;
                errorMsg.style.display = "block";
                mainBtn.disabled = false;
                mainBtn.innerText = isLoginMode ? "Intră în cont" : "Înregistrare";
            }
        });
    }
});
