/* ============================================================
   LOGICA PENTRU GÂNDURI ȘI RECENZII (COMENȚII)
   ============================================================ */

async function initializareComentarii() {
    // 1. Așteptăm ca Supabase să fie definit în script.js
    const client = window.supabaseClient;

    if (!client) {
        console.error("Eroare: Conexiunea Supabase nu a fost găsită.");
        return;
    }

    const commentForm = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-prompt');
    const commentsList = document.getElementById('comments-list');
    const submitBtn = document.getElementById('submit-comment');
    const commentText = document.getElementById('comment-text');

    // Luăm numele fișierului curent pentru a identifica articolul
    const articleUrl = window.location.pathname.split('/').pop() || "index.html";

    // 2. Verificăm dacă utilizatorul este logat
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (user) {
        // Dacă e logat, arătăm formularul și ascundem îndemnul de logare
        if (commentForm) commentForm.style.display = 'block';
        if (loginPrompt) loginPrompt.style.display = 'none';
    } else {
        // Dacă nu e logat, ne asigurăm că vede prompt-ul de login
        if (commentForm) commentForm.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
    }

    // 3. Funcție pentru a încărca comentariile din baza de date
    async function loadComments() {
        const { data, error } = await client
            .from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error) {
            console.error("Eroare la încărcare comentarii:", error);
            return;
        }

        if (data.length === 0) {
            commentsList.innerHTML = "<p style='font-size: 0.9rem; color: gray; text-align:center;'>Fii primul care lasă un gând despre acest eseu.</p>";
            return;
        }

        commentsList.innerHTML = data.map(c => `
            <div class="comment-card" style="margin-bottom: 15px; padding: 20px; background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <strong style="color: var(--text-main); font-size: 0.9rem;">${c.user_name}</strong>
                    <small style="color: gray; font-size: 0.75rem;">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</small>
                </div>
                <p style="font-size: 0.95rem; line-height: 1.5; color: #444; margin: 0;">${c.continut}</p>
            </div>
        `).join('');
    }

    // 4. Funcție pentru a trimite un comentariu nou
    if (submitBtn) {
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
                alert("Eroare la postare: " + error.message);
                submitBtn.disabled = false;
                submitBtn.innerText = "Postează";
            } else {
                commentText.value = "";
                submitBtn.disabled = false;
                submitBtn.innerText = "Postează";
                await loadComments(); // Reîncărcăm lista imediat
            }
        };
    }

    // Pornim încărcarea comentariilor la deschiderea paginii
    loadComments();
}

// Rulăm totul după ce s-a încărcat pagina
document.addEventListener('DOMContentLoaded', initializareComentarii);
