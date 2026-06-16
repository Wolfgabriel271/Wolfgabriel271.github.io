/* ==========================================================================
   ELDEN RING INSPIRED PORTFOLIO SYSTEM SCRIPTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Core Modules
    initThemeEngine();
    initMobileNav();
    initCanvasParticles();
    initSmoothScroll();
    initScrollReveal();
    initProjectModals();
    initCertGallery();
    initParallaxScenic();

});

/* ==========================================================================
   1. Theme Management Engine
   ========================================================================== */
function initThemeEngine() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        
        // Save choice
        localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
        
        // Trigger a custom event for canvas color transition
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: isDark ? 'dark' : 'light' } }));
        
        // Dynamic switch of inner icon
        const icon = themeBtn.querySelector('i');
        if (icon) {
            if (isDark) {
                icon.className = 'fa-solid fa-sun';
            } else {
                icon.className = 'fa-solid fa-moon';
            }
        }
    });

    // Handle initial state setup
    const savedTheme = localStorage.getItem('portfolio-theme');
    const isDarkNow = document.documentElement.classList.contains('dark-mode');
    const icon = themeBtn.querySelector('i');
    
    if (icon) {
        if (savedTheme === 'dark' || (savedTheme === null && isDarkNow)) {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }
}

/* ==========================================================================
   2. Mobile Drawer Navigation
   ========================================================================== */
function initMobileNav() {
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.getElementById('mobile-menu-overlay');

    if (!hamburger || !navLinks || !menuOverlay) return;

    function toggleMenu() {
        const isOpen = hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
    }

    hamburger.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);

    // Close when navigating inside page links
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

/* ==========================================================================
   3. Smooth Scroll Engine Integration (Lenis Fallback)
   ========================================================================== */
function initSmoothScroll() {
    // Check for global Lenis variable loaded via script tag
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }
}

/* ==========================================================================
   4. Scroll Intersection Observer (Performance Optimized)
   ========================================================================== */
function initScrollReveal() {
    const revealTargets = document.querySelectorAll('.reveal-hidden, .timeline-item, .skill-card, .project-box');
    
    if (revealTargets.length === 0) return;

    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Handle staggered animations for lists and grids
                const delay = entry.target.style.getPropertyValue('--delay') || '0s';
                setTimeout(() => {
                    entry.target.classList.add('reveal-visible');
                    
                    // Specific trigger for skill rating fill bars
                    const skillFill = entry.target.querySelector('.skill-fill');
                    if (skillFill) {
                        const targetWidth = skillFill.style.getPropertyValue('--width') || '100%';
                        skillFill.style.width = targetWidth;
                    }
                }, parseFloat(delay) * 1000);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealTargets.forEach((target, index) => {
        // Automatically inject staggered reveal delays if none exist
        if (!target.style.getPropertyValue('--delay')) {
            target.style.setProperty('--delay', `${(index % 3) * 0.15}s`);
        }
        target.classList.add('reveal-hidden');
        revealObserver.observe(target);
    });
}

/* ==========================================================================
   5. Elden Ring Scenic Canvas Particle Engine
   ========================================================================== */
function initCanvasParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let animationFrameId;

    // Define theme particle structures
    const goldenLeafColors = ['rgba(233, 196, 106, 0.45)', 'rgba(231, 111, 81, 0.25)', 'rgba(244, 235, 216, 0.15)'];
    const cosmicStardustColors = ['rgba(162, 210, 255, 0.4)', 'rgba(122, 31, 29, 0.2)', 'rgba(244, 235, 216, 0.15)'];
    
    let currentPalette = document.documentElement.classList.contains('dark-mode') ? cosmicStardustColors : goldenLeafColors;

    window.addEventListener('themeChanged', (e) => {
        currentPalette = e.detail.theme === 'dark' ? cosmicStardustColors : goldenLeafColors;
        // Transform current active particles color scheme on dynamic toggles
        particlesArray.forEach(p => {
            p.color = currentPalette[Math.floor(Math.random() * currentPalette.length)];
        });
    });

    function setCanvasDimensions() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1.2;
            this.speedX = Math.random() * 0.6 - 0.25; // Drifting wind effect
            this.speedY = Math.random() * 0.4 + 0.35;  // Falling gently
            this.color = currentPalette[Math.floor(Math.random() * currentPalette.length)];
            this.spin = Math.random() * 0.01;
            this.angle = Math.random() * 360;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.angle += this.spin;

            // Reset loop
            if (this.y > canvas.height) {
                this.y = -10;
                this.x = Math.random() * canvas.width;
            }
            if (this.x > canvas.width) {
                this.x = 0;
            } else if (this.x < 0) {
                this.x = canvas.width;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            
            // Draw subtle diamond/leaf shapes rather than generic circles
            ctx.moveTo(0, -this.size * 1.5);
            ctx.lineTo(this.size, 0);
            ctx.lineTo(0, this.size * 1.5);
            ctx.lineTo(-this.size, 0);
            
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    function initParticlesPool() {
        particlesArray = [];
        // Cap particle count on mobile screens to maintain high frame-rates
        const maxParticles = window.innerWidth < 768 ? 35 : 100;
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particlesArray.forEach(p => {
            p.update();
            p.draw();
        });
        
        animationFrameId = requestAnimationFrame(animateParticles);
    }

    initParticlesPool();
    animateParticles();

    // Re-initialize pool on screen width adjustments to prevent overflow
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initParticlesPool();
        }, 250);
    });
}

