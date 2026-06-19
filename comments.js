/* ============================================================
   LOGICA AVANSATĂ PENTRU RECENZII (COMENȚII)
   ============================================================ */

async function initializareComentarii() {
    // 1. Verificăm dacă motorul Supabase a pornit
    const client = window.supabaseClient;
    if (!client) {
        // Dacă nu e gata, mai așteptăm 100ms și încercăm iar
        setTimeout(initializareComentarii, 100);
        return;
    }

    const commentForm = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-prompt');
    const commentsList = document.getElementById('comments-list');
    const submitBtn = document.getElementById('submit-comment');
    const commentText = document.getElementById('comment-text');

    // Identificăm articolul după numele fișierului
    const articleUrl = window.location.pathname.split('/').pop() || "index.html";

    // 2. VERIFICĂM SESIUNEA (Metoda sigură)
    const { data: { session } } = await client.auth.getSession();
    const user = session?.user;

    if (user) {
        // UTILIZATOR LOGAT
        if (commentForm) commentForm.style.display = 'block';
        if (loginPrompt) loginPrompt.style.display = 'none';
        console.log("Comentarii: Utilizator detectat -", user.email);
    } else {
        // UTILIZATOR NELOGAT
        if (commentForm) commentForm.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
        console.log("Comentarii: Niciun utilizator logat.");
    }

    // 3. ÎNCĂRCARE COMENTARII
    async function loadComments() {
        const { data, error } = await client
            .from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error) {
            console.error("Eroare DB:", error);
            return;
        }

        if (!data || data.length === 0) {
            commentsList.innerHTML = "<p style='font-size: 0.9rem; color: gray; text-align:center;'>Fii primul care lasă un gând.</p>";
            return;
        }

        commentsList.innerHTML = data.map(c => `
            <div class="comment-card" style="margin-bottom: 15px; padding: 20px; background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <strong style="color: var(--text-main); font-size: 0.9rem;">${c.user_name || 'Cititor'}</strong>
                    <small style="color: gray; font-size: 0.75rem;">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</small>
                </div>
                <p style="font-size: 0.95rem; line-height: 1.5; color: #444; margin: 0;">${c.continut}</p>
            </div>
        `).join('');
    }

    // 4. POSTARE COMENTARIU
    if (submitBtn && user) {
        submitBtn.onclick = async () => {
            const text = commentText.value.trim();
            if (!text) return;

            submitBtn.disabled = true;
            submitBtn.innerText = "Se trimite...";

            const { error } = await client.from('comentarii').insert([
                {
                    user_id: user.id,
                    user_name: user.user_metadata.full_name || user.email.split('@')[0],
                    articol_url: articleUrl,
                    continut: text
                }
            ]);

            if (error) {
                alert("Eroare: " + error.message);
                submitBtn.disabled = false;
                submitBtn.innerText = "Postează";
            } else {
                commentText.value = "";
                submitBtn.disabled = false;
                submitBtn.innerText = "Postează";
                loadComments(); // Refresh listă
            }
        };
    }

    loadComments();
}

// Pornim procesul
initializareComentarii();
