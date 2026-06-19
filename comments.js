/* ============================================================
   LOGICA PENTRU RECENZII - REPARATĂ (FĂRĂ ERORI NULL)
   ============================================================ */

async function startCommentsLogic() {
    const client = window.supabaseClient;
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

    // Dacă nu suntem pe o pagină cu listă de comentarii, ne oprim aici fără eroare
    if (!commentsList) return;

    function refreshUI(user) {
        if (user) {
            if (formContainer) formContainer.style.display = 'block';
            if (loginPrompt) loginPrompt.style.display = 'none';
            setupPosting(user);
        } else {
            if (formContainer) formContainer.style.display = 'none';
            if (loginPrompt) loginPrompt.style.display = 'block';
        }
    }

    const { data: { session } } = await client.auth.getSession();
    refreshUI(session?.user);

    client.auth.onAuthStateChange((event, session) => {
        refreshUI(session?.user);
    });

    async function loadComments() {
        if (!commentsList) return;
        const { data, error } = await client
            .from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error) {
            commentsList.innerHTML = "<p>Eroare la încărcare.</p>";
            return;
        }

        if (!data || data.length === 0) {
            commentsList.innerHTML = "<p style='text-align:center; opacity:0.5;'>Nicio recenzie încă. Fii primul care scrie!</p>";
            return;
        }

        commentsList.innerHTML = data.map(c => `
            <div class="comment-card" style="margin-bottom: 20px; padding: 20px; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong style="color: #4a4743;">${c.user_name || 'Cititor'}</strong>
                    <small style="color: #a59d91;">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</small>
                </div>
                <p style="margin: 0; line-height: 1.6;">${c.continut}</p>
            </div>
        `).join('');
    }

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
            if (error) alert("Eroare: " + error.message);
            else { commentArea.value = ""; await loadComments(); }
            postBtn.disabled = false;
            postBtn.innerText = "Postează";
        };
    }

    loadComments();
}

startCommentsLogic();
