/* ============================================================
   LOGICA "BULLETPROOF" PENTRU RECENZII
   ============================================================ */

async function startCommentsLogic() {
    const client = window.supabaseClient;
    
    // 1. Așteptăm conexiunea
    if (!client) {
        setTimeout(startCommentsLogic, 100);
        return;
    }

    const formContainer = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-to-comment');
    const commentsList = document.getElementById('comments-display-list');
    const postBtn = document.getElementById('post-comment-btn');
    const commentArea = document.getElementById('new-comment');
    const articleUrl = window.location.pathname.split('/').pop() || "index.html";

    // 2. FUNCȚIA DE ACTUALIZARE VIZUALĂ (Forțată)
    function refreshUI(user) {
        if (user) {
            console.log("✅ User detectat în comentarii:", user.email);
            if (formContainer) formContainer.setAttribute('style', 'display: block !important; margin-bottom: 40px;');
            if (loginPrompt) loginPrompt.setAttribute('style', 'display: none !important;');
            setupPosting(user);
        } else {
            console.log("❌ Niciun user în comentarii.");
            if (formContainer) formContainer.setAttribute('style', 'display: none !important;');
            if (loginPrompt) loginPrompt.setAttribute('style', 'display: block !important;');
        }
    }

    // 3. VERIFICARE IMEDIATĂ (Chiar acum!)
    const { data: { session } } = await client.auth.getSession();
    refreshUI(session?.user);

    // 4. ASCULTĂTOR DE SESIUNE (Dacă se loghează pe parcurs)
    client.auth.onAuthStateChange((event, session) => {
        refreshUI(session?.user);
    });

    // 5. ÎNCĂRCARE COMENTARII DIN DB
    async function loadComments() {
        const { data, error } = await client
            .from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error) return;

        if (!data || data.length === 0) {
            commentsList.innerHTML = "<p style='text-align:center; opacity:0.5;'>Nicio recenzie încă.</p>";
            return;
        }

        commentsList.innerHTML = data.map(c => `
            <div class="comment-card" style="margin-bottom: 20px; padding: 20px; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong style="color: var(--text-main); font-size: 0.95rem;">${c.user_name || 'Cititor'}</strong>
                    <small style="color: #a59d91; font-size: 0.75rem;">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</small>
                </div>
                <p style="font-size: 1rem; line-height: 1.6; color: #444; margin: 0;">${c.continut}</p>
            </div>
        `).join('');
    }

    // 6. LOGICA DE POSTARE
    function setupPosting(user) {
        if (!postBtn) return;
        postBtn.onclick = async () => {
            const text = commentArea.value.trim();
            if (!text) return;

            postBtn.disabled = true;
            postBtn.innerText = "Se trimite...";

            const { error } = await client.from('comentarii').insert([{
                user_id: user.id,
                user_name: user.user_metadata.full_name || user.email.split('@')[0],
                articol_url: articleUrl,
                continut: text
            }]);

            if (error) {
                alert("Eroare: " + error.message);
            } else {
                commentArea.value = "";
                await loadComments();
            }
            postBtn.disabled = false;
            postBtn.innerText = "Postează";
        };
    }

    loadComments();
}

startCommentsLogic();
