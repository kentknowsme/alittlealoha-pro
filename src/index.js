'use strict';

import { createApp } from 'vue';

/* ── Constants ──────────────────────────────────────────────────────────── */
const CANVAS_SIZE   = 1000;
const SLIDE_HOLD_MS = 5000;
// Inset every logo draw by this many px on each side so the content sits
// inside the inscribed circle and border-radius:50% clips nothing.
// Increase if the logo still clips; decrease if the logo looks too small.
const LOGO_PAD      = 40;

// Brand colours for effects that don't pixel-sample (avoids tainted-canvas
// issues when SVGs are cross-origin or served from file://).
const BRAND_COLORS = [
    [240, 176,  96],   // --gold
    [248, 204, 138],   // --gold-light
    [  0, 187,   0],   // --green-light
    [201, 106, 255],   // --violet
    [232, 240, 224],   // --text
];

/* ── TAG DESCRIPTIONS (centralised, non-reactive, O(1) lookup) ──────────── */
const TAG_DESCRIPTIONS = {
    // ── DDI / Infrastructure ─────────────────────────────────────────────
    'Infoblox':          'Centralised DDI management platform.',
    'BIND 9':            'Industry-standard DNS server software.',
    'QIP':               'IPAM solution for enterprise networks.',
    'IPv6':              'Next-gen internet protocol addressing.',
    'DDI Automation':    'Scripted management of DNS/DHCP.',
    'RHEL':              'Red Hat Enterprise Linux OS.',
    'CentOS':            'Community Enterprise Operating System.',
    'Solaris':           'Sun Microsystems Unix OS.',
    'SuSE':              'Linux distribution for enterprise.',
    'HP-UX':             'Hewlett Packard Unix OS.',
    'Visio':             'Microsoft diagramming tool.',
    'OmniGraffle':       'Mac diagramming tool.',
    'draw.io':           'Free online diagramming.',
    'Confluence':        'Atlassian wiki software.',
    'Jira':              'Project tracking software.',
    'Atlassian':         'Software suite vendor.',
    'Scrum':             'Agile framework.',
    'Wi-Fi':             'Wireless networking standard.',
    'Router':            'Network traffic director.',
    '802.11':            'Wireless LAN standard.',
    'Coverage':          'Signal range area.',
    'Security':          'Protection measures.',
    'Modem':             'Modulator-Demodulator device.',
    'ISP':               'Internet Service Provider.',
    'Port Forwarding':   'Routing external requests internally.',
    'QoS':               'Quality of Service prioritisation.',
    'Mesh':              'Multi-node wireless network.',
    'Eero':              'Mesh system brand.',
    'Orbi':              'Mesh system brand.',
    'Google WiFi':       'Mesh system brand.',
    'Node Placement':    'Strategic device positioning.',
    'Cat6':              'Ethernet cable standard.',
    'Cat5e':             'Ethernet cable standard.',
    'Ethernet':          'Wired networking.',
    'Wired':             'Physical cable connection.',
    'LAN':               'Local Area Network.',
    'Troubleshooting':   'Problem diagnosis.',
    'Diagnostics':       'System health checks.',
    'Connectivity':      'Network connection status.',
    'DNS':               'Domain Name System protocol.',
    'Speed':             'Data transfer rate.',
    'Firewall':          'Network security barrier.',
    'Guest Network':     'Isolated user network.',
    'Audit':             'Security review.',
    'Firmware':          'Device software.',
    'Xfinity':           'Comcast ISP.',
    'CenturyLink':       'Lumen ISP.',
    'Technical Support': 'Help desk assistance.',
    'Coordination':      'Scheduling and logistics.',
    'Documentation':     'Written records.',
    'Onboarding':        'New user setup.',
    'Markdown':          'Plain text formatting.',

    // ── Web / DevOps ──────────────────────────────────────────────────────
    'Perl':               'Scripting language.',
    'Bash':               'Shell scripting.',
    'ksh':                'Korn shell.',
    'zsh':                'Z shell.',
    'PowerShell':         'Microsoft scripting.',
    'Runbooks':           'Operational procedures.',
    'SOPs':               'Standard Operating Procedures.',
    'Guides':             'Instructional manuals.',
    'Docs-as-Code':       'Documentation workflow.',
    'Linux':              'Operating system kernel.',
    'Codementor':         'Mentoring platform.',
    'Node.js':            'JavaScript runtime.',
    'MySQL':              'Relational database.',
    'MongoDB':            'NoSQL database.',
    'Apache':             'Web server.',
    'PostgreSQL':         'Advanced relational DB.',
    'Google Cloud':       'Cloud provider.',
    'AWS':                'Amazon Web Services.',
    'Azure':              'Microsoft cloud.',
    'Camunda':            'Open-source BPM workflow engine.',
    'BPMN':               'Business Process Model.',
    'Integration':        'System connectivity.',
    'API Docs':           'Interface documentation.',

    // ── Design ────────────────────────────────────────────────────────────
    'Identity Design':     'Brand visual strategy.',
    'Illustrator':         'Vector graphics tool.',
    'Inkscape':            'Open-source vector tool.',
    'SVG':                 'Scalable Vector Graphics.',
    'Brand Guide':         'Style manual.',
    'Print-Ready':         'Production quality files.',
    'CMYK':                'Print colour model.',
    'InDesign':            'Page layout tool.',
    'Reports':             'Business documents.',
    'Proposals':           'Sales documents.',
    'LibreOffice':         'Office suite.',
    'Word':                'Word processor.',
    'PDF':                 'Portable Document Format.',
    'Posts':               'Social media updates.',
    'Banners':             'Header graphics.',
    'Covers':              'Profile headers.',
    'Photoshop':           'Raster editor.',
    'Canva':               'Design tool.',
    'Instagram':           'Social platform.',
    'LinkedIn':            'Professional network.',
    'PowerPoint':          'Microsoft presentation tool.',
    'Slides':              'Presentation slides.',
    'Decks':               'Pitch decks.',
    'Keynote':             'Apple presentation tool.',
    'LibreOffice Impress': 'Open-source presentation app.',
    'Google Slides':       'Web presentation tool.',
    'Lightroom':           'Adobe photo editing suite.',
    'Color Grading':       'Image colour adjustment.',
    'Compositing':         'Image layering.',
    'Photography':         'Image capture.',
    'Business':            'Corporate context.',
    'Events':              'Occasions.',
    'Editing':             'Image refinement.',
    'Illustration':        'Hand-drawn or digital artwork.',
    'Diagrams':            'Visual system representations.',
    'Hand-drawn':          'Manual creation.',
    'Digital':             'Computer generated.',
    'Custom Art':          'Unique artwork.',
    'WebP':                'Modern web image format.',
    'Figma':               'UI design tool.',
    'UI':                  'User Interface.',

    // ── Calligraphy ───────────────────────────────────────────────────────
    'Envelope Addressing': 'Handwritten mail.',
    'Copperplate':         'Classic script style.',
    'Italic':              'Angled script style.',
    'Modern':              'Contemporary style.',
    'Pointed Pen':         'Calligraphy tool.',
    'Engrossing':          'Formal writing.',
    'Certificates':        'Official awards.',
    'Awards':              'Recognition.',
    'Formal':              'Official tone.',
    'Place Cards':         'Seating markers.',
    'Menus':               'Food lists.',
    'Seating Charts':      'Guest arrangement.',
    'Event':               'Gathering.',
    'Quotes':              'Famous sayings.',
    'Framed':              'Wall art.',
    'Gift':                'Present.',
    'Scrivener':           'Professional writer.',
    'Legal':               'Law related.',
    'Holiday':             'Seasonal.',
    'Cards':               'Greetings.',
    'Seasonal':            'Time-specific.',
    'Personal':            'Individualised.',
};

