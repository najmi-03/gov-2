// ============================================
// Admin Panel — Muhammad Najmi Ahyar Portfolio
// ============================================

(function () {
    'use strict';

    // ===== STATE =====
    let supabase = null;
    let currentUser = null;
    let editingWorkId = null;
    let editingExpId = null;
    let editingWorkSlug = null;
    let pendingLayers = []; // { file, name, preview }
    let existingLayers = []; // For editing: { id, name, file_url, sort_order, replaceFile?, replacePreview? }

    // ===== INIT =====
    function init() {
        // Check if Supabase is configured
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            showScreen('setupScreen');
            return;
        }

        // Initialize Supabase client
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Generate login particles
        generateParticles();

        // Check auth session
        checkSession();

        // Bind events
        bindEvents();
    }

    // ===== AUTH =====
    async function checkSession() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                currentUser = session.user;
                showDashboard();
            } else {
                showScreen('loginScreen');
            }
        } catch (e) {
            console.error('Session check failed:', e);
            showScreen('loginScreen');
        }
    }

    async function login(email, password) {
        const errorEl = document.getElementById('loginError');
        const btn = document.getElementById('loginBtn');
        errorEl.textContent = '';
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0"></div> <span>Memproses...</span>';

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            currentUser = data.user;
            showDashboard();
        } catch (e) {
            errorEl.textContent = e.message === 'Invalid login credentials'
                ? 'Email atau password salah'
                : e.message;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Masuk</span>';
        }
    }

    async function logout() {
        await supabase.auth.signOut();
        currentUser = null;
        showScreen('loginScreen');
        showToast('Berhasil logout', 'success');
    }

    // ===== SCREENS =====
    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active-screen');
        });
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'flex';
            el.classList.add('active-screen');
        }
    }

    function showDashboard() {
        showScreen('dashboard');
        loadWorks();
        loadExperiences();
        loadAdminProfile();
        loadSkills();
    }

    // ===== WORKS CRUD =====
    async function loadWorks() {
        const listEl = document.getElementById('worksList');
        const loadingEl = document.getElementById('worksLoading');
        const emptyEl = document.getElementById('worksEmpty');

        listEl.innerHTML = '';
        loadingEl.style.display = 'flex';
        emptyEl.style.display = 'none';

        try {
            const { data, error } = await supabase
                .from('works')
                .select('*, work_layers(*)')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            loadingEl.style.display = 'none';

            if (!data || data.length === 0) {
                emptyEl.style.display = 'flex';
                return;
            }

            data.forEach(work => {
                // Sort layers
                if (work.work_layers) {
                    work.work_layers.sort((a, b) => a.sort_order - b.sort_order);
                }
                listEl.appendChild(createWorkCard(work));
            });
        } catch (e) {
            loadingEl.style.display = 'none';
            showToast('Gagal memuat portfolio: ' + e.message, 'error');
        }
    }

    function createWorkCard(work) {
        const card = document.createElement('div');
        card.className = 'work-card';
        const layerCount = work.work_layers ? work.work_layers.length : 0;
        const firstLayer = work.work_layers && work.work_layers[0]
            ? `<img src="${work.work_layers[0].file_url}" alt="${work.title}">`
            : `<i class="fas fa-image"></i>`;

        card.innerHTML = `
            <div class="work-card-thumb">${firstLayer}</div>
            <div class="work-card-body">
                <div class="work-card-title">${escapeHtml(work.title)}</div>
                <div class="work-card-desc">${escapeHtml(work.description || '')}</div>
                <div class="work-card-meta">
                    <span class="work-card-badge">
                        <i class="fas fa-layer-group"></i> ${layerCount} layer
                    </span>
                    <span class="work-card-badge">
                        <i class="fas fa-sort"></i> #${work.sort_order}
                    </span>
                </div>
                <div class="work-card-actions">
                    <button class="btn btn-ghost btn-sm edit-work" data-id="${work.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-work" data-id="${work.id}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.edit-work').addEventListener('click', () => openEditWork(work));
        card.querySelector('.delete-work').addEventListener('click', () => deleteWork(work.id, work.slug));

        return card;
    }

    function openAddWork() {
        editingWorkId = null;
        pendingLayers = [];
        existingLayers = [];
        document.getElementById('workModalTitle').innerHTML = '<i class="fas fa-palette"></i> Tambah Design';
        document.getElementById('workForm').reset();
        document.getElementById('workOrder').value = '0';
        renderLayersUI();
        openModal('workModal');
    }

    function openEditWork(work) {
        editingWorkId = work.id;
        editingWorkSlug = work.slug;
        pendingLayers = [];
        existingLayers = (work.work_layers || []).map(l => ({
            id: l.id,
            name: l.name,
            file_url: l.file_url,
            sort_order: l.sort_order,
            replaceFile: null,
            replacePreview: null
        }));

        document.getElementById('workModalTitle').innerHTML = '<i class="fas fa-palette"></i> Edit Design';
        document.getElementById('workTitle').value = work.title;
        document.getElementById('workDesc').value = work.description || '';
        document.getElementById('workOrder').value = work.sort_order || 0;
        renderLayersUI();
        openModal('workModal');
    }

    async function saveWork(e) {
        e.preventDefault();
        const btn = document.getElementById('saveWorkBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div> Menyimpan...';

        try {
            const title = document.getElementById('workTitle').value.trim();
            const description = document.getElementById('workDesc').value.trim();
            const sort_order = parseInt(document.getElementById('workOrder').value) || 0;
            let slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            if (editingWorkId) {
                // Use the original slug to prevent breaking storage paths
                slug = editingWorkSlug;
                
                // Update existing work (we omit slug so it remains unchanged in DB)
                const { error } = await supabase
                    .from('works')
                    .update({ title, description, sort_order })
                    .eq('id', editingWorkId);
                if (error) throw error;

                // Update existing layer names/order/image
                for (let i = 0; i < existingLayers.length; i++) {
                    const layer = existingLayers[i];
                    if (!layer.id) continue;

                    let updatePayload = { name: layer.name, sort_order: i };

                    // If user replaced the image, upload new file first
                    if (layer.replaceFile) {
                        const ext = layer.replaceFile.name.split('.').pop();
                        const filePath = `works/${slug}/layer-${layer.id}-${Date.now()}.${ext}`;
                        const { error: upErr } = await supabase.storage
                            .from('portfolio')
                            .upload(filePath, layer.replaceFile, { upsert: true });
                        if (upErr) throw upErr;
                        const { data: urlData } = supabase.storage
                            .from('portfolio')
                            .getPublicUrl(filePath);
                        updatePayload.file_url = urlData.publicUrl;
                    }

                    await supabase.from('work_layers').update(updatePayload).eq('id', layer.id);
                }

                // Upload new pending layers
                const startOrder = existingLayers.length;
                for (let i = 0; i < pendingLayers.length; i++) {
                    const layer = pendingLayers[i];
                    const filePath = `works/${slug}/layer-${Date.now()}-${i}.png`;
                    const { error: uploadError } = await supabase.storage
                        .from('portfolio')
                        .upload(filePath, layer.file, { upsert: true });
                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabase.storage
                        .from('portfolio')
                        .getPublicUrl(filePath);

                    await supabase.from('work_layers').insert({
                        work_id: editingWorkId,
                        name: layer.name,
                        file_url: urlData.publicUrl,
                        sort_order: startOrder + i
                    });
                }

                showToast('Design berhasil diupdate!', 'success');
            } else {
                // Prevent duplicate slug constraint errors by appending a random suffix
                slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
                
                // Create new work
                const { data, error } = await supabase
                    .from('works')
                    .insert({ title, description, slug, sort_order })
                    .select()
                    .single();
                if (error) throw error;

                // Upload layers
                for (let i = 0; i < pendingLayers.length; i++) {
                    const layer = pendingLayers[i];
                    const filePath = `works/${slug}/layer-${Date.now()}-${i}.png`;
                    const { error: uploadError } = await supabase.storage
                        .from('portfolio')
                        .upload(filePath, layer.file, { upsert: true });
                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabase.storage
                        .from('portfolio')
                        .getPublicUrl(filePath);

                    await supabase.from('work_layers').insert({
                        work_id: data.id,
                        name: layer.name,
                        file_url: urlData.publicUrl,
                        sort_order: i
                    });
                }

                showToast('Design berhasil ditambahkan!', 'success');
            }

            closeModal('workModal');
            loadWorks();
        } catch (e) {
            showToast('Gagal menyimpan: ' + e.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
        }
    }

    async function deleteWork(id, slug) {
        if (!confirm('Hapus design ini? Semua layer juga akan dihapus.')) return;

        try {
            // Delete storage files
            try {
                const { data: files } = await supabase.storage
                    .from('portfolio')
                    .list(`works/${slug}`);
                if (files && files.length > 0) {
                    const paths = files.map(f => `works/${slug}/${f.name}`);
                    await supabase.storage.from('portfolio').remove(paths);
                }
            } catch (e) {
                console.warn('Storage cleanup error:', e);
            }

            // Delete from database (cascade deletes layers)
            const { error } = await supabase.from('works').delete().eq('id', id);
            if (error) throw error;

            showToast('Design berhasil dihapus', 'success');
            loadWorks();
        } catch (e) {
            showToast('Gagal menghapus: ' + e.message, 'error');
        }
    }

    async function deleteExistingLayer(layerIdx) {
        const layer = existingLayers[layerIdx];
        if (!layer) return;

        if (layer.id) {
            try {
                await supabase.from('work_layers').delete().eq('id', layer.id);
            } catch (e) {
                showToast('Gagal menghapus layer: ' + e.message, 'error');
                return;
            }
        }

        existingLayers.splice(layerIdx, 1);
        renderLayersUI();
    }

    // ===== EXPERIENCE CRUD =====
    async function loadExperiences() {
        const listEl = document.getElementById('experienceList');
        const loadingEl = document.getElementById('expLoading');
        const emptyEl = document.getElementById('expEmpty');

        listEl.innerHTML = '';
        loadingEl.style.display = 'flex';
        emptyEl.style.display = 'none';

        try {
            const { data, error } = await supabase
                .from('experiences')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            loadingEl.style.display = 'none';

            if (!data || data.length === 0) {
                emptyEl.style.display = 'flex';
                return;
            }

            data.forEach(exp => {
                listEl.appendChild(createExpCard(exp));
            });
        } catch (e) {
            loadingEl.style.display = 'none';
            showToast('Gagal memuat pengalaman: ' + e.message, 'error');
        }
    }

    function createExpCard(exp) {
        const card = document.createElement('div');
        card.className = 'exp-card';
        const tags = (exp.tags || []).map(t => `<span class="exp-tag">${escapeHtml(t)}</span>`).join('');

        card.innerHTML = `
            <div class="exp-card-info">
                <div class="exp-card-header">
                    <span class="exp-card-company">${escapeHtml(exp.company)}</span>
                    <span class="exp-card-period">${escapeHtml(exp.period)}</span>
                </div>
                <div class="exp-card-location">
                    <i class="fas fa-map-marker-alt"></i> ${escapeHtml(exp.location || '')}
                </div>
                <div class="exp-card-desc">${escapeHtml(exp.description || '')}</div>
                <div class="exp-card-tags">${tags}</div>
            </div>
            <div class="exp-card-actions">
                <button class="btn btn-ghost btn-icon edit-exp" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon delete-exp" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        card.querySelector('.edit-exp').addEventListener('click', () => openEditExp(exp));
        card.querySelector('.delete-exp').addEventListener('click', () => deleteExperience(exp.id));

        document.getElementById('addExpBtn').addEventListener('click', () => {
            editingExpId = null;
            document.getElementById('expModalTitle').innerHTML = '<i class="fas fa-briefcase"></i> Tambah Pengalaman';
            document.getElementById('expForm').reset();
            openModal('expModal');
        });

        // Add Skill
        document.getElementById('addSkillBtn').addEventListener('click', () => {
            editingSkillIndex = null;
            document.getElementById('skillModalTitle').innerHTML = '<i class="fas fa-star"></i> Tambah Skill';
            document.getElementById('skillForm').reset();
            openModal('skillModal');
        });

        document.getElementById('skillForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('skillName').value.trim();
            const percent = parseInt(document.getElementById('skillPercent').value) || 0;
            const desc = document.getElementById('skillDesc').value.trim();

            const skillData = { name, percent, desc };

            if (editingSkillIndex !== null) {
                adminSkills[editingSkillIndex] = skillData;
            } else {
                adminSkills.push(skillData);
            }

            renderSkillsAdmin();
            closeModal('skillModal');
            document.getElementById('saveAllSkillsBtn').classList.add('btn-accent-pulse'); // Add some highlight
            setTimeout(() => document.getElementById('saveAllSkillsBtn').classList.remove('btn-accent-pulse'), 2000);
        });

        document.getElementById('saveAllSkillsBtn').addEventListener('click', saveSkillsToStorage);

        return card;
    }

    function openAddExp() {
        editingExpId = null;
        document.getElementById('expModalTitle').innerHTML = '<i class="fas fa-briefcase"></i> Tambah Pengalaman';
        document.getElementById('expForm').reset();
        document.getElementById('expOrder').value = '0';
        openModal('expModal');
    }

    function openEditExp(exp) {
        editingExpId = exp.id;
        document.getElementById('expModalTitle').innerHTML = '<i class="fas fa-briefcase"></i> Edit Pengalaman';
        document.getElementById('expCompany').value = exp.company;
        document.getElementById('expPeriod').value = exp.period;
        document.getElementById('expLocation').value = exp.location || '';
        document.getElementById('expDesc').value = exp.description || '';
        document.getElementById('expTags').value = (exp.tags || []).join(', ');
        document.getElementById('expOrder').value = exp.sort_order || 0;
        openModal('expModal');
    }

    async function saveExperience(e) {
        e.preventDefault();
        const btn = document.getElementById('saveExpBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div> Menyimpan...';

        try {
            const company = document.getElementById('expCompany').value.trim();
            const period = document.getElementById('expPeriod').value.trim();
            const location = document.getElementById('expLocation').value.trim();
            const description = document.getElementById('expDesc').value.trim();
            const tagsStr = document.getElementById('expTags').value.trim();
            const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
            const sort_order = parseInt(document.getElementById('expOrder').value) || 0;

            const payload = { company, period, location, description, tags, sort_order };

            if (editingExpId) {
                const { error } = await supabase
                    .from('experiences')
                    .update(payload)
                    .eq('id', editingExpId);
                if (error) throw error;
                showToast('Pengalaman berhasil diupdate!', 'success');
            } else {
                const { error } = await supabase
                    .from('experiences')
                    .insert(payload);
                if (error) throw error;
                showToast('Pengalaman berhasil ditambahkan!', 'success');
            }

            closeModal('expModal');
            loadExperiences();
        } catch (e) {
            showToast('Gagal menyimpan: ' + e.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
        }
    }

    // ===== SKILLS CRUD =====
    let adminSkills = [];
    let editingSkillIndex = null;

    async function loadSkills() {
        document.getElementById('skillsLoading').style.display = 'block';
        document.getElementById('skillsEmpty').style.display = 'none';
        const listEl = document.getElementById('skillsAdminList');
        listEl.innerHTML = '';
        document.getElementById('saveAllSkillsBtn').style.display = 'none';

        try {
            const { data, error } = await supabase.storage.from('portfolio').download('content/skills.json');
            if (error) {
                // Not found is fine for first time
                if (error.message.includes('Object not found')) {
                    adminSkills = [];
                } else {
                    throw error;
                }
            } else {
                const text = await data.text();
                adminSkills = JSON.parse(text);
                
                // Sort by percent by default if needed, or leave as is
                adminSkills.sort((a, b) => b.percent - a.percent);
            }
        } catch (err) {
            console.error('Error loading skills file:', err);
            adminSkills = [];
        } finally {
            document.getElementById('skillsLoading').style.display = 'none';
            renderSkillsAdmin();
        }
    }

    function renderSkillsAdmin() {
        const listEl = document.getElementById('skillsAdminList');
        const emptyEl = document.getElementById('skillsEmpty');
        const saveBtn = document.getElementById('saveAllSkillsBtn');
        
        listEl.innerHTML = '';

        if (!adminSkills || adminSkills.length === 0) {
            emptyEl.style.display = 'flex';
            saveBtn.style.display = 'none';
            return;
        }

        emptyEl.style.display = 'none';
        saveBtn.style.display = 'inline-block';

        adminSkills.forEach((skill, index) => {
            const el = document.createElement('div');
            el.className = 'glass-card';
            el.style.padding = '16px';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'space-between';
            
            el.innerHTML = `
                <div>
                    <h4 style="margin:0;color:var(--text-primary);display:flex;align-items:center;gap:8px;">
                        ${escapeHtml(skill.name)} 
                        <span style="background:var(--accent);color:#000;padding:2px 6px;border-radius:4px;font-size:0.75rem;">${skill.percent}%</span>
                    </h4>
                    <p style="margin:4px 0 0 0;font-size:0.85rem;color:var(--text-secondary);">${escapeHtml(skill.desc)}</p>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-ghost edit-skill" data-idx="${index}" style="padding:6px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-ghost delete-skill" data-idx="${index}" style="padding:6px;width:32px;height:32px;color:var(--danger);display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            el.querySelector('.edit-skill').addEventListener('click', () => {
                editingSkillIndex = index;
                document.getElementById('skillModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Skill';
                document.getElementById('skillName').value = skill.name;
                document.getElementById('skillPercent').value = skill.percent;
                document.getElementById('skillDesc').value = skill.desc;
                openModal('skillModal');
            });

            el.querySelector('.delete-skill').addEventListener('click', () => {
                if(confirm('Yakin ingin menghapus skill ini?')) {
                    adminSkills.splice(index, 1);
                    renderSkillsAdmin();
                }
            });

            listEl.appendChild(el);
        });
    }

    async function saveSkillsToStorage() {
        const btn = document.getElementById('saveAllSkillsBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;margin:0;border-width:2px;"></div> Menyimpan...';
        
        try {
            const fileData = JSON.stringify(adminSkills);
            const blob = new Blob([fileData], { type: 'application/json' });
            
            const { error } = await supabase.storage.from('portfolio').upload('content/skills.json', blob, {
                upsert: true,
                contentType: 'application/json'
            });
            
            if (error) throw error;
            showToast('Daftar skill berhasil disimpan', 'success');
        } catch (e) {
            console.error(e);
            showToast('Gagal menyimpan skill: ' + e.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan Skills';
        }
    }

    async function deleteExperience(id) {
        if (!confirm('Hapus pengalaman ini?')) return;
        try {
            const { error } = await supabase.from('experiences').delete().eq('id', id);
            if (error) throw error;
            showToast('Pengalaman berhasil dihapus', 'success');
            loadExperiences();
        } catch (e) {
            showToast('Gagal menghapus: ' + e.message, 'error');
        }
    }

    // ===== PROFILE / SETTINGS =====
    let pendingProfileFile = null;

    async function loadAdminProfile() {
        const preview = document.getElementById('adminProfilePreview');
        try {
            const { data, error } = await supabase.storage
                .from('portfolio')
                .list('profile', { sortBy: { column: 'created_at', order: 'desc' }, limit: 1 });
            
            if (data && data.length > 0) {
                const { data: urlData } = supabase.storage
                    .from('portfolio')
                    .getPublicUrl('profile/' + data[0].name);
                
                if (urlData && urlData.publicUrl) {
                    preview.src = urlData.publicUrl;
                }
            }
        } catch (e) {
            console.log('Error loading profile photo', e);
        }
    }

    async function saveProfilePhoto() {
        if (!pendingProfileFile) return;
        
        const btn = document.getElementById('saveProfileBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div> Mengupload...';

        try {
            const ext = pendingProfileFile.name.split('.').pop() || 'png';
            const fileName = `avatar-${Date.now()}.${ext}`;
            const filePath = `profile/${fileName}`;

            // Upload format file baru
            const { error: uploadErr } = await supabase.storage
                .from('portfolio')
                .upload(filePath, pendingProfileFile, { upsert: true });

            if (uploadErr) throw uploadErr;

            // Optional: Hapus file profile lama untuk menghemat storage
            try {
                const { data: oldFiles } = await supabase.storage
                    .from('portfolio')
                    .list('profile');
                
                const filesToDelete = oldFiles
                    .filter(f => f.name !== fileName && f.name !== '.emptyFolderPlaceholder')
                    .map(f => `profile/${f.name}`);
                    
                if (filesToDelete.length > 0) {
                    await supabase.storage.from('portfolio').remove(filesToDelete);
                }
            } catch (e) { console.warn('Gagal menghapus foto lama', e); }

            showToast('Foto profil berhasil di-update!', 'success');
            pendingProfileFile = null;
            btn.innerHTML = '<i class="fas fa-save"></i> Simpan Foto Profil';
        } catch (e) {
            showToast('Gagal mengupload foto: ' + e.message, 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Simpan Foto Profil';
        }
    }

    // ===== LAYERS UI =====
    function renderLayersUI() {
        const listEl = document.getElementById('layersList');
        const countEl = document.getElementById('layerCount');
        listEl.innerHTML = '';

        const totalLayers = existingLayers.length + pendingLayers.length;
        countEl.textContent = `${totalLayers} layer`;

        // Existing layers
        existingLayers.forEach((layer, i) => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            const thumbSrc = layer.replacePreview || layer.file_url;
            const statusLabel = layer.replaceFile
                ? `<span style="color:var(--accent);font-size:.72rem">⚡ Akan diganti</span>`
                : `<span style="color:var(--text-muted);font-size:.72rem">Existing layer</span>`;

            item.innerHTML = `
                <div class="layer-item-thumb" style="cursor:pointer;position:relative;" title="Klik untuk ganti gambar">
                    <img src="${thumbSrc}" alt="${escapeHtml(layer.name)}">
                    <div class="layer-thumb-overlay"><i class="fas fa-camera"></i></div>
                </div>
                <div class="layer-item-info">
                    <div class="layer-item-name">
                        <input type="text" value="${escapeHtml(layer.name)}" class="layer-name-input">
                    </div>
                    <div class="layer-item-size">${statusLabel}</div>
                </div>
                <div class="layer-item-actions">
                    <button type="button" class="replace-layer-btn" title="Ganti gambar layer">
                        <i class="fas fa-image"></i>
                    </button>
                    <button type="button" class="delete-layer" title="Hapus layer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Rename
            item.querySelector('.layer-name-input').addEventListener('change', (e) => {
                existingLayers[i].name = e.target.value;
            });

            // Replace image — via hidden input or thumb click
            const triggerReplace = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = () => {
                    if (!input.files[0]) return;
                    const file = input.files[0];
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        existingLayers[i].replaceFile = file;
                        existingLayers[i].replacePreview = e.target.result;
                        renderLayersUI();
                        showToast(`Layer "${existingLayers[i].name}" siap diganti — klik Simpan`, 'success');
                    };
                    reader.readAsDataURL(file);
                };
                input.click();
            };
            item.querySelector('.layer-item-thumb').addEventListener('click', triggerReplace);
            item.querySelector('.replace-layer-btn').addEventListener('click', triggerReplace);

            // Delete
            item.querySelector('.delete-layer').addEventListener('click', () => deleteExistingLayer(i));

            listEl.appendChild(item);
        });

        // Pending layers (new, not yet saved)
        pendingLayers.forEach((layer, i) => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            const size = formatBytes(layer.file.size);
            item.innerHTML = `
                <div class="layer-item-thumb">
                    <img src="${layer.preview}" alt="${escapeHtml(layer.name)}">
                </div>
                <div class="layer-item-info">
                    <div class="layer-item-name">
                        <input type="text" value="${escapeHtml(layer.name)}" class="layer-name-input">
                    </div>
                    <div class="layer-item-size">${size} • <span style="color:var(--success)">Baru</span></div>
                </div>
                <div class="layer-item-actions">
                    <button type="button" class="delete-layer" title="Hapus layer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            item.querySelector('.layer-name-input').addEventListener('change', (e) => {
                pendingLayers[i].name = e.target.value;
            });
            item.querySelector('.delete-layer').addEventListener('click', () => {
                pendingLayers.splice(i, 1);
                renderLayersUI();
            });

            listEl.appendChild(item);
        });
    }

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
                pendingLayers.push({
                    file: file,
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    preview: e.target.result
                });
                renderLayersUI();
            };
            reader.readAsDataURL(file);
        });
    }

    // ===== MODAL =====
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // ===== TOAST =====
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== HELPERS =====
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function generateParticles() {
        const container = document.getElementById('loginParticles');
        if (!container) return;
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'login-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = Math.random() * 12 + 's';
            p.style.animationDuration = (8 + Math.random() * 8) + 's';
            p.style.width = (2 + Math.random() * 3) + 'px';
            p.style.height = p.style.width;
            container.appendChild(p);
        }
    }

    // ===== EVENTS =====
    function bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            login(email, password);
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', logout);

        // Tab switching
        document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.currentTarget.dataset.tab;
                
                // Update active link
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Show tab content
                document.querySelectorAll('.tab-content').forEach(t => {
                    t.style.display = 'none';
                    t.classList.remove('active');
                });
                const tabEl = document.getElementById(tab + 'Tab');
                if (tabEl) {
                    tabEl.style.display = 'block';
                    tabEl.classList.add('active');
                }
                
                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('active');
                }
            });
        });

        // Mobile sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('open');
            });
        }

        // Add buttons
        document.getElementById('addWorkBtn').addEventListener('click', openAddWork);
        document.getElementById('addExpBtn').addEventListener('click', openAddExp);

        // Work form
        document.getElementById('workForm').addEventListener('submit', saveWork);

        // Experience form
        document.getElementById('expForm').addEventListener('submit', saveExperience);

        // Modal close buttons
        document.querySelectorAll('.modal-close, .btn-ghost[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.modal;
                if (modalId) closeModal(modalId);
            });
        });

        // Modal overlay click to close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                const modal = overlay.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        });

        // File upload - Layer Zone
        const layerUploadZone = document.getElementById('uploadZone');
        const layerFileInput = document.getElementById('layerFileInput');

        layerUploadZone.addEventListener('click', () => layerFileInput.click());
        layerUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            layerUploadZone.classList.add('dragover');
        });
        layerUploadZone.addEventListener('dragleave', () => {
            layerUploadZone.classList.remove('dragover');
        });
        layerUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            layerUploadZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });
        layerFileInput.addEventListener('change', () => {
            handleFiles(layerFileInput.files);
            layerFileInput.value = '';
        });

        // Profile Photo Setup
        const profileInput = document.getElementById('profileFileInput');
        const profileZone = document.getElementById('profileUploadZone');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const profilePreview = document.getElementById('adminProfilePreview');

        function handleProfileFile(file) {
            if (!file || !file.type.startsWith('image/')) return;
            pendingProfileFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePreview.src = e.target.result;
                saveProfileBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }

        if (profileZone && profileInput) {
            profileZone.addEventListener('click', () => profileInput.click());
            profileZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                profileZone.classList.add('dragover');
            });
            profileZone.addEventListener('dragleave', () => {
                profileZone.classList.remove('dragover');
            });
            profileZone.addEventListener('drop', (e) => {
                e.preventDefault();
                profileZone.classList.remove('dragover');
                if(e.dataTransfer.files.length) handleProfileFile(e.dataTransfer.files[0]);
            });
            profileInput.addEventListener('change', () => {
                if(profileInput.files.length) handleProfileFile(profileInput.files[0]);
            });
            
            saveProfileBtn.addEventListener('click', saveProfilePhoto);
        }
    }

    // ===== START =====
    document.addEventListener('DOMContentLoaded', init);

})();
