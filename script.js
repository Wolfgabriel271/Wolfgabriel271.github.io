/* =========================================
   JAZEN GABRIEL — PORTFOLIO
   JavaScript — Elden Ring Theme Edition

   Sections:
    1.  Theme Toggle Logic
    2.  Hamburger Menu Logic
    3.  Mouse Tracking
    4.  Typewriter
    5.  Dynamic Particle System (full 10-color palette)
    6.  Counter Animation
    7.  Skill Bars
    8.  Scroll Reveal
    9.  Nav On Scroll
    10. Profile Tint
    11. Project Modal Logic
    12. Certifications Gallery Logic
    13. Lenis Buttery Smooth Scrolling
    14. Scroll-To-Top Button (injected, no HTML edits needed)
    15. Contact Form Validation + Success Toast
    16. Profile Image Cursor Tilt (About page)
    17. "Lost Grace" Easter Egg
    18. Theme-Toggle Visual Pulse
    19. Image Fade-In On Load (project/cert/profile photos)
    20. Certifications Gallery Keyboard Nav + Live Region
    21. (merged into 11 — modal Escape / focus return / focus trap)
    22. Copy-To-Clipboard On Contact Details
    23. Keyboard Shortcuts
    24. Social Icon Accessible Names

   Performance & accessibility notes:
    - Every animation loop is paused while the
      tab is hidden (Page Visibility API).
    - `prefers-reduced-motion` is checked once
      and respected by the particle system,
      the moon parallax, and Lenis smooth scroll.
    - All hot-path work (particles, parallax)
      reads/writes typed arrays and only ever
      touches transform/opacity in the DOM, to
      stay off the main-thread layout path.
========================================= */
'use strict';

// Respect the OS-level reduced-motion preference everywhere below.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Tracks tab visibility so animation loops can pause instead of
// burning CPU/battery in a background tab.
let isPageVisible = !document.hidden;
document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
}, { passive: true });

// =========================================
// 1. THEME TOGGLE LOGIC
// =========================================
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;
const rootElement = document.documentElement;

function syncThemeButton() {
    const isDark = rootElement.classList.contains('dark-mode');
    if (themeIcon) {
        themeIcon.classList.toggle('fa-sun', isDark);
        themeIcon.classList.toggle('fa-moon', !isDark);
    }
    if (themeBtn) {
        themeBtn.setAttribute('aria-pressed', String(isDark));
        themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        themeBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

// Match the saved theme on every page, including when storage is unavailable.
try {
    rootElement.classList.toggle('dark-mode', localStorage.getItem('portfolio-theme') !== 'light');
} catch (e) {
    rootElement.classList.add('dark-mode');
}
syncThemeButton();

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isDark = !rootElement.classList.contains('dark-mode');
        rootElement.classList.toggle('dark-mode', isDark);
        try { localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light'); } catch (e) { /* Theme still switches for this page. */ }
        syncThemeButton();
        // Brief glow pulse on every theme switch.
        if (typeof triggerThemePulse === 'function') triggerThemePulse();
    });
}

// =========================================
// 2. HAMBURGER MENU LOGIC
// =========================================
const hamburgerBtn   = document.getElementById('hamburger-btn');
const navLinks       = document.querySelector('.nav-links');
const menuOverlay    = document.getElementById('mobile-menu-overlay');

// Shared by the mobile menu and the project modal. Lenis keeps scrolling
// the page under `body { overflow: hidden }`, so it has to be stopped too.
function setScrollLocked(locked) {
    document.body.style.overflow = locked ? 'hidden' : '';
    if (window.__lenis) { locked ? window.__lenis.stop() : window.__lenis.start(); }
}

function openMobileMenu() {
    if (!hamburgerBtn || !navLinks || !menuOverlay) return;
    hamburgerBtn.classList.add('open');
    navLinks.classList.add('open');
    menuOverlay.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    setScrollLocked(true);
}

function closeMobileMenu() {
    // No-op when already closed, so Escape / link clicks can't unlock scroll under an open modal.
    if (!hamburgerBtn || !navLinks || !menuOverlay || !navLinks.classList.contains('open')) return;
    hamburgerBtn.classList.remove('open');
    navLinks.classList.remove('open');
    menuOverlay.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    setScrollLocked(false);
}

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('open');
        isOpen ? closeMobileMenu() : openMobileMenu();
    });
}

if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMobileMenu);
}

// Close menu when a nav link is tapped
if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
});

// =========================================
// 3. MOUSE TRACKING
// =========================================
let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
}, { passive: true });

// =========================================
// 4. TYPEWRITER 
// =========================================
const typingEl = document.querySelector('.typewriter-text');
if (typingEl) {
    const phrases = [
        'Aspiring Senior Software Engineer',
        'Software Engineer',
        'Full-Stack Developer',
        'Backend Software Engineer',
        'Frontend Developer',
        'Application Software Developer',
        'Software Development Engineer',
        'API Developer',
        'Cloud Software Engineer',
        'DevOps Engineer'
    ];
    let pIdx = 0, cIdx = 0, del = false;

    if (prefersReducedMotion) { typingEl.textContent = phrases[0]; } else (function step() {
        const p = phrases[pIdx];
        typingEl.textContent = del ? p.slice(0, cIdx - 1) : p.slice(0, cIdx + 1);
        del ? cIdx-- : cIdx++;
        let delay = del ? 30 : 85;
        if (!del && cIdx === p.length)  { delay = 2200; del = true; }
        else if (del && cIdx === 0)     { del = false; pIdx = (pIdx + 1) % phrases.length; delay = 360; }
        setTimeout(step, delay);
    })();
}

