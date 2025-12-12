# Style & UI Consistency Audit

Date: 2025-09-14
Repository: `writingwithaphasia`

## Scope
Audit covers visual styling and frontend code patterns across:
- Global CSS (`src/styles/global.css`)
- Component‑scoped styled‑JSX blocks in pages/components
- Font management (`src/styles/fonts.js`)
- Markdown → HTML pipeline (`src/utils/markdown.js`)
- Asset organization under `static/`

## Summary (Executive Overview)
The project mixes three styling strategies (global CSS, inline styled‑JSX per component, and ad‑hoc element attributes/styles applied during markdown processing). Core typography is centralized, but color tokens, spacing scale, and component states are not. There is duplicated HR / link / image styling logic across global CSS, `Sidebar`, and markdown transforms. Map + layout containers rely on bespoke class names with inline layout rules. Overall maintainability risk is moderate; introducing a design token layer and extracting repeated patterns would reduce churn.

## Detected Styling Mechanisms
| Mechanism | Files Using | Notes |
|----------|-------------|-------|
| Global CSS (global.css) | `_app.js` (import), all DOM | Resets, scrollbar hiding, link styles, story content theming. |
| styled-jsx (scoped) | Most pages/components (`index.js`, `resources.js`, `Sidebar.js`, `ImageModal.js`, `_app.js`) | Encapsulates local styles; occasionally duplicates global rules. |
| Inline style attributes generated in markdown | `markdown.js` (image `style="cursor: pointer;"`) | Hard-coded; bypasses tokens. |
| SVG/inline data URIs | `Map.js` (gray pin) | Inlined base64 SVG without central color variable. |
| CSS Variables | `--font-family-primary` only | Only typography captured as variable; no variables for colors, spacing, radii, shadows. |

