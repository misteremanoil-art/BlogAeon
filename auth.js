// === CONFIGURARE SUPABASE ===
const SUPABASE_URL = 'https://wlqdalqyrlmehkqwvviy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ejSs6WkxzS_BzoqSjUMInw_-vqKAdE_';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elemente HTML
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const submitBtn = document.getElementById('submit-btn');
const switchAuth = document.getElementById('switch-auth');
const switchText = document.getElementById('switch-text');
const errorMessage = document.getElementById('error-message');

let isLogin = true;

// Comutare între Login și Register
switchAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;

    authTitle.innerText = isLogin ? 'Conectare' : 'Cont Nou';
    submitBtn.innerText = isLogin ? 'Intră în cont' : 'Creează cont';
    switchText.innerText = isLogin ? 'Nu ai cont?' : 'Ai deja cont?';
    switchAuth.innerText = isLogin ? 'Creează unul' : 'Conectează-te';
    
    errorMessage.style.display = 'none';
});

// Trimiterea formularului
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isLogin) {
            // === LOGIN ===
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            window.location.href = 'index.html';
        } else {
            // === REGISTER ===
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            alert('Cont creat cu succes! Verifică-ți email-ul pentru confirmare.');
        }
    } catch (error) {
        errorMessage.innerText = error.message;
        errorMessage.style.display = 'block';
    }
});