// =========================================
// 5. DYNAMIC PARTICLE SYSTEM
//    Drifting "rune dust" embers + a faint
//    twinkling starfield, both drawing from
//    the full 10-color Elden Ring palette:
//    gold/amber motes (Erdtree), occasional
//    scarlet-rot motes (corruption), and
//    moonlight/iron star sparkles overhead.
// =========================================
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    canvas.style.willChange = 'transform';

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    // Reduce particle count on mobile for better performance
    const isMobile = W < 768;
    const mobileParticleFactor = isMobile ? 0.5 : 1;
    // Reduced-motion visitors get a tiny, mostly-static field rather
    // than zero particles, so the canvas still reads as intentional.
    const motionFactor = prefersReducedMotion ? 0.15 : 1;
    const S     = Math.max(4, Math.floor(Math.min(90, Math.floor(W * H / 12000) * mobileParticleFactor) * motionFactor));
    const sx    = new Float32Array(S), sy   = new Float32Array(S);
    const sbx   = new Float32Array(S), sby  = new Float32Array(S);
    const ssize = new Float32Array(S), sop  = new Float32Array(S);
    const stws  = new Float32Array(S), stwo = new Float32Array(S);
    const sden  = new Float32Array(S);
    // Color category per particle: 0 = gold (main), 1 = amber (dim),
    // 2 = scarlet rot (rare "corruption" mote, ~8% of particles).
    const scat  = new Uint8Array(S);

    for (let i = 0; i < S; i++) {
        sx[i]  = sbx[i] = Math.random() * W;
        sy[i]  = sby[i] = Math.random() * H;
        ssize[i] = Math.random() * 1.2 + 0.25;
        sop[i]   = Math.random() * 0.35 + 0.05;
        stws[i]  = Math.random() * 0.01 + 0.003;
        stwo[i]  = Math.random() * 6.28;
        sden[i]  = Math.random() * 12 + 2;
        const roll = Math.random();
        scat[i]  = roll > 0.92 ? 2 : (roll > 0.7 ? 1 : 0);
    }

    // Reduce emitter count on mobile / reduced-motion for better performance
    const E     = Math.max(2, Math.floor((isMobile ? 5 : 10) * motionFactor));
    const ex    = new Float32Array(E), ey    = new Float32Array(E);
    const evx   = new Float32Array(E), evy   = new Float32Array(E);
    const elife = new Float32Array(E), edec  = new Float32Array(E);
    const esize = new Float32Array(E);
    const ecat  = new Uint8Array(E); // 0 = parchment dust, 1 = scarlet rot mote

    function resetE(i) {
        ex[i]    = Math.random() * W;
        ey[i]    = H + 8;
        evx[i]   = (Math.random() - 0.5) * 0.8;
        evy[i]   = -(Math.random() * 0.8 + 0.25);
        elife[i] = Math.random() * 0.4 + 0.4;
        edec[i]  = Math.random() * 0.002 + 0.0005;
        esize[i] = Math.random() * 1.4 + 0.5;
        ecat[i]  = Math.random() > 0.85 ? 1 : 0;
    }
    for (let i = 0; i < E; i++) { resetE(i); ey[i] = Math.random() * H; }

    // Faint twinkling starfield — only drawn in dark mode, in the
    // upper portion of the viewport, using moonlight/iron tones.
    const starCount = prefersReducedMotion ? 0 : (isMobile ? 18 : 36);
    const stx = new Float32Array(starCount), sty = new Float32Array(starCount);
    const stsize = new Float32Array(starCount), stspeed = new Float32Array(starCount), stphase = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
        stx[i] = Math.random() * W;
        sty[i] = Math.random() * H * 0.45; // upper-sky band only
        stsize[i] = Math.random() * 1.1 + 0.3;
        stspeed[i] = Math.random() * 0.02 + 0.006;
        stphase[i] = Math.random() * 6.28;
    }

    const bloodMoon = document.querySelector('.blood-moon');
    const moonGlow  = document.querySelector('.moon-glow');
    let moonX = 0, moonY = 0;

    /**
     * Returns the correct ember palette for the active theme.
     * Light mode previously reused the same bright gold as dark
     * mode, which had poor contrast against the pale parchment
     * background — this branch fixes that by leaning on the
     * deeper Rune Amber / Iron Armor tones in daylight instead.
     */
    function getParticleColors() {
        const isDark = document.documentElement.classList.contains('dark-mode');
        return isDark
            ? { main: '#D4A017', dim: '#7A6A30', rot: '#C2607A', dust: '#C9870A' }
            : { main: '#B8860B', dim: '#9AA0AA', rot: '#8B1A1A', dust: '#7A6A40' };
    }

    let rafId = null;

    function animate(ts) {
        ctx.clearRect(0, 0, W, H);
        const pColors = getParticleColors();
        const isDark = document.documentElement.classList.contains('dark-mode');

        // Starfield (dark mode only)
        if (isDark && starCount) {
            ctx.fillStyle = '#6A8FAF';
            for (let i = 0; i < starCount; i++) {
                const twinkle = Math.sin(ts * stspeed[i] + stphase[i]) * 0.5 + 0.5;
                ctx.globalAlpha = twinkle * 0.45;
                ctx.beginPath();
                ctx.arc(stx[i], sty[i], stsize[i], 0, 6.2832);
                ctx.fill();
            }
        }

        for (let i = 0; i < S; i++) {
            const tw = Math.sin(ts * stws[i] + stwo[i]) * 0.2 + 0.8;
            const dx = mouseX - sx[i], dy = mouseY - sy[i];
            const d2 = dx * dx + dy * dy;
            if (d2 < 10000 && d2 > 0.0001) {
                const d = Math.sqrt(d2);
                const f = (100 - d) / 100;
                sx[i] -= dx / d * f * sden[i] * 0.3;
                sy[i] -= dy / d * f * sden[i] * 0.3;
            } else {
                sx[i] += (sbx[i] - sx[i]) * 0.04;
                sy[i] += (sby[i] - sy[i]) * 0.04;
            }
            ctx.globalAlpha = sop[i] * tw;
            ctx.fillStyle   = scat[i] === 2 ? pColors.rot : (scat[i] === 1 ? pColors.dim : pColors.main);
            ctx.beginPath();
            ctx.arc(sx[i], sy[i], ssize[i], 0, 6.2832);
            ctx.fill();
        }

        for (let i = 0; i < E; i++) {
            ex[i]    += evx[i] + Math.sin(ts * 0.001 + i) * 0.15;
            ey[i]    += evy[i];
            elife[i] -= edec[i];
            if (elife[i] <= 0 || ey[i] < -15) { resetE(i); continue; }
            ctx.globalAlpha = elife[i] * 0.5;
            ctx.fillStyle = ecat[i] === 1 ? pColors.rot : pColors.dust;
            ctx.beginPath();
            ctx.arc(ex[i], ey[i], esize[i], 0, 6.2832);
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        if (bloodMoon && !prefersReducedMotion) {
            const tx = (mouseX / W - 0.5) * 14;
            const ty = (mouseY / H - 0.5) * 8;
            moonX += (tx - moonX) * 0.03;
            moonY += (ty - moonY) * 0.03;
            bloodMoon.style.transform = `translate3d(${moonX}px,${moonY}px, 0)`;
            if (moonGlow) moonGlow.style.transform = `translate3d(${moonX * 0.5}px,${moonY * 0.5}px, 0)`;
        }

        // Pause the loop entirely while the tab is hidden; resume
        // automatically once it becomes visible again (see the
        // Page Visibility listener near the top of this file).
        if (isPageVisible) {
            rafId = requestAnimationFrame(animate);
        } else {
            rafId = null;
        }
    }

    rafId = requestAnimationFrame(animate);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && rafId === null) {
            rafId = requestAnimationFrame(animate);
        }
    }, { passive: true });

    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            for (let i = 0; i < S; i++) {
                if (sx[i] > W) { sx[i] = sbx[i] = Math.random() * W; }
                if (sy[i] > H) { sy[i] = sby[i] = Math.random() * H; }
            }
            for (let i = 0; i < starCount; i++) {
                if (stx[i] > W) stx[i] = Math.random() * W;
                if (sty[i] > H * 0.45) sty[i] = Math.random() * H * 0.45;
            }
        }, 250);
    }, { passive: true });
}

