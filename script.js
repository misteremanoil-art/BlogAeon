/* ============================================================
   1. CONFIGURARE GLOBALĂ SUPABASE & BAZĂ DE DATE
   ============================================================ */

// Protecție redeclarare Client Supabase
if (typeof window.supabaseClient === 'undefined') {
    const sbUrl = 'https://wlqdalqyrlmehkqwvviy.supabase.co';
    const sbKey = 'sb_publishable_ejSs6WkxzS_BzoqSjUMInw_-vqKAdE_';
    window.supabaseClient = supabase.createClient(sbUrl, sbKey);
}

// Protecție redeclarare Bază de Date Articole
if (typeof window.articoleDB === 'undefined') {
    window.articoleDB = [
        { titlu: "Chemarea divină și răspunsul nostru", descriere: "Pilda scuzelor din Luca 14 și importanța răspunsului personal.", url: "articol-chemarea-divina.html", tags: "teologie chemare" },
        { titlu: "Rugăciunea, între egocentrism și teocentrism", descriere: "Cum rugăciunea personală poate deveni centrată pe voia lui Dumnezeu.", url: "rugaciunea-egocentrism-si-teocentrism.html", tags: "rugaciune teologie" },
        { titlu: "Redescoperind Comuniunea Personală", descriere: "Un ghid practic în trei pași pentru o rugăciune personală profundă.", url: "redescoperind-comuniunea-personala.html", tags: "rugaciune" },
        { titlu: "Rediscovering Personal Communion", descriere: "A pastor’s three-step guide to personal prayer based on Matthew 6:6.", url: "rediscovering-personal-communion.html", tags: "prayer" }
    ];
}

/* ============================================================
   2. FUNCȚII DE SESIUNE ȘI ISTORIC
   ============================================================ */

async function updateGlobalUI() {
    const authLink = document.getElementById('auth-link-header');
    if (!authLink) return;

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        
        if (user) {
            const userName = user.user_metadata.full_name || user.email.split('@')[0];
            authLink.innerText = userName;
            authLink.href = "profil.html";
            authLink.style.color = "var(--accent)";
            authLink.style.fontWeight = "700";

            // LOGICĂ ISTORIC LECTURĂ
            const articleTitle = document.querySelector('h1')?.innerText;
            const articleUrl = window.location.pathname.split('/').pop();

            if (articleTitle && (articleUrl.includes('articol-') || articleUrl.includes('rugaciunea-') || articleUrl.includes('rediscovering-') || articleUrl.includes('redescoperind-'))) {
                let history = JSON.parse(localStorage.getItem('reading_history') || '[]');
                history = history.filter(item => item.url !== articleUrl);
                history.unshift({ title: articleTitle, url: articleUrl });
                localStorage.setItem('reading_history', JSON.stringify(history.slice(0, 5)));
            }
        }
    } catch (e) {
        console.log("Sesiune: Vizitator nelogat.");
    }
}

/* ============================================================
   3. MOTORUL DE CĂUTARE
   ============================================================ */
