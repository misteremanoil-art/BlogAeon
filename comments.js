/* ============================================================
   LOGICA "SUPREMA" PENTRU RECENZII (COMENȚII)
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

    // 2. Identificăm elementele din HTML (cu noile tale ID-uri)
    const formContainer = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-to-comment');
    const commentsDisplay = document.getElementById('comments-display-list');
    const postBtn = document.getElementById('post-comment-btn');
    const textArea = document.getElementById('new-comment');

    // 3. Verificăm dacă suntem pe o pagină care chiar are secțiune de comentarii
    if (!commentsDisplay) {
        console.log("Comentarii: Nu am găsit 'comments-display-list', mă opresc.");
        return;
    }

    // 4. Funcție pentru a afișa formularul sau prompt-ul de login
    const updateUI = (user) => {
        if (user) {
            console.log("Comentarii: User logat detectat -> Arăt formularul.");
            if (formContainer) formContainer.style.setProperty('display', 'block', 'important');
            if (loginPrompt) loginPrompt.style.setProperty('display', 'none', 'important');
            setupPosting(user);
        } else {
            console.log("Comentarii: Niciun user -> Arăt cererea de logare.");
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

    // 7. Funcție pentru a încărca comentariile din baza de date
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
            commentsDisplay.innerHTML = "<p style='text-align:center; opacity:0.5; padding: 20px;'>Fii primul care lasă un gând despre acest eseu.</p>";
            return;
        }

        commentsDisplay.innerHTML = data.map(c => `
            <div class="card" style="margin-bottom: 20px; padding: 20px; border-radius: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong style="color: var(--text-main); font-size: 0.9rem;">${c.user_name || 'Cititor'}</strong>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</small>
                </div>
                <p style="margin: 0; font-size: 1rem; line-height: 1.6; color: #333;">${c.continut}</p>
            </div>
        `).join('');
    }

    // 8. Logica de trimitere comentariu
    function setupPosting(user) {
        if (!postBtn) return;
        
        // Resetăm evenimentul de click ca să nu se multiplice
        postBtn.onclick = null;
        
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