// =========================================
// 6. COUNTER ANIMATION
// =========================================
function animateCounter(el) {
    const target = +el.dataset.target;
    if (prefersReducedMotion) { el.textContent = target; return; }
    const t0     = performance.now();
    const dur    = 1800;
    (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
    })(t0);
}

const counters = document.querySelectorAll('.stat-number[data-target]');
if (counters.length) {
    const obs = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
}

// =========================================
// 7. SKILL BARS
// =========================================
const fills = document.querySelectorAll('.skill-fill');
if (fills.length) {
    const obs = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.width = e.target.style.getPropertyValue('--width');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    fills.forEach(f => obs.observe(f));
}

// =========================================
// 8. SCROLL REVEAL
//    .project-box intentionally excluded —
//    the Projects page now shows cards
//    immediately, no fade-up entrance.
// =========================================
const reveals = document.querySelectorAll('.timeline-item, .skill-card, .about-grid, .stats-bar, .empty-state, .contact-info-grid, .contact-form-wrapper, .certificate-gallery');
if (reveals.length) {
    reveals.forEach(el => el.classList.add('reveal-hidden'));
    const obs = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('reveal-visible'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => obs.observe(el));
}

// =========================================
// 9. NAV ON SCROLL
// =========================================
const nav = document.querySelector('nav');
if (nav) {
    let prev = false;
    window.addEventListener('scroll', () => {
        const cur = window.scrollY > 60;
        if (cur !== prev) { nav.classList.toggle('nav-scrolled', cur); prev = cur; }
    }, { passive: true });
}