function executaCautarea() {
    const resultsContainer = document.getElementById('results-list');
    if (!resultsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q')?.toLowerCase().trim() || "";
    
    const titleElement = document.getElementById('search-title');
    if (titleElement) titleElement.innerText = query ? `Rezultate pentru: "${query}"` : "Căutare";

    const filtrate = window.articoleDB.filter(a => 
        a.titlu.toLowerCase().includes(query) || 
        a.descriere.toLowerCase().includes(query)
    );

    if (filtrate.length > 0) {
        resultsContainer.innerHTML = filtrate.map(a => `
            <a href="${a.url}" class="card" style="display:block; padding:25px; margin-bottom:15px; text-decoration:none; border: 1px solid rgba(0,0,0,0.08); border-radius:15px;">
                <h3 style="color:#4a4743; margin-bottom:10px;">${a.titlu}</h3>
                <p style="color:rgba(74,71,67,0.7); font-size:0.95rem;">${a.descriere}</p>
            </a>`).join('');
    } else {
        const noRes = document.getElementById('no-results');
        if (noRes) noRes.style.display = "block";
    }
}

/* ============================================================
   4. LOGICĂ UI (Progres, Filtre, Back-to-top)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    updateGlobalUI();
    executaCautarea();

    document.body.classList.add("loaded");

    // --- BARA DE PROGRES ---
    if (!document.getElementById('progress-bar')) {
        const progressBar = document.createElement("div");
        progressBar.id = "progress-bar";
        document.body.appendChild(progressBar);

        const updateProgress = () => {
            const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            progressBar.style.width = `${Math.min(100, scrolled)}%`;
        };
        window.addEventListener("scroll", updateProgress, { passive: true });
    }

    // --- TIMP DE LECTURĂ ---
    const articleBody = document.querySelector(".essay-content");
    const timeElement = document.querySelector(".reading-time");
    if (articleBody && timeElement) {
        const words = articleBody.innerText.trim().split(/\s+/).length;
        const time = Math.max(1, Math.ceil(words / 225));
        timeElement.textContent = `${time} min de lectură`;
    }

    // --- FILTRARE ---
    const cards = Array.from(document.querySelectorAll(".card"));
    const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));
    
    if (filterButtons.length) {
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                const filter = button.dataset.filter || "all";
                filterButtons.forEach(chip => chip.classList.toggle("active", chip === button));
                cards.forEach(card => {
                    const cat = (card.dataset.category || "").toLowerCase();
                    card.style.display = (filter === "all" || cat.includes(filter.toLowerCase())) ? "block" : "none";
                });
            });
        });
    }

    // --- BACK TO TOP ---
    const btt = document.querySelector(".back-to-top");
    if (btt) {
        window.addEventListener("scroll", () => {
            btt.classList.toggle("visible", window.scrollY > 320);
        }, { passive: true });
        btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
});
/* ============================================================
   LOGICA SECȚIUNE SUSȚINERE (FINAL ARTICOL)
   Gestionează selecția sumelor și afișarea câmpului "Alta"
   ============================================================ */

function initSupportSection() {
    // Referințe către elementele din HTML
    const choices = document.querySelectorAll('.s-choice');
    const customTrigger = document.getElementById('s-custom-trigger');
    const customBox = document.getElementById('s-custom-box');
    const customField = document.getElementById('s-custom-field');

    // Verificăm dacă suntem pe o pagină care are această secțiune
    if (!choices.length) return;

    // 1. GESTIONARE CLICK PE BUTOANE (FRECVENȚĂ ȘI SUME FIXE)
    choices.forEach(btn => {
        btn.addEventListener('click', () => {
            // Găsim rândul (părintele) butonului pentru a reseta doar acel grup
            const parentRow = btn.parentElement;
            parentRow.querySelectorAll('.s-choice').forEach(b => b.classList.remove('active'));
            
            // Activăm butonul curent
            btn.classList.add('active');

            // 2. LOGICĂ ASCUNDERE AUTOMATĂ CÂMP "ALTA"
            // Dacă butonul apăsat are clasa 's-amt-preset' ($5, $10), ascundem câmpul custom
            if (btn.classList.contains('s-amt-preset') && customBox) {
                customBox.classList.remove('active');
            }
        });
    });

    // 3. LOGICĂ AFIȘARE CÂMP "ALTA SUMĂ"
    if (customTrigger && customBox) {
        customTrigger.addEventListener('click', () => {
            // Adăugăm clasa .active care declanșează animația din CSS
            customBox.classList.add('active');
            
            // Punem automat cursorul în câmpul de text
            if (customField) customField.focus();
        });
    }
}

// Lansăm funcția la încărcarea paginii
document.addEventListener('DOMContentLoaded', initSupportSection);
/* ============================================================
  /* ============================================================
   LOGICA DARK MODE (REPARATĂ)
   ============================================================ */
function applyTheme(theme) {
    const html = document.documentElement;
    const moon = document.getElementById('moon-icon');
    const sun = document.getElementById('sun-icon');

    if (theme === 'dark') {
        html.classList.add('dark');
        if (moon) moon.style.display = 'none';
        if (sun) sun.style.display = 'block';
    } else {
        html.classList.remove('dark');
        if (moon) moon.style.display = 'block';
        if (sun) sun.style.display = 'none';
    }
}

// 1. Verificăm tema imediat (pentru a evita flash-ul alb)
const savedTheme = localStorage.getItem('aeon-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(savedTheme);

// 2. Activăm butonul după ce se încarcă pagina
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.onclick = (e) => {
            e.preventDefault(); // Prevenim orice comportament ciudat
            const isDark = document.documentElement.classList.contains('dark');
            const newTheme = isDark ? 'light' : 'dark';
            
            localStorage.setItem('aeon-theme', newTheme);
            applyTheme(newTheme);
            console.log("Tema s-a schimbat în:", newTheme);
        };
    }
});





