const SUPABASE_URL = 'https://wlqdalqyrlmehkqwvviy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ejSs6WkxzS_BzoqSjUMInw_-vqKAdE_';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const authLink = document.getElementById('auth-link-header'); // Asigură-te că ai acest ID în HTML

    if (user) {
        // Dacă utilizatorul e logat
        const userName = user.user_metadata.full_name || user.email.split('@')[0];
        authLink.innerText = `Salut, ${userName}`;
        authLink.href = "profil.html"; // Îl trimitem la pagina de profil
        authLink.style.color = "var(--accent)";
    }
}

document.addEventListener('DOMContentLoaded', checkUser);
