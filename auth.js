// CONFIGURARE SUPABASE (Înlocuiește cu datele tale din setările Supabase)
const SUPABASE_URL = 'sb_publishable_ejSs6WkxzS_BzoqSjUMInw_-vqKAdE_';
const SUPABASE_ANON_KEY = 'sb_secret_NS2DqXq5KN0OMCJG3S7yyQ_V76ek6MW';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const switchAuthBtn = document.getElementById('switch-auth');
const submitBtn = document.getElementById('submit-btn');

let isLogin = true;

// Comutare între Login și Register
switchAuthBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    authTitle.innerText = isLogin ? 'Conectare' : 'Cont Nou';
    submitBtn.innerText = isLogin ? 'Intră în cont' : 'Înregistrează-te';
    document.getElementById('switch-text').innerText = isLogin ? 'Nu ai cont?' : 'Ai deja cont?';
    switchAuthBtn.innerText = isLogin ? 'Creează unul' : 'Conectează-te';
});

// Manipulare Formular
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
        else window.location.href = 'index.html'; // Redirecționare la succes
    } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) alert(error.message);
        else alert('Verifică-ți email-ul pentru confirmare!');
    }
});
