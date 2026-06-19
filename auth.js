// Configurație Supabase
const SUPABASE_URL = 'https://wlqdalqyrlmehkqwvviy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ejSs6WkxzS_BzoqSjUMInw_-vqKAdE_';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authForm = document.getElementById('auth-form-internal');
const toggleBtn = document.getElementById('toggle-btn');
const mainBtn = document.getElementById('main-btn');
const successBanner = document.getElementById('success-banner');
const errorMsg = document.getElementById('error-msg');

let isLoginMode = true;

// Comutare Login/Register
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        document.getElementById('auth-title').innerText = isLoginMode ? "Conectare" : "Creare Cont";
        mainBtn.innerText = isLoginMode ? "Intră în cont" : "Înregistrare";
        document.getElementById('switch-msg').innerText = isLoginMode ? "Nu ai un cont?" : "Ai deja un cont?";
        toggleBtn.innerText = isLoginMode ? "Creează unul" : "Conectează-te";
    });
}

// Logica de Submit
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            if (isLoginMode) {
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                window.location.href = "index.html";
            } else {
                const { error } = await supabaseClient.auth.signUp({ email, password });
                if (error) throw error;
                successBanner.style.display = "block";
                setTimeout(() => { location.reload(); }, 3000);
            }
        } catch (err) {
            errorMsg.innerText = err.message;
            errorMsg.style.display = "block";
        }
    });
}
