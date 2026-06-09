document.addEventListener("DOMContentLoaded", () => {
    // Face pagina vizibilă treptat
    document.body.classList.add("loaded");

    // Creare bară de progres
    const progressBar = document.createElement("div");
    progressBar.id = "progress-bar";
    document.body.appendChild(progressBar);

    window.onscroll = () => {
        let winScroll = document.documentElement.scrollTop;
        let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        let scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    };
});
