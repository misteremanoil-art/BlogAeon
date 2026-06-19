// 1. Configurare unică Supabase
const SUPABASE_URL = 'https://wlqdalqyrlmehkqwvviy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ejSs6WkxzS_BzoqSjUMInw_-vqKAdE_';

// Verificăm dacă supabase este deja definit (pentru a evita erorile de duplicare)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Funcția care actualizează Header-ul (Logare -> Nume)
async function updateHeaderStatus() {
    const authLink = document.getElementById('auth-link-header');
    if (!authLink) return;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (user) {
            const userName = user.user_metadata.full_name || user.email.split('@')[0];
            authLink.innerText = userName; // Afișăm numele sau emailul
            authLink.href = "profil.html"; 
            authLink.style.color = "var(--accent)";
            authLink.style.fontWeight = "700";
        }
    } catch (err) {
        console.error("Eroare sesiune:", err);
    }
}

// 3. Rulăm funcția la încărcare
document.addEventListener('DOMContentLoaded', updateHeaderStatus);
