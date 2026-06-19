/* ============================================================
   LOGICA SUPREMA PENTRU RECENZII (COMENȚII)
   ============================================================ */

function setupComments() {
    const client = window.supabaseClient;
    if (!client) {
        setTimeout(setupComments, 100);
        return;
    }

    const commentForm = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-prompt');
    const commentsList = document.getElementById('comments-list');
    const submitBtn = document.getElementById('submit-comment');
    const commentText = document.getElementById('comment-text');
    const articleUrl = window.location.pathname.split('/').pop() || "index.html";

    // 1. ASCULTĂTOR DE SESIUNE (Reacționează instant la logare)
    client.auth.onAuthStateChange((event, session) => {
        const user = session?.user;

        if (user) {
            if (commentForm) commentForm.style.display = 'block';
            if (loginPrompt) loginPrompt.style.display = 'none';
            console.log("Comentarii: Sesiune confirmată pentru", user.email);
            
            // Activăm butonul de postare doar dacă avem user
            setupPostButton(client, user, articleUrl);
        } else {
            if (commentForm) commentForm.style.display = 'none';
            if (loginPrompt) loginPrompt.style.display = 'block';
            console.log("Comentarii: Sesiune neidentificată.");
        }
    });

    // 2. FUNCȚIE ÎNCĂRCARE COMENTARII
    async function loadComments() {
        const { data, error } = await client
            .from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error) {
            console.error("Eroare la citirea comentariilor:", error);
            return;
        }

        if (!data || data.length === 0) {
            commentsList.innerHTML = "<p style='font-size: 0.9rem; color: gray; text-align:center;'>Nicio recenzie încă. Fii primul care scrie!</p>";
            return;
        }

        commentsList.innerHTML = data.map(c => `
            <div class="comment-card" style="margin-bottom: 15px; padding: 20px; background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <strong style="color: var(--text-main); font-size: 0.9rem;">${c.user_name || 'Cititor'}</strong>
                    <small style="color: gray; font-size: 0.75rem;">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</small>
                </div>
                <p style="font-size: 0.95rem; line-height: 1.5; color: #444; margin: 0;">${c.continut}</p>
            </div>
        `).join('');
    }

    // 3. FUNCȚIE LOGICĂ BUTON POSTARE
    function setupPostButton(client, user, url) {
        if (!submitBtn) return;
        
        submitBtn.onclick = async () => {
            const text = commentText.value.trim();
            if (!text) return;

            submitBtn.disabled = true;
            submitBtn.innerText = "Se trimite...";

            const { error } = await client.from('comentarii').insert([
                {
                    user_id: user.id,
                    user_name: user.user_metadata.full_name || user.email.split('@')[0],
                    articol_url: url,
                    continut: text
                }
            ]);

            if (error) {
                alert("Eroare la postare: " + error.message);
                submitBtn.disabled = false;
                submitBtn.innerText = "Postează";
            } else {
                commentText.value = "";
                submitBtn.disabled = false;
                submitBtn.innerText = "Postează";
                loadComments(); // Reîncărcăm lista
            }
        };
    }

    loadComments();
}

// Pornim totul
setupComments();
