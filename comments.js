document.addEventListener('DOMContentLoaded', async () => {
    const client = window.supabaseClient; // Folosim clientul din script.js
    const commentForm = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-prompt');
    const commentsList = document.getElementById('comments-list');
    const submitBtn = document.getElementById('submit-comment');
    const commentText = document.getElementById('comment-text');

    // Luăm URL-ul curent pentru a identifica articolul
    const articleUrl = window.location.pathname.split('/').pop();

    // 1. Verificăm dacă userul e logat pentru a arăta formularul
    const { data: { user } } = await client.auth.getUser();
    if (user) {
        commentForm.style.display = 'block';
        loginPrompt.style.display = 'none';
    }

    // 2. Funcție pentru a încărca comentariile
    async function loadComments() {
        const { data, error } = await client
            .from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error) {
            commentsList.innerHTML = "<p>Eroare la încărcare.</p>";
            return;
        }

        if (data.length === 0) {
            commentsList.innerHTML = "<p style='font-size: 0.9rem; color: gray;'>Fii primul care lasă un gând despre acest eseu.</p>";
            return;
        }

        commentsList.innerHTML = data.map(c => `
            <div class="comment-card">
                <div class="comment-header">
                    <span class="comment-author">${c.user_name}</span>
                    <span class="comment-date">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</span>
                </div>
                <div class="comment-body">${c.continut}</div>
            </div>
        `).join('');
    }

    // 3. Funcție pentru a posta un comentariu
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
        } else {
            commentText.value = "";
            await loadComments(); // Reîncărcăm lista
        }

        submitBtn.disabled = false;
        submitBtn.innerText = "Postează";
    };

    // Inițializare
    loadComments();
});
