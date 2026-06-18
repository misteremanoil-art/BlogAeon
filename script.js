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
// Verifică statusul logării în header
async function checkAuthStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    const nav = document.querySelector('.header-right');

    if (user) {
        // Dacă e logat, adăugăm buton de Logout
        const logoutBtn = document.createElement('a');
        logoutBtn.href = "#";
        logoutBtn.innerText = "Ieșire";
        logoutBtn.onclick = async () => {
            await supabase.auth.signOut();
            window.location.reload();
        };
        nav.appendChild(logoutBtn);
    } else {
        // Dacă nu e logat, arătăm buton de Login
        const loginLink = document.createElement('a');
        loginLink.href = "autentificare.html";
        loginLink.innerText = "Logare";
        nav.appendChild(loginLink);
    }
}

document.addEventListener('DOMContentLoaded', checkAuthStatus);
