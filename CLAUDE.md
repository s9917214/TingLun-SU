# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **academic portfolio website** designed for graduate school applications. It's a static, single-page application (SPA) built with vanilla HTML5, CSS3, and JavaScript, inspired by professional research institute design (Max Planck Institute aesthetic). The portfolio showcases research projects, publications, patents, and technical expertise.

**Target audience**: Graduate school admission committees, research professors, and academic recruiters.

## Architecture

### Static Site Structure
- **Single HTML file** (`index.html`): Contains all content sections in semantic HTML5
- **Single CSS file** (`style.css`): Complete styling system with CSS custom properties
- **Single JavaScript file** (`script.js`): All interactive features and animations
- **No build process**: Direct deployment to GitHub Pages

### Content Sections (in order)
1. **Overview** - Researcher profile, interests, statistics, contact info
2. **Research Projects** - Industry-academia collaborative projects with video demonstrations
3. **Publications** - Journal articles with DOI links, metrics, and BibTeX export
4. **Patents** - Granted and pending patents with classification info
5. **Technical Expertise** - Skill bars and technology badges
6. **Contact** - Multi-channel contact info and research statement

### Video Integration System
The site supports **three video embedding methods** for research demonstrations:

1. **YouTube** (recommended) - Uses iframe embed with video ID
2. **Google Drive** - Uses Drive file preview with file ID
3. **Local videos** - HTML5 `<video>` element with multiple source formats

Video wrappers use `data-video-type` attribute to distinguish types. See VIDEO_GUIDE.md for detailed embedding instructions.

## Key Design Patterns

### CSS Architecture
- **CSS Custom Properties** (`:root` variables) for theming - all colors, spacing, shadows defined centrally
- **BEM-like naming**: `.section-title`, `.pub-content`, `.patent-card`, etc.
- **Mobile-first responsive**: Grid layouts collapse to single column on mobile
- **Print-friendly**: Dedicated `@media print` styles hide navigation and videos

### JavaScript Features
- **Intersection Observer API** for scroll animations and lazy loading
- **No dependencies**: Pure vanilla JavaScript (ES6+)
- **Debounced scroll handlers** for performance
- **Modular feature functions**: Each feature is self-contained

### Interactive Elements
- Smooth scroll navigation
- Active section highlighting in navbar
- Mobile hamburger menu
- Animated statistics counters
- Skill bar progress animations
- Lazy-loaded videos
- BibTeX copy-to-clipboard
- Scroll-to-top button
- Keyboard shortcuts (1-6 for sections, ESC to close menu)

## Development Workflow

### Local Development
```bash
# No build step required - just open the file
# Option 1: Double-click index.html
# Option 2: Use Live Server (VS Code extension)
# Option 3: Python HTTP server
python -m http.server 8000
```

### Testing Checklist
Test on multiple browsers and devices:
- Desktop: Chrome, Firefox, Safari
- Mobile: iOS Safari, Chrome Mobile
- Responsive breakpoints: 1024px, 768px, 480px
- Print preview (Ctrl+P)

### Video Testing
Verify all three video types load correctly:
- YouTube: Check video ID is valid and video is public/unlisted
- Google Drive: Ensure share settings are "Anyone with link"
- Local: Confirm video files exist in `videos/` folder

## Common Customization Tasks

### Changing Personal Information
1. Search `index.html` for placeholder text (e.g., "蘇挺綸", "s9917214@gmail.com")
2. Replace with actual information
3. Update statistics in `.stat-value` elements

### Adding/Removing Projects
Each project is an `<article class="research-project">` block. Copy entire block to add new project. Structure:
- `.project-header` - Title, year, status
- `.project-video-container` - Video embed
- `.project-details` - Abstract, technologies, outcomes, publications

### Modifying Color Scheme
Edit CSS custom properties in `style.css` `:root`:
- `--color-primary` - Main dark color
- `--color-accent` - Interactive elements (links, buttons)
- `--color-highlight` - Emphasis color

### Adding Publications
Each publication is a `.publication-item` with:
- `.pub-badges` - Journal type, Q-rating, Impact Factor
- `.pub-title`, `.pub-authors`, `.pub-venue` - Bibliographic info
- `.pub-abstract` - Summary
- `.pub-links` - DOI, PDF, BibTeX links

## Important Implementation Details

### Video Lazy Loading
Videos only load when scrolled into viewport using Intersection Observer. Prevents initial page load slowdown.

### Mobile Menu Toggle
JavaScript adds/removes `.active` class on `.nav-menu` and animates hamburger icon spans with transforms.

### Stat Counter Animation
Uses `requestAnimationFrame` for smooth number counting animation when stats section enters viewport.

### BibTeX Generation
`addCopyBibTexFeature()` dynamically generates BibTeX from DOM content and copies to clipboard using Navigator API.

### Google Drive URL Formatting
`updateGoogleDriveVideos()` extracts file ID from various Drive URL formats and normalizes to `/preview` endpoint.

## Browser Compatibility
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Uses Intersection Observer API (no IE11 support)
- CSS Grid and Flexbox layouts
- ES6+ JavaScript features

## Deployment
GitHub Pages deployment:
1. Push files to repository named `username.github.io`
2. Enable Pages in Settings → Pages
3. Select `main` branch
4. Site available at `https://username.github.io`

No build or compilation step required - all files are production-ready.

## File Dependencies
- `index.html` → `style.css` (stylesheet link)
- `index.html` → `script.js` (script tag at end of body)
- Video files (if using local videos) → `videos/` directory
- Optional: `papers/` directory for PDF downloads

## Performance Optimization
- Videos use lazy loading (Intersection Observer)
- Scroll events use debouncing (50ms delay)
- Images should be compressed before upload
- Minimal external dependencies (self-contained)

## Accessibility Features
- Semantic HTML5 elements
- ARIA attributes on interactive elements
- Keyboard navigation support (tabindex on badges)
- High contrast color ratios
- Print stylesheet for academic contexts
