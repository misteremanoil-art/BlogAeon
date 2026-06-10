document.addEventListener("DOMContentLoaded", () => {
    // 1. Facem pagina să apară fluid
    document.body.classList.add("loaded");

    // 2. Creăm bara de progres dinamic
    const progressBar = document.createElement("div");
    progressBar.id = "progress-bar";
    document.body.appendChild(progressBar);

    // 3. Calculăm Reading Progress
    window.addEventListener("scroll", () => {
        let winScroll = document.documentElement.scrollTop;
        let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        let scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });

    // 4. Calculăm timpul estimat de citire
    const articleBody = document.querySelector(".essay-content");
    if (articleBody) {
        const text = articleBody.innerText;
        const wpm = 225; // cuvinte pe minut
        const words = text.trim().split(/\s+/).length;
        const time = Math.ceil(words / wpm);
        const timeElement = document.querySelector(".reading-time");
        if (timeElement) timeElement.innerText = `${time} min de lectură`;
    }
});
