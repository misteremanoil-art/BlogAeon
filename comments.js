/* ============================================================
   LOGICA FINALĂ PENTRU GÂNDURI ȘI RECENZII
   ============================================================ */

function setupCommentsSystem() {
    const client = window.supabaseClient;
    
    // 1. Verificăm dacă Supabase este gata
    if (!client) {
        setTimeout(setupCommentsSystem, 100);
        return;
    }

    // Elemente din HTML-ul tău actual
    const formContainer = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-to-comment');
    const commentsList = document.getElementById('comments-display-list');
    const postBtn = document.getElementById('post-comment-btn');
    const commentArea = document.getElementById('new-comment');
    
    // Identificăm articolul după URL (numele fișierului)
    const articleUrl = window.location.pathname.split('/').pop() || "index.html";

    // 2. Ascultăm starea utilizatorului (Login/Logout)
    client.auth.onAuthStateChange((event, session) => {
        const user = session?.user;

        if (user) {
            // Utilizator LOGAT: arătăm formularul, ascundem promptul
            if (formContainer) formContainer.style.display = 'block';
            if (loginPrompt) loginPrompt.style.display = 'none';
            
            // Activăm logica de postare
            setupPostingLogic(client, user, articleUrl);
        } else {
            // Utilizator NELOGAT: invers
            if (formContainer) formContainer.style.display = 'none';
            if (loginPrompt) loginPrompt.style.display = 'block';
        }
    });

    // 3. Funcție pentru a încărca recenziile existente
    async function loadComments() {
        const { data, error } = await client
            .from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error) {
            console.error("Eroare la încărcare:", error);
            return;
        }

        if (!data || data.length === 0) {
            commentsList.innerHTML = "<p style='font-size: 0.9rem; color: gray; text-align:center;'>Nicio recenzie încă. Fii primul care scrie!</p>";
            return;
        }

        commentsList.innerHTML = data.map(c => `
            <div class="comment-card" style="margin-bottom: 20px; padding: 20px; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong style="color: var(--text-main); font-size: 0.95rem;">${c.user_name || 'Cititor'}</strong>
                    <small style="color: #a59d91; font-size: 0.75rem;">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</small>
                </div>
                <p style="font-size: 1rem; line-height: 1.6; color: #444; margin: 0;">${c.continut}</p>
            </div>
        `).join('');
    }

    // 4. Logica pentru butonul "Postează"
    function setupPostingLogic(client, user, url) {
        if (!postBtn) return;
        
        // Scoatem orice eveniment vechi ca să nu posteze de două ori
        postBtn.onclick = null;

        postBtn.onclick = async () => {
            const text = commentArea.value.trim();
            if (!text) {
                alert("Te rugăm să scrii un gând înainte de a posta.");
                return;
            }

            postBtn.disabled = true;
            postBtn.innerText = "Se trimite...";

            const { error } = await client.from('comentarii').insert([
                {
                    user_id: user.id,
                    user_name: user.user_metadata.full_name || user.email.split('@')[0],
                    articol_url: url,
                    continut: text
                }
            ]);

            if (error) {
                alert("Eroare: " + error.message);
                postBtn.disabled = false;
                postBtn.innerText = "Postează";
            } else {
                commentArea.value = ""; // Golim textul
                postBtn.disabled = false;
                postBtn.innerText = "Postează";
                loadComments(); // Refresh automat
            }
        };
    }

    // Încărcăm comentariile imediat ce se intră pe pagină
    loadComments();
}

// Lansăm sistemul
setupCommentsSystem();
