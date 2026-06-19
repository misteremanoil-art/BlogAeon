/* ============================================================
   LOGICA "SUPREMA" PENTRU RECENZII (COMENȚII) - VERSIUNEA EDITORIALĂ
   ============================================================ */

async function initComments() {
    console.log("Comentarii: Inițializare pornire...");

    // 1. Așteptăm ca Supabase să fie gata în window
    const client = window.supabaseClient;
    if (!client) {
        console.log("Comentarii: Supabase nu e gata, reîncercăm...");
        setTimeout(initComments, 200);
        return;
    }

    // 2. Identificăm elementele din HTML
    const formContainer = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-to-comment');
    const commentsDisplay = document.getElementById('comments-display-list');
    const postBtn = document.getElementById('post-comment-btn');
    const textArea = document.getElementById('new-comment');

    // 3. Verificăm dacă suntem pe o pagină care are secțiune de comentarii
    if (!commentsDisplay) {
        console.log("Comentarii: Nu am găsit 'comments-display-list', mă opresc.");
        return;
    }

    // 4. Funcție pentru a afișa formularul sau prompt-ul de login
    const updateUI = (user) => {
        if (user) {
            console.log("Comentarii: User logat detectat.");
            if (formContainer) formContainer.style.setProperty('display', 'block', 'important');
            if (loginPrompt) loginPrompt.style.setProperty('display', 'none', 'important');
            setupPosting(user);
        } else {
            console.log("Comentarii: Niciun user detectat.");
            if (formContainer) formContainer.style.setProperty('display', 'none', 'important');
            if (loginPrompt) loginPrompt.style.setProperty('display', 'block', 'important');
        }
    };

    // 5. Verificăm sesiunea curentă
    const { data: { session } } = await client.auth.getSession();
    updateUI(session?.user);

    // 6. Ascultăm dacă userul se loghează/deloghează live
    client.auth.onAuthStateChange((event, session) => {
        updateUI(session?.user);
    });

    // 7. Funcție pentru a încărca comentariile (STILIZATE EDITORIAL)
    async function loadComments() {
        const articleUrl = window.location.pathname.split('/').pop() || "index.html";
        
        const { data, error } = await client
            .from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error) {
            console.error("Comentarii: Eroare la încărcare:", error);
            return;
        }

        if (!data || data.length === 0) {
            commentsDisplay.innerHTML = "<p style='text-align:center; opacity:0.5; padding: 40px; font-style: italic;'>Încă nu sunt gânduri așternute aici. Fii primul care începe dialogul.</p>";
            return;
        }

        // GENERARE HTML STILIZAT (REVIEW-ITEM)
        commentsDisplay.innerHTML = data.map(c => `
            <div class="review-item" style="padding: 25px; border-bottom: 1px solid var(--line); background: #fffdfa;">
                <div class="review-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span class="review-author" style="font-family: var(--sans); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-main);">${c.user_name || 'Cititor Anonim'}</span>
                    <span class="review-date" style="font-size: 0.75rem; color: var(--text-muted);">${new Date(c.creat_la).toLocaleDateString('ro-RO', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                </div>
                <div class="review-content" style="font-family: var(--serif); font-size: 1.15rem; line-height: 1.6; color: #3d3a36; font-style: italic;">
                    "${c.continut}"
                </div>
            </div>
        `).join('');
    }

    // 8. Logica de trimitere comentariu
    function setupPosting(user) {
        if (!postBtn) return;
        postBtn.onclick = null; // Prevenim dublarea evenimentului
        
        postBtn.onclick = async () => {
            const text = textArea.value.trim();
            if (!text) return;

            postBtn.disabled = true;
            postBtn.innerText = "Se trimite...";

            const { error } = await client.from('comentarii').insert([{
                user_id: user.id,
                user_name: user.user_metadata.full_name || user.email.split('@')[0],
                articol_url: window.location.pathname.split('/').pop() || "index.html",
                continut: text
            }]);

            if (error) {
                alert("Eroare la postare: " + error.message);
                postBtn.disabled = false;
                postBtn.innerText = "Postează";
            } else {
                textArea.value = "";
                postBtn.disabled = false;
                postBtn.innerText = "Postează";
                loadComments(); // Reîncărcăm lista instant
            }
        };
    }

    loadComments();
}

// Lansăm procesul
initComments();
