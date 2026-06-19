/* ============================================================
   LOGICA PENTRU PAGINA DE AUTENTIFICARE
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Folosim variabila creată în script.js
    const client = window.supabaseClient; 

    const form = document.getElementById('auth-form-internal');
    const tglBtn = document.getElementById('toggle-btn');
    const mBtn = document.getElementById('main-btn');
    const authTitle = document.getElementById('auth-title');
    const authDesc = document.getElementById('auth-desc');
    const switchMsg = document.getElementById('switch-msg');
    const successBanner = document.getElementById('success-banner');
    const errorMsg = document.getElementById('error-msg');

    let isLoginMode = true;

    if (tglBtn) {
        tglBtn.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            if (isLoginMode) {
                authTitle.innerText = "Conectare";
                authDesc.innerText = "Bine ai revenit.";
                mBtn.innerText = "Intră în cont";
                switchMsg.innerText = "Nu ai un cont?";
                tglBtn.innerText = "Creează unul";
            } else {
                authTitle.innerText = "Creare Cont";
                authDesc.innerText = "Alătură-te comunității.";
                mBtn.innerText = "Înregistrare";
                switchMsg.innerText = "Ai deja un cont?";
                tglBtn.innerText = "Conectează-te";
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = "none";
            mBtn.disabled = true;

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
                mBtn.disabled = false;
            }
        });
    }
});