/* ==========================================================================
   6. Projects Detailed Modal Module (Data-Driven Injection)
   ========================================================================== */
const projectData = {
    foursight: {
        title: "Foursight Car Rentals",
        subtitle: "C Console Enterprise Application",
        image: "Foursight Car Rental Management System.png",
        desc: "A highly engineered CLI system built from scratch in C, implementing relational database simulation through advanced pointer operations and optimized binary file serialization. The architectural interface employs ANSI code escape sequences to structuralize a comprehensive dashboard dashboard UI with real-time feedback elements.",
        features: [
            "Secure system entry using dynamic hashed string authentications.",
            "Dynamic barcode validation systems simulating live physical scanner feeds.",
            "Automated calendar day trackers computing granular tiered late-fee matrix models.",
            "Visual responsive analytics dashboard running efficiently within shell architectures."
        ]
    },
    kapeinato: {
        title: "Kape Inato Cafe System",
        subtitle: "Full-Stack Web Application Architecture",
        image: "Final kapeinato 2.png",
        desc: "A high-performance modern web system addressing point-of-sale management, inventory analysis, and multi-user ordering capabilities. Leveraging custom designed decoupled layouts, it pairs a secure PHP transaction layer with relational tracking algorithms designed on MySQLi.",
        features: [
            "Responsive menu display interfaces allowing real-time ordering transitions.",
            "Highly secure admin system overseeing dynamic item updates and status actions.",
            "Optimized query structures processing analytical metrics calculations.",
            "Custom transaction logs processing operations directly onto system components."
        ]
    }
};

function initProjectModals() {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-modal');
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');

    if (!modal || !modalBody || !closeBtn) return;

    function openModal(projectId) {
        const data = projectData[projectId];
        if (!data) return;

        // Structured inner layouts mapping
        const featuresHTML = data.features.map(feat => `<li><i class="fa-solid fa-cross"></i> <span>${feat}</span></li>`).join('');

        modalBody.innerHTML = `
            <img class="modal-image" src="${data.image}" alt="${data.title}">
            <h2 class="modal-title">${data.title}</h2>
            <div class="modal-subtitle">${data.subtitle}</div>
            <p class="modal-desc">${data.desc}</p>
            <div class="modal-features">
                <h4>System Capabilities & Design</h4>
                <ul class="features-list">
                    ${featuresHTML}
                </ul>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop standard scrolls
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    viewDetailsButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projId = btn.getAttribute('data-project');
            openModal(projId);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   7. Certification Display & Switcher System
   ========================================================================== */
function initCertGallery() {
    const mainCertImage = document.getElementById('main-cert-image');
    const certDescription = document.getElementById('cert-description');
    const certThumbs = document.querySelectorAll('.cert-thumb');

    if (!mainCertImage || !certDescription || certThumbs.length === 0) return;

    // Direct binding for custom page interactions
    window.showCertificate = function(imgSrc, title, element) {
        if (!mainCertImage || !certDescription) return;

        // Quick fade-out effect
        mainCertImage.style.opacity = '0';
        certDescription.style.opacity = '0';

        setTimeout(() => {
            mainCertImage.src = imgSrc;
            certDescription.textContent = title;
            
            // Fade back in
            mainCertImage.style.opacity = '1';
            certDescription.style.opacity = '1';
        }, 250);

        // Manage dynamic thumb status indicators
        certThumbs.forEach(thumb => thumb.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        }
    };
}

/* ==========================================================================
   8. Parallax Background & Cursor Motion Parallax
   ========================================================================== */
function initParallaxScenic() {
    const moon = document.querySelector('.blood-moon');
    const glow = document.querySelector('.moon-glow');
    
    if (!moon && !glow) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    window.addEventListener('mousemove', (e) => {
        // Calculate coordinate offsets relative to viewport center
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        targetX = (e.clientX - centerX) / 45;
        targetY = (e.clientY - centerY) / 45;
    });

    function updateParallaxPosition() {
        // Linear interpolation to create smooth lag-free movement transitions
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        if (moon) {
            moon.style.transform = `translate3d(${currentX * -1.2}px, ${currentY * -1.2}px, 0)`;
        }
        if (glow) {
            glow.style.transform = `translate3d(${currentX * 0.8}px, ${currentY * 0.8}px, 0)`;
        }

        requestAnimationFrame(updateParallaxPosition);
    }

    requestAnimationFrame(updateParallaxPosition);
}