// =========================================
// 10. PROFILE TINT
// =========================================
const pImg = document.querySelector('.profile-img');
if (pImg) {
    const overlay = pImg.closest('.profile-frame')?.querySelector('.profile-blood-overlay');
    if (overlay) {
        pImg.addEventListener('mouseenter', () => overlay.classList.add('tinted'),    { passive: true });
        pImg.addEventListener('mouseleave', () => overlay.classList.remove('tinted'), { passive: true });
    }
}

// =========================================
// 11. PROJECT MODAL LOGIC
// =========================================
const projectData = {
    'foursight': {
        title: "Foursight Car Rental Management System",
        description: `Foursight Car Rental Management System is a comprehensive C program that implements a full-featured car rental management system called "Foursight Car Rentals." Written as a single-file console application, it supports up to 400 cars, 1,000 customers, and 2,000 rental records, all persisted through flat text-based database files.\n\nThe system features a role-based login (admin and cashier), a main dashboard displaying live stats such as available cars, active rentals, estimated revenue in Philippine Peso, and late return counts. Core modules cover car inventory management with barcode generation (via the zint CLI tool), customer records, a rental workflow with automated late fee calculation (PHP 50/hour), receipt generation saved to a dedicated directory, email notifications via libcurl (SMTP), payment and billing menus, and detailed reporting.\n\nAdmin users additionally have access to a user management panel for creating, deleting, and toggling roles of system accounts. The code is cross-platform, with conditional compilation blocks handling Windows-specific APIs (Win32, conio.h) alongside POSIX/Linux terminal handling, and it uses ANSI color codes for a more polished console UI experience.`,
        techStack: ["C Programming", "Console Application", "File-based DB", "libcurl (SMTP)", "ANSI Colors"],
        image: "Foursight%20Car%20Rental%20Management%20System.png",
        sourceCode: "https://drive.google.com/drive/u/1/folders/1zpuuSNAwoMHz94zhKZpZjiJakFftrMV_"
    },
    'kapeinato': {
        title: "Kape Inato Cafe Management System",
        description: `Kape Inato is a full-stack cafe management web system built for a real local cafe business located at Panda Tea, J.A. Clarins Street, Dao, Tagbilaran, Bohol. The website serves as both a customer-facing platform and an administrative back-end system, featuring a beautifully designed landing page with a live clock, a dynamic menu page showcasing pizzas, pastas, drinks, and appetizers, and an online ordering system that allows customers to place pickup orders directly through the site.\n\nOn the administrative side, the system includes a secure login portal, a full-featured dashboard for managing menu items, tracking QR-based and online orders, monitoring inventory stock levels, viewing customer feedback and ratings, analyzing weekly sales trends, and reviewing action logs. All powered by a PHP and MySQLi back-end connected to a live MySQL database hosted on InfinityFree, with a dark-themed, amber-accented user interface styled entirely with custom CSS to reflect the warm and premium identity of the Kape Inato brand.`,
        techStack: ["PHP", "MySQLi", "HTML5 & CSS3", "Full-Stack Web"],
        image: "Final%20kapeinato%202.png", 
        sourceCode: "https://drive.google.com/drive/u/1/folders/1C8-FlzOtFIf42h5cdC_Se1Aa4Qq9IAmN"
    },
    'hx1rover': {
        title: "HX-1 Rover — Autonomous Robot",
        description: `The HX-1 Rover is a multi-mode autonomous robot system built on an ESP32 microcontroller, designed to operate as a Sumobot, a Human Following robot, an Obstacle Avoidance robot, and a Maze Solver — all selectable from a single smartphone web interface over Wi-Fi.\n\nThe rover is equipped with a 4-DOF robotic arm for manipulation tasks, a live dual webcam feed for real-time visual monitoring, and an array of ultrasonic and IR sensors for navigation and obstacle detection. Networking is bridged through an Orange Pi running a Java WebSocket server, which relays commands and sensor/video data between the ESP32 firmware and the web-based control interface.\n\nThis project ties together embedded firmware development, real-time sensor fusion, wireless control architecture, and cross-device communication — a direct application of hardware-software integration skills.`,
        techStack: ["ESP32", "Embedded C++", "Java WebSocket Server", "Orange Pi", "Wi-Fi Control", "Robotics"],
        image: "HX-1%20Rover.png",
        sourceCode: "https://drive.google.com/drive/u/1/folders/19hZF6zZ40hAZUpW-CRD1xhgD6UCs4jMA"
    }
};

const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
let modalTrigger = null;

function openModal(projectId, trigger) {
    const data = projectData[projectId];
    if (!data || !modal || !modalBody) return;
    modalBody.innerHTML = `
        <h2 class="modal-title" id="modal-title-heading">${data.title}</h2>
        <img src="${data.image}" alt="${data.title}" class="modal-image">
        <div class="modal-tech-stack">
            ${data.techStack.map(tech => `<span class="badge">${tech}</span>`).join('')}
        </div>
        <div class="modal-desc">
            ${data.description.split('\n').map(para => para.trim() ? `<p>${para}</p>` : '').join('')}
        </div>
        <div class="modal-cta">
            <a href="${data.sourceCode}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                <span class="btn-glow"></span>
                <i class="fa-solid fa-folder-open"></i> Access Drive Source
            </a>
        </div>
    `;
    modalTrigger = trigger || null;
    modal.classList.add('reveal-visible');
    modal.scrollTop = 0;
    setScrollLocked(true);
    if (closeModal) closeModal.focus({ preventScroll: true });
}

