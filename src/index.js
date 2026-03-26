'use strict';

// const { createApp } = Vue;

// replace existing top of index.js
import { createApp } from 'vue';

/* ── Constants ──────────────────────────────────────────────────────────── */
const CANVAS_SIZE   = 1000;          // internal canvas resolution (px)
const SLIDE_HOLD_MS = 5000;          // how long each logo is displayed

// Brand colors for the particle scatter effect
// (avoids pixel-sampling the SVG, which can taint the canvas cross-browser)
const BRAND_COLORS = [
    [240, 176, 96],   // --gold
    [248, 204, 138],  // --gold-light
    [0,   187, 0],    // --green-light
    [201, 106, 255],  // --violet
    [232, 240, 224],  // --text
];

/* ── App ────────────────────────────────────────────────────────────────── */
createApp({

    /* ── Data ─────────────────────────────────────────────────────────── */
    data() {
        return {
            isScrolled:    false,
            showTop:       false,
            activeSection: 'hero',
            year:          new Date().getFullYear(),

            /* Canvas carousel state (underscore prefix = not reactive-tracked) */
            heroLogos: [
                '/assets/img/a-little-aloha-clear-shadow.svg',
                '/assets/img/pro-with-a-little-aloha-clear-shadow.svg',
                '/assets/img/design-with-a-little-aloha-clear-shadow.svg',
                '/assets/img/calligraphy-with-a-little-aloha-clear-shadow.svg',
            ],
            // Entrance effect for each logo index
            // 0 → Transporter  1 → Mullany block dissolve
            // 2 → Eru particles  3 → Burn from center
            heroEffects: ['transporter', 'mullany', 'particles', 'burn'],

            /* Lightbox */
            selectedImage:  null,
            isLightboxOpen: false,

            /* ── Service cards ─────────────────────────────────────────── */
            services: {
                infra: [
                    { title:'DDI Consulting & Audits',       meta:'DNS · DHCP · IPAM',          icon:'fa-sitemap',     desc:'Enterprise DNS/DHCP/IPAM architecture, migration planning, implementation, and documentation using Infoblox, BIND 9, and QIP. Zone design, automation scripting, and comprehensive runbooks.',                                          tags:['Infoblox','BIND 9','QIP','IPv6','DDI Automation'],                 visible:false, expanded:false },
                    { title:'Linux / Unix Administration',   meta:'RHEL · CentOS · Solaris',    icon:'fa-server',      desc:'System configuration, hardening, monitoring, and automation across RHEL, CentOS, SuSE, Solaris, and HP-UX. Network service deployment and long-term infrastructure support.',                                                        tags:['RHEL','CentOS','Solaris','SuSE','HP-UX'],                         visible:false, expanded:false },
                    { title:'Network Architecture Diagrams', meta:'Visio · OmniGraffle',        icon:'fa-share-alt',   desc:'DNS zone maps, DHCP scope layouts, IPAM hierarchy diagrams, and full network infrastructure visuals for engineering reviews, audits, and team onboarding.',                                                                         tags:['Visio','OmniGraffle','draw.io','Confluence'],                     visible:false, expanded:false },
                    { title:'Wi-Fi Setup & Optimization',    meta:'Home · Small Office',        icon:'fa-wifi',        desc:'Full Wi-Fi assessment, router placement, channel optimization, and configuration for reliable whole-home or office coverage. Includes password hardening and guest network isolation.',                                              tags:['Wi-Fi','Router','802.11','Coverage','Security'],                   visible:false, expanded:false },
                    { title:'Router & Modem Configuration',  meta:'Swap · Setup · Optimize',    icon:'fa-exchange',    desc:'Modem and router installation, ISP configuration, port forwarding, QoS tuning, and firmware updates. Covers most major consumer and prosumer brands.',                                                                           tags:['Modem','Router','ISP','Port Forwarding','QoS'],                   visible:false, expanded:false },
                    { title:'Mesh Network Installation',     meta:'Whole-Home Coverage',        icon:'fa-signal',      desc:'Design and installation of multi-node mesh systems for consistent whole-home or office coverage. Node placement, backhaul configuration, and performance validation included.',                                                    tags:['Mesh','Eero','Orbi','Google WiFi','Node Placement'],               visible:false, expanded:false },
                    { title:'Ethernet Cable Consulting',     meta:'Wired · Reliable · Fast',    icon:'fa-plug',        desc:'On-site assessment and implementation of wired ethernet runs for desktops, smart TVs, gaming systems, and workstations. Cat5e/Cat6 runs up to 50 ft per visit.',                                                                tags:['Cat6','Cat5e','Ethernet','Wired','LAN'],                           visible:false, expanded:false },
                    { title:'Network Troubleshooting',       meta:'Diagnostics · Resolution',   icon:'fa-stethoscope', desc:'Systematic diagnosis of connectivity issues, slow speeds, dropped connections, and device conflicts. Covers ISP handoff, router configuration, and endpoint problems.',                                                          tags:['Troubleshooting','Diagnostics','Connectivity','DNS','Speed'],      visible:false, expanded:false },
                    { title:'Network Security Review',       meta:'Home Security Audit',        icon:'fa-shield',      desc:'Review of router security settings, default credential exposure, guest network isolation, firewall rules, and firmware currency. Written summary delivered after visit.',                                                         tags:['Security','Firewall','Guest Network','Audit','Firmware'],          visible:false, expanded:false },
                    { title:'ISP Liaison Support',           meta:'On-Site Coordination',       icon:'fa-phone',       desc:'On-site support during ISP visits or as your technical representative when navigating service issues, equipment upgrades, or speed complaints with your provider.',                                                              tags:['ISP','Xfinity','CenturyLink','Technical Support','Coordination'], visible:false, expanded:false },
                    { title:'IT Onboarding Documentation',   meta:'Small Team Setup',           icon:'fa-book',        desc:'Complete IT onboarding packages for small teams: system access guides, tool walkthroughs, credential management procedures, and first-week technical checklists.',                                                              tags:['Documentation','Onboarding','Confluence','Markdown'],             visible:false, expanded:false },
                ],
                webops: [
                    { title:'Scripting & Automation',          meta:'Perl · Bash · Shell',        icon:'fa-terminal',  desc:'Automation tooling for sysadmin workflows, DNS record management, log parsing, data migration, and infrastructure integration across Unix and Windows environments.',                                              tags:['Perl','Bash','ksh','zsh','PowerShell'],                visible:false, expanded:false },
                    { title:'Confluence & Jira Configuration', meta:'Atlassian · Documentation',  icon:'fa-tasks',     desc:'Full Confluence space buildout, page hierarchy design, and template creation. Jira project configuration, workflow customization, and team onboarding documentation.',                                          tags:['Confluence','Jira','Atlassian','Scrum'],               visible:false, expanded:false },
                    { title:'Technical Writing',               meta:'Runbooks · SOPs · Guides',   icon:'fa-file-text', desc:'Process documentation, runbooks, integration guides, change procedures, and IT onboarding materials written clearly for operators, engineers, and executives.',                                                 tags:['Markdown','Docs-as-Code','Confluence','Visio'],        visible:false, expanded:false },
                    { title:'Remote Advisory Sessions',        meta:'DNS · Linux · Perl',         icon:'fa-headphones',desc:'Live one-on-one advisory sessions for DNS troubleshooting, Linux system issues, Perl scripting questions, and infrastructure design reviews. Scheduled via video call.',                                        tags:['DNS','Linux','Perl','Infoblox','Codementor'],          visible:false, expanded:false },
                    { title:'Application & DevOps Support',    meta:'Node.js · MySQL · MongoDB',  icon:'fa-cogs',      desc:'Application server administration, deployment pipeline support, and database operations for Apache, Node.js, MySQL, PostgreSQL, and MongoDB environments.',                                                    tags:['Node.js','MySQL','MongoDB','Apache','PostgreSQL'],     visible:false, expanded:false },
                    { title:'VM Server Build & Docs',          meta:'Google Cloud · AWS · Azure', icon:'fa-cloud',     desc:'Virtual machine provisioning, configuration, and documentation in Google Cloud, AWS, Azure, and on-premises environments. Includes deployment runbooks and architecture records.',                             tags:['Google Cloud','AWS','Azure','CentOS','Apache'],        visible:false, expanded:false },
                    { title:'BPM / Camunda Documentation',     meta:'Integration Guides',         icon:'fa-random',    desc:'Integration guides, process maps, swimlane diagrams, API reference docs, and change management procedures for Camunda BPM platform migrations.',                                                              tags:['Camunda','BPMN','Integration','API Docs'],             visible:false, expanded:false },
                ],
                design: [
                    { title:'Logo & Brand Identity',          meta:'Identity Design',              icon:'fa-paint-brush',     desc:'Original logo design, brand color palette, typography selection, and brand style guide. Delivered in vector formats suitable for web, print, and merchandise.',                                                tags:['Illustrator','Inkscape','SVG','Brand Guide'],                           visible:false, expanded:false },
                    { title:'Business Cards & Print Layout',  meta:'Print Design',                 icon:'fa-print',           desc:'Business card, flyer, brochure, and promotional material design. Print-ready files delivered in CMYK at correct resolution for professional printing.',                                                   tags:['Print-Ready','CMYK','Illustrator','InDesign'],                          visible:false, expanded:false },
                    { title:'Document Design & Formatting',   meta:'Reports · Proposals',          icon:'fa-file',            desc:'Professional design and formatting for reports, proposals, guides, and presentation documents. Transforms plain content into polished, branded deliverables.',                                            tags:['LibreOffice','Word','InDesign','PDF'],                                  visible:false, expanded:false },
                    { title:'Social Media Graphics',          meta:'Posts · Banners · Covers',     icon:'fa-picture-o',       desc:'On-brand graphics for Instagram, Facebook, LinkedIn, and X. Correctly sized for each platform — posts, stories, banners, and profile assets.',                                                         tags:['Photoshop','Canva','Instagram','LinkedIn'],                             visible:false, expanded:false },
                    { title:'Presentation Design',            meta:'Slides & Decks',               icon:'fa-bar-chart',       desc:'Slide deck design for pitches, training, and conference talks. Custom templates, infographics, and clean layouts in your preferred format.',                                                             tags:['PowerPoint','Keynote','LibreOffice Impress','Google Slides'],           visible:false, expanded:false },
                    { title:'Photo Editing & Retouching',     meta:'Adobe Creative Suite',         icon:'fa-photo',           desc:'Professional photo retouching, color correction, background removal, compositing, and image restoration using Adobe Photoshop and Lightroom.',                                                         tags:['Photoshop','Lightroom','Color Grading','Compositing'],                 visible:false, expanded:false },
                    { title:'Site & Property Photography',    meta:'Business · Events · Listings', icon:'fa-camera',          desc:'On-site photography for small business locations, property listings, events, and website hero images. Edited and delivered in web-ready and print-ready formats. Enthusiast-level pricing.',            tags:['Photography','Business','Lightroom','Events','Editing'],               visible:false, expanded:false },
                    { title:'Custom Illustrations & Diagrams',meta:'Hand-drawn · Digital',         icon:'fa-pencil-square-o', desc:'Custom illustrations, technical diagrams, and conceptual drawings created digitally or by hand. Suitable for websites, presentations, and print materials.',                                           tags:['Illustration','Diagrams','Custom Art','Digital','Hand-drawn'],         visible:false, expanded:false },
                    { title:'Web Graphics & UI Elements',     meta:'Icons · Banners · UI',         icon:'fa-object-group',    desc:'Custom web graphics, icon sets, hero banners, and UI elements designed for web delivery. Optimized for performance in SVG and WebP formats.',                                                         tags:['SVG','WebP','Figma','Illustrator'],                                    visible:false, expanded:false },
                ],
                calli: [
                    { title:'Wedding & Event Invitations', meta:'Envelope Addressing',   icon:'fa-envelope',   desc:'Hand-addressed envelopes and inner envelopes for weddings, formal events, and celebrations. Multiple script styles available — copperplate, italic, and modern calligraphy.',                                                    tags:['Copperplate','Italic','Modern','Pointed Pen'],       visible:false, expanded:false },
                    { title:'Certificates & Diplomas',    meta:'Engrossing Services',    icon:'fa-certificate',desc:'Official-quality calligraphy for certificates, diplomas, awards, and formal recognitions. Engrossed by hand with attention to alignment, spacing, and consistency.',                                                          tags:['Engrossing','Certificates','Awards','Formal'],       visible:false, expanded:false },
                    { title:'Place Cards & Menus',        meta:'Event Stationery',       icon:'fa-cutlery',    desc:'Handwritten place cards, table cards, menus, and seating charts for weddings, banquets, and formal dinners. Coordinated with your event palette and style.',                                                                 tags:['Place Cards','Menus','Seating Charts','Event'],      visible:false, expanded:false },
                    { title:'Custom Framed Lettering',    meta:'Quotes & Art Pieces',    icon:'fa-picture-o',  desc:'Original calligraphy art pieces featuring quotes, poems, names, and custom text. Suitable for framing and gifting. Available in multiple script styles and paper sizes.',                                                    tags:['Custom Art','Quotes','Framed','Gift'],               visible:false, expanded:false },
                    { title:'Scrivener & Legal Documents',meta:'Formal Documents',       icon:'fa-pencil',     desc:'Handwritten engrossment for legal documents, formal correspondence, proclamations, and official records requiring traditional calligraphic presentation.',                                                                   tags:['Scrivener','Legal','Formal','Engrossing'],           visible:false, expanded:false },
                    { title:'Custom Holiday Cards',       meta:'Seasonal Correspondence',icon:'fa-gift',       desc:'Personalized holiday cards and seasonal correspondence hand-lettered with a unique, handcrafted feel. Individual cards or short runs for businesses and families.',                                                          tags:['Holiday','Cards','Seasonal','Personal'],             visible:false, expanded:false },
                ],
            },

            /* ── Gallery ───────────────────────────────────────────── */
            gallery: [
                { title:'DNS Zone Hierarchy Diagram',     cat:'tech',   catLabel:'Pro Services', img:'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',  visible:false },
                { title:'Network Infrastructure Map',     cat:'tech',   catLabel:'Pro Services', img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',  visible:false },
                { title:'Confluence Documentation Space', cat:'tech',   catLabel:'Pro Services', img:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',  visible:false },
                { title:'Technical Integration Guide',    cat:'tech',   catLabel:'Pro Services', img:'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80', visible:false },
                { title:'Brand Identity System',          cat:'design', catLabel:'Design',       img:'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',  visible:false },
                { title:'Print Layout — Trifold Brochure',cat:'design', catLabel:'Design',       img:'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=600&q=80', visible:false },
                { title:'Utah Landscape Photography',     cat:'design', catLabel:'Design',       img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', visible:false },
                { title:'Wedding Envelope Addressing',    cat:'calli',  catLabel:'Calligraphy',  img:'https://images.unsplash.com/photo-1606293926249-ed2e44282563?w=600&q=80', visible:false },
                { title:'Certificate Engrossing',         cat:'calli',  catLabel:'Calligraphy',  img:'https://images.unsplash.com/photo-1531416996070-ecc1ba64dd5e?w=600&q=80', visible:false },
                { title:'Custom Framed Quote Piece',      cat:'calli',  catLabel:'Calligraphy',  img:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80', visible:false },
            ],
        };
    },

    /* ── Computed ─────────────────────────────────────────────────────── */
    computed: {
        techGallery()   { return this.gallery.filter(i => i.cat === 'tech');   },
        designGallery() { return this.gallery.filter(i => i.cat === 'design'); },
        calliGallery()  { return this.gallery.filter(i => i.cat === 'calli');  },
    },

    /* ── Lifecycle ────────────────────────────────────────────────────── */
    mounted() {
        window.addEventListener('scroll',  this.onScroll,  { passive: true });
        window.addEventListener('keydown', this.onKeydown);
        this._initCanvas();
        this._animateCards();
        this._initObserver();
        (() => {
            const computeStickyOffset = () => {
                const navContainer = document.querySelector('nav .container');
                const servicesLink = document.querySelector('nav .nav-link[href="#services"]');
                const sticky = document.querySelector('.sticky-nav');

                if (!navContainer || !servicesLink || !sticky) {
                sticky && sticky.style.removeProperty('--sticky-offset');
                return;
                }

                const containerRect = navContainer.getBoundingClientRect();
                const linkRect = servicesLink.getBoundingClientRect();

                // left offset relative to container left
                const leftInContainer = Math.max(0, linkRect.left - containerRect.left);

                // set CSS var on body or sticky directly
                sticky.style.setProperty('--sticky-offset', `${leftInContainer}px`);
            };

            // compute once and on resize (and orientationchange)
            computeStickyOffset();
            window.addEventListener('resize', computeStickyOffset, { passive: true });
            window.addEventListener('orientationchange', computeStickyOffset, { passive: true });

            // Optional: rerun after fonts / images loaded
            window.addEventListener('load', computeStickyOffset);
        })();
    },

    beforeUnmount() {
        window.removeEventListener('scroll',  this.onScroll);
        window.removeEventListener('keydown', this.onKeydown);
        clearTimeout(this._slideTimer);
        if (this._raf)  cancelAnimationFrame(this._raf);
        if (this._obs)  this._obs.disconnect();
    },

    /* ── Methods ──────────────────────────────────────────────────────── */
    methods: {

        /* ── Scroll / nav ─────────────────────────────────────────── */
        onScroll() {
            this.isScrolled = window.scrollY > 50;
            this.showTop    = window.scrollY > window.innerHeight;
            const ids = ['hero','services','portfolio','about','platforms'];
            const pos = window.scrollY + 140;
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && pos >= el.offsetTop && pos < el.offsetTop + el.offsetHeight) {
                    this.activeSection = id; break;
                }
            }
        },

        scrollTo(id) {
            const el = document.getElementById(id);
            if (!el) return;
            window.scrollTo({
                top: el.getBoundingClientRect().top + window.scrollY - 70,
                behavior: 'smooth',
            });
        },

        scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); },

        /* ── Keyboard ─────────────────────────────────────────────── */
        onKeydown(e) {
            if (e.key === 'Escape' && this.isLightboxOpen) this.closeLightbox();
        },

        /* ══════════════════════════════════════════════════════════
         * CANVAS CAROUSEL
         *
         * Fixed-size canvas (1000×1000 internal px, CSS-scaled).
         * All transitions render inside the canvas — zero layout
         * impact, no jitter anywhere on the page.
         * ══════════════════════════════════════════════════════════ */
        _initCanvas() {
            const canvas = document.getElementById('hero-canvas');
            if (!canvas) return;

            // Set internal resolution; CSS width/height scale it visually
            canvas.width  = CANVAS_SIZE;
            canvas.height = CANVAS_SIZE;
            this._canvas  = canvas;
            this._ctx     = canvas.getContext('2d');
            this._curIdx  = 0;
            this._busy    = false;

            // Load all SVGs as Image objects
            let loaded = 0;
            this._imgs = this.heroLogos.map(src => {
                const img = new Image();
                img.onload  = () => { if (++loaded === this._imgs.length) this._onReady(); };
                img.onerror = () => { if (++loaded === this._imgs.length) this._onReady(); };
                img.src = src;
                return img;
            });
        },

        _onReady() {
            // Draw first logo immediately
            const ctx = this._ctx;
            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            if (this._imgs[0] && this._imgs[0].naturalWidth) {
                ctx.drawImage(this._imgs[0], 0, 0, CANVAS_SIZE, CANVAS_SIZE);
            }
            // Start the slide timer
            this._slideTimer = setTimeout(() => this._advance(), SLIDE_HOLD_MS);
        },

        _advance() {
            if (this._busy) return;
            const next   = (this._curIdx + 1) % this._imgs.length;
            const effect = this.heroEffects[next];   // entrance effect of destination
            this._runEffect(effect, this._imgs[this._curIdx], this._imgs[next], () => {
                this._curIdx  = next;
                this._busy    = false;
                this._slideTimer = setTimeout(() => this._advance(), SLIDE_HOLD_MS);
            });
        },

        _runEffect(name, from, to, done) {
            this._busy = true;
            const { _ctx: ctx } = this;
            const w = CANVAS_SIZE, h = CANVAS_SIZE;
            switch (name) {
                case 'transporter': this._fxTransporter(ctx, from, to, w, h, done); break;
                case 'mullany':     this._fxMullany    (ctx, from, to, w, h, done); break;
                case 'particles':   this._fxParticles  (ctx, from, to, w, h, done); break;
                case 'burn':        this._fxBurn       (ctx, from, to, w, h, done); break;
                default:            this._fxDissolve   (ctx, from, to, w, h, done); break;
            }
        },

        /* ── Effect 0 — Simple dissolve (fallback / loop-around) ─ */
        _fxDissolve(ctx, from, to, w, h, done) {
            const dur = 700, t0 = performance.now();
            const tick = now => {
                const t = Math.min((now - t0) / dur, 1);
                ctx.clearRect(0, 0, w, h);
                ctx.globalAlpha = 1 - t; ctx.drawImage(from, 0, 0, w, h);
                ctx.globalAlpha = t;     ctx.drawImage(to,   0, 0, w, h);
                ctx.globalAlpha = 1;
                this._raf = t < 1 ? requestAnimationFrame(tick) : (ctx.drawImage(to, 0, 0, w, h), done());
            };
            this._raf = requestAnimationFrame(tick);
        },

        /* ── Effect 1 — Star Trek Transporter ─────────────────── */
        // Vertical columns shimmer and dissolve staggered left-to-right,
        // with a cyan beam at the wavefront.
        _fxTransporter(ctx, from, to, w, h, done) {
            const COLS = 48;
            const colW = w / COLS;
            const dur  = 1400;
            const t0   = performance.now();
            // Each column starts its fade at a random offset within [0, 0.45]
            const offsets = Array.from({ length: COLS }, () => Math.random() * 0.45);

            const tick = now => {
                const t = Math.min((now - t0) / dur, 1);
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(to, 0, 0, w, h);     // "to" image as base layer

                for (let i = 0; i < COLS; i++) {
                    const cp = Math.max(0, Math.min(1, (t - offsets[i]) / 0.55));
                    if (cp >= 1) continue;

                    ctx.save();
                    ctx.beginPath(); ctx.rect(i * colW, 0, colW, h); ctx.clip();

                    // from-image column fades out
                    ctx.globalAlpha = 1 - cp;
                    ctx.drawImage(from, 0, 0, w, h);

                    // Cyan shimmer at the mid-point of each column's transition
                    if (cp > 0.05 && cp < 0.95) {
                        const glow = Math.sin(cp * Math.PI) * 0.75;
                        ctx.globalAlpha = glow;
                        ctx.fillStyle = 'rgba(140, 220, 255, 1)';
                        ctx.fillRect(i * colW, 0, colW, h);
                    }
                    ctx.restore();
                }

                ctx.globalAlpha = 1;
                if (t < 1) {
                    this._raf = requestAnimationFrame(tick);
                } else {
                    ctx.clearRect(0, 0, w, h);
                    ctx.drawImage(to, 0, 0, w, h);
                    done();
                }
            };
            this._raf = requestAnimationFrame(tick);
        },

        /* ── Effect 2 — Mullany randomised block dissolve ─────── */
        // Canvas is divided into N×N blocks. Each block flips at its own
        // random time, flashing gold at the transition point.
        _fxMullany(ctx, from, to, w, h, done) {
            const GRID  = 22;
            const bw    = w / GRID, bh = h / GRID;
            const dur   = 1200;
            const t0    = performance.now();
            // Each block flips at a random time in [0.02, 0.98]
            const thresh = Array.from({ length: GRID * GRID }, () => 0.02 + Math.random() * 0.96);

            const tick = now => {
                const t = Math.min((now - t0) / dur, 1);
                ctx.clearRect(0, 0, w, h);

                for (let r = 0; r < GRID; r++) {
                    for (let c = 0; c < GRID; c++) {
                        const idx = r * GRID + c;
                        const thr = thresh[idx];
                        const bx  = c * bw, by = r * bh;

                        ctx.save();
                        ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();

                        if (t < thr) {
                            ctx.drawImage(from, 0, 0, w, h);
                        } else if (t < thr + 0.055) {
                            // Brief gold flash
                            const ft = (t - thr) / 0.055;
                            ctx.drawImage(to, 0, 0, w, h);
                            ctx.globalAlpha = 1 - ft;
                            ctx.fillStyle = '#F8CC8A';
                            ctx.fillRect(bx, by, bw, bh);
                        } else {
                            ctx.drawImage(to, 0, 0, w, h);
                        }
                        ctx.restore();
                    }
                }

                ctx.globalAlpha = 1;
                if (t < 1) {
                    this._raf = requestAnimationFrame(tick);
                } else {
                    ctx.clearRect(0, 0, w, h);
                    ctx.drawImage(to, 0, 0, w, h);
                    done();
                }
            };
            this._raf = requestAnimationFrame(tick);
        },

        /* ── Effect 3 — Eru.js-style particle scatter ─────────── */
        // Coloured squares scatter outward from the image centre then
        // fade out while the new image fades in — no pixel sampling
        // so no tainted-canvas risk with SVGs served locally.
        _fxParticles(ctx, from, to, w, h, done) {
            const STEP = 14;
            const cx = w / 2, cy = h / 2;

            const particles = [];
            for (let y = 0; y < h; y += STEP) {
                for (let x = 0; x < w; x += STEP) {
                    const dx    = x - cx, dy = y - cy;
                    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.9;
                    const dist  = Math.sqrt(dx * dx + dy * dy);
                    const speed = 1.2 + Math.random() * 3.5 + dist * 0.0025;
                    const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
                    particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color, sz: STEP * (0.55 + Math.random() * 0.6) });
                }
            }

            const dur = 1100, t0 = performance.now();

            const tick = now => {
                const t = Math.min((now - t0) / dur, 1);
                ctx.clearRect(0, 0, w, h);

                // Phase A (t 0 → 0.6): from-image quickly fades; particles scatter outward
                if (t < 0.65) {
                    const pt = t / 0.65;
                    const e  = pt * pt;

                    // from-image fades out fast
                    ctx.globalAlpha = Math.max(0, 1 - pt * 2.2);
                    ctx.drawImage(from, 0, 0, w, h);
                    ctx.globalAlpha = 1;

                    // Scatter particles
                    const pAlpha = Math.max(0, 1 - e * 1.3);
                    for (const p of particles) {
                        const px = p.x + p.vx * e * 200;
                        const py = p.y + p.vy * e * 200;
                        const [r, g, b] = p.color;
                        ctx.fillStyle = `rgba(${r},${g},${b},${pAlpha * 0.7})`;
                        ctx.fillRect(px - p.sz / 2, py - p.sz / 2, p.sz, p.sz);
                    }
                }

                // Phase B (t 0.4 → 1): to-image fades in
                if (t > 0.38) {
                    const ft = Math.min((t - 0.38) / 0.62, 1);
                    ctx.globalAlpha = ft;
                    ctx.drawImage(to, 0, 0, w, h);
                }

                ctx.globalAlpha = 1;
                if (t < 1) {
                    this._raf = requestAnimationFrame(tick);
                } else {
                    ctx.clearRect(0, 0, w, h);
                    ctx.drawImage(to, 0, 0, w, h);
                    done();
                }
            };
            this._raf = requestAnimationFrame(tick);
        },

        /* ── Effect 4 — Burn from centre ──────────────────────── */
        // A radial clip expands outward from the centre, revealing the
        // new image. A fire-coloured gradient ring sits at the boundary.
        _fxBurn(ctx, from, to, w, h, done) {
            const cx   = w / 2, cy = h / 2;
            const maxR = Math.sqrt(cx * cx + cy * cy) * 1.06;
            const dur  = 1300, t0 = performance.now();

            const tick = now => {
                const t     = Math.min((now - t0) / dur, 1);
                const eased = t * t * (3 - 2 * t);   // smooth-step
                const r     = eased * maxR;

                ctx.clearRect(0, 0, w, h);

                // New image inside expanding disc
                if (r > 0) {
                    ctx.save();
                    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
                    ctx.drawImage(to, 0, 0, w, h);
                    ctx.restore();
                }

                // Old image outside the disc
                if (r < maxR) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(0, 0, w, h);
                    ctx.arc(cx, cy, r, 0, Math.PI * 2, true); // counter-clockwise = exclude disc
                    ctx.clip();
                    ctx.drawImage(from, 0, 0, w, h);
                    ctx.restore();
                }

                // Fire ring at the boundary
                if (r > 8 && r < maxR - 5) {
                    const ringW    = 38 + 22 * Math.sin(t * Math.PI);
                    const strength = Math.sin(t * Math.PI);
                    const g = ctx.createRadialGradient(cx, cy, Math.max(0, r - ringW * 0.85), cx, cy, r + ringW * 0.35);
                    g.addColorStop(0,   'rgba(255,100,0,0)');
                    g.addColorStop(0.3, `rgba(255,70,0,${0.65 * strength})`);
                    g.addColorStop(0.6, `rgba(255,210,0,${0.90 * strength})`);
                    g.addColorStop(0.8, `rgba(255,70,0,${0.55 * strength})`);
                    g.addColorStop(1,   'rgba(200,40,0,0)');
                    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.strokeStyle = g; ctx.lineWidth = ringW; ctx.stroke();
                }

                if (t < 1) {
                    this._raf = requestAnimationFrame(tick);
                } else {
                    ctx.clearRect(0, 0, w, h);
                    ctx.drawImage(to, 0, 0, w, h);
                    done();
                }
            };
            this._raf = requestAnimationFrame(tick);
        },

        /* ── Service cards ────────────────────────────────────── */
        toggleCard(service) { service.expanded = !service.expanded; },

        _animateCards() {
            const all = [
                ...this.services.infra,
                ...this.services.webops,
                ...this.services.design,
                ...this.services.calli,
            ];
            all.forEach((s, i) => setTimeout(() => { s.visible = true; }, 80 + i * 30));
        },

        /* ── Portfolio ────────────────────────────────────────── */
        _initObserver() {
            this._obs = new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
            }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

            setTimeout(() => {
                document.querySelectorAll('.gallery-card').forEach(el => this._obs.observe(el));
                this.gallery.forEach((g, i) => setTimeout(() => { g.visible = true; }, 60 + i * 55));
            }, 400);
        },

        openLightbox(img) {
            this.selectedImage  = img;
            this.isLightboxOpen = true;
            document.body.style.overflow = 'hidden';
            this.$nextTick(() => document.querySelector('.lightbox-close')?.focus());
        },

        closeLightbox() {
            this.isLightboxOpen = false;
            this.selectedImage  = null;
            document.body.style.overflow = '';
        },
    },

}).mount('#app');
