async function initBlogComments() {
    const client = window.supabaseClient;
    if (!client) { setTimeout(initBlogComments, 200); return; }

    const toggleInput = document.getElementById('toggle-review-input');
    const modal = document.getElementById('reviews-overlay');
    const openBtn = document.getElementById('open-reviews-modal');
    const closeBtn = document.getElementById('close-modal');
    const displayList = document.getElementById('comments-display-list');
    const postBtn = document.getElementById('post-comment-btn');
    const textArea = document.getElementById('new-comment');
    const articleUrl = window.location.pathname.split('/').pop() || "index.html";

    // 1. Verificare User
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
        document.getElementById('login-to-comment').style.display = 'block';
    }

    // 2. Deschidere/Închidere Modal
    openBtn.onclick = () => { modal.style.display = 'flex'; loadComments(); };
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // 3. Încărcare
    async function loadComments() {
        displayList.innerHTML = "<p style='text-align:center; opacity:0.5;'>Se caută gândurile comunității...</p>";
        const { data, error } = await client.from('comentarii')
            .select('*').eq('articol_url', articleUrl).order('creat_la', { ascending: false });

        if (!data || data.length === 0) {
            displayList.innerHTML = "<p style='text-align:center; opacity:0.5; padding: 40px;'>Liniște. Încă nu s-au scris recenzii pentru acest eseu.</p>";
            return;
        }

        displayList.innerHTML = data.map(c => `
            <div class="review-item" style="padding: 25px 0; border-bottom: 1px solid rgba(0,0,0,0.04);">
                <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                    <span style="font-family:var(--sans); font-weight:700; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--accent);">${c.user_name}</span>
                    <span style="font-size:0.7rem; color:gray;">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</span>
                </div>
                <p style="font-family:var(--serif); font-size:1.15rem; line-height:1.6; font-style:italic;">"${c.continut}"</p>
            </div>
        `).join('');
    }

    // 4. Postare
    if (postBtn && session) {
        postBtn.onclick = async () => {
            const text = textArea.value.trim();
            if (!text) return;
            postBtn.disabled = true;
            postBtn.innerText = "...";
            const { error } = await client.from('comentarii').insert([{
                user_id: session.user.id,
                user_name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
                articol_url: articleUrl,
                continut: text
            }]);
            if (!error) { 
                textArea.value = ""; 
                toggleInput.checked = false; 
                alert("Gândul tău a fost așternut cu succes.");
                loadComments(); 
            }
            postBtn.disabled = false;
            postBtn.innerText = "Postează";
        };
    }
}
initBlogComments();
