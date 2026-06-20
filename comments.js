/* ============================================================
   LOGICA PENTRU GÂNDURI ȘI RECENZII (COMUNITATE AEON)
   Gestionează postarea, încărcarea și afișarea în fereastră (Modal)
   ============================================================ */

async function initBlogComments() {
    // 1. CONEXIUNEA LA SUPABASE
    const client = window.supabaseClient;
    if (!client) { 
        // Dacă motorul nu e gata, mai așteptăm puțin
        setTimeout(initBlogComments, 200); 
        return; 
    }

    // 2. REFERINȚE ELEMENTE HTML
    const toggleInput = document.getElementById('toggle-review-input'); // Checkbox-ul de expandare
    const modal = document.getElementById('reviews-overlay');         // Fundalul negru/blurat al popup-ului
    const openBtn = document.getElementById('open-reviews-modal');      // Butonul "Citește recenziile"
    const closeBtn = document.getElementById('close-modal');           // Butonul "X" din popup
    const displayList = document.getElementById('comments-display-list'); // Lista din interiorul popup-ului
    const postBtn = document.getElementById('post-comment-btn');       // Butonul de trimitere
    const textArea = document.getElementById('new-comment');           // Zona de scris
    
    // Identificăm articolul după numele fișierului curent
    const articleUrl = window.location.pathname.split('/').pop() || "index.html";

    // 3. VERIFICARE UTILIZATOR LOGAT
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
        // Dacă nu e logat, arătăm mesajul de îndrumare către login
        const prompt = document.getElementById('login-to-comment');
        if (prompt) prompt.style.display = 'block';
    }

    // 4. LOGICA PENTRU FEREASTRA POPUP (MODAL)
    if (openBtn && modal) {
        // DESCHIDERE: Adăugăm clasa 'active' pentru a declanșa CSS-ul (display:flex + blur)
        openBtn.onclick = () => { 
            modal.classList.add('active'); 
            document.body.style.overflow = 'hidden'; // Blocăm scroll-ul paginii din spate
            loadComments(); // Încărcăm recenziile proaspete
        };
    }

    if (closeBtn) {
        // ÎNCHIDERE: Scoatem clasa 'active'
        closeBtn.onclick = () => { 
            modal.classList.remove('active'); 
            document.body.style.overflow = ''; // Reactivăm scroll-ul paginii
        };
    }

    // Închidere la click oriunde pe fundalul întunecat
    window.onclick = (e) => { 
        if (e.target == modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // 5. FUNCȚIE ÎNCĂRCARE RECENZII DIN BAZA DE DATE
    async function loadComments() {
        if (!displayList) return;
        
        displayList.innerHTML = "<p style='text-align:center; opacity:0.5; padding: 20px;'>Se caută gândurile comunității...</p>";
        
        const { data, error } = await client.from('comentarii')
            .select('*')
            .eq('articol_url', articleUrl)
            .order('creat_la', { ascending: false });

        if (error || !data || data.length === 0) {
            displayList.innerHTML = "<p style='text-align:center; opacity:0.5; padding: 40px;'>Liniște. Încă nu s-au scris recenzii pentru acest eseu.</p>";
            return;
        }

        // Construim lista de recenzii cu stilul editorial (Serif + Italic)
        displayList.innerHTML = data.map(c => `
            <div class="review-item" style="padding: 25px 0; border-bottom: 1px solid rgba(0,0,0,0.04);">
                <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                    <span style="font-family:var(--sans); font-weight:700; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--accent);">${c.user_name}</span>
                    <span style="font-size:0.7rem; color:gray;">${new Date(c.creat_la).toLocaleDateString('ro-RO')}</span>
                </div>
                <p style="font-family:var(--serif); font-size:1.15rem; line-height:1.6; font-style:italic; margin:0;">"${c.continut}"</p>
            </div>
        `).join('');
    }

    // 6. LOGICA PENTRU POSTARE (BUTONUL "POSTEAZĂ")
    if (postBtn && session) {
        postBtn.onclick = async () => {
            const text = textArea.value.trim();
            if (!text) return; // Nu trimitem dacă e gol

            postBtn.disabled = true;
            postBtn.innerText = "...";

            // Trimitem datele către Supabase
            const { error } = await client.from('comentarii').insert([{
                user_id: session.user.id,
                user_name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
                articol_url: articleUrl,
                continut: text
            }]);

            if (error) { 
                alert("Eroare la postare: " + error.message); 
            } else { 
                // Succes: curățăm interfața și notificăm userul
                textArea.value = ""; 
                if (toggleInput) toggleInput.checked = false; // Închidem zona de scris
                alert("Gândul tău a fost așternut cu succes.");
                loadComments(); // Reîncărcăm lista în fundal
            }
            
            postBtn.disabled = false;
            postBtn.innerText = "Postează";
        };
    }
}

// Lansăm tot sistemul de comentarii
initBlogComments();
