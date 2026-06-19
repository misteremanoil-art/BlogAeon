/* ============================================================
   LOGICA FINALĂ PENTRU RECENZII (VARIANTA ULTRA-COMPACTĂ)
   ============================================================ */

async function initComments() {
    console.log("Comentarii: Pornire sistem compact...");

    // 1. Conexiunea la clientul global stabilit în script.js
    const client = window.supabaseClient;
    if (!client) {
        setTimeout(initComments, 200);
        return;
    }

    // 2. Referințe către elementele HTML
    const formContainer = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-to-comment');
    const commentsDisplay = document.getElementById('comments-display-list');
    const postBtn = document.getElementById('post-comment-btn');
    const textArea = document.getElementById('new-comment');

    // Siguranță: dacă nu suntem pe o pagină cu comentarii, oprim execuția
    if (!commentsDisplay) return;

    // 3. Funcția de actualizare interfață (Logat/Nelogat)
    const updateUI = (user) => {
        if (user) {
            if (formContainer) formContainer.style.setProperty('display', 'block', 'important');
            if (loginPrompt) loginPrompt.style.setProperty('display', 'none', 'important');
            setupPosting(user);
        } else {
            if (formContainer) formContainer.style.setProperty('display', 'none', 'important');
            if (loginPrompt) loginPrompt.style.setProperty('display', 'block', 'important');
        }
    };

    // Verificăm sesiunea la încărcare și la orice schimbare (login/logout)
    const { data: { session } } = await client.auth.getSession();
    updateUI(session?.user);

    client.auth.onAuthStateChange((event, session) => {
        updateUI(session?.user);
    });

    // 4. Încărcarea comentariilor din baza de date
    async function loadComments() {
        const articleUrl = window.location.pathname.split('/').pop() || "index.html";
        
        const { data, error } = await client
            .from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error) {
            console.error("Eroare încărcare:", error);
            return;
        }

        if (!data || data.length === 0) {
            commentsDisplay.innerHTML = "<p style='text-align:center; opacity:0.4; padding: 20px; font-size: 0.8rem; font-style: italic;'>Secțiune deschisă pentru gânduri.</p>";
            return;
        }

        // Populăm lista cu recenzii
        commentsDisplay.innerHTML = data.map(c => `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-author">${c.user_name || 'Cititor'}</span>
                    <span class="review-date">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</span>
                </div>
                <div class="review-content">
                    ${c.continut}
                </div>
            </div>
        `).join('');

        // Forțăm scroll-ul la începutul listei după încărcare
        commentsDisplay.scrollTop = 0;
    }

    // 5. Logica pentru postarea unei recenzii noi
    function setupPosting(user) {
        if (!postBtn) return;
        
        // Resetăm evenimentul pentru a evita postările multiple
        postBtn.onclick = null;
        
        postBtn.onclick = async () => {
            const text = textArea.value.trim();
            if (!text) return;

            postBtn.disabled = true;
            postBtn.innerText = "...";

            const { error } = await client.from('comentarii').insert([{
                user_id: user.id,
                user_name: user.user_metadata.full_name || user.email.split('@')[0],
                articol_url: window.location.pathname.split('/').pop() || "index.html",
                continut: text
            }]);

            if (error) {
                alert("Eroare: " + error.message);
                postBtn.disabled = false;
                postBtn.innerText = "Postează";
            } else {
                textArea.value = ""; // Curățăm câmpul
                postBtn.disabled = false;
                postBtn.innerText = "Postează";
                await loadComments(); // Reîncărcăm lista instant
            }
        };
    }

    // Inițializăm lista la pornire
    loadComments();
}

// Lansăm tot sistemul
initComments();