function closeProjectModal() {
    if (!modal || !modal.classList.contains('reveal-visible')) return;
    modal.classList.remove('reveal-visible');
    setScrollLocked(false);
    if (modalTrigger) { modalTrigger.focus({ preventScroll: true }); modalTrigger = null; }
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-details-btn');
    if (btn) openModal(btn.getAttribute('data-project'), btn);
});

if (modal) {
    if (closeModal) closeModal.addEventListener('click', closeProjectModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeProjectModal(); });

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('reveal-visible')) return;
        if (e.key === 'Escape') { closeProjectModal(); return; }
        if (e.key === 'Tab') {
            // Keep keyboard focus inside the dialog while it is open.
            const focusable = modal.querySelectorAll('a[href], button:not([disabled])');
            if (!focusable.length) return;
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            else if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        }
    });
}

// =========================================
// 12. CERTIFICATIONS GALLERY LOGIC
// =========================================
let certSwapTimer = null;
function showCertificate(src, description, thumbnailElement) {
    const mainImage = document.getElementById('main-cert-image');
    const displayBox = document.getElementById('display-box');
    const descElement = document.getElementById('cert-description');

    if (!mainImage || !displayBox || !descElement) return;

    displayBox.classList.add('loading');
    clearTimeout(certSwapTimer);

    certSwapTimer = setTimeout(() => {
        const reveal = () => displayBox.classList.remove('loading');
        mainImage.onload = reveal;
        mainImage.onerror = reveal;
        mainImage.src = src;
        mainImage.alt = description;
        descElement.textContent = description;
        if (mainImage.complete) reveal();
    }, 300);

    document.querySelectorAll('.cert-thumb').forEach(thumb => thumb.classList.remove('active'));
    if (thumbnailElement) thumbnailElement.classList.add('active');
}

// =========================================
// 13. LENIS BUTTERY SMOOTH SCROLLING
//     Skipped entirely for reduced-motion
//     visitors — native scroll is instant
//     and predictable, which is what that
//     preference is asking for.
// =========================================
if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    const lenis = new Lenis({
        duration: 1.2, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        syncTouch: false, 
        touchMultiplier: 2,
        infinite: false,
    });

    let lenisRafId = null;
    function raf(time) {
        lenis.raf(time);
        if (isPageVisible) {
            lenisRafId = requestAnimationFrame(raf);
        } else {
            lenisRafId = null;
        }
    }
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && lenisRafId === null) {
            lenisRafId = requestAnimationFrame(raf);
        }
    }, { passive: true });

    lenisRafId = requestAnimationFrame(raf);

    // Exposed so the scroll-to-top button (section 14) can use
    // Lenis's own smooth-scroll-to instead of the native jump.
    window.__lenis = lenis;
}
// =========================================
// 14. SCROLL-TO-TOP BUTTON
//     Injected at runtime so it appears on
//     every page without editing five HTML
//     files individually. Fades in once the
//     visitor has scrolled past one viewport
//     height, fades out near the top.
// =========================================
(function setupScrollTopButton() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.id = 'scroll-top-btn';
    btn.setAttribute('aria-label', 'Scroll back to top');
    btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    document.body.appendChild(btn);

    let visible = false;
    function syncVisibility() {
        const shouldShow = window.scrollY > window.innerHeight * 0.6;
        if (shouldShow !== visible) {
            visible = shouldShow;
            btn.classList.toggle('visible', visible);
        }
    }
    syncVisibility();
    window.addEventListener('scroll', syncVisibility, { passive: true });

    btn.addEventListener('click', () => {
        if (window.__lenis) {
            window.__lenis.scrollTo(0, { duration: prefersReducedMotion ? 0 : 1.1 });
        } else {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
    });
})();

