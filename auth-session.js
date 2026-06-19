// Configurare Supabase (aceleași chei)
const SUPABASE_URL = 'https://wlqdalqyrlmehkqwvviy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ejSs6WkxzS_BzoqSjUMInw_-vqKAdE_';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateHeaderStatus() {
    // Verificăm sesiunea
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    // Căutăm butonul de logare în pagină
    const authLink = document.getElementById('auth-link-header');

    if (user && authLink) {
        // Dacă utilizatorul e logat, schimbăm link-ul
        const name = user.user_metadata.full_name || "Contul meu";
        authLink.innerText = name;
        authLink.href = "profil.html"; // Îl trimitem la setări
        authLink.style.fontWeight = "700";
        authLink.style.color = "var(--accent)";
    }
}

// Rulăm funcția la fiecare încărcare de pagină
document.addEventListener('DOMContentLoaded', updateHeaderStatus);
