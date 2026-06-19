/* ============================================================
   LOGICA EDITORIALĂ PENTRU RECENZII
   ============================================================ */

async function initComments() {
    const client = window.supabaseClient;
    if (!client) {
        setTimeout(initComments, 200);
        return;
    }

    const formContainer = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-to-comment');
    const commentsDisplay = document.getElementById('comments-display-list');
    const postBtn = document.getElementById('post-comment-btn');
    const textArea = document.getElementById('new-comment');

    if (!commentsDisplay) return;

    const updateUI = (user) => {
        if (user) {
            if (formContainer) formContainer.style.display = 'block';
            if (loginPrompt) loginPrompt.style.display = 'none';
            setupPosting(user);
        } else {
            if (formContainer) formContainer.style.display = 'none';
            if (loginPrompt) loginPrompt.style.display = 'block';
        }
    };

    const { data: { session } } = await client.auth.getSession();
    updateUI(session?.user);

    client.auth.onAuthStateChange((event, session) => {
        updateUI(session?.user);
    });

    async function loadComments() {
        const articleUrl = window.location.pathname.split('/').pop() || "index.html";
        const { data, error } = await client
            .from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error || !data || data.length === 0) {
            commentsDisplay.innerHTML = "<p style='text-align:center; opacity:0.5; padding: 40px; font-family: var(--serif); font-style: italic;'>Secțiune deschisă pentru gânduri și reflecții.</p>";
            return;
        }

        commentsDisplay.innerHTML = data.map(c => `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-author">${c.user_name || 'Cititor'}</span>
                    <span class="review-date">${new Date(c.creat_la).toLocaleDateString('ro-RO', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                </div>
                <div class="review-content">
                    ${c.continut}
                </div>
            </div>
        `).join('');
    }

    function setupPosting(user) {
        if (!postBtn) return;
        postBtn.onclick = async () => {
            const text = textArea.value.trim();
            if (!text) return;
            postBtn.disabled = true;
            postBtn.innerText = "Trimitere...";

            const { error } = await client.from('comentarii').insert([{
                user_id: user.id,
                user_name: user.user_metadata.full_name || user.email.split('@')[0],
                articol_url: window.location.pathname.split('/').pop() || "index.html",
                continut: text
            }]);

            if (error) {
                alert("Eroare: " + error.message);
            } else {
                textArea.value = "";
                await loadComments();
            }
            postBtn.disabled = false;
            postBtn.innerText = "Postează";
        };
    }

    loadComments();
}

initComments();
