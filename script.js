alert("Scriptul s-a încărcat!");
document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");

    const progressBar = document.createElement("div");
    progressBar.id = "progress-bar";
    document.body.appendChild(progressBar);

    const updateProgress = () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, scrolled))}%`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });

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

    if (filterButtons.length) {
        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const activeFilter = button.dataset.filter || "all";
                filterButtons.forEach((chip) => chip.classList.toggle("active", chip === button));
                const currentQuery = searchInputs[0]?.value || "";
                applyFilters(activeFilter, currentQuery);
            });
        });
    }

    searchInputs.forEach((input) => {
        input.addEventListener("input", () => {
            const activeFilter = document.querySelector(".filter-chip.active")?.dataset.filter || "all";
            applyFilters(activeFilter, input.value);
        });
    });

    const backToTop = document.querySelector(".back-to-top");
    if (backToTop) {
        const toggleButton = () => {
            backToTop.classList.toggle("visible", window.scrollY > 320);
        };

        toggleButton();
        window.addEventListener("scroll", toggleButton, { passive: true });
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});
// Baza de date a blogului
const articoleDB = [
    {
        titlu: "Chemarea divină și răspunsul nostru",
        descriere: "Pilda scuzelor din Luca 14 și importanța de a răspunde chemării lui Dumnezeu.",
        url: "articol-chemarea-divina.html",
        tags: "chemare pilda luca teologie"
    },
    {
        titlu: "Rugăciunea, între egocentrism și teocentrism",
        descriere: "Cum rugăciunea personală poate deveni centrată pe sine sau pe voia lui Dumnezeu.",
        url: "rugaciunea-egocentrism-si-teocentrism.html",
        tags: "rugaciune teologie matei"
    },
    {
        titlu: "Redescoperind Comuniunea Personală",
        descriere: "Un ghid practic în trei pași pentru o rugăciune personală profundă.",
        url: "redescoperind-comuniunea-personala.html",
        tags: "rugaciune pastor guide"
    },
    {
        titlu: "Rediscovering Personal Communion",
        descriere: "A pastor’s three-step guide to personal prayer based on Matthew 6:6.",
        url: "rediscovering-personal-communion.html",
        tags: "prayer ministry guide"
    }
];
/* ============================================================
   BAZĂ DE DATE ARTICOLE
   Adaugă aici orice articol nou sub formă de obiect {titlu, descriere, url, tags}
   ============================================================ */
const articoleDB = [
    {
        titlu: "Chemarea divină și răspunsul nostru",
        descriere: "Pilda scuzelor din Luca 14 și importanța de a răspunde chemării lui Dumnezeu.",
        url: "articol-chemarea-divina.html",
        tags: "chemare pilda luca teologie"
    },
    {
        titlu: "Rugăciunea, între egocentrism și teocentrism",
        descriere: "Cum rugăciunea personală poate deveni centrată pe sine sau pe voia lui Dumnezeu.",
        url: "rugaciunea-egocentrism-si-teocentrism.html",
        tags: "rugaciune teologie matei"
    },
    {
        titlu: "Redescoperind Comuniunea Personală",
        descriere: "Un ghid practic în trei pași pentru o rugăciune personală profundă.",
        url: "redescoperind-comuniunea-personala.html",
        tags: "rugaciune pastor guide"
    },
    {
        titlu: "Rediscovering Personal Communion",
        descriere: "A pastor’s three-step guide to personal prayer based on Matthew 6:6.",
        url: "rediscovering-personal-communion.html",
        tags: "prayer ministry guide"
    }
];

/* ============================================================
   LOGICA DE CĂUTARE (PENTRU PAGINA cautare.html)
   ============================================================ */
function executaCautarea() {
    const resultsContainer = document.getElementById('results-list');
    
    // Verificăm dacă suntem pe pagina de căutare
    if (!resultsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q')?.toLowerCase().trim() || "";
    
    const titleElement = document.getElementById('search-title');
    const noResults = document.getElementById('no-results');

    if (query === "") {
        if (titleElement) titleElement.innerText = "Te rugăm să introduci un termen de căutare.";
        return;
    }

    if (titleElement) titleElement.innerText = `Rezultate pentru: "${query}"`;

    const filtrate = articoleDB.filter(a => 
        a.titlu.toLowerCase().includes(query) || 
        a.descriere.toLowerCase().includes(query) ||
        a.tags.toLowerCase().includes(query)
    );

    if (filtrate.length > 0) {
        if (noResults) noResults.style.display = "none";
        resultsContainer.innerHTML = filtrate.map(a => `
            <a href="${a.url}" class="card" style="margin-bottom: 20px; display: block; text-decoration: none; padding: 20px; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px;">
                <h3 style="color: #4a4743; margin: 0 0 8px 0;">${a.titlu}</h3>
                <p style="color: rgba(74,71,67,0.7); font-size: 0.95rem; margin: 0;">${a.descriere}</p>
            </a>
        `).join('');
    } else {
        if (noResults) noResults.style.display = "block";
        resultsContainer.innerHTML = "";
    }
}

/* ============================================================
   CONTROL FORMULAR (PENTRU BARA DIN HEADER)
   ============================================================ */
function initializareFormular() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            if (searchInput.value.trim() === "") {
                e.preventDefault(); 
            }
        });
    }
}

// Rulăm ambele funcții când documentul este gata
document.addEventListener('DOMContentLoaded', () => {
    executaCautarea();
    initializareFormular();
});

         