## Theme / Design Tokens Assessment
Currently only: `--font-family-primary`.
Missing potential tokens:
- Colors: primary (#217dbb), primary-hover (#3498db), text-dark (#2c3e50 / #3a2c2a / #222), accent (#ff6b6b), neutral grays (#666, #888, #9CA3AF, #bcbcbc, #e0e0e0, #f7fafc, #f8f9fa)
- Background surfaces: light panel (#f7fafc), overlay (#ffffff vs #f8f9fa), modal backdrop rgba(0,0,0,0.8)
- Spacing scale: (4, 8, 12, 16, 20, 24, 32, 40) used inconsistently (e.g., 1.2rem, 1.08rem, 0.5rem, 2.3rem)
- Radius values: 4px, 6px, 8px, 12px, 16px
- Shadow presets: map card shadow, image hover shadows, modal shadow all unique numbers
- Transition durations: 0.2s, 0.3s, 1s, 150ms, 200ms, 400ms appear without unification

## Typography
| Context | Font Sizes & Weights Observed | Issues |
|---------|-------------------------------|--------|
| Navbar | 2.1rem title, links 1.08rem uppercase 600 | Non-integer rem usage (1.08rem) hinders scale; uppercase letter-spacing (0.18em) ad-hoc. |
| Headings in stories | h1: 2rem center, h2:1.25rem, h3:1.08rem | Slight mismatch to resource page h1 (2.3rem). |
| Resources page | h1: 2.3rem; body 1.15rem; list 1.08rem | Divergent sizing from story content (1.08rem). |
| Body/story | ~1.08rem line-height 1.55 | Acceptable readability; would benefit from consistent modular scale (e.g., 1.0, 1.125, 1.265, 1.424...). |
| Captions | 0.9rem italic/center | Consistent but implemented in multiple places. |

Recommendation: Define a typographic scale (base 16px → 1.125 modular) and map semantic tokens (--font-size-body, --font-size-h1, etc.). Replace decimal ad-hoc values like 1.08rem.

## Color Usage Inventory
| Color | Hex / RGBA | Usage Examples | Comment |
|-------|------------|----------------|---------|
| Primary | #217dbb | Links, buttons, active tab text | Tokenize. |
| Primary Hover | #3498db | Link hover, headings color in resources | Tokenize; unify heading color vs link color. |
| Brand Dark 1 | #3a2c2a | Navbar title, overlay text | Needs naming. |
| Brand Dark 2 | #2c3e50 | Headings in stories, resource body text | Conflict—two dark bases. |
| Accent Red | #ff6b6b | Map cluster pins | Should be --color-accent-warn or similar. |
| Gray Mid | #666 | HR decorative, captions, placeholder text | Tokenize --color-text-secondary. |
| Gray Light | #888 | Decorative HR alt | Token. |
| Gray Border | #bcbcbc, #e0e0e0, #e9ecef | Navbar border, map controls, modal caption border | Consolidate border color tokens. |
| Panel BG | #f7fafc | Navbar background, resource container | Token --color-surface-alt. |
| Off White | #f8f9fa | Body background, modal caption BG | Token --color-surface. |
| Overlay Backdrop | rgba(0,0,0,0.8) | Image modal | Could standardize overlay alpha levels. |

## Repetition & Duplication
- Link styles defined globally and redefined inside `.story-content :global(a)` and resources tab content.
- HR decorative rule duplicated in global CSS and inside `Sidebar` styled-jsx block.
- Image hover scaling & shadow effects defined both for grid images and inline story images with slightly different shadows.
- Font family declarations repeated despite existence of CSS variable helper (`getFontFamilyVar()`).
- Multiple custom transitions each with unique durations (150ms, 200ms, 300ms, 400ms, 1s) without shared token.

## Structural/Layout Inconsistencies
| Area | Pattern | Concern |
|------|---------|---------|
| Main layout | `index.js` flex row splitting map + sidebar; mobile media queries embedded inside page component | Harder to reuse responsive rules elsewhere (e.g., resources page not sharing layout primitives). |
| Sidebar content width | `max-width: 52rem` internal | Magic number; no global container width token. |
| Resources container | `max-width: 700px` with padding 2rem | Different max width vs sidebar content (832px). |
| Modal sizing | `max-width: 90vw` vs other panels with fixed radii | Should share surface tokens & radii scale. |

## Accessibility & UX Findings
| Topic | Observation | Suggestion |
|-------|-------------|-----------|
| Color contrast | Primary link #217dbb on white OK; gray #666 on white borderline for small text but passes (4.5+). | Ensure tokens maintain contrast ratios. |
| Focus states | Buttons & links rely solely on color hover; no explicit focus outlines removed but custom backgrounds might mask default outlines. | Add visible focus styles (outline or box-shadow) tokens. |
| Click targets | Close buttons (32px/40px) OK. Tab buttons fine. | Standardize min hit size token. |
| Motion | Zoom animations quick; sidebar transition 1s may feel slow relative to other 150–400ms animations. | Harmonize to ~200–300ms standard duration scale. |
| Scrollbar hiding | Global removal of scrollbars can impact discoverability & accessibility. | Reconsider full removal; provide visible scroll on content areas. |

## Markdown Processing Specifics
- Adds inline `style="cursor: pointer;"` on images; better to add a class (e.g., `.clickable-image`) and style via CSS.
- Rewrites links to add `target` & `rel` (good), but global CSS attempts to set `target: _blank;` which is not a valid CSS property (bug: `a[href^="http"] { target: _blank; }`).
- HR transformation duplicates styling logic already in global & sidebar CSS; centralize via a single `.story-separator` class and transform to `<hr class="story-separator" />`.

## Asset Organization Observations
- Mixed `static/img` vs `static/images` (markdown utils expect `static/images`). Directory of existing story images uses `static/img/<story>`. Potential mismatch (bug risk) between `imagesDirectory` path and actual folder names.
- Inconsistent file naming cases/extensions (`.JPEG`, `.JPG`, `.jpg`) — increases risk of case-sensitive deployment issues.
- Some filenames contain spaces (e.g., `after shave.jpg`) leading to URL encoding complexities.

## Code-Level Styling Concerns
| File | Issue | Example | Recommendation |
|------|-------|---------|----------------|
| global.css | Invalid CSS property | `a[href^="http"] { target: _blank; }` | Remove rule; logic handled in HTML. |
| Sidebar.js | Duplicated HR & link styles | `.story-content :global(hr)` | Replace with shared class & tokens. |
| Map.js | Inline base64 SVG color not tokenized | Gray pin fill `#9CA3AF` | Reference `--color-neutral-400`. |
| resources.js | Hard-coded spacing/radii | `border-radius: 16px;` | Use token `--radius-xl`. |
| ImageModal.js | Unique shadow values | `box-shadow: 0 10px 30px rgba(...)` | Introduce shadow scale tokens. |
| fonts.js | Only font family tokenized | No color/spacing tokens | Expand token module. |
| markdown.js | Inline styles & direct DOM onclick | `<img ... style="cursor:pointer" onclick=...>` | Use delegation or data attributes & class. |

## Consistency Ratings (Subjective)
| Category | Rating (1=low consistency, 5=high) | Notes |
|----------|-------------------------------------|-------|
| Typography | 3 | Single family unified, sizes ad-hoc. |
| Color | 2 | Many hex codes, few abstractions. |
| Spacing | 2 | Arbitrary rem values & px. |
| Components reuse | 2 | Layout & panel styles bespoke. |
| Accessibility styling | 2 | Focus & scrollbars not standardized. |

## Recommended Remediation Roadmap
1. Token Layer (Foundations)
   - Create `:root` variables in `global.css` (or separate `tokens.css`): colors, spacing, radii, shadows, durations, font sizes.
   - Replace raw literals incrementally (search/replace plan).
2. Shared Utility Classes
   - `.container`, `.panel`, `.story-separator`, `.visually-hidden`, `.focus-ring`.
3. Markdown Output Normalization
   - Emit semantic classes: `<hr class="story-separator" />`, wrap images with figure optionally, remove inline styles.
4. Refactor Duplications
   - Centralize link styling (only global + focus variant), remove duplicates in styled-jsx.
   - Extract HR decorative style to one place.
5. Asset Alignment
   - Rename `static/img` → `static/images` (or adjust code to point to `img`).
   - Normalize filenames: lowercase, hyphen-separated, consistent extension `.jpg` or `.jpeg`.
6. Accessibility Enhancements
   - Add focus styles: `a:focus-visible, button:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }`.
   - Re-enable scrollbars in scrollable content or provide custom styling.
7. Animation Harmonization
   - Define `--transition-fast: 150ms`, `--transition-base: 250ms`, `--transition-slow: 400ms`; use easing tokens.
8. Documentation & Linting
   - Add this audit + a condensed style guide section to repo.
   - Optionally add a stylelint config to enforce token usage.

## Proposed Design Tokens (Draft)
```
:root {
  /* Typography */
  --font-family-primary: 'TASA Orbiter', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-md: 1.125rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-3xl: 2.5rem;
  --line-height-base: 1.55;

  /* Color */
  --color-text: #2c3e50;
  --color-text-strong: #3a2c2a;
  --color-text-secondary: #666666;
  --color-primary: #217dbb;
  --color-primary-hover: #3498db;
  --color-accent: #ff6b6b;
  --color-border: #e0e0e0;
  --color-border-strong: #bcbcbc;
  --color-surface: #ffffff;
  --color-surface-alt: #f7fafc;
  --color-surface-muted: #f8f9fa;
  --color-overlay: rgba(0,0,0,0.8);
  --color-focus: #145a8a;

  /* Spacing (factor of 4) */
  --space-0: 0;
  --space-1: 0.25rem; /*4px*/
  --space-2: 0.5rem;  /*8px*/
  --space-3: 0.75rem; /*12px*/
  --space-4: 1rem;    /*16px*/
  --space-5: 1.25rem; /*20px*/
  --space-6: 1.5rem;  /*24px*/
  --space-8: 2rem;    /*32px*/
  --space-10: 2.5rem; /*40px*/

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.12);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --shadow-modal: 0 10px 30px rgba(0,0,0,0.3);

  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 250ms;
  --transition-slow: 400ms;
  --ease-standard: cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

## Condensed Style Guide (Actionable)
1. Always use design tokens; do not hard-code hex colors or px (except rare vendor components).
2. Use semantic class names (`.panel`, `.story-separator`, `.image-grid`) instead of repeating styled-jsx blocks.
3. Limit layout max widths to tokens (`--layout-max-readable: 52rem; --layout-max-narrow: 44rem;`).
4. Replace decimal ad-hoc font sizes (1.08rem, 2.3rem) with the token scale.
5. Remove invalid CSS (`target: _blank;`).
6. Centralize link style once; in components only override when necessary.
7. Provide focus-visible outline using `--color-focus`.
8. Avoid inline `onclick`; use delegation or React handlers with `data-` attributes.
9. Keep animation durations to `--transition-*` tokens. Sidebar transition ≤ 400ms.
10. Asset naming: lowercase, hyphen-separated; prefer `.jpg` (or `.webp` for optimization) and store under a single root directory aligning with code references.

## Quick Wins (Low Effort / High Impact)
- Remove `target: _blank;` CSS rule (bug).
- Introduce tokens for primary colors & apply to navbar/resources/stories.
- Refactor HR styling duplication into one rule with a class.
- Add focus-visible styles globally.
- Align `static/images` path mismatch before new stories rely on wrong directory.

## Longer-Term Enhancements
- Add automated lint step: stylelint + custom rule disallowing unknown color literals.
- Consider CSS extraction from styled-jsx to CSS Modules or a utility-first approach if scale increases.
- Introduce theming capability (dark mode) by scoping tokens under `[data-theme="dark"]` once tokens exist.

---
Prepared automatically by audit script (conceptual). Update as refactors proceed.

## 2025 Q3 Palette Adoption

New core palette introduced (added to Tailwind config + CSS variables):

| Name | Hex | CSS Variable | Tailwind Key | Intended Semantic Usage |
|------|-----|--------------|--------------|-------------------------|
| Ink | `#3C494B` | `--color-ink-strong` | `ink` | Primary headings, high-emphasis text, active tab state |
| Rust | `#A14100` | `--color-accent-rust` | `rust` | Primary action buttons, key interactive accents, focus ring alt |
| Sunrise | `#FE8E3D` | `--color-accent-warm` | `sunrise` | Hover state for Rust buttons, subtle highlight backgrounds, badges |
| Mist | `#D8E7EA` | `--color-surface-mist` | `mist` | Soft panels / resource containers / neutral section backgrounds |

Adoption Strategy:
1. Dual-run period where old `--color-primary`/`--color-primary-hover` remain for stories until tokens updated.
2. New components should prefer the refreshed palette (Ink for text, Rust for primary actions, Sunrise for hover states, Mist for subtle panels) unless maintaining story visual continuity.
3. When replacing legacy blues (#217dbb / #3498db), map: base link → Rust, hover → Sunrise. Avoid recoloring historical imagery callouts unless contrast fails.
4. Perform accessibility contrast verification before applying Sunrise as foreground on Mist (meets >4.5:1 for text at 14px+ bold or 18px normal only if contrast passes; otherwise default to Ink).

Refactoring Checklist (in progress):
- [x] Globals: Added CSS variables & link color swap
- [x] Resources page: migrated container, links, buttons, and active tabs
- [ ] Navbar: migrate title and link hover to palette
- [ ] Buttons (if any scattered styled-jsx): align to Rust/Sunrise
- [ ] StoryMap overlays: replace `#3a2c2a` with Ink token
- [ ] ImageModal / overlays: evaluate Rust or neutral for actions
- [ ] Remove obsolete `--color-primary*` after full migration

Tailwind Usage Examples:
```
<h1 className="text-ink">Heading</h1>
<button className="bg-rust hover:bg-sunrise text-white px-4 py-2 rounded-md">Action</button>
<div className="bg-mist p-6 rounded-xl shadow-sm">Panel</div>
```

CSS Variable Fallback Example (styled-jsx):
```
button.callout { background: var(--color-accent-rust); }
button.callout:hover { background: var(--color-accent-warm); }
```

Do not introduce raw hex values for these tones going forward—always reference token names for easier future theming.
