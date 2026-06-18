// === ACTUALIZARE HEADER ÎN FUNCȚIE DE STATUSUL AUTENTIFICĂRII ===

async function updateAuthUI() {
    const nav = document.querySelector('.header-right');
    if (!nav) return;

    // Șterge link-ul vechi de autentificare dacă există
    const existingAuthLink = document.getElementById('auth-link');
    if (existingAuthLink) existingAuthLink.remove();

    // Verificăm dacă utilizatorul este logat
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // === UTILIZATOR LOGAT ===
        const accountLink = document.createElement('a');
        accountLink.id = 'auth-link';
        accountLink.href = '#';
        accountLink.innerText = 'Contul meu';
        accountLink.style.fontWeight = '600';
        accountLink.style.color = 'var(--text-main)';

        // La click → Logout
        accountLink.onclick = async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.reload(); // Reîmprospătează pagina
        };

        nav.appendChild(accountLink);
    } else {
        // === UTILIZATOR NELOGAT ===
        const loginLink = document.createElement('a');
        loginLink.id = 'auth-link';
        loginLink.href = 'autentificare.html';
        loginLink.innerText = 'Conectare';
        loginLink.style.fontWeight = '700';
        loginLink.style.color = 'var(--accent)';

        nav.appendChild(loginLink);
    }
}

// Rulează funcția când pagina se încarcă
document.addEventListener('DOMContentLoaded', updateAuthUI);
