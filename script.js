document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");

    // ===== BARA DE PROGRES =====
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

    // ===== TIMP DE LECTURĂ =====
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

    // ===== MENIU HAMBURGER (MOBIL) =====
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener("click", () => {
            const isOpen = hamburgerBtn.getAttribute("aria-expanded") === "true";
            hamburgerBtn.setAttribute("aria-expanded", String(!isOpen));
            mobileMenu.setAttribute("aria-hidden", String(isOpen));
            hamburgerBtn.classList.toggle("is-open", !isOpen);
            mobileMenu.classList.toggle("is-open", !isOpen);
        });

        // Închide meniul când se dă click pe un link
        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                hamburgerBtn.setAttribute("aria-expanded", "false");
                mobileMenu.setAttribute("aria-hidden", "true");
                hamburgerBtn.classList.remove("is-open");
                mobileMenu.classList.remove("is-open");
            });
        });

        // Închide meniul la click în afara lui
        document.addEventListener("click", (e) => {
            if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                hamburgerBtn.setAttribute("aria-expanded", "false");
                mobileMenu.setAttribute("aria-hidden", "true");
                hamburgerBtn.classList.remove("is-open");
                mobileMenu.classList.remove("is-open");
            }
        });
    }

    // ===== NORMALIZARE DIACRITICE (pentru căutare) =====
    function normalizeDiacritics(str) {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    // ===== FILTRARE ȘI CĂUTARE CU MESAJ "NICIUN REZULTAT" =====
    const cards = Array.from(document.querySelectorAll(".card"));
    const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));
    const searchInputs = Array.from(document.querySelectorAll(".search-box input"));

    // Mesaj "niciun rezultat" pentru pagina blog.html
    let noResultsMsg = document.getElementById("no-results-blog");
    if (!noResultsMsg && cards.length > 0) {
        noResultsMsg = document.createElement("div");
        noResultsMsg.id = "no-results-blog";
        noResultsMsg.style.cssText = "display:none; text-align:center; padding:40px 20px; grid-column:1/-1;";
        noResultsMsg.innerHTML = `
            <p style="font-family:var(--serif); font-size:1.4rem; color:#4a4743; margin-bottom:12px;">
                Ne pare rău, niciun articol nu corespunde căutării tale.
            </p>
            <p style="color:var(--muted); margin-bottom:0;">Încearcă un alt termen sau șterge filtrul activ.</p>
        `;
        const container = cards[0]?.closest("section") || cards[0]?.parentElement;
        if (container) container.appendChild(noResultsMsg);
    }

    const applyFilters = (activeFilter = "all", query = "") => {
        const normalizedQuery = normalizeDiacritics(query.trim());
        let visibleCount = 0;

        cards.forEach((card) => {
            const categories = normalizeDiacritics(card.dataset.category || "");
            const text = normalizeDiacritics(card.innerText);
            const matchesCategory = activeFilter === "all" || categories.includes(normalizeDiacritics(activeFilter));
            const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
            const isVisible = matchesCategory && matchesQuery;
            card.style.display = isVisible ? "block" : "none";
            if (isVisible) visibleCount++;
        });

        if (noResultsMsg) {
            noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
        }
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

    // ===== PAGINARE (pentru blog.html) =====
    const articlesContainer = document.getElementById("articles-container");
    const paginationContainer = document.getElementById("pagination");
    const CARDS_PER_PAGE = 6;

    if (articlesContainer && paginationContainer && cards.length > CARDS_PER_PAGE) {
        let currentPage = 1;
        const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE);

        function showPage(page) {
            currentPage = page;
            cards.forEach((card, index) => {
                const start = (page - 1) * CARDS_PER_PAGE;
                const end = start + CARDS_PER_PAGE;
                card.style.display = (index >= start && index < end) ? "block" : "none";
            });
            renderPagination();
            // Scroll la top al grilei
            articlesContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        function renderPagination() {
            paginationContainer.innerHTML = "";

            // Buton "Anterior"
            if (currentPage > 1) {
                const prev = document.createElement("button");
                prev.className = "pagination-btn";
                prev.textContent = "← Anterior";
                prev.addEventListener("click", () => showPage(currentPage - 1));
                paginationContainer.appendChild(prev);
            }

            // Numere pagini
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement("button");
                btn.className = "pagination-btn" + (i === currentPage ? " active" : "");
                btn.textContent = i;
                btn.setAttribute("aria-label", `Pagina ${i}`);
                btn.addEventListener("click", () => showPage(i));
                paginationContainer.appendChild(btn);
            }

            // Buton "Următor"
            if (currentPage < totalPages) {
                const next = document.createElement("button");
                next.className = "pagination-btn";
                next.textContent = "Următor →";
                next.addEventListener("click", () => showPage(currentPage + 1));
                paginationContainer.appendChild(next);
            }
        }

        showPage(1);
    }

    // ===== BUTON ÎNAPOI SUS =====
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
