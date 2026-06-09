document.addEventListener("DOMContentLoaded", () => {
    // 1. Fade in effect la încărcare
    document.body.classList.add("loaded");

    // 2. Bara de progres la citire
    const progressBar = document.createElement("div");
    progressBar.id = "progress-bar";
    document.body.appendChild(progressBar);

    window.onscroll = () => {
        // Update progres bar
        let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        let scrolled = (winScroll / height) * 100;
        document.getElementById("progress-bar").style.width = scrolled + "%";

        // Scroll effect pentru Header
        const header = document.querySelector("header");
        if (winScroll > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };
});
