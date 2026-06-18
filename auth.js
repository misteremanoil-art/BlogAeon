// CONFIGURARE SUPABASE
const SUPABASE_URL = 'https://wlqdalqyrlmehkqwvviy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ejSs6WkxzS_BzoqSjUMInw_-vqKAdE_';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ELEMENTE DOM
const toggleBtn = document.getElementById('toggle-btn');
const authTitle = document.getElementById('auth-title');
const authDesc = document.getElementById('auth-desc');
const mainBtn = document.getElementById('main-btn');
const switchMsg = document.getElementById('switch-msg');
const errorMsg = document.getElementById('error-msg');
const successBanner = document.getElementById('success-banner');
const authForm = document.getElementById('auth-form-internal');

let isLoginMode = true;

// FUNCȚIE ACTUALIZARE TEXTE
function updateUI() {
    if (isLoginMode) {
        authTitle.innerText = "Conectare";
        authDesc.innerText = "Bine ai revenit la Blog Aeon.";
        mainBtn.innerText = "Intră în cont";
        switchMsg.innerText = "Nu ai un cont?";
        toggleBtn.innerText = "Creează unul";
    } else {
        authTitle.innerText = "Creare Cont";
        authDesc.innerText = "Alătură-te comunității noastre.";
        mainBtn.innerText = "Înregistrare";
        switchMsg.innerText = "Ai deja un cont?";
        toggleBtn.innerText = "Conectează-te";
    }
}

// EVENT LISTENERS
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        updateUI();
        errorMsg.style.display = "none";
    });
}

if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = "none";
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        mainBtn.disabled = true;
        const originalText = mainBtn.innerText;
        mainBtn.innerText = "Se procesează...";

        try {
            if (isLoginMode) {
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                window.location.href = "index.html";
            } else {
                const { error } = await supabaseClient.auth.signUp({ email, password });
                if (error) throw error;

                successBanner.style.display = "block";
                setTimeout(() => {
                    successBanner.style.display = "none";
                    isLoginMode = true;
                    updateUI();
                    document.getElementById('password').value = "";
                    mainBtn.disabled = false;
                }, 3000);
            }
        } catch (err) {
            errorMsg.innerText = err.message;
            errorMsg.style.display = "block";
            mainBtn.disabled = false;
            mainBtn.innerText = originalText;
        }
    });
}