// =========================================
// 15. CONTACT FORM VALIDATION + SUCCESS TOAST
//     The form currently posts to "#" (no
//     backend), so this intercepts submit,
//     validates client-side, shakes any
//     invalid field in scarlet, and shows a
//     themed success toast on a valid send
//     instead of silently doing nothing.
// =========================================
(function setupContactForm() {
    const form = document.querySelector('.contact-form-wrapper form');
    if (!form) return; // not the contact page

    // Paste your Formspree endpoint here (https://formspree.io/f/xxxxxxx)
    // to send messages in the background. Leave '' to open the visitor's
    // email client with the message pre-filled instead.
    const FORM_ENDPOINT = '';
    const CONTACT_EMAIL = 'jazdigamon12@gmail.com';

    let toastEl = document.querySelector('.form-toast');
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'form-toast';
        toastEl.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Message ready — your email client will open shortly.</span>';
        document.body.appendChild(toastEl);
    }
    let toastTimer = null;
    function showToast(msg) {
        if (msg) toastEl.querySelector('span').textContent = msg;
        toastEl.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 3600);
    }

    function shakeField(field) {
        field.classList.remove('field-invalid');
        // restart the animation even if it's already mid-shake
        requestAnimationFrame(() => field.classList.add('field-invalid'));
        field.addEventListener('animationend', () => field.classList.remove('field-invalid'), { once: true });
    }

    form.addEventListener('input', (e) => { if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid'); });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fields = Array.from(form.querySelectorAll('.form-control'));
        let allValid = true;
        let firstInvalid = null;

        fields.forEach((field) => {
            const value = field.value.trim();
            const isEmail = field.type === 'email';
            const valid = value.length > 0 && (!isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
            if (!valid) {
                allValid = false;
                if (!firstInvalid) firstInvalid = field;
                field.setAttribute('aria-invalid', 'true');
                shakeField(field);
            } else {
                field.removeAttribute('aria-invalid');
            }
        });

        if (!allValid) {
            firstInvalid.focus();
            showToast('Please fill in every field (with a valid email).');
            return;
        }

        const data = new FormData(form);
        if (FORM_ENDPOINT) {
            fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
                .then((r) => { if (!r.ok) throw new Error('send failed'); showToast('Message sent. Thank you!'); form.reset(); })
                .catch(() => showToast('Could not send. Please email me directly.'));
        } else {
            const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
            window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`;
            showToast('Message ready — your email client will open shortly.');
            form.reset();
        }
    });
})();

// =========================================
// 16. PROFILE IMAGE CURSOR TILT (About page)
//     A subtle perspective tilt that follows
//     the cursor within the portrait frame —
//     purely a transform, so it stays smooth
//     and GPU-composited. Skipped entirely
//     for touch devices and reduced-motion.
// =========================================
(function setupProfileTilt() {
    if (prefersReducedMotion) return;
    const frame = document.querySelector('.profile-frame');
    if (!frame) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // touch device, no hover tilt

    const maxTilt = 6; // degrees
    let targetX = 0, targetY = 0, curX = 0, curY = 0, raf = null;

    function loop() {
        curX += (targetX - curX) * 0.12;
        curY += (targetY - curY) * 0.12;
        frame.style.transform = `perspective(900px) rotateX(${curY}deg) rotateY(${curX}deg)`;
        if (Math.abs(targetX - curX) > 0.01 || Math.abs(targetY - curY) > 0.01) {
            raf = requestAnimationFrame(loop);
        } else {
            raf = null;
        }
    }

    frame.addEventListener('mousemove', (e) => {
        const rect = frame.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;  // 0 → 1
        const py = (e.clientY - rect.top) / rect.height;  // 0 → 1
        targetX = (px - 0.5) * maxTilt * 2;
        targetY = -(py - 0.5) * maxTilt * 2;
        if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    frame.addEventListener('mouseleave', () => {
        targetX = 0; targetY = 0;
        if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
})();

// =========================================
// 17. "LOST GRACE" EASTER EGG
//     Typing "grace" anywhere on the page
//     (no input focused) shows a small nod
//     to Sites of Grace. Lightweight: just a
//     5-character rolling buffer compared on
//     each keystroke, no listeners added or
//     removed dynamically.
// =========================================
(function setupGraceEasterEgg() {
    const target = 'grace';
    let buffer = '';
    let toastEl = null;
    let hideTimer = null;

    function ensureToast() {
        if (toastEl) return toastEl;
        toastEl = document.createElement('div');
        toastEl.className = 'grace-toast';
        toastEl.innerHTML = '✦ Lost Grace Discovered ✦';
        document.body.appendChild(toastEl);
        return toastEl;
    }

    document.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key.length !== 1) return;
        buffer = (buffer + e.key.toLowerCase()).slice(-target.length);
        if (buffer === target) {
            const toast = ensureToast();
            toast.classList.add('visible');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
            buffer = '';
        }
    });
})();

// =========================================
// 18. THEME-TOGGLE VISUAL PULSE
//     Called from section 1 on every theme
//     switch — adds a short-lived class that
//     triggers the themePulseBurst keyframes
//     defined in style.css, then cleans up
//     after itself via animationend.
// =========================================
function triggerThemePulse() {
    if (prefersReducedMotion) return;
    const moon = document.querySelector('.blood-moon');
    const glow = document.querySelector('.moon-glow');
    [moon, glow].forEach((el) => {
        if (!el) return;
        el.classList.remove('theme-pulse');
        requestAnimationFrame(() => el.classList.add('theme-pulse'));
        el.addEventListener('animationend', () => el.classList.remove('theme-pulse'), { once: true });
    });
}

// =========================================
// 19. IMAGE FADE-IN ON LOAD
//     Project screenshots, certificate
//     images, and the profile portrait all
//     pop in abruptly once downloaded. This
//     fades each one in smoothly the instant
//     it finishes loading (or immediately, if
//     it's already cached and complete),
//     using only opacity — no layout shift,
//     no jank.
// =========================================
(function setupImageFadeIn() {
    const selectors = '.project-image img, .cert-display img, .cert-thumb img, .profile-img';
    const images = document.querySelectorAll(selectors);

    images.forEach((img) => {
        img.classList.add('lazy-fade');
        if (img.complete && img.naturalWidth > 0) {
            // Already loaded (e.g. browser cache) — show immediately.
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
            img.addEventListener('error', () => img.classList.add('loaded'), { once: true }); // don't hide broken images forever
        }
    });
})();

// =========================================
// 20. CERTIFICATIONS GALLERY — KEYBOARD NAV
//     + LIVE REGION
//     Arrow Left/Right cycle through cert
//     thumbnails without needing a mouse, and
//     an aria-live region announces the
//     newly-selected certificate so screen
//     reader users get the same update sighted
//     users see in the description text.
// =========================================
(function setupCertKeyboardNav() {
    const thumbs = Array.from(document.querySelectorAll('.cert-thumb'));
    if (!thumbs.length) return; // not the certifications page

    thumbs.forEach((thumb, i) => {
        thumb.setAttribute('tabindex', '0');
        thumb.setAttribute('role', 'button');
        const img = thumb.querySelector('img');
        thumb.setAttribute('aria-label', `View certificate: ${(img && img.alt) || (i + 1)}`);
    });

    let liveRegion = document.getElementById('cert-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'cert-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.style.position = 'absolute';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        liveRegion.style.clipPath = 'inset(50%)';
        document.body.appendChild(liveRegion);
    }

    // Keep the live region in sync any time the description text changes,
    // regardless of whether the change came from a click or a key press.
    const descEl = document.getElementById('cert-description');
    if (descEl) {
        const announce = () => { liveRegion.textContent = `Now viewing: ${descEl.textContent}`; };
        const mo = new MutationObserver(announce);
        mo.observe(descEl, { childList: true, characterData: true, subtree: true });
    }

    thumbs.forEach((thumb, i) => {
        thumb.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                thumb.click();
                return;
            }
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            e.preventDefault();
            const next = e.key === 'ArrowRight'
                ? thumbs[(i + 1) % thumbs.length]
                : thumbs[(i - 1 + thumbs.length) % thumbs.length];
            next.focus();
            next.click();
        });
    });
})();

// =========================================
// 21. (Merged into section 11)
//     Escape key, focus return and the focus
//     trap now live next to openModal() so
//     there is a single close path.
// =========================================

// =========================================
// 22. COPY-TO-CLIPBOARD ON CONTACT DETAILS
//     Clicking the email or phone number on
//     the Contact page copies it straight to
//     the clipboard and confirms with the same
//     themed toast used by the contact form,
//     instead of forcing a manual select-and-copy.
// =========================================
(function setupContactCopy() {
    const cards = document.querySelectorAll('.contact-card .contact-details p');
    if (!cards.length) return; // not the contact page

    let toastEl = document.querySelector('.form-toast');
    function ensureToast() {
        if (toastEl) return toastEl;
        toastEl = document.createElement('div');
        toastEl.className = 'form-toast';
        document.body.appendChild(toastEl);
        return toastEl;
    }
    let toastTimer = null;
    function flashToast(message) {
        const toast = ensureToast();
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${message}</span>`;
        toast.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
    }

    cards.forEach((p) => {
        const text = p.textContent.trim();
        const looksCopyable = text.includes('@') || /\d{7,}/.test(text);
        if (!looksCopyable) return;

        const copy = async () => {
            try {
                await navigator.clipboard.writeText(text);
                flashToast('Copied to clipboard.');
            } catch (err) {
                // Clipboard API needs HTTPS / permission.
                flashToast('Could not copy. Please select the text manually.');
            }
        };

        p.style.cursor = 'pointer';
        p.title = 'Click to copy';
        p.tabIndex = 0;
        p.setAttribute('role', 'button');
        p.setAttribute('aria-label', `Copy ${text}`);
        p.addEventListener('click', copy);
        p.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); }
        });
    });
})();

