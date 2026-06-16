/* =========================================
   JAZEN GABRIEL — PORTFOLIO
   JavaScript — Dynamic Theme Edition
========================================= */
'use strict';

// =========================================
// 1. THEME TOGGLE LOGIC
// =========================================
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark-mode');
        const isDark = document.documentElement.classList.contains('dark-mode');
        
        if (isDark) {
            localStorage.setItem('portfolio-theme', 'dark');
            if(themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.setItem('portfolio-theme', 'light');
            if(themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}

if (themeIcon && document.documentElement.classList.contains('dark-mode')) {
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

// =========================================
// 2. HAMBURGER MENU LOGIC
// =========================================
const hamburgerBtn   = document.getElementById('hamburger-btn');
const navLinks       = document.querySelector('.nav-links');
const menuOverlay    = document.getElementById('mobile-menu-overlay');

function openMobileMenu() {
    hamburgerBtn.classList.add('open');
    navLinks.classList.add('open');
    menuOverlay.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    hamburgerBtn.classList.remove('open');
    navLinks.classList.remove('open');
    menuOverlay.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
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
        'Computer Engineering Student',
        'Future Senior Software Engineer',
        'C++ & C Programmer',
        'Java & Python Developer',
        'Full-Stack Web Developer (PHP/JS)'
    ];
    let pIdx = 0, cIdx = 0, del = false;

    (function step() {
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
    const S     = Math.min(90, Math.floor(W * H / 12000) * mobileParticleFactor);
    const sx    = new Float32Array(S), sy   = new Float32Array(S);
    const sbx   = new Float32Array(S), sby  = new Float32Array(S);
    const ssize = new Float32Array(S), sop  = new Float32Array(S);
    const stws  = new Float32Array(S), stwo = new Float32Array(S);
    const sden  = new Float32Array(S);
    const sdim  = new Uint8Array(S);

    for (let i = 0; i < S; i++) {
        sx[i]  = sbx[i] = Math.random() * W;
        sy[i]  = sby[i] = Math.random() * H;
        ssize[i] = Math.random() * 1.2 + 0.25;
        sop[i]   = Math.random() * 0.35 + 0.05;
        stws[i]  = Math.random() * 0.01 + 0.003;
        stwo[i]  = Math.random() * 6.28;
        sden[i]  = Math.random() * 12 + 2;
        sdim[i]  = Math.random() > 0.7 ? 1 : 0;
    }

    // Reduce emitter count on mobile for better performance
    const E     = isMobile ? 5 : 10;
    const ex    = new Float32Array(E), ey    = new Float32Array(E);
    const evx   = new Float32Array(E), evy   = new Float32Array(E);
    const elife = new Float32Array(E), edec  = new Float32Array(E);
    const esize = new Float32Array(E);

    function resetE(i) {
        ex[i]    = Math.random() * W;
        ey[i]    = H + 8;
        evx[i]   = (Math.random() - 0.5) * 0.8;
        evy[i]   = -(Math.random() * 0.8 + 0.25);
        elife[i] = Math.random() * 0.4 + 0.4;
        edec[i]  = Math.random() * 0.002 + 0.0005;
        esize[i] = Math.random() * 1.4 + 0.5;
    }
    for (let i = 0; i < E; i++) { resetE(i); ey[i] = Math.random() * H; }

    const bloodMoon = document.querySelector('.blood-moon');
    const moonGlow  = document.querySelector('.moon-glow');
    let moonX = 0, moonY = 0;

    function getParticleColors() {
        const isDark = document.documentElement.classList.contains('dark-mode') ||
                       !document.documentElement.classList.contains('dark-mode') &&
                       getComputedStyle(document.documentElement).getPropertyValue('--bg-grad-top').trim().startsWith('#0');
        return {
            main: '#D4A017',
            dim:  '#7A6A30',
            dust: '#C9870A'
        };
    }

    function animate(ts) {
        ctx.clearRect(0, 0, W, H);
        const pColors = getParticleColors();

        for (let i = 0; i < S; i++) {
            const tw = Math.sin(ts * stws[i] + stwo[i]) * 0.2 + 0.8;
            const dx = mouseX - sx[i], dy = mouseY - sy[i];
            const d2 = dx * dx + dy * dy;
            if (d2 < 10000) {
                const d = Math.sqrt(d2);
                const f = (100 - d) / 100;
                sx[i] -= dx / d * f * sden[i] * 0.3;
                sy[i] -= dy / d * f * sden[i] * 0.3;
            } else {
                sx[i] += (sbx[i] - sx[i]) * 0.04;
                sy[i] += (sby[i] - sy[i]) * 0.04;
            }
            ctx.globalAlpha = sop[i] * tw;
            ctx.fillStyle   = sdim[i] ? pColors.dim : pColors.main;
            ctx.beginPath();
            ctx.arc(sx[i], sy[i], ssize[i], 0, 6.2832);
            ctx.fill();
        }

        ctx.fillStyle = pColors.dust;
        for (let i = 0; i < E; i++) {
            ex[i]    += evx[i] + Math.sin(ts * 0.001 + i) * 0.15;
            ey[i]    += evy[i];
            elife[i] -= edec[i];
            if (elife[i] <= 0 || ey[i] < -15) { resetE(i); continue; }
            ctx.globalAlpha = elife[i] * 0.5;
            ctx.beginPath();
            ctx.arc(ex[i], ey[i], esize[i], 0, 6.2832);
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        if (bloodMoon) {
            const tx = (mouseX / W - 0.5) * 14;
            const ty = (mouseY / H - 0.5) * 8;
            moonX += (tx - moonX) * 0.03;
            moonY += (ty - moonY) * 0.03;
            bloodMoon.style.transform = `translate3d(${moonX}px,${moonY}px, 0)`;
            if (moonGlow) moonGlow.style.transform = `translate3d(${moonX * 0.5}px,${moonY * 0.5}px, 0)`;
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

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
        }, 250);
    }, { passive: true });
}

// =========================================
// 6. COUNTER ANIMATION
// =========================================
function animateCounter(el) {
    const target = +el.dataset.target;
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
// 8. SCROLL REVEAL (Fixed: Added .certificate-gallery)
// =========================================
const reveals = document.querySelectorAll('.timeline-item, .skill-card, .about-grid, .stats-bar, .empty-state, .contact-info-grid, .contact-form-wrapper, .project-box, .certificate-gallery');
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
    }
};

const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

function openModal(projectId) {
    const data = projectData[projectId];
    if (data && modalBody) {
        modalBody.innerHTML = `
            <h2 class="modal-title">${data.title}</h2>
            <img src="${data.image}" alt="${data.title}" class="modal-img">
            <div class="modal-tech-stack">
                ${data.techStack.map(tech => `<span class="badge">${tech}</span>`).join('')}
            </div>
            <div class="modal-desc">
                ${data.description.split('\n').map(para => `<p>${para}</p>`).join('')}
            </div>
            <div class="modal-cta-group">
                <a href="${data.sourceCode}" target="_blank" rel="noopener" class="btn-primary">
                    <span class="btn-glow"></span>
                    <i class="fa-solid fa-folder-open"></i> Access Drive Source
                </a>
            </div>
        `;
        modal.classList.add('reveal-visible');
    }
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-details-btn');
    if (btn) {
        const projectId = btn.getAttribute('data-project');
        openModal(projectId);
    }
});

if (closeModal) {
    closeModal.addEventListener('click', () => modal.classList.remove('reveal-visible'));
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('reveal-visible');
    }
});

// =========================================
// 12. CERTIFICATIONS GALLERY LOGIC
// =========================================
function showCertificate(src, description, thumbnailElement) {
    const mainImage = document.getElementById('main-cert-image');
    const displayBox = document.getElementById('display-box');
    const descElement = document.getElementById('cert-description');

    if (!mainImage || !displayBox || !descElement) return;

    displayBox.classList.add('loading');
    
    setTimeout(() => {
        mainImage.src = src;
        descElement.textContent = description;
        displayBox.classList.remove('loading');
    }, 300);

    document.querySelectorAll('.cert-thumb').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbnailElement.classList.add('active');
}

// =========================================
// 13. LENIS BUTTERY SMOOTH SCROLLING
// =========================================
if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
        duration: 1.2, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false, 
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}