window.addEventListener("load", () => {
    // 1. Trigger la animația de intrare (Fade-in)
    document.body.classList.add("loaded");

    // 2. Bara de progres la citire
    const progressBar = document.createElement("div");
    progressBar.id = "progress-bar";
    document.body.appendChild(progressBar);

    window.addEventListener("scroll", () => {
        let winScroll = document.documentElement.scrollTop;
        let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        let scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });
});
/* Animație pentru a face pagina să apară fluid când se încarcă */
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