// =========================================
// 23. KEYBOARD SHORTCUTS
//     Home → scroll to top (mirrors the
//     scroll-to-top button). "T" → toggle
//     theme. Both are ignored while the
//     visitor is typing into a form field, so
//     they never interfere with the contact
//     form or any text input.
// =========================================
(function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === 'Home') {
            e.preventDefault();
            const topBtn = document.getElementById('scroll-top-btn');
            if (topBtn) topBtn.click();
            else window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }

        if ((e.key === 't' || e.key === 'T') && themeBtn) {
            themeBtn.click();
        }
    });
})();

// =========================================
// 24. SOCIAL ICON ACCESSIBLE NAMES
//     Icon-only links get an aria-label so screen
//     readers announce "GitHub" instead of nothing.
// =========================================
(function labelSocialIcons() {
    const names = { 'github.com': 'GitHub', 'facebook.com': 'Facebook', 'instagram.com': 'Instagram', 'x.com': 'X (Twitter)', 'tiktok.com': 'TikTok' };
    document.querySelectorAll('a.social-icon').forEach((a) => {
        if (a.getAttribute('aria-label')) return;
        const host = a.hostname.replace(/^www\./, '');
        a.setAttribute('aria-label', a.dataset.tooltip || names[host] || host);
    });
})();

