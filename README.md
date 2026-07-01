# Simon Rioult — Portfolio V4

Personal portfolio website for Simon Rioult, a freelance web designer based in Le Havre who creates premium showcase websites for local businesses (restaurants, bars, artisans).

**Core pitch:** "Je montre au commerçant son futur site avant même de vendre."

**🌐 Live:** https://simonr.fr — hosted on GitHub Pages, served through Cloudflare (HTTPS). See [Deployment & infrastructure](#deployment--infrastructure).

---

## Project overview

A cinematic, scroll-driven experience. Zero dependencies, zero frameworks — pure HTML/CSS/JS with **GSAP + ScrollTrigger** loaded via CDN. Scrolling is **fully native** (no smooth-scroll library).

**Libraries (CDN only, no npm/bundler):**
- [GSAP 3.12.5 + ScrollTrigger](https://gsap.com) — scroll-triggered reveal animations
- **Google Analytics 4** (`gtag.js`, id `G-DS1HVCTGMS`) — on every page, injected right after `<meta charset>` (added 2026-06-25). See [Analytics & SEO](#analytics--seo-2026-06-25--2026-06-27).

> **Lenis (smooth scroll) removed 2026-06-18** — it intercepted wheel/trackpad input and caused desktop scroll jank. Scrolling is now 100% native. See [Performance](#performance--scroll-2026-06-18).

**Live email:** simonrioultbonjour.fr@gmail.com

---

## File structure

```
portfolio V3 vs code/
├── index.html                      ← Main portfolio (complete experience redesign)
├── CNAME                           ← Custom domain for GitHub Pages (simonr.fr)
├── mentions-legales.html           ← Legal page (LCEN compliant)
├── css/
│   └── style.css                   ← All styles — cinematic agency theme
├── js/
│   ├── main.js                     ← All JS behaviours
│   └── consent.js                  ← Bandeau cookies RGPD (Consent Mode v2) — 2026-06-29
├── img/                            ← All photos: JPEG, ~26 MB total (see Images note)
│   ├── hortense/                   ← 33 photos for Maison Hortense (kebab-case filenames)
│   ├── plomberie/                  ← 21 photos for Atlantique Plomberie (p01–p21.jpg)
│   ├── tigre/                      ← 4 photos for Le Tigre Doré
│   └── menuisier/                  ← 4 photos for Ateliers Leroy
├── menuisier-demo.html             ← Demo: Ateliers Leroy (menuiserie & ébénisterie)
├── lecume-bistrot-demo.html        ← Demo: L'Écume (bistrot de la mer)
├── le-tigre-dore-demo.html         ← Demo: Le Tigre Doré (cuisine indienne)
├── le-margaux-demo.html            ← Demo: Le Margaux (resto & bar à vins)
├── maison-hortense-demo.html       ← Signature demo: Maison Hortense (gastronomique)
├── voltaique-bar-demo.html         ← Signature demo: Atlantique Plomberie (home)
├── plomberie-services.html         ← Atlantique Plomberie — Services page
├── plomberie-galerie.html          ← Atlantique Plomberie — Gallery page
├── plomberie-contact.html          ← Atlantique Plomberie — Contact & devis page
├── robots.txt                      ← SEO — allow all + sitemap pointer (2026-06-27)
├── sitemap.xml                     ← SEO — homepage + mentions-legales only (2026-06-27)
├── favicon.svg                     ← Favicon SR (fond crème, S ink + R corail) — 2026-06-29
├── favicon-16/32/96.png            ← Fallbacks PNG (Safari/Windows préfèrent le PNG au SVG) — 2026-06-29
└── apple-touch-icon.png            ← Icône iOS 180×180 (écran d'accueil) — 2026-06-29
```

> **Note:** the trailing space in the folder name `portfolio V3 vs code ` is real — keep it when `cd`-ing.

---

## Images — optimized JPEG (2026-06-15)

All photos were originally PNG (~127 MB total, some single files 4–5 MB). They were converted to **JPEG quality 82** at the same dimensions — **~26 MB total, no visible quality loss** — to fix heavy scroll lag on mobile. All code references use `.jpg`.

- Original PNGs are backed up outside the repo: `project 2k26/img-ORIGINAUX-png-backup/`.
- If adding new photos, **export as JPEG** (or run them through the same compression) — do **not** add multi-MB PNGs.

---

## Performance — scroll (2026-06-18)

A round of scroll-performance fixes after persistent desktop jank (mobile was always smooth). Diagnosed by elimination: the demo pages — which use **no GSAP** — scroll perfectly, so the cause was the index's scroll-driven JS.

- **Lenis removed.** The smooth-scroll library re-animated wheel/trackpad input on its own loop — that's what stuttered (dragging the scrollbar bypassed Lenis and was always smooth, the key clue). ScrollTrigger works fine on native scroll; anchor links use `window.scrollTo({ behavior: 'smooth' })`.
- **Horizontal gallery → native scroll.** Was a GSAP `pin` + `scrub` that turned vertical scroll into a horizontal tween every frame (the heaviest desktop-only effect). Now a native `overflow-x` strip with click-and-drag (mouse) + swipe (trackpad).
- **Hero headline parallax removed** (it was a per-frame `scrub` animation).
- **Custom cursor** uses `transform: translate3d` instead of `left/top` (no per-frame layout).
- **Scroll progress bar + sticky nav**: one rAF-batched scroll listener, with the page height **cached** (no `scrollHeight` reflow on every wheel tick); the bar is driven by `transform: scaleX`.
- **Also removed:** `scroll-behavior: smooth` (fought Lenis), the `body` `background-color` CSS transition (GSAP drives it), and the header `backdrop-filter` blur lowered 20px → 10px.

The only scroll-driven JS left is the **Process/Showstopper pin** (cheap — toggles classes at phase boundaries, no per-frame tween) plus one-shot reveal animations.

---

## Analytics & SEO (2026-06-25 → 2026-06-27)

**Google Analytics 4** — `gtag.js` (measurement id `G-DS1HVCTGMS`) injected **right after `<meta charset>` on every deployed HTML page** (12 pages, incl. demos), now gated behind a consent banner (see [cookie banner](#analytics--seo-2026-06-25--2026-06-27) note below). Check hits in GA **Realtime**, not the home banner (which lags 24-48h). Note: Cloudflare's bot protection returns **403 to Google's Tag Assistant crawler**, so "tag not detected" there is a **false negative** — real browsers load it fine (verified: a browser-UA fetch of `simonr.fr` returns 200 with the tag present).

**On-page SEO (index.html):**
- `<title>` → *"Création de sites web au Havre · Simon Rioult"*; meta description reworked with local keywords.
- `<link rel="canonical">`, `geo.*` meta, **Open Graph** tags (link preview when sharing).
- **JSON-LD** `ProfessionalService` — `areaServed` Le Havre, no street address (service-area business).
- Single `<h1>` (the hero headline) — kept as-is for branding.

**Crawl control:**
- `robots.txt` (allow all) + `sitemap.xml` (homepage + mentions-legales only).
- **All demo pages carry `<meta name="robots" content="noindex, nofollow">`** (2026-06-27) so the fictional demo businesses never rank — they stay reachable via the gallery.

**Off-site (TODO, by Simon):** Google Search Console (submit `sitemap.xml`) + Google Business Profile (service-area, address hidden).

> ✅ **Cookie consent banner — done 2026-06-29.** GA4 runs in **Consent Mode v2** (`analytics_storage: denied` by default on every page); `js/consent.js` self-injects an Accepter/Refuser bar (brand palette, ink + coral). Choice stored in `localStorage` (`sr-consent`); a returning visitor who accepted re-grants before `gtag('config')` so their pageview is counted. No cookie is set before consent.

---

## Design system

### Palette — Cinematic bright theme

| Variable | Value | Usage |
|---|---|---|
| `--cream` | `#FAF6EF` | Base background, hero, FAQ |
| `--cream-2` | `#F2EBE0` | Cards, alternate surfaces |
| `--cream-3` | `#E8DDD0` | Borders on cream sections |
| `--ink` | `#18140E` | Deep warm black — text, dark scenes |
| `--ink-2` | `rgba(24,20,14,0.65)` | Secondary text |
| `--ink-3` | `rgba(24,20,14,0.32)` | Muted text, labels |
| `--coral` | `#E84C1A` | Primary accent — buttons, cursor, word reveals, marquee scene |
| `--coral-2` | `#FF6633` | Accent hover state |
| `--forest` | `#1B3528` | Deep green — stats, contact, word scenes |
| `--stone` | `#C9B99A` | Word panel wipe colour on cream sections |

### Typography
- Display/headings: **Playfair Display** (serif, 400–900) — `var(--serif)`
- Body text: **DM Sans** (sans-serif, 300–700) — `var(--sans)`

### Layout
- Max width: `1240px`
- Gutters: `clamp(22px, 5.5vw, 72px)` (fluid)
- Breakpoints: `900px` (burger + nav-links hidden, gallery stack, process stack), `768px` (gallery card sizing + mobile layout tweaks), `640px` (mobile)

---

## Portfolio sections (index.html)

The page is structured as 14 full-width **scenes** — each with its own background colour — that scroll like film frames.

**Nav:** L'approche · Réalisations · Tarifs · FAQ — plus "Me contacter" CTA. Transparent on cream hero, frosted-glass on scroll. **On mobile (≤900px) the inline links are hidden — navigation goes through the burger menu.**

### 01 — Hero (cream `#FAF6EF`)
Full viewport. Giant Playfair Display headline (`clamp(4rem → 12rem)`) in 3 masked lines that slide up on load.
- Line 1: dim "Les commerces"
- Line 2: "qu'on retient"
- Line 3: coral "nous font vivre une expérience."
- Sub-text: "Ils créent une impression durable dès la première visite en ligne. *Restaurants, bars et artisans du Havre.*"
- Kicker, CTA pair, badge (**6+ Démos sur-mesure** — reworded 2026-06-25, was "6+ Sites livrés"), scroll indicator, animated coral glow radial (`.hero-glow`/`.s-hero` isolated with `contain` + `will-change` for perf).

### 02 — Marquee (coral `#E84C1A`)
Bold full-colour strip: "Site Vitrine • Menu en ligne • Réservation • Design sur-mesure • Maquette offerte • Le Havre •" — infinite CSS scroll, pauses on hover.

### 03 — Giant word "RESTAURANTS" (ink `#18140E`)
Full viewport word reveal: foreground panel wipes away (GSAP `scaleX`), word clips in (`clip-path`).

### 04 — Impact / Stats (forest `#1B3528`)
2×2 grid on dark green. Each card staggers in on scroll. Animated count-up: `100%`, `8 jours`, `0 €`, `6+`. The `6+` card now reads **"Démos sur-mesure"** (honest framing — was "Commerces transformés", reworded 2026-06-25).

### 05 — Giant word "BARS & CAFÉS" (cream)

### 06 — Process / Showstopper (ink `#18140E`)
`260vh` pinned section (was `400vh` until 2026-06-30 — shortened because the scroll-through felt too long; phase boundaries are proportional to `progress*4` so less height = faster phase changes). 4 phases driven by GSAP ScrollTrigger scroll progress. Left: phase text + dot nav. Right: browser mockup with 4 cross-fading layers (empty state → skeleton → emerging brand → Maison Hortense). The mockup is pure CSS/SVG (no images).
**Mobile (≤900px):** the browser mockup is **stacked below the phase text** (both visible, centered); section reduced to `230vh`.

### 07 — Giant word "LE HAVRE" (coral)

### 08 — Réalisations — Horizontal gallery (cream)
**Native horizontal scroll** strip (`.real-track-outer` `overflow-x`). Navigate by **click-and-drag** (mouse), **swipe** (trackpad), or by **dragging the scrollbar** under the gallery (`.real-progress` is now a draggable thumb — key for Windows/mouse users with no trackpad swipe, added 2026-06-29). The thumb's width = visible portion, position = `scrollLeft`. Hover = image `scale(1.07)` + card `translateY(-8px)` + coral border. Each card has a `.rc-tier` badge: gold **"★ Signature"** or translucent **"Vitrine"**.
Cards: L'Écume · Le Tigre Doré · Le Margaux · Maison Hortense.
> Previously a GSAP `pin` + `scrub` (vertical scroll drove horizontal movement) — replaced with native scroll on **all** viewports for smoothness (see [Performance](#performance--scroll-2026-06-18)). On mobile the card image keeps a fixed `aspect-ratio` so the photo and its Vitrine/Signature badge stay visible.

### 09 — Giant word "SUR-MESURE" (forest)

### 10 — Tarifs (ink `#18140E`)
Two pricing cards stagger in. Prices count up on entry. Coral checkmark list. Featured card has coral border glow.
- Site vitrine — from 249 € (359 € → 250 € → 249 €)
- Site signature — from 549 € (749 € → 550 € → 549 €) — first checkmark now reads **« Inclus tout ce que contient le pack Vitrine »** (added 2026-06-25)

Below the cards: an optional **monthly maintenance** block (`.suivi`, added 2026-06-17) — two plans, rendered static (no scroll-reveal):
- **Sérénité — 24,89 €/mois** (2 modifications/month, managed hosting, monitored)
- **Sérénité + — 39,89 €/mois** (5 modifications/month + seasonal updates + "réponse prioritaire et très rapide" — no fixed SLA hours, reworded 2026-06-29; prices 24,99/49,99 → 24,89/39,89)

The section sub-title was reworded from "Pas d'abonnement" to reflect the optional monthly suivi.

### 11 — Giant word "QUALITÉ" (cream)

### 12 — Témoignage (coral `#E84C1A`)
Large italic Playfair quote on full coral background. Reveals on scroll entry. 3-step process grid below (On se parle → Maquette offerte → On lance).

### 13 — FAQ (cream)
Sticky 2-column layout. Accordion with coral sweep underline.

### 14 — Contact (forest `#1B3528`)
Giant headline (`clamp(3rem → 7rem)`): "Votre commerce mérite mieux qu'une absence." Primary CTA + email link. Subtle coral radial glow from bottom.

---

## JavaScript features (js/main.js)

Uses **GSAP + ScrollTrigger** (CDN) for scroll-triggered animations. Scrolling itself is native (Lenis removed). Vanilla JS for everything else.

| Feature | Description |
|---|---|
| **Native scroll** (Lenis removed) | Lenis (smooth scroll) was **removed 2026-06-18** — it caused desktop scroll jank. `lenis` is now permanently `null`; all references fall back to native behaviour. |
| **ScrollTrigger refresh on load** | `ScrollTrigger.refresh()` runs on `window.load` and after each `<img>` finishes — so pin/scroll positions are recalculated once heavy images are in (fixes pinned sections leaving blank gaps). |
| **Loader split-wipe** | "Simon." scrambles letter by letter → progress bar fills → top/bottom panels GSAP `yPercent` split apart. Once per session via `sessionStorage` key `sr-v4-intro`. |
| **Hero stagger timeline** | GSAP timeline: kicker fades up, `.mask-inner` lines slide from `translateY(110%)`, sub/actions/badge/scroll-ind cascade. Fires via `runHeroAnim()` after loader exits. |
| **BG colour morph** | Each `[data-scene]` element triggers `gsap.to('body', { backgroundColor })` on enter/back. 0.85s ease-out. |
| **Giant word reveals** | Per `.s-word`: foreground `.word-panel` `scaleX: 1→0` + `.word-text` `clip-path: inset(0 100%→0%)`. Triggered once at `top 65%`. |
| **Horizontal gallery (native)** | Native `overflow-x` scroll on `.real-track-outer` + pointer **click-and-drag** (6px move threshold so card links still click). The `.real-progress` bar is a **draggable scrollbar** (`syncBar()` sizes/positions the `.rp-fill` thumb; `barScrollTo()` maps a pointer drag back to `scrollLeft`). (Was GSAP `pin` + `scrub` — removed for performance.) |
| **Process pinned scroll** | ScrollTrigger pins `.proc-sticky` for the `260vh` section. `onUpdate` fires `setPhase()` — swaps `.active` phase, `.visible` browser layer, dot indicators. |
| **Count-up animations** | `[data-count]` and `.tc-big[data-count]`: GSAP object tween `{ val: 0 → target }` on ScrollTrigger `onEnter`. |
| **Parallax headline (removed)** | **Removed 2026-06-18** — was a per-frame `scrub` animation contributing to scroll jank. |
| **Scroll progress bar + nav** | `#spb` coral line driven by `transform: scaleX`. One **rAF-batched** scroll listener handles both the bar and the sticky nav; page height is **cached** (recomputed on resize / load / ScrollTrigger refresh) to avoid a `scrollHeight` reflow every scroll tick. |
| **Sticky nav** | Adds `.scrolled` (cream frosted glass) after 24px. |
| **Burger menu** | Toggles `.open` on `#mobMenu`, locks body scroll. Primary navigation on mobile. |
| **Custom cursor** | `#cur` sharp **ink/black dot** (with soft glow) + `#cur-ring` **soft black halo** that trails (0.11 lerp; blurred radial gradient), positioned via `transform: translate3d` (GPU). Halo swells on hover. **Adaptive (2026-06-30):** on dark scenes (`data-scene="ink"`/`"forest"`) an IntersectionObserver (thin centre band, runs even in reduced-motion) adds `body.cursor-on-dark` → dot + halo turn **coral** so it stays visible. Desktop only. (Coral until 2026-06-30, outlined ring until 2026-06-27.) |
| **Magnetic buttons** | `.btn` elements drift toward cursor, spring back on leave. Desktop + non-reduced-motion only. |
| **Smooth anchor scroll** | `href="#…"` links use native `window.scrollTo({ behavior: 'smooth' })`, `offset: -76`. (The old `lenis.scrollTo()` branch is dead code now that `lenis` is always `null`.) |
| **Page exit curtain** | Internal links trigger `#page-curtain.closing` split-panels, then navigate after 620ms. |
| **FAQ accordion** | One item open at a time. Height via `scrollHeight`. `aria-expanded` toggled. |

All interactive JS features guard on `(hover: hover)` (touch) and `prefers-reduced-motion`.

---

## CSS animation systems (css/style.css)

| System | Description |
|---|---|
| **Hero mask reveal** | `.mask-line { overflow: hidden }` clips `.mask-inner`. GSAP drives `y: 110%→0%` on load. |
| **Hero glow** | Coral radial gradient div behind headline — `glowPulse` keyframe (8s loop). `.hero-glow` + `.s-hero` carry `contain: layout paint` + `will-change: transform` to isolate repaints (2026-06-27). |
| **Scroll indicator** | `.scroll-line` draws/retracts via `scrollDrop` keyframe. |
| **Marquee** | `translateX(-50%)` roll at 22s. Pauses on hover. |
| **Word panel wipe / clip reveal** | `.word-panel` `scaleX: 1→0` + `.word-text` `clip-path` reveal. |
| **Process layer crossfade** | `.pl { opacity:0 }` → `.visible { opacity:1 }`. Phase swap via `.proc-phase.active`. |
| **Gallery card hover** | `.rc-img` `scale(1.07)` + card `translateY(-8px)` + coral `box-shadow`. |
| **Tier badges** | `.rc-tier--sig` gold gradient + glow; `.rc-tier--vit` translucent white pill. |
| **Nav / FAQ sweep lines** | `a::after` / `.faq-item::after` `width: 0→100%`. |
| **Scene backgrounds** | `[data-scene]` set `background-color`; the `body` colour is morphed by **GSAP** on scene enter (the CSS `body` transition was removed so it doesn't fight GSAP frame-by-frame). |
| **Page curtain** | `#page-curtain` split panels `scaleY: 0→1` on `.closing`. |

All systems respect `prefers-reduced-motion: reduce` — durations collapse to `0.01ms`.

---

## Demo pages

Each demo is a self-contained single-file site with a "← Retour au portfolio" pill linking back to **`index.html#realisations`** (lands on the gallery, not the top — changed 2026-06-27). Next to the pill sits a fixed **tier badge** (gold *"✦ Démo Signature"* or translucent *"Démo Vitrine"*, added 2026-06-20). Every demo page is **`noindex, nofollow`** so only the portfolio itself ranks (see [Analytics & SEO](#analytics--seo-2026-06-25--2026-06-27)).

| File | Establishment | Theme | Type |
|---|---|---|---|
| `menuisier-demo.html` | Ateliers Leroy | Walnut brown, amber accent | Vitrine |
| `le-tigre-dore-demo.html` | Le Tigre Doré | Deep red | Vitrine |
| `le-margaux-demo.html` | Le Margaux | Wine purple | Vitrine |
| `voltaique-bar-demo.html` | Atlantique Plomberie | Dark navy + gold | Signature |
| `maison-hortense-demo.html` | Maison Hortense | Forest green | Signature |
| `lecume-bistrot-demo.html` | L'Écume | Deep navy | Signature |

**Maps:** Vitrine demos use a `.map-link` pill (opens Google Maps); Signature demos embed a full Google Maps iframe.

### Atlantique Plomberie (4-page signature demo)
`voltaique-bar-demo.html` (home) · `plomberie-services.html` · `plomberie-galerie.html` · `plomberie-contact.html`. Photos: `img/plomberie/p01.jpg`–`p21.jpg`.

### Maison Hortense
Fully built signature demo (rich editorial site), reused as the "final result" layer in the Showstopper section. Photos: `img/hortense/` — 33 kebab-case JPEGs.

### L'Écume — Bistrot de la mer
Signature demo. All 7 photo slots **filled** (JPEG): `hero-seafood.jpg`, `salle-mer.jpg`, `quai-poissons.jpg`, `salle-tamisee.jpg`, `galerie-plateau.jpg`, `galerie-cabillaud.jpg`, `galerie-terrasse.jpg`.

### Le Tigre Doré / Ateliers Leroy
Vitrine demos, all photo slots filled (`img/tigre/`, `img/menuisier/`).

### Le Margaux
Vitrine demo. **Photo placeholder still missing:** `img/margaux/hero.jpg` — hero falls back to a CSS gradient. (This reference has been broken since before the JPEG migration; the `margaux/` folder doesn't exist.)

---

## Mentions légales (mentions-legales.html)

Standalone page, self-contained styles. Required by French LCEN law.

- Éditeur: Simon Rioult — Le Havre, 76620
- Téléphone: +33 7 49 88 86 10
- Email: simonrioultbonjour.fr@gmail.com
- SIRET: *en cours d'immatriculation* (fill on registration — 2026-07-05)
- Hébergeur: **GitHub, Inc. (GitHub Pages)** + **Cloudflare** (CDN/DNS) — corrected 2026-06-17 (the file previously listed Netlify, which was wrong).

> ✅ **Cookie banner — done 2026-06-29.** GA4 (added 2026-06-25) is now gated behind a CNIL/RGPD consent bar via **Consent Mode v2** + `js/consent.js`. See [Analytics & SEO](#analytics--seo-2026-06-25--2026-06-27).

---

## Global rules for demo sites

- "← Retour au portfolio" pill links to `index.html#realisations`; a tier badge (Signature/Vitrine) sits beside it. Position varies per demo (top-centre or bottom-centre), never over the main visual.
- Scroll reveal hidden state gated behind `html.js` class, 1800ms safety timeout.
- All JS effects disabled on touch devices (`(hover: hover)` check).

---

## Running locally

```bash
# from the project folder (mind the trailing space)
cd "/Users/simonrioultdenorme/Desktop/project 2k26/portfolio V3 vs code "
python3 -m http.server 3000   # → http://localhost:3000
```

Or use **VS Code Live Server** (right-click `index.html` → Open with Live Server).

> Always use a local server — fonts and relative paths behave differently on `file://`.

---

## Deployment & infrastructure

The site is live at **https://simonr.fr**.

| Layer | Detail |
|---|---|
| **Hosting** | GitHub Pages — repo `simonrioultbonjourfr-ui/SimonR`, branch `main`, `/ (root)`. `CNAME` file holds `simonr.fr`. |
| **Auth / push** | SSH (`git@github.com:simonrioultbonjourfr-ui/SimonR.git`), key `~/.ssh/id_ed25519`. |
| **Domain** | `simonr.fr`, registered at **Domaine.fr** (renews 14 June). Nameservers delegated to **Cloudflare**. |
| **DNS (Cloudflare)** | 4× `A simonr.fr` → `185.199.108–111.153` (GitHub Pages), **Proxied**. `CNAME www` → `simonrioultbonjourfr-ui.github.io`. |
| **HTTPS** | Served by **Cloudflare** (GitHub's own custom-domain cert check stayed stuck, so the Cloudflare proxy provides the certificate). SSL/TLS mode: Full. |

### Publishing an update
```bash
git add -A && git commit -m "…" && git push origin main
```
1. GitHub Pages redeploys automatically (a few minutes).
2. **Cloudflare caches CSS/JS/images aggressively (up to ~4 h).** After a change, either enable **Development Mode** (Caching → Configuration, bypasses cache 3 h) or **Purge Everything**, or you'll keep seeing the old version.
3. Browsers also cache locally — test in a **private/incognito tab** or append `?v=2` to bust it.

### Publishing a future client site (same recipe)
New GitHub repo → push static files → enable Pages (main/root) → in Cloudflare add the domain (or subdomain), point A/CNAME at the GitHub Pages IPs, Proxied.

---

## To-do / known placeholders

- **Le Margaux:** `img/margaux/hero.jpg` missing — hero falls back to a CSS gradient (pre-existing).
- **Mentions légales — Hébergeur:** ✅ done 2026-06-17 (corrected to GitHub Pages + Cloudflare).
- **SIRET:** fill in `mentions-legales.html` once registered (2026-07-05).
- Map coordinates in demo pages point to Le Havre city centre — update to real addresses once known.
- Phone numbers and addresses in demo pages are fictional.
- **Cookie consent banner (CNIL/RGPD)** — ✅ done 2026-06-29 (Consent Mode v2 + `js/consent.js`).
- **Favicon missing** — no `<link rel="icon">`, so `/favicon.ico` 404s on every page (offered, not done).
- **Off-site SEO** — set up Google Search Console (submit `sitemap.xml`) + Google Business Profile (service-area, no public address).
- **Prospecting** — pattern for free prospect maquettes: build at `simonr.fr/<client>`, set `noindex`, send the link, take it down if ghosted.