/* ── App ────────────────────────────────────────────────────────────────── */
createApp({

    /* ── Data ─────────────────────────────────────────────────────────── */
    data() {
        return {
            isScrolled:    false,
            showTop:       false,
            activeSection: 'hero',
            year:          new Date().getFullYear(),

            /* Canvas carousel */
            heroLogos: [
                '/assets/img/a-little-aloha-clear-shadow.svg',
                '/assets/img/pro-with-a-little-aloha-clear-shadow.svg',
                '/assets/img/design-with-a-little-aloha-clear-shadow.svg',
                '/assets/img/calligraphy-with-a-little-aloha-clear-shadow.svg',
            ],
            // All four transitions use the unified swarm effect.
            // Swap any entry back to 'transporter' | 'mullany' | 'particles' | 'burn'
            // to restore an individual legacy effect for one slide.
            heroEffects: ['swarm', 'swarm', 'swarm', 'swarm'],

            /* Lightbox */
            selectedImage:  null,
            isLightboxOpen: false,

            /* ── Service cards ─────────────────────────────────────────── */
            // meta  = primary tag labels shown as prominent chips
            // tags  = secondary labels (merged with meta by _processServicesData)
            services: {
                infra: [
                    { title:'DDI Consulting & Audits',
                      meta:['Infoblox','BIND 9','QIP'],
                      tags:['IPv6','DDI Automation'],
                      icon:'fa-sitemap',
                      desc:'Enterprise DNS/DHCP/IPAM architecture, migration planning, implementation, and documentation using Infoblox, BIND 9, and QIP. Zone design, automation scripting, and comprehensive runbooks.',
                      expanded:false, visible:false },

                    { title:'Linux / Unix Administration',
                      meta:['RHEL','CentOS','Solaris'],
                      tags:['SuSE','HP-UX'],
                      icon:'fa-server',
                      desc:'System configuration, hardening, monitoring, and automation across RHEL, CentOS, SuSE, Solaris, and HP-UX. Network service deployment and long-term infrastructure support.',
                      expanded:false, visible:false },

                    { title:'Network Architecture Diagrams',
                      meta:['Visio','OmniGraffle','draw.io'],
                      tags:['Confluence'],
                      icon:'fa-share-alt',
                      desc:'DNS zone maps, DHCP scope layouts, IPAM hierarchy diagrams, and full network infrastructure visuals for engineering reviews, audits, and team onboarding.',
                      expanded:false, visible:false },

                    { title:'Wi-Fi Setup & Optimization',
                      meta:['Wi-Fi','Router','802.11'],
                      tags:['Coverage','Security'],
                      icon:'fa-wifi',
                      desc:'Full Wi-Fi assessment, router placement, channel optimisation, and configuration for reliable whole-home or office coverage. Includes password hardening and guest network isolation.',
                      expanded:false, visible:false },

                    { title:'Router & Modem Configuration',
                      meta:['Modem','Router','ISP'],
                      tags:['Port Forwarding','QoS'],
                      icon:'fa-exchange',
                      desc:'Modem and router installation, ISP configuration, port forwarding, QoS tuning, and firmware updates. Covers most major consumer and prosumer brands.',
                      expanded:false, visible:false },

                    { title:'Mesh Network Installation',
                      meta:['Mesh','Eero','Orbi'],
                      tags:['Google WiFi','Node Placement'],
                      icon:'fa-signal',
                      desc:'Design and installation of multi-node mesh systems for consistent whole-home or office coverage. Node placement, backhaul configuration, and performance validation included.',
                      expanded:false, visible:false },

                    { title:'Ethernet Cable Consulting',
                      meta:['Cat6','Cat5e','Ethernet'],
                      tags:['Wired','LAN'],
                      icon:'fa-plug',
                      desc:'On-site assessment and implementation of wired ethernet runs for desktops, smart TVs, gaming systems, and workstations. Cat5e/Cat6 runs up to 50 ft per visit.',
                      expanded:false, visible:false },

                    { title:'Network Troubleshooting',
                      meta:['Troubleshooting','Diagnostics','Connectivity'],
                      tags:['DNS','Speed'],
                      icon:'fa-stethoscope',
                      desc:'Systematic diagnosis of connectivity issues, slow speeds, dropped connections, and device conflicts. Covers ISP handoff, router configuration, and endpoint problems.',
                      expanded:false, visible:false },

                    { title:'Network Security Review',
                      meta:['Security','Firewall','Guest Network'],
                      tags:['Audit','Firmware'],
                      icon:'fa-shield',
                      desc:'Review of router security settings, default credential exposure, guest network isolation, firewall rules, and firmware currency. Written summary delivered after visit.',
                      expanded:false, visible:false },

                    { title:'ISP Liaison Support',
                      meta:['ISP','Xfinity','CenturyLink'],
                      tags:['Technical Support','Coordination'],
                      icon:'fa-phone',
                      desc:'On-site support during ISP visits or as your technical representative when navigating service issues, equipment upgrades, or speed complaints with your provider.',
                      expanded:false, visible:false },

                    { title:'IT Onboarding Documentation',
                      meta:['Documentation','Onboarding','Confluence'],
                      tags:['Markdown'],
                      icon:'fa-book',
                      desc:'Complete IT onboarding packages for small teams: system access guides, tool walkthroughs, credential management procedures, and first-week technical checklists.',
                      expanded:false, visible:false },
                ],

                webops: [
                    { title:'Scripting & Automation',
                      meta:['Perl','Bash','ksh'],
                      tags:['zsh','PowerShell'],
                      icon:'fa-terminal',
                      desc:'Automation tooling for sysadmin workflows, DNS record management, log parsing, data migration, and infrastructure integration across Unix and Windows environments.',
                      expanded:false, visible:false },

                    { title:'Confluence & Jira Configuration',
                      meta:['Confluence','Jira','Atlassian'],
                      tags:['Scrum'],
                      icon:'fa-tasks',
                      desc:'Full Confluence space buildout, page hierarchy design, and template creation. Jira project configuration, workflow customisation, and team onboarding documentation.',
                      expanded:false, visible:false },

                    { title:'Technical Writing',
                      meta:['Markdown','Docs-as-Code','Confluence'],
                      tags:['Visio'],
                      icon:'fa-file-text',
                      desc:'Process documentation, runbooks, integration guides, change procedures, and IT onboarding materials written clearly for operators, engineers, and executives.',
                      expanded:false, visible:false },

                    { title:'Remote Advisory Sessions',
                      meta:['DNS','Linux','Perl'],
                      tags:['Infoblox','Codementor'],
                      icon:'fa-headphones',
                      desc:'Live one-on-one advisory sessions for DNS troubleshooting, Linux system issues, Perl scripting questions, and infrastructure design reviews. Scheduled via video call.',
                      expanded:false, visible:false },

                    { title:'Application & DevOps Support',
                      meta:['Node.js','MySQL','MongoDB'],
                      tags:['Apache','PostgreSQL'],
                      icon:'fa-cogs',
                      desc:'Application server administration, deployment pipeline support, and database operations for Apache, Node.js, MySQL, PostgreSQL, and MongoDB environments.',
                      expanded:false, visible:false },

                    { title:'VM Server Build & Docs',
                      meta:['Google Cloud','AWS','Azure'],
                      tags:['CentOS','Apache'],
                      icon:'fa-cloud',
                      desc:'Virtual machine provisioning, configuration, and documentation in Google Cloud, AWS, Azure, and on-premises environments. Includes deployment runbooks and architecture records.',
                      expanded:false, visible:false },

                    { title:'BPM / Camunda Documentation',
                      meta:['Camunda','BPMN','Integration'],
                      tags:['API Docs'],
                      icon:'fa-random',
                      desc:'Integration guides, process maps, swimlane diagrams, API reference docs, and change management procedures for Camunda BPM platform migrations.',
                      expanded:false, visible:false },
                ],

                design: [
                    { title:'Logo & Brand Identity',
                      meta:['Illustrator','Inkscape','SVG'],
                      tags:['Brand Guide'],
                      icon:'fa-paint-brush',
                      desc:'Original logo design, brand colour palette, typography selection, and brand style guide. Delivered in vector formats suitable for web, print, and merchandise.',
                      expanded:false, visible:false },

                    { title:'Business Cards & Print Layout',
                      meta:['Print-Ready','CMYK','Illustrator'],
                      tags:['InDesign'],
                      icon:'fa-print',
                      desc:'Business card, flyer, brochure, and promotional material design. Print-ready files delivered in CMYK at correct resolution for professional printing.',
                      expanded:false, visible:false },

                    { title:'Document Design & Formatting',
                      meta:['LibreOffice','Word','InDesign'],
                      tags:['PDF'],
                      icon:'fa-file',
                      desc:'Professional design and formatting for reports, proposals, guides, and presentation documents. Transforms plain content into polished, branded deliverables.',
                      expanded:false, visible:false },

                    { title:'Social Media Graphics',
                      meta:['Photoshop','Canva','Instagram'],
                      tags:['LinkedIn'],
                      icon:'fa-picture-o',
                      desc:'On-brand graphics for Instagram, Facebook, LinkedIn, and X. Correctly sized for each platform — posts, stories, banners, and profile assets.',
                      expanded:false, visible:false },

                    { title:'Presentation Design',
                      meta:['PowerPoint','Keynote','LibreOffice Impress'],
                      tags:['Google Slides'],
                      icon:'fa-bar-chart',
                      desc:'Slide deck design for pitches, training, and conference talks. Custom templates, infographics, and clean layouts in your preferred format.',
                      expanded:false, visible:false },

                    { title:'Photo Editing & Retouching',
                      meta:['Photoshop','Lightroom','Color Grading'],
                      tags:['Compositing'],
                      icon:'fa-photo',
                      desc:'Professional photo retouching, colour correction, background removal, compositing, and image restoration using Adobe Photoshop and Lightroom.',
                      expanded:false, visible:false },

                    { title:'Site & Property Photography',
                      meta:['Photography','Business','Lightroom'],
                      tags:['Events','Editing'],
                      icon:'fa-camera',
                      desc:'On-site photography for small business locations, property listings, events, and website hero images. Edited and delivered in web-ready and print-ready formats. Enthusiast-level pricing.',
                      expanded:false, visible:false },

                    { title:'Custom Illustrations & Diagrams',
                      meta:['Illustration','Diagrams','Custom Art'],
                      tags:['Digital','Hand-drawn'],
                      icon:'fa-pencil-square-o',
                      desc:'Custom illustrations, technical diagrams, and conceptual drawings created digitally or by hand. Suitable for websites, presentations, and print materials.',
                      expanded:false, visible:false },

                    { title:'Web Graphics & UI Elements',
                      meta:['SVG','WebP','Figma'],
                      tags:['Illustrator'],
                      icon:'fa-object-group',
                      desc:'Custom web graphics, icon sets, hero banners, and UI elements designed for web delivery. Optimised for performance in SVG and WebP formats.',
                      expanded:false, visible:false },
                ],

                calli: [
                    { title:'Wedding & Event Invitations',
                      meta:['Copperplate','Italic','Modern'],
                      tags:['Pointed Pen'],
                      icon:'fa-envelope',
                      desc:'Hand-addressed envelopes and inner envelopes for weddings, formal events, and celebrations. Multiple script styles available — copperplate, italic, and modern calligraphy.',
                      expanded:false, visible:false },

                    { title:'Certificates & Diplomas',
                      meta:['Engrossing','Certificates','Awards'],
                      tags:['Formal'],
                      icon:'fa-certificate',
                      desc:'Official-quality calligraphy for certificates, diplomas, awards, and formal recognitions. Engrossed by hand with attention to alignment, spacing, and consistency.',
                      expanded:false, visible:false },

                    { title:'Place Cards & Menus',
                      meta:['Place Cards','Menus','Seating Charts'],
                      tags:['Event'],
                      icon:'fa-cutlery',
                      desc:'Handwritten place cards, table cards, menus, and seating charts for weddings, banquets, and formal dinners. Coordinated with your event palette and style.',
                      expanded:false, visible:false },

                    { title:'Custom Framed Lettering',
                      meta:['Custom Art','Quotes','Framed'],
                      tags:['Gift'],
                      icon:'fa-picture-o',
                      desc:'Original calligraphy art pieces featuring quotes, poems, names, and custom text. Suitable for framing and gifting. Available in multiple script styles and paper sizes.',
                      expanded:false, visible:false },

                    { title:'Scrivener & Legal Documents',
                      meta:['Scrivener','Legal','Formal'],
                      tags:['Engrossing'],
                      icon:'fa-pencil',
                      desc:'Handwritten engrossment for legal documents, formal correspondence, proclamations, and official records requiring traditional calligraphic presentation.',
                      expanded:false, visible:false },

                    { title:'Custom Holiday Cards',
                      meta:['Holiday','Cards','Seasonal'],
                      tags:['Personal'],
                      icon:'fa-gift',
                      desc:'Personalised holiday cards and seasonal correspondence hand-lettered with a unique, handcrafted feel. Individual cards or short runs for businesses and families.',
                      expanded:false, visible:false },
                ],
            },

            /* ── Portfolio Gallery ──────────────────────────────────────── */
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
        this._processServicesData();   // process tags once, on mount
        this._animateCards();
        this._initObserver();

        (() => {
            const computeStickyOffset = () => {
                const navContainer = document.querySelector('nav .container');
                const servicesLink = document.querySelector('nav .nav-link[href="#services"]');
                const sticky       = document.querySelector('.sticky-nav');

                if (!navContainer || !servicesLink || !sticky) {
                    sticky && sticky.style.removeProperty('--sticky-offset');
                    return;
                }

                const containerRect   = navContainer.getBoundingClientRect();
                const linkRect        = servicesLink.getBoundingClientRect();
                const leftInContainer = Math.max(0, linkRect.left - containerRect.left);
                sticky.style.setProperty('--sticky-offset', `${leftInContainer}px`);
            };

            computeStickyOffset();
            window.addEventListener('resize',            computeStickyOffset, { passive: true });
            window.addEventListener('orientationchange', computeStickyOffset, { passive: true });
            window.addEventListener('load',              computeStickyOffset);
        })();
    },

    beforeUnmount() {
        window.removeEventListener('scroll',  this.onScroll);
        window.removeEventListener('keydown', this.onKeydown);
        clearTimeout(this._slideTimer);
        if (this._raf) cancelAnimationFrame(this._raf);
        if (this._obs) this._obs.disconnect();
    },

    /* ── Methods ──────────────────────────────────────────────────────── */
    methods: {

        /* ── Padded drawImage helper ──────────────────────────────────── */
        // Every logo is drawn inset by LOGO_PAD px on all four sides so
        // the content fits inside the border-radius:50% circle.
        _di(ctx, img, w, h) {
            ctx.drawImage(img, LOGO_PAD, LOGO_PAD, w - LOGO_PAD * 2, h - LOGO_PAD * 2);
        },
        _processServicesData() {
            const processList = (list) => list.map(item => {
                const allLabels = [...new Set([...(item.meta || []), ...(item.tags || [])])];
                const allTags   = allLabels.map(label => ({
                    label,
                    shortDesc: TAG_DESCRIPTIONS[label] || `Details about ${label}.`,
                }));
                return { ...item, allTags };
            });

            this.services.infra  = processList(this.services.infra);
            this.services.webops = processList(this.services.webops);
            this.services.design = processList(this.services.design);
            this.services.calli  = processList(this.services.calli);
        },

        /* ── Card toggle ──────────────────────────────────────────────── */
        toggleCard(service) { service.expanded = !service.expanded; },

        /* ── Scroll / nav ─────────────────────────────────────────────── */
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
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
        },

        scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); },

        /* ── Keyboard ─────────────────────────────────────────────────── */
        onKeydown(e) {
            if (e.key === 'Escape' && this.isLightboxOpen) this.closeLightbox();
        },

        /* ══════════════════════════════════════════════════════════════
         * CANVAS CAROUSEL
         * Fixed-size 1000×1000 px canvas, CSS-scaled for display.
         * All transitions render inside the canvas — zero layout impact.
         * ══════════════════════════════════════════════════════════════ */
        _initCanvas() {
            const canvas = document.getElementById('hero-canvas');
            if (!canvas) return;

            canvas.width  = CANVAS_SIZE;
            canvas.height = CANVAS_SIZE;
            this._canvas  = canvas;
            this._ctx     = canvas.getContext('2d');
            this._curIdx  = 0;
            this._busy    = false;
            this._slideTimer = null;

            let loaded = 0;
            const total = this.heroLogos.length;

            this._imgs = this.heroLogos.map(src => {
                const img   = new Image();
                img.onload  = () => { if (++loaded === total) this._onReady(); };
                img.onerror = () => {
                    console.error(`Failed to load logo: ${src}`);
                    if (++loaded === total) this._onReady();
                };
                img.src = src;
                return img;
            });
        },

        _onReady() {
            const ctx = this._ctx;
            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            if (this._imgs[0] && this._imgs[0].naturalWidth) {
                this._di(ctx, this._imgs[0], CANVAS_SIZE, CANVAS_SIZE);
            }
            this._startCycle();
        },

        _startCycle() {
            if (this._slideTimer) clearTimeout(this._slideTimer);
            this._slideTimer = setTimeout(() => this._advance(), SLIDE_HOLD_MS);
        },

        _advance() {
            if (this._busy) {
                // Effect still running — retry in 100 ms rather than dropping the frame.
                this._slideTimer = setTimeout(() => this._advance(), 100);
                return;
            }
            const nextIdx    = (this._curIdx + 1) % this._imgs.length;
            const effectName = this.heroEffects[nextIdx];

            this._runEffect(effectName, this._imgs[this._curIdx], this._imgs[nextIdx], () => {
                this._curIdx = nextIdx;
                this._busy   = false;
                this._startCycle();
            });
        },

        _runEffect(name, from, to, done) {
            this._busy = true;
            const { _ctx: ctx } = this;
            const w = CANVAS_SIZE, h = CANVAS_SIZE;

            // Dynamic safety check — falls back to dissolve for unknown names.
            if (!this[`_fx${name.charAt(0).toUpperCase() + name.slice(1)}`]) {
                console.warn(`Effect "${name}" not found — falling back to dissolve.`);
                this._fxDissolve(ctx, from, to, w, h, done);
                return;
            }

            switch (name) {
                case 'swarm':       this._fxSwarm      (ctx, from, to, w, h, done); break;
                case 'transporter': this._fxTransporter(ctx, from, to, w, h, done); break;
                case 'mullany':     this._fxMullany    (ctx, from, to, w, h, done); break;
                case 'particles':   this._fxParticles  (ctx, from, to, w, h, done); break;
                case 'burn':        this._fxBurn       (ctx, from, to, w, h, done); break;
                default:            this._fxDissolve   (ctx, from, to, w, h, done); break;
            }
        },

        /* ── Effect 0 — Simple dissolve (fallback) ────────────────────── */
        _fxDissolve(ctx, from, to, w, h, done) {
            const dur = 700, t0 = performance.now();
            const tick = now => {
                const t = Math.min((now - t0) / dur, 1);
                ctx.clearRect(0, 0, w, h);
                ctx.globalAlpha = 1 - t; this._di(ctx, from, w, h);
                ctx.globalAlpha = t;     this._di(ctx, to,   w, h);
                ctx.globalAlpha = 1;
                this._raf = t < 1 ? requestAnimationFrame(tick) : (this._di(ctx, to, w, h), done());
            };
            this._raf = requestAnimationFrame(tick);
        },

        /* ── Effect 1 — Star Trek Transporter ────────────────────────── */
        // Vertical columns shimmer and dissolve staggered left-to-right
        // with a cyan beam at the wavefront.
        _fxTransporter(ctx, from, to, w, h, done) {
            const COLS    = 48;
            const colW    = w / COLS;
            const dur     = 1400;
            const t0      = performance.now();
            const offsets = Array.from({ length: COLS }, () => Math.random() * 0.45);

            const tick = now => {
                const t = Math.min((now - t0) / dur, 1);
                ctx.clearRect(0, 0, w, h);
                this._di(ctx, to, w, h);

                for (let i = 0; i < COLS; i++) {
                    const cp = Math.max(0, Math.min(1, (t - offsets[i]) / 0.55));
                    if (cp >= 1) continue;

                    ctx.save();
                    ctx.beginPath(); ctx.rect(i * colW, 0, colW, h); ctx.clip();
                    ctx.globalAlpha = 1 - cp;
                    this._di(ctx, from, w, h);

                    if (cp > 0.05 && cp < 0.95) {
                        const glow = Math.sin(cp * Math.PI) * 0.75;
                        ctx.globalAlpha = glow;
                        ctx.fillStyle = 'rgba(140,220,255,1)';
                        ctx.fillRect(i * colW, 0, colW, h);
                    }
                    ctx.restore();
                }

                ctx.globalAlpha = 1;
                if (t < 1) {
                    this._raf = requestAnimationFrame(tick);
                } else {
                    ctx.clearRect(0, 0, w, h);
                    this._di(ctx, to, w, h);
                    done();
                }
            };
            this._raf = requestAnimationFrame(tick);
        },

        /* ── Effect 2 — Mullany randomised block dissolve ────────────── */
        // Canvas divided into N×N blocks; each flips at its own random time
        // with a brief gold flash at the transition point.
        _fxMullany(ctx, from, to, w, h, done) {
            const GRID   = 22;
            const bw     = w / GRID, bh = h / GRID;
            const dur    = 1200;
            const t0     = performance.now();
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
                            this._di(ctx, from, w, h);
                        } else if (t < thr + 0.055) {
                            const ft = (t - thr) / 0.055;
                            this._di(ctx, to, w, h);
                            ctx.globalAlpha = 1 - ft;
                            ctx.fillStyle = '#F8CC8A';
                            ctx.fillRect(bx, by, bw, bh);
                        } else {
                            this._di(ctx, to, w, h);
                        }
                        ctx.restore();
                    }
                }

                ctx.globalAlpha = 1;
                if (t < 1) {
                    this._raf = requestAnimationFrame(tick);
                } else {
                    ctx.clearRect(0, 0, w, h);
                    this._di(ctx, to, w, h);
                    done();
                }
            };
            this._raf = requestAnimationFrame(tick);
        },

        /* ── Effect 3 — Eru.js-style particle scatter ────────────────── */
        // Coloured squares scatter outward from the image centre then fade
        // while the new image fades in.  Uses BRAND_COLORS to avoid
        // tainted-canvas issues with cross-origin SVGs.
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

                if (t < 0.65) {
                    const pt = t / 0.65;
                    const e  = pt * pt;
                    ctx.globalAlpha = Math.max(0, 1 - pt * 2.2);
                    this._di(ctx, from, w, h);
                    ctx.globalAlpha = 1;

                    const pAlpha = Math.max(0, 1 - e * 1.3);
                    for (const p of particles) {
                        const px = p.x + p.vx * e * 200;
                        const py = p.y + p.vy * e * 200;
                        const [r, g, b] = p.color;
                        ctx.fillStyle = `rgba(${r},${g},${b},${pAlpha * 0.7})`;
                        ctx.fillRect(px - p.sz / 2, py - p.sz / 2, p.sz, p.sz);
                    }
                }

                if (t > 0.38) {
                    const ft = Math.min((t - 0.38) / 0.62, 1);
                    ctx.globalAlpha = ft;
                    this._di(ctx, to, w, h);
                }

                ctx.globalAlpha = 1;
                if (t < 1) {
                    this._raf = requestAnimationFrame(tick);
                } else {
                    ctx.clearRect(0, 0, w, h);
                    this._di(ctx, to, w, h);
                    done();
                }
            };
            this._raf = requestAnimationFrame(tick);
        },

        /* ── Effect 4 — Burn from centre ─────────────────────────────── */
        // A radial clip expands outward from the centre revealing the new
        // image.  A fire-coloured gradient ring sits at the boundary.
        _fxBurn(ctx, from, to, w, h, done) {
            const cx   = w / 2, cy = h / 2;
            const maxR = Math.sqrt(cx * cx + cy * cy) * 1.06;
            const dur  = 1300, t0 = performance.now();

            const tick = now => {
                const t     = Math.min((now - t0) / dur, 1);
                const eased = t * t * (3 - 2 * t);
                const r     = eased * maxR;

                ctx.clearRect(0, 0, w, h);

                if (r > 0) {
                    ctx.save();
                    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
                    this._di(ctx, to, w, h);
                    ctx.restore();
                }

                if (r < maxR) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(0, 0, w, h);
                    ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
                    ctx.clip();
                    this._di(ctx, from, w, h);
                    ctx.restore();
                }

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
                    this._di(ctx, to, w, h);
                    done();
                }
            };
            this._raf = requestAnimationFrame(tick);
        },

        /* ── Effect 5 — Particle Swarm (outward explosion / inward convergence) ── */
        //
        // EXIT  (t = 0.00 → 0.58) — current logo pixels scatter outward from
        //   the canvas centre; they fade as they fly.
        //
        // ENTER (t = 0.42 → 1.00) — new logo pixels start scattered outside the
        //   canvas and swarm inward to converge on their target positions.
        //
        // The two phases overlap (0.42–0.58) so the transition is continuous.
        //
        // Pixel sampling honours alpha, so particles are automatically confined
        // to the non-transparent circular logo area (no extra clipping needed).
        // Falls back to BRAND_COLORS if the canvas is tainted.
        //
        // Density knob — change STEP (px between particle centres):
        //   10 → ~3 000 particles/phase  (richest)
        //   14 → ~1 500 particles/phase  (balanced)
        //   18 → ~900  particles/phase   (fastest) ← current
        _fxSwarm(ctx, from, to, w, h, done) {
            const STEP = 18;    // particle grid pitch in px
            const DUR  = 2400;  // total animation duration in ms

            /* ── pixel sampling ─────────────────────────────────────── */
            const sampleImg = (img) => {
                const off = document.createElement('canvas');
                off.width = w;  off.height = h;
                const c = off.getContext('2d');
                // Draw with the same padding used for display so particle
                // positions align with the visible logo.
                c.drawImage(img, LOGO_PAD, LOGO_PAD, w - LOGO_PAD * 2, h - LOGO_PAD * 2);
                try { return c.getImageData(0, 0, w, h).data; }
                catch (_) { return null; }   // tainted canvas — use brand colours
            };

            const fromData = sampleImg(from);
            const toData   = sampleImg(to);

            /* ── helpers ────────────────────────────────────────────── */
            const ss = (t) => (t <= 0) ? 0 : (t >= 1) ? 1 : t * t * (3 - 2 * t);

            const brandPfx = () => {
                const [r, g, b] = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
                return `rgba(${r},${g},${b}`;
            };

            const colorPfx = (data, idx) =>
                data ? `rgba(${data[idx]},${data[idx + 1]},${data[idx + 2]}` : brandPfx();

            /* ── build particle lists ───────────────────────────────── */
            const cx = w / 2, cy = h / 2;
            const exitParts  = [];
            const enterParts = [];

            for (let py = 0; py < h; py += STEP) {
                for (let px = 0; px < w; px += STEP) {
                    const idx = (py * w + px) * 4;

                    // EXIT particle — only where source logo is opaque
                    const ea = fromData ? fromData[idx + 3] : 255;
                    if (ea > 20) {
                        const ec    = colorPfx(fromData, idx);
                        const dx    = px - cx, dy = py - cy;
                        const dist  = Math.sqrt(dx * dx + dy * dy) || 1;
                        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.7;
                        const delay = (dist / (w * 0.71)) * 0.22 + Math.random() * 0.06;
                        const speed = 1.4 + Math.random() * 2.8 + dist * 0.0018;
                        exitParts.push({
                            x: px, y: py,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            delay,
                            color: ec,
                            sz: STEP * (0.5 + Math.random() * 0.5),
                        });
                    }

                    // ENTER particle — only where destination logo is opaque
                    const na = toData ? toData[idx + 3] : 255;
                    if (na > 20) {
                        const nc      = colorPfx(toData, idx);
                        const dx      = px - cx, dy = py - cy;
                        const dist    = Math.sqrt(dx * dx + dy * dy) || 1;
                        const scatter = 0.35 + Math.random() * 0.45;
                        const sx = px + (dx / dist) * w * scatter + (Math.random() - 0.5) * 80;
                        const sy = py + (dy / dist) * h * scatter + (Math.random() - 0.5) * 80;
                        const delay = (dist / (w * 0.71)) * 0.22 + Math.random() * 0.06;
                        enterParts.push({
                            sx, sy, tx: px, ty: py,
                            delay,
                            color: nc,
                            sz: STEP * (0.5 + Math.random() * 0.5),
                        });
                    }
                }
            }

            /* ── animation loop ─────────────────────────────────────── */
            const t0 = performance.now();

            const tick = (now) => {
                const t = Math.min((now - t0) / DUR, 1);
                ctx.clearRect(0, 0, w, h);

                // EXIT phase (0 → 58 %)
                if (t < 0.58) {
                    const phase = t / 0.58;
                    const imgA  = Math.max(0, 1 - phase * 3.5);
                    if (imgA > 0) {
                        ctx.globalAlpha = imgA;
                        this._di(ctx, from, w, h);
                        ctx.globalAlpha = 1;
                    }
                    for (const p of exitParts) {
                        const raw = (phase - p.delay) / (1 - p.delay);
                        if (raw <= 0) continue;
                        const e = ss(Math.min(1, raw));
                        const x = p.x + p.vx * e * 200;
                        const y = p.y + p.vy * e * 200;
                        const a = Math.max(0, 1 - e * 1.6);
                        if (a <= 0) continue;
                        ctx.fillStyle = `${p.color},${a})`;
                        ctx.fillRect(x - p.sz / 2, y - p.sz / 2, p.sz, p.sz);
                    }
                }

                // ENTER phase (42 → 100 %)
                if (t >= 0.42) {
                    const phase = (t - 0.42) / 0.58;
                    for (const p of enterParts) {
                        const raw = (phase - p.delay) / (1 - p.delay);
                        if (raw <= 0) continue;
                        const e = ss(Math.min(1, raw));
                        const x = p.sx + (p.tx - p.sx) * e;
                        const y = p.sy + (p.ty - p.sy) * e;
                        const a = Math.min(1, raw * 2.5);
                        if (a <= 0) continue;
                        ctx.fillStyle = `${p.color},${a})`;
                        ctx.fillRect(x - p.sz / 2, y - p.sz / 2, p.sz, p.sz);
                    }
                    // Final image fades in over the last quarter of the enter phase.
                    if (phase > 0.72) {
                        ctx.globalAlpha = ss((phase - 0.72) / 0.28);
                        this._di(ctx, to, w, h);
                        ctx.globalAlpha = 1;
                    }
                }

                if (t < 1) {
                    this._raf = requestAnimationFrame(tick);
                } else {
                    ctx.clearRect(0, 0, w, h);
                    this._di(ctx, to, w, h);
                    done();
                }
            };

            this._raf = requestAnimationFrame(tick);
        },

        /* ── Service card animation ───────────────────────────────────── */
        _animateCards() {
            const all = [
                ...this.services.infra,
                ...this.services.webops,
                ...this.services.design,
                ...this.services.calli,
            ];
            all.forEach((s, i) => setTimeout(() => { s.visible = true; }, 80 + i * 30));
        },

        /* ── Portfolio / gallery ──────────────────────────────────────── */
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