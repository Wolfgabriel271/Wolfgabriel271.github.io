# ⚜️ Jazen Gabriel — Portfolio Website

> *"Any fool can write code that a computer can understand. Good programmers write code that humans can understand."* — Martin Fowler

A personal portfolio site built from scratch with vanilla HTML, CSS, and JavaScript — no frameworks, no build step. Styled around an **Elden Ring–inspired** visual identity: Erdtree gold, void black, ashen fog, and a touch of moonlight, with a light "Lands Between by day" mode and a dark "Age of Stars" mode that the visitor can toggle at will.

🔗 **Live site:** *add your deployed link here*

---

## 📖 About

This is the personal site of **Jazen Gabriel M. Digamon**, a Computer Engineering student at the University of Bohol with an eye on becoming a Senior Software Engineer. The site covers his story, resume, projects, certifications, and a way to get in touch — all wrapped in a dark-fantasy aesthetic that still behaves like a fast, accessible, production-grade website underneath.

## ✨ Features

- **Dual theme system** — light ("Parchment / Lands Between") and dark ("Void Black / Age of Stars") modes, saved to `localStorage` so the choice persists across visits
- **Canvas particle engine** — drifting ember and starfield effects rendered with typed arrays for performance, fully theme-aware and mouse-reactive
- **Smooth scrolling** via Lenis, with graceful fallback to native scroll
- **Scroll-reveal animations** powered by `IntersectionObserver` — content fades in as it enters the viewport instead of all animating on page load
- **Animated stat counters** and **skill progress bars** that count up/fill only once they're visible
- **Project showcase** with an expandable modal for full case-study descriptions, tech stack badges, and source code links
- **Interactive certifications gallery** with keyboard navigation (arrow keys) and live region announcements for screen readers
- **Contact form validation** with inline field-shake feedback and a themed success toast — no backend required
- **Copy-to-clipboard** on email and phone number with confirmation toast
- **Cursor-reactive profile tilt** on the About page (disabled automatically on touch devices)
- **Responsive mobile navigation** with an animated hamburger-to-X transition
- **Scroll-to-top button** that injects itself on every page automatically
- **A small easter egg** for visitors who type the right word 👀
- **Full accessibility pass** — skip-to-content link, visible focus rings, `aria-live` regions, keyboard shortcuts (`Home` to scroll up, `T` to toggle theme), and complete `prefers-reduced-motion` support
- **Performance-first by design** — every animation loop pauses when the browser tab is hidden, all hot-path work touches only `transform`/`opacity`, and images are lazy-loaded where appropriate
- **Print-friendly resume** — a dedicated `@media print` stylesheet strips all decorative effects for a clean printout
- **SEO & social sharing** — per-page meta descriptions and Open Graph tags so shared links render properly on LinkedIn, Discord, etc.

## 🛠️ Tech Stack

| Layer       | Tools |
|-------------|-------|
| Markup      | Semantic HTML5 |
| Styling     | CSS3 (custom properties, Grid, Flexbox, no preprocessor) |
| Scripting   | Vanilla JavaScript (ES6+, no framework) |
| Smooth Scroll | [Lenis](https://github.com/studio-freight/lenis) |
| Icons       | [Font Awesome 6.5.1](https://fontawesome.com/) |
| Fonts       | Playfair Display, DM Sans, DM Mono (Google Fonts) |

No build tools, no package manager, no transpilation — open `index.html` and it just works.

## 📁 Project Structure

```
├── index.html              Home / Hero
├── about.html              Bio, info cards, profile portrait
├── resume.html             Education, skills, timeline
├── projects.html           Project showcase + detail modals
├── certifications.html     Certificate gallery
├── contact.html            Contact form + social links
├── style.css               All styling, themes, and animations
└── script.js               All interactivity and logic
```

## 🚀 Running Locally

No installation needed — this is a static site.

```bash
git clone https://github.com/Wolfgabriel271/<repo-name>.git
cd <repo-name>
```

Then either open `index.html` directly in a browser, or serve it locally for the most accurate experience:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Visit `http://localhost:8000`.

## 🎨 Color Palette

| Swatch | Name | Hex |
|--------|------|-----|
| 🟡 | Erdtree Gold | `#D4A017` |
| 🟠 | Rune Amber | `#B8860B` |
| ⚫ | Void Black | `#0E0C0A` |
| 🌫️ | Ashen Fog | `#8A8A7A` |
| 📜 | Parchment | `#E8D5A3` |
| 🌌 | Night Sky | `#1A1C2E` |
| 🩸 | Malenia's Rot | `#8B1A1A` |
| ⚙️ | Iron Armor | `#9AA0AA` |
| 🌙 | Moonlight | `#6A8FAF` |

## 📬 Contact

- **Email:** jazdigamon12@gmail.com
- **GitHub:** [@Wolfgabriel271](https://github.com/Wolfgabriel271)
- **LinkedIn:** Jazen Gabriel Digamon

---

<p align="center"><em>"First, solve the problem. Then, write the code."</em></p>
