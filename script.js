/* ============================================================
   1. CONFIGURARE GLOBALĂ SUPABASE
   Folosim un check pentru a preveni eroarea de redeclarare
   ============================================================ */
if (typeof window.supabaseClient === 'undefined') {
    const sbUrl = 'https://wlqdalqyrlmehkqwvviy.supabase.co';
    const sbKey = 'sb_publishable_ejSs6WkxzS_BzoqSjUMInw_-vqKAdE_';
    window.supabaseClient = supabase.createClient(sbUrl, sbKey);
}

/* ============================================================
   2. BAZA DE DATE ARTICOLE (Pentru Motorul de Căutare)
   ============================================================ */
const articoleDB = [
    { titlu: "Chemarea divină și răspunsul nostru", descriere: "Pilda scuzelor din Luca 14 și importanța răspunsului personal.", url: "articol-chemarea-divina.html", tags: "teologie chemare" },
    { titlu: "Rugăciunea, între egocentrism și teocentrism", descriere: "Cum rugăciunea personală poate deveni centrată pe voia lui Dumnezeu.", url: "rugaciunea-egocentrism-si-teocentrism.html", tags: "rugaciune teologie" },
    { titlu: "Redescoperind Comuniunea Personală", descriere: "Un ghid practic în trei pași pentru o rugăciune personală profundă.", url: "redescoperind-comuniunea-personala.html", tags: "rugaciune" },
    { titlu: "Rediscovering Personal Communion", descriere: "A pastor’s three-step guide to personal prayer based on Matthew 6:6.", url: "rediscovering-personal-communion.html", tags: "prayer" }
];

/* ============================================================
   3. FUNCȚII DE SESIUNE ȘI ISTORIC LECTURĂ
   ============================================================ */

async function updateGlobalHeaderAndHistory() {
    const authLink = document.getElementById('auth-link-header');
    if (!authLink) return;

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        
        if (user) {
            // Actualizăm Header-ul cu numele utilizatorului
            const userName = user.user_metadata.full_name || user.email.split('@')[0];
            authLink.innerText = userName;
            authLink.href = "profil.html";
            authLink.style.color = "var(--accent)";
            authLink.style.fontWeight = "700";

            // LOGICĂ ISTORIC LECTURĂ
            const articleTitle = document.querySelector('h1')?.innerText;
            const articleUrl = window.location.pathname.split('/').pop();

            // Salvăm în istoric doar dacă suntem pe o pagină de articol validă
            if (articleTitle && (articleUrl.includes('articol-') || articleUrl.includes('rugaciunea-') || articleUrl.includes('rediscovering-') || articleUrl.includes('redescoperind-'))) {
                let history = JSON.parse(localStorage.getItem('reading_history') || '[]');
                history = history.filter(item => item.url !== articleUrl); // Evităm duplicatele
                history.unshift({ title: articleTitle, url: articleUrl }); // Adăugăm la început
                localStorage.setItem('reading_history', JSON.stringify(history.slice(0, 5))); // Păstrăm ultimele 5
            }
        }
    } catch (e) {
        console.log("Sesiune: Utilizator nelogat.");
    }
}

/* ============================================================
   4. MOTORUL DE CĂUTARE (Pentru pagina cautare.html)
   ============================================================ */
function executaCautarea() {
    const resultsContainer = document.getElementById('results-list');
    if (!resultsContainer) return; // Oprim dacă nu suntem pe pagina de căutare

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q')?.toLowerCase().trim() || "";
    
    const titleElement = document.getElementById('search-title');
    if (titleElement) titleElement.innerText = query ? `Rezultate pentru: "${query}"` : "Căutare";

    const filtrate = articoleDB.filter(a => 
        a.titlu.toLowerCase().includes(query) || 
        a.tags.toLowerCase().includes(query) ||
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
   5. LOGICĂ UI (Progres, Lectură, Filtre, Back-to-top)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    // Inițializăm funcțiile de bază
    updateGlobalHeaderAndHistory();
    executaCautarea();

    document.body.classList.add("loaded");

    // --- BARA DE PROGRES PE SCROLL ---
    const progressBar = document.createElement("div");
    progressBar.id = "progress-bar";
    document.body.appendChild(progressBar);

    const updateProgress = () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, scrolled))}%`;
    };
    window.addEventListener("scroll", updateProgress, { passive: true });

    // --- CALCULATOR TIMP DE LECTURĂ ---
    const articleBody = document.querySelector(".essay-content");
    if (articleBody) {
        const text = articleBody.innerText || "";
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const time = Math.max(1, Math.ceil(words / 225));
        const timeElement = document.querySelector(".reading-time");
        if (timeElement) {
            timeElement.textContent = `${time} min de lectură`;
        }
    }

    // --- SISTEM DE FILTRARE (Index / Blog) ---
    const cards = Array.from(document.querySelectorAll(".card"));
    const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));
    const searchInputs = Array.from(document.querySelectorAll(".search-box input"));

    const applyFilters = (activeFilter = "all", query = "") => {
        const normalizedQuery = query.trim().toLowerCase();
        cards.forEach((card) => {
            const categories = (card.dataset.category || "").toLowerCase();
            const text = card.innerText.toLowerCase();
            const matchesCategory = activeFilter === "all" || categories.includes(activeFilter.toLowerCase());
            const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
            card.style.display = matchesCategory && matchesQuery ? "block" : "none";
        });
    };

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const activeFilter = button.dataset.filter || "all";
            filterButtons.forEach((chip) => chip.classList.toggle("active", chip === button));
            applyFilters(activeFilter, searchInputs[0]?.value || "");
        });
    });

    searchInputs.forEach((input) => {
        input.addEventListener("input", () => {
            const activeFilter = document.querySelector(".filter-chip.active")?.dataset.filter || "all";
            applyFilters(activeFilter, input.value);
        });
    });

    // --- BUTONUL BACK TO TOP ---
    const backToTop = document.querySelector(".back-to-top");
    if (backToTop) {
        window.addEventListener("scroll", () => {
            backToTop.classList.toggle("visible", window.scrollY > 320);
        }, { passive: true });
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});