// =========================================
// DEVELOPER NOTES — MAINTAINING THIS FILE
// =========================================
//
// Adding a new project (Projects page):
//   1. Add a `.project-box` card to projects.html with a unique
//      `data-project-id`.
//   2. Add a matching entry to `projectData` in section 11 above,
//      keyed by that same id, with title/description/techStack/
//      image/sourceCode.
//   3. No changes needed here in section 8 — `.project-box` is
//      intentionally excluded from the scroll-reveal animation
//      per the current design (see section 8's comment).
//
// Adding a new certificate (Certifications page):
//   1. Add a `.cert-thumb` div with an `onclick="showCertificate(...)"`
//      call (see certifications.html for the existing pattern).
//   2. Section 20 automatically wires up keyboard navigation and
//      the aria-live announcement for any `.cert-thumb` found in
//      the DOM — no JS changes required.
//
// Adjusting particle/ember density (section 5):
//   `S` (stars) and `E` (emitters) are both derived from viewport
//   area and clamped for mobile + reduced-motion. Raising the caps
//   in `Math.min(90, ...)` will increase visual density at the
//   cost of main-thread draw time — profile on a low-end device
//   before raising it.
//
// Palette reference (kept in sync with style.css):
//   Erdtree Gold #D4A017 · Rune Amber #B8860B · Ashen Fog #8A8A7A
//   Void Black #0E0C0A · Parchment #E8D5A3 · Night Sky #1A1C2E
//   Malenia's Rot #8B1A1A · Scarlet Rot #C2607A · Iron Armor #9AA0AA
//   Moonlight #6A8FAF
//
// Performance checklist for any new animation added to this file:
//   - Animate transform/opacity only — never top/left/width/height.
//   - Gate it behind `if (!prefersReducedMotion)`.
//   - If it runs every frame, gate the rAF loop behind `isPageVisible`
//     the same way sections 5 and 13 do.
//
// Browser support: this file relies on IntersectionObserver,
// MutationObserver, the Clipboard API, and CSS custom properties —
// all well-supported in current Chrome, Firefox, Safari, and Edge.
// No transpilation/polyfills are included by design, to keep this
// a zero-build static site.

/* ============================================================
   CYBERPUNK RESPONSIVE + MOTION UPGRADE
   Progressive enhancement; the site remains usable if JS fails.
   ============================================================ */
(function cyberpunkEnhancements() {
  'use strict';
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('page-ready');

  // Animate content as it enters view; reveal immediately if unsupported/reduced motion.
  const revealTargets = document.querySelectorAll(
    '.section-heading, .section-label, .about-bio, .info-item, .skill-card, .timeline-item, .project-box, .contact-card, .contact-form-wrapper, .cert-display, .resume-section, .stats-bar .stat-item'
  );
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach((el, i) => {
      if (el.closest('.hero')) return;
      el.classList.add('js-reveal');
      el.style.transitionDelay = `${Math.min(i % 5, 4) * 45}ms`;
      observer.observe(el);
    });
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  // Close the mobile drawer when switching to desktop width, and keep aria state accurate.
  const menu = document.querySelector('.nav-links');
  const toggle = document.getElementById('hamburger-btn');
  const overlay = document.getElementById('mobile-menu-overlay');
  function closeDrawer() {
    if (!menu || !toggle || !menu.classList.contains('open')) return;
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (window.__lenis && typeof window.__lenis.start === 'function') window.__lenis.start();
  }
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeDrawer(); }, { passive: true });
  if (menu && toggle) {
    toggle.setAttribute('aria-controls', 'primary-navigation');
    menu.id = menu.id || 'primary-navigation';
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeDrawer();
    }));
  }

  // Small parallax on desktop only; no pointer tracking on touch devices.
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const hero = document.querySelector('.hero');
    if (hero) {
      let raf = 0;
      hero.addEventListener('pointermove', event => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - .5;
          const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - .5;
          hero.style.setProperty('--pointer-x', `${x * 8}px`);
          hero.style.setProperty('--pointer-y', `${y * 6}px`);
          raf = 0;
        });
      }, { passive: true });
      hero.addEventListener('pointerleave', () => {
        hero.style.setProperty('--pointer-x', '0px');
        hero.style.setProperty('--pointer-y', '0px');
      }, { passive: true });
    }
  }
})();


/* ============================================================
   IMMERSIVE CYBERPUNK DETAILS
   Lightweight enhancements: reading progress, local clock/status HUD,
   and a subtle pointer glow on desktop. No external libraries required.
   ============================================================ */
(function immersiveInterface() {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reading progress line gives long pages a subtle, useful sense of movement.
  const progress = document.createElement('div');
  progress.id = 'cyber-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  let scrollTicking = false;
  function updateProgress() {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    progress.style.width = `${Math.min(100, Math.max(0, (window.scrollY / max) * 100))}%`;
    scrollTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  // Tiny status HUD with the visitor's own local time (no location tracking).
  const hud = document.createElement('aside');
  hud.id = 'cyber-hud';
  hud.setAttribute('aria-label', 'Interface status and local time');
  hud.innerHTML = '<span class="hud-dot" aria-hidden="true"></span><span>SYS ONLINE</span><span aria-hidden="true">/</span><time class="hud-clock" id="cyber-clock"></time>';
  document.body.appendChild(hud);
  const clock = hud.querySelector('#cyber-clock');
  function updateClock() {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  }
  updateClock();
  window.setInterval(updateClock, 30000);

  // Soft cursor light only on mouse/trackpad devices; disabled on touch and reduced motion.
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cyber-pointer-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    let raf = 0, x = -400, y = -400;
    window.addEventListener('pointermove', event => {
      x = event.clientX; y = event.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        glow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        raf = 0;
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });
    document.addEventListener('pointerenter', () => { glow.style.opacity = ''; });
  }
})();
