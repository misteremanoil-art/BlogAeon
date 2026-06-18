const SUPABASE_URL = 'https://wlqdalqyrlmehkqwvviy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ejSs6WkxzS_BzoqSjUMInw_-vqKAdE_';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const submitBtn = document.getElementById('submit-btn');
const switchAuth = document.getElementById('switch-auth');
const switchText = document.getElementById('switch-text');
const errorMessage = document.getElementById('error-message');

let isLogin = true;

function updateUI() {
    if (isLogin) {
        authTitle.innerText = 'Conectare';
        authSubtitle.innerText = 'Intră în contul tău pentru a accesa conținut exclusiv.';
        submitBtn.innerText = 'Intră în cont';
        switchText.innerText = 'Nu ai cont?';
        switchAuth.innerText = 'Creează unul';
    } else {
        authTitle.innerText = 'Creează cont';
        authSubtitle.innerText = 'Creează un cont pentru a accesa rubrica de eseuri teologice.';
        submitBtn.innerText = 'Creează cont';
        switchText.innerText = 'Ai deja cont?';
        switchAuth.innerText = 'Conectează-te';
    }
    errorMessage.style.display = 'none';
}

// Comutare între Login și Register
switchAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    updateUI();
});

// Trimiterea formularului
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        errorMessage.innerText = 'Te rugăm să completezi emailul și parola.';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            alert('Autentificare reușită!');
            window.location.href = 'index.html';
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            alert('Cont creat cu succes! Verifică-ți email-ul pentru confirmare.');
        }
    } catch (error) {
        errorMessage.innerText = error.message;
        errorMessage.style.display = 'block';
    }
});

// Inițializare
updateUI();
