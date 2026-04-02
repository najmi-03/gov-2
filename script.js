// ============================================
// Muhammad Najmi Ahyar — Portfolio Scripts
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Cursor Glow ---
    const cursorGlow = document.getElementById('cursorGlow');
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    // --- Particles ---
    const particlesContainer = document.getElementById('heroParticles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 12 + 's';
        particle.style.animationDuration = (8 + Math.random() * 8) + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }

    // --- Typing Effect ---
    const titles = ['Graphic Designer', 'Web Developer', 'Creative Thinker', 'Visual Storyteller'];
    const typingEl = document.getElementById('typingText');
    let titleIdx = 0, charIdx = 0, isDeleting = false;

    function typeEffect() {
        const current = titles[titleIdx];
        if (isDeleting) {
            typingEl.textContent = current.substring(0, charIdx - 1);
            charIdx--;
        } else {
            typingEl.textContent = current.substring(0, charIdx + 1);
            charIdx++;
        }

        let speed = isDeleting ? 40 : 80;

        if (!isDeleting && charIdx === current.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            titleIdx = (titleIdx + 1) % titles.length;
            speed = 400;
        }

        setTimeout(typeEffect, speed);
    }
    typeEffect();

    // --- Navbar Scroll ---
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section, .hero');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);

        // Active nav link
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 150;
            if (window.scrollY >= top) current = sec.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) link.classList.add('active');
        });
    });

    // --- Mobile Nav Toggle ---
    const workTemplate = document.getElementById('workTemplate');
    const expPlaceholder = document.getElementById('experienceList');
    const skillsGrid = document.querySelector('.skills-grid');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // --- Scroll Reveal (Intersection Observer) — IN & OUT ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, i * 80);
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Skill Ring Animation — IN & OUT ---
    const skillCards = document.querySelectorAll('.skill-card');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            } else {
                entry.target.classList.remove('animate');
            }
        });
    }, { threshold: 0.2 });

    skillCards.forEach(card => skillObserver.observe(card));

    // --- Stat Counter Animation — IN & OUT ---
    const statNumbers = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                // Clear any existing timer
                if (el._counterTimer) clearInterval(el._counterTimer);
                let count = 0;
                const increment = target / 40;
                el._counterTimer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        el.textContent = target;
                        clearInterval(el._counterTimer);
                    } else {
                        el.textContent = Math.floor(count);
                    }
                }, 40);
            } else {
                const el = entry.target;
                if (el._counterTimer) clearInterval(el._counterTimer);
                el.textContent = '0';
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => statObserver.observe(el));

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Supabase Init (if configured) ---
    let sb = null;
    if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL && typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY) {
        try {
            sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.log('Supabase init failed, using fallback:', e);
        }
    }

    // --- Portfolio Layer Viewer ---
    async function loadPortfolio() {
        const grid = document.getElementById('portfolioGrid');
        let works = [];

        // Try Supabase first
        if (sb) {
            try {
                const { data, error } = await sb
                    .from('works')
                    .select('*, work_layers(*)')
                    .order('sort_order', { ascending: true });

                if (!error && data && data.length > 0) {
                    works = data.map(w => ({
                        id: w.slug || w.id,
                        title: w.title,
                        description: w.description || '',
                        layers: (w.work_layers || [])
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map(l => ({
                                file: l.file_url,
                                name: l.name,
                                isUrl: true
                            }))
                    }));
                }
            } catch (e) {
                console.log('Supabase fetch failed, trying works.json:', e);
            }
        }

        // Fallback to works.json
        if (works.length === 0) {
            try {
                const res = await fetch('works.json');
                const jsonWorks = await res.json();
                works = jsonWorks.map(w => ({
                    ...w,
                    layers: w.layers.map(l => ({
                        file: `${w.folder}/${l.file}`,
                        name: l.name,
                        isUrl: false
                    }))
                }));
            } catch (e) {
                console.log('No works.json found:', e);
                return;
            }
        }

        if (!works.length) return;

        works.forEach((work) => {
            const item = document.createElement('div');
            item.className = 'portfolio-item reveal';
            item.innerHTML = `
                <div class="portfolio-item-header">
                    <div class="portfolio-item-info">
                        <h3>${work.title}</h3>
                        <p>${work.description}</p>
                    </div>
                </div>
                <div class="portfolio-viewer">
                    <div class="layer-canvas" id="canvas-${work.id}">
                        <div class="layer-counter" id="counter-${work.id}">Layer 0 / ${work.layers.length}</div>
                        ${work.layers.map((layer, i) =>
                            `<img src="${layer.file}" alt="${layer.name}" class="layer-img" data-layer="${i}" loading="lazy">`
                        ).join('')}
                    </div>
                    <div class="layer-controls" id="controls-${work.id}">
                        <div class="layer-slider-wrap">
                            <div class="layer-slider-label">
                                <span>Layer Slider</span>
                                <button class="layer-play-btn" id="play-${work.id}" title="Auto-play">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                            <input type="range" class="layer-slider" id="slider-${work.id}"
                                min="0" max="${work.layers.length}" value="0" step="1">
                        </div>
                        ${work.layers.map((layer, i) =>
                            `<button class="layer-btn" data-layer="${i}" data-work="${work.id}">
                                <span class="layer-btn-dot"></span>
                                <span class="layer-btn-name">${layer.name}</span>
                                <span class="layer-btn-idx">${String(i + 1).padStart(2, '0')}</span>
                            </button>`
                        ).join('')}
                    </div>
                </div>
            `;
            grid.appendChild(item);
            setTimeout(() => setupLayerViewer(work), 100);
        });

        document.querySelectorAll('.portfolio-item.reveal').forEach(el => revealObserver.observe(el));
    }

    // --- Load Experiences from Supabase ---
    async function loadExperiences() {
        if (!sb) return; // Keep static HTML fallback

        try {
            const { data, error } = await sb
                .from('experiences')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error || !data || data.length === 0) return;

            const timeline = document.getElementById('experienceTimeline');
            if (!timeline) return;

            // Remove fallback items
            timeline.querySelectorAll('[data-fallback]').forEach(el => el.remove());

            data.forEach(exp => {
                const tags = (exp.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
                const item = document.createElement('div');
                item.className = 'timeline-item reveal';
                item.innerHTML = `
                    <div class="timeline-marker"><div class="timeline-dot"></div></div>
                    <div class="timeline-card glass-card">
                        <div class="timeline-header">
                            <span class="timeline-badge">${exp.period}</span>
                            <h3 class="timeline-title">${exp.company}</h3>
                        </div>
                        <p class="timeline-location"><i class="fas fa-map-marker-alt"></i> ${exp.location || ''}</p>
                        <p class="timeline-desc">${exp.description || ''}</p>
                        <div class="timeline-tags">${tags}</div>
                    </div>
                `;
                timeline.appendChild(item);
                revealObserver.observe(item);
            });
        } catch (e) {
            console.log('Experience fetch from Supabase failed, using fallback:', e);
        }
    }

    function setupLayerViewer(work) {
        const canvas = document.getElementById(`canvas-${work.id}`);
        const slider = document.getElementById(`slider-${work.id}`);
        const playBtn = document.getElementById(`play-${work.id}`);
        const counter = document.getElementById(`counter-${work.id}`);
        const buttons = document.querySelectorAll(`.layer-btn[data-work="${work.id}"]`);
        const layers = canvas.querySelectorAll('.layer-img');

        let visibleLayers = new Set();
        let autoPlayTimer = null;

        function updateView(upToIndex) {
            visibleLayers.clear();
            layers.forEach((img, i) => {
                if (i <= upToIndex) {
                    setTimeout(() => {
                        img.classList.add('visible');
                    }, (i - Math.max(0, upToIndex - work.layers.length)) * 150);
                    visibleLayers.add(i);
                } else {
                    img.classList.remove('visible');
                }
            });
            buttons.forEach((btn, i) => {
                btn.classList.toggle('active', i <= upToIndex);
            });
            counter.textContent = `Layer ${Math.min(upToIndex + 1, work.layers.length)} / ${work.layers.length}`;
        }

        function resetAll() {
            layers.forEach(img => img.classList.remove('visible'));
            buttons.forEach(btn => btn.classList.remove('active'));
            counter.textContent = `Layer 0 / ${work.layers.length}`;
            visibleLayers.clear();
        }

        slider.addEventListener('input', () => {
            const val = parseInt(slider.value);
            if (val === 0) { resetAll(); } else { updateView(val - 1); }
        });

        buttons.forEach((btn, i) => {
            btn.addEventListener('click', () => {
                const img = layers[i];
                if (visibleLayers.has(i)) {
                    img.classList.remove('visible');
                    btn.classList.remove('active');
                    visibleLayers.delete(i);
                } else {
                    img.classList.add('visible');
                    btn.classList.add('active');
                    visibleLayers.add(i);
                }
                counter.textContent = `Layer ${visibleLayers.size} / ${work.layers.length}`;
                slider.value = visibleLayers.size;
            });
        });

        function togglePlay() {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = null;
                playBtn.classList.remove('playing');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                return;
            }

            resetAll();
            slider.value = 0;
            playBtn.classList.add('playing');
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';

            let current = 0;
            autoPlayTimer = setInterval(() => {
                if (current < work.layers.length) {
                    layers[current].classList.add('visible');
                    buttons[current].classList.add('active');
                    visibleLayers.add(current);
                    current++;
                    slider.value = current;
                    counter.textContent = `Layer ${current} / ${work.layers.length}`;
                } else {
                    clearInterval(autoPlayTimer);
                    autoPlayTimer = null;
                    playBtn.classList.remove('playing');
                    playBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            }, 800);
        }

        playBtn.addEventListener('click', togglePlay);

        // Auto-play on scroll feature
        const viewerContainer = canvas.closest('.portfolio-item');
        if (viewerContainer) {
            let hasAutoPlayed = false;
            const autoPlayObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasAutoPlayed) {
                        hasAutoPlayed = true;
                        // Kasih jeda sedikit biar animasi masuk/reveal selasai dulu
                        setTimeout(() => {
                            if (!autoPlayTimer) togglePlay();
                        }, 500); 
                    } else if (!entry.isIntersecting && autoPlayTimer) {
                        // Pause animation if scrolled out of view
                        togglePlay();
                        hasAutoPlayed = false; // Reset so it can play again when scrolled back
                    }
                });
            }, { threshold: 0.4 });
            
            autoPlayObserver.observe(viewerContainer);
        }
    }

    // --- Dynamic Skills Loading ---
    async function loadSkills() {
        if (!sb || !skillsGrid) return;
        
        try {
            const { data, error } = await sb.storage.from('portfolio').download('content/skills.json');
            if (error) throw error;
            
            const text = await data.text();
            const skills = JSON.parse(text);
            
            if (skills && skills.length > 0) {
                // Determine if we need to clean up existing static HTML
                skillsGrid.innerHTML = '';
                
                // Helper to prevent XSS
                const escapeHtmlText = (str) => {
                    if (!str) return '';
                    return str.toString()
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                };

                skills.forEach(skill => {
                    const card = document.createElement('div');
                    card.className = 'skill-card glass-card reveal';
                    card.dataset.skill = skill.percent || 0;
                    
                    card.innerHTML = `
                        <div class="skill-icon-wrapper">
                            <div class="skill-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle class="skill-ring-bg" cx="50" cy="50" r="45"/>
                                    <circle class="skill-ring-fill" cx="50" cy="50" r="45" style="--percent: ${skill.percent || 0}"/>
                                </svg>
                                <span class="skill-percent">${skill.percent || 0}%</span>
                            </div>
                        </div>
                        <h3 class="skill-name">${escapeHtmlText(skill.name)}</h3>
                        <p class="skill-desc">${escapeHtmlText(skill.desc)}</p>
                    `;
                    skillsGrid.appendChild(card);
                });

                // Observe new cards with both Reveal and Skill Ring observers
                const newCards = skillsGrid.querySelectorAll('.skill-card.reveal:not(.active)');
                newCards.forEach(el => {
                    if (typeof revealObserver !== 'undefined') revealObserver.observe(el);
                    if (typeof skillObserver !== 'undefined') skillObserver.observe(el);
                });
            }
        } catch (error) {
            console.log('Error fetching skills or using fallback:', error.message);
            // If error or file not found, we keep the existing static HTML in index.html as fallback!
        }
    }

    // --- Fetch Profile Photo ---
    async function loadProfilePhoto() {
        if (!sb) return;
        try {
            const { data, error } = await sb.storage
                .from('portfolio')
                .list('profile', { sortBy: { column: 'created_at', order: 'desc' }, limit: 1 });
            
            if (data && data.length > 0) {
                const { data: urlData } = sb.storage
                    .from('portfolio')
                    .getPublicUrl('profile/' + data[0].name);
                
                if (urlData && urlData.publicUrl) {
                    const avatarImg = document.querySelector('.avatar-photo');
                    if (avatarImg) {
                        avatarImg.src = urlData.publicUrl;
                    }
                }
            }
        } catch (e) {
            console.log('Error fetching profile photo:', e);
        }
    }

    // --- Anti-Screenshot / Confidential Data Protection ---
    const protectConfidentialData = () => {
        // Prevent Context Menu (Right Click) on protected sections
        const protectedSections = document.querySelectorAll('.no-screenshot');
        protectedSections.forEach(section => {
            section.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            // Additional protection for dragging
            section.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });
        });

        // Detect Print Screen or Snipping Tool shortcuts
        const blurScreen = () => {
            document.body.classList.add('screenshot-blurred');
            setTimeout(() => {
                document.body.classList.remove('screenshot-blurred');
            }, 3000); // Unblur after 3 seconds
        };

        window.addEventListener('keyup', (e) => {
            // PrintScreen key
            if (e.key === 'PrintScreen' || e.keyCode === 44) {
                blurScreen();
                // Optionally clear clipboard here using an empty string if clipboard API is allowed
                navigator.clipboard.writeText('');
            }
        });

        window.addEventListener('keydown', (e) => {
            // Windows Snipping Tool (Win + Shift + S) or Mac Screenshot (Cmd + Shift + 4/3/5)
            if ((e.metaKey && e.shiftKey) || (e.ctrlKey && e.shiftKey)) {
                blurScreen();
            }
        });

        // Blur on visibility change (when Snipping tool is opened, page often loses focus)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.body.classList.add('screenshot-blurred');
            } else {
                // Keep blurred briefly after return
                setTimeout(() => {
                    document.body.classList.remove('screenshot-blurred');
                }, 500);
            }
        });

        // Prevent copying via keyboard shortcut (Ctrl+C, Cmd+C) inside confidential section
        document.addEventListener('copy', (e) => {
            if (e.target.closest('.confidential')) {
                e.preventDefault();
                // Override clipboard
                if (e.clipboardData) {
                    e.clipboardData.setData('text/plain', 'Tindakan ini tidak diizinkan. Dokumen ini bersifat rahasia.');
                }
            }
        });
    };
    
    protectConfidentialData();

    // Boot up
    loadPortfolio();
    loadExperiences();
    loadSkills();
    loadProfilePhoto();
});
