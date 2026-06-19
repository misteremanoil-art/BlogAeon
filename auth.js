/* ============================================================
   LOGICA PENTRU PAGINA DE AUTENTIFICARE
   ============================================================ */

// Așteptăm să se încarce DOM-ul
document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form-internal');
    const toggleBtn = document.getElementById('toggle-btn');
    const mainBtn = document.getElementById('main-btn');
    const authTitle = document.getElementById('auth-title');
    const authDesc = document.getElementById('auth-desc');
    const switchMsg = document.getElementById('switch-msg');
    const successBanner = document.getElementById('success-banner');
    const errorMsg = document.getElementById('error-msg');

    let isLoginMode = true;

    // 1. FUNCȚIA DE COMUTARE (Login <-> Creare Cont)
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

    // 2. LOGICA DE SUBMIT (Login & Register)
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            errorMsg.style.display = "none";
            if (successBanner) successBanner.style.display = "none";
            
            mainBtn.disabled = true;
            mainBtn.innerText = "Se procesează...";

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                if (isLoginMode) {
                    // --- LOGIN ---
                    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    
                    window.location.href = "index.html";
                } else {
                    // --- REGISTER ---
                    const { data, error } = await supabaseClient.auth.signUp({ email, password });
                    if (error) throw error;

                    // Succes vizual
                    if (successBanner) successBanner.style.display = "block";
                    mainBtn.innerText = "Cont creat!";
                    
                    setTimeout(() => {
                        window.location.reload(); // Refresh pentru a reveni la login
                    }, 3000);
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
