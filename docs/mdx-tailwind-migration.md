# MDX + Tailwind Migration Strategy
Date: 2025-09-14
Status: Draft
Owner: (assign)

## 0. Objectives
Modernize the content pipeline and visual system to achieve:
1. Rich MDX story content (components, video embeds, image grids) with consistent styling.
2. Tailwind-driven design system (tokens, theming, accessibility) replacing ad‑hoc styled-jsx + global duplication.
3. Polished map → story transition on home page (progressive minimization of map, animated reveal of story panel) with responsive behavior.
4. Unified asset handling (images + video + future media) with optimization (Next.js image, lazy loading, aspect ratio control).
5. Improved authoring ergonomics (frontmatter schema, MDX components, linting, preview).

## 1. Current State (Condensed)
- Markdown parsed via remark + gray-matter → HTML string; images handled by regex rewriting.
- Story layout: Sidebar with raw HTML injection; Map uses OpenLayers with cluster markers.
- Styling: Mix of global.css + styled-jsx; no Tailwind; design tokens minimal.
- Tables used as layout hacks for image grids; no semantic components.
- No standardized video embedding; would require manual HTML.

## 2. Target Architecture Overview
```
src/
  components/
    map/
      MapClient.tsx
      StoryMap.tsx          (container orchestrating map + panel state)
      MarkerIcon.tsx
    stories/
      StoryLayout.tsx       (shell applied to each story page)
      StoryHeader.tsx       (title / meta / location)
      StoryBody.tsx         (prose wrapper)
      MDXComponents.tsx     (export component mapping for MDX provider)
      media/
        ImageGrid.tsx
        StoryImage.tsx
        VideoEmbed.tsx
        Figure.tsx
        Separator.tsx
    ui/
      Panel.tsx
      Tabs.tsx
      Button.tsx
      FocusTrap.tsx
  lib/
    mdx/
      mdx-pipeline.ts       (compile MDX with remark/rehype plugins)
      plugins/
        remark-frontmatter-validation.ts
        remark-image-normalize.ts
        rehype-slug-autolink.ts
    content/
      stories/ *.mdx
      media/ (shared assets)
  pages/
    index.tsx               (uses <StoryMap />)
    stories/[id].tsx        (loads compiled MDX + data)
    api/preview.ts          (draft preview mode)
  styles/
    tailwind.css            (@tailwind directives)
  config/
    contentlayer.config.(js|ts) (optional if using Contentlayer)
```

## 3. Technology Selections
| Concern | Choice | Rationale |
|---------|--------|-----------|
| Styling | Tailwind CSS + minimal global custom layer | Utility-driven consistency, design tokens via config extension. |
| MDX compilation | `@next/mdx` or custom with `next-mdx-remote`; optional Contentlayer for typed frontmatter | Content queries + type safety. |
| Images | Next.js `<Image />` with dynamic sizing + optional blur placeholder | Performance + responsive. |
| Video | `react-player` or native `<video>` + wrapper component | Flexible sources (YouTube, Vimeo) + consistent styling. |
| Map | Retain OpenLayers (mature) wrapped in client component; extract styling to Tailwind classes | Lower migration risk. |
| Animations | CSS (Tailwind transitions) + small framer-motion for panel / map size transitions | Smooth choreographed transitions. |
| Validation | Zod schema for frontmatter | Early failure & editor hints. |

## 4. Tailwind Integration Plan
1. Install Tailwind + PostCSS config.
2. Replace global font variable with Tailwind font family extension.
3. Extend theme:
```js
// tailwind.config.js (excerpt)
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,md,mdx}',
    './docs/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['TASA Orbiter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        primary: '#217dbb',
        primaryHover: '#3498db',
        brandDark: '#3a2c2a',
        brandInk: '#2c3e50',
        accent: '#ff6b6b',
        grayMid: '#666666',
        surface: '#ffffff',
        surfaceAlt: '#f7fafc',
        surfaceMuted: '#f8f9fa'
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0,0,0,0.1)',
        md: '0 4px 12px rgba(0,0,0,0.12)',
        panel: '0 8px 24px rgba(0,0,0,0.12)',
        modal: '0 10px 30px rgba(0,0,0,0.3)'
      },
      borderRadius: {
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px'
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
```
4. Use `prose` class (typography plugin) for MDX body; override specifics in `tailwind.css` with `@layer components`.
5. Gradually delete styled-jsx blocks after utilities cover them.

## 5. MDX Pipeline
Option A (Lightweight): next-mdx-remote + custom loader in `getStaticProps`.
Option B (Structured): Contentlayer for automatic type generation & caching.

Selected: Option B if build times acceptable (≤ few hundred stories). Fallback to A if complexity too high now.

### Frontmatter Schema (Zod)
```ts
const StoryMetaSchema = z.object({
  id: z.string().optional(), // derived from filename
  title: z.string(),
  name: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(), // ISO or human
  coordinates: z.tuple([z.number(), z.number()]),
  tags: z.array(z.string()).default([]),
  hero: z.string().optional(), // path to hero image
  status: z.enum(['published','draft']).default('published')
});
```

### MDX Component Mapping
| MDX Tag | Component | Description |
|---------|----------|-------------|
| `img` | `StoryImage` | Enforces responsive wrapper + caption extraction. |
| `ImageGrid` | `<ImageGrid images={[...]} />` | Replaces ad-hoc tables. Accepts children or array prop. |
| `Video` | `VideoEmbed` | YouTube/Vimeo/MP4. Props: `src`, `title`, `aspect=16/9`. |
| `Separator` | `Separator` | Replaces asterisk HR pattern. |
| `Callout` | `Callout` | Optional emphasis block. |
| `a` | Custom Link | Adds target, rel, focus styles. |
| `h1..h3` | Heading wrappers | Auto-generate ids, anchor links. |

## 6. Map + Story Interaction Redesign
Desired flow:
1. Full-width map on desktop with overlay prompt.
2. On marker click: panel slides in from right (or transforms from bottom on mobile) while map scales/shrinks to a corner (top-left card) with smooth easing, raising elevation (shadow) and maintaining interactivity (allow re-center or close story).
3. Panel includes sticky header (title + close/back), scrollable content body.
4. URL updates to `/stories/[id]` via shallow routing (Next.js `router.push` with `shallow: true`) for shareability and browser back support.
5. Closing panel reverses animation.

Implementation outline:
- Wrap map + panel in `StoryMap` component managing `selectedId` state.
- Use framer-motion LayoutGroup + `motion.div` for: map container scale/position, panel slide/fade.
- When `selectedId` set, compute reduced map size (e.g., fixed width 360px on desktop, height 240px on mobile) with responsive Tailwind classes + motion transitions.
- Preload MDX bundle for hovered markers (optional performance optimization).

## 7. Image Handling & Grids
Eliminate table layouts. Provide patterns:
- Single image: `<img />` auto-wrapped.
- Side-by-side: `<ImageGrid columns={2}> ...children... </ImageGrid>`.
- Masonry-esque: initial pass with CSS grid auto-flow dense.

`ImageGrid` Tailwind base classes:
```
<div className={cn('grid gap-6', cols === 2 && 'sm:grid-cols-2', cols === 3 && 'sm:grid-cols-3')}>
  {children}
</div>
```
Captions via `<Figure>` component: wraps image and caption with consistent spacing and typography.

## 8. Video Embedding
`<Video src="https://youtu.be/..." />` resolves provider type:
- If YouTube/Vimeo: responsive iframe wrapper using intrinsic ratio (`aspect-video`).
- If local MP4: HTML5 `<video controls>` with optional poster.
- Lazy load offscreen via `loading="lazy"` / intersection observer for iframes.

## 9. Accessibility & UX Enhancements
- Focus management: when panel opens, focus the story heading; restore focus to last marker on close.
- ARIA roles: panel `aria-labelledby` referencing h1 id.
- Keyboard shortcuts: Escape closes panel; arrow keys cycle markers (optional future).
- Reduced motion respect: disable scaling animation if `(prefers-reduced-motion: reduce)`.
- Color contrast validated via tokens.

## 10. Performance Considerations
| Concern | Mitigation |
|---------|------------|
| First Load CSS | Tailwind JIT purges unused selectors; limit custom CSS. |
| MDX Compilation Cost | Incremental static generation or Contentlayer caching. |
| Map Library Size | Dynamic `import()` Map component; only load on index page (no SSR). |
| Image Payload | Use Next `<Image>` with width/height or responsive `sizes` attribute. |
| Interaction Jank | Offload expensive layout recalculations; use transforms for map shrink animation. |

## 11. Migration Phases
| Phase | Scope | Output | Exit Criteria |
|-------|-------|--------|---------------|
| 1 | Tooling bootstrap | Tailwind setup, base theme tokens, typography plugin | Build passes, existing pages compile with Tailwind available (no visual overhaul yet). |
| 2 | MDX infra | Add MDX pipeline (parallel to markdown), convert 1 pilot story | Pilot story renders identically (or improved) with MDX components. |
| 3 | Story components | Implement StoryLayout, MDX component map, ImageGrid, Video | Pilot story uses new components; table layout removed. |
| 4 | Map refactor | Introduce StoryMap with animation, shallow routing | Smooth transition working; no console errors; accessible focus. |
| 5 | Batch conversion | Convert remaining markdown files to .mdx (script) | All stories in MDX; old markdown pipeline removed. |
| 6 | Cleanup & hardening | Remove styled-jsx duplicates, enforce tokens, stylelint | Zero styled-jsx (except map if needed); lint passes. |
| 7 | Enhancements | Prefetching, keyboard nav, dark mode tokens (optional) | Stretch goals validated. |

## 12. Risk & Mitigation
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Content conversion errors | Broken links/images | Write conversion script + validation report (image existence, frontmatter schema). |
| Map animation jank | Poor UX | Use transform + will-change; test on mid-tier devices. |
| Tailwind class proliferation | Readability | Extract frequently reused patterns into small components. |
| MDX security (HTML) | XSS risk | Avoid raw HTML injection; restrict allowed elements or sanitize. |
| Build time growth | Slow deploys | Incremental static regeneration or on-demand revalidation later. |

## 13. Tooling & Automation
- Add `npm run lint:content` script: frontmatter validation & dead image check.
- Add stylelint with custom rule: forbid raw hex outside Tailwind config (optional).
- Prettier plugin for Tailwind class sorting.

## 14. Story Authoring Guidelines (Draft)
```
---
title: "Sample Story"
location: "Chicago, IL"
coordinates: [-87.6298, 41.8781]
hero: ./hero.jpg
tags: ["recovery", "family"]
---

# Title (auto-rendered can be omitted if name is used)

<Separator />

<ImageGrid columns={2}>
  <Figure src="./photo1.jpg" caption="At the hospital" />
  <Figure src="./photo2.jpg" caption="First therapy session" />
</ImageGrid>

Some paragraph text with a [useful link](https://example.com).

<Video src="https://youtu.be/xyz" title="Therapy recap" />
```

## 15. Rollback Strategy
- Keep original markdown pipeline until Phase 5 completed; feature flag MDX route resolution.
- Maintain branch with stable version; revert by toggling environment variable `USE_MDX=false`.

## 16. Acceptance Criteria (Key)
- Map transition: ≤ 300ms main animation, 60fps on modern laptop, accessible focus transfer.
- Story typographic rhythm consistent across all stories (no styled-jsx overrides required).
- Images never overflow container; grid collapses gracefully to single column on <640px.
- Video embeds responsive and keyboard accessible (tab to controls).
- No inline `onclick` or style attributes in final story HTML.

## 17. Immediate Next Steps (Suggested)
1. Initialize Tailwind + typography plugin.
2. Create pilot MDX story (convert one existing `.md`).
3. Build MDX component mapping with basic `StoryImage`, `Separator`.
4. Prototype map + panel animation using framer-motion in isolation.

## 18. Open Questions
- Use Contentlayer for type-safety now or defer? (Decide before pilot.)
- Need dark mode / high contrast variant? (Impacts token naming.)
- Do stories require localization later? (Affects file organization.)

---
End of document.

## Status Check v0.1.0 (2025-09-14T19:00:00Z)

Periodic migration tracking entry.

### High-Level
Tailwind + base MDX wiring completed. Advanced story components, frontmatter-driven metadata, and map refactor pending. Build is stable after debugging remark plugin chain.

### Phase Progress
| Phase | Status | Delta vs Plan |
|-------|--------|---------------|
| 1 Tooling bootstrap | DONE | Matches plan. |
| 2 MDX infra | PARTIAL | Demo page only; no real story yet; frontmatter parsing disabled temporarily. |
| 3 Story components | NOT STARTED | Need StoryLayout, ImageGrid, VideoEmbed, Figure. |
| 4 Map refactor | NOT STARTED | Awaiting metadata index + story layout. |
| 5 Batch conversion | NOT STARTED | Blocked by frontmatter schema & tooling. |
| 6 Cleanup & hardening | NOT STARTED | Styled-jsx still present; no content linting. |
| 7 Enhancements | NOT STARTED | Deferred intentionally. |

### Completed Artifacts
- Tailwind config/theme + typography plugin.
- MDX loader (custom) + provider mapping (`StoryImage`, headings, links, `Separator`).
- Demo MDX page builds successfully.
- Change log & migration strategy docs maintained.

### Key Gaps
1. Frontmatter extraction + validation (to power map & listings)
2. Real story conversion (choose `ayse.md` first)
3. StoryLayout & media components
4. Metadata index generation
5. Map panel animation scaffold

### Risks & Notes
- Reintroducing frontmatter plugins must avoid prior preset error—will add custom minimal parser plugin if needed.
- Map animation complexity could expand scope; start minimal (shrink map + slide-in panel).

### Immediate Recommended Order
1. Implement frontmatter schema + extraction (Zod) and build metadata index.
2. Convert first story to MDX using schema.
3. Create StoryLayout + media components (ImageGrid, Figure, VideoEmbed).
4. Introduce metadata-driven map listing (no animation yet).
5. Add framer-motion animations.

### Pending Decisions
- Contentlayer adoption timing.
- Draft vs published frontmatter usage.

---
End Status Check v0.1.0

## Status Check v0.2.0 (2025-09-14T21:30:00Z)

### Delta Since v0.1.0
- Added frontmatter schema (Zod) and custom YAML export remark plugin (replacing failing preset).
- Implemented media components: `Figure`, `ImageGrid`, `VideoEmbed`.
- Created `StoryLayout` scaffold.
- Converted first real story (`ayse.mdx`) with enriched metadata.
- Added metadata indexing utility (`getStoriesMeta`).
- Resolved recurring “empty preset” error via custom plugin approach.

### Updated Phase Progress
| Phase | Status | Notes |
|-------|--------|-------|
| 1 Tooling bootstrap | DONE | Stable. |
| 2 MDX infra | PARTIAL | Real story converted; dynamic story route still using legacy markdown pipeline. |
| 3 Story components | PARTIAL | Base layout + core media components present; Callout & advanced heading anchors pending. |
| 4 Map refactor | NOT STARTED | Requires metadata index integration + MDX story route. |
| 5 Batch conversion | NOT STARTED | Await scripting & validation tool. |
| 6 Cleanup & hardening | NOT STARTED | styled-jsx still used; no lint:content script yet. |
| 7 Enhancements | NOT STARTED | Deferred. |

### Completed Artifacts (New This Version)
- `src/lib/mdx/schema.js`, `remark-frontmatter-export.js`.
- `src/lib/mdx/getStoriesMeta.js` (initial metadata indexer).
- `src/components/stories/StoryLayout.js`.
- `src/components/mdx/{Figure,ImageGrid,VideoEmbed}.js`.
- `src/content/stories/ayse.mdx`.

### Outstanding Gaps
1. Replace legacy `/stories/[id].js` markdown rendering with MDX aware loader (import MDX modules & frontmatter).
2. Expose metadata index to homepage map (static JSON or in-memory during build) and wire coordinates.
3. Implement validation/diagnostic script: check images exist, coordinates present, required fields.
4. Begin second & third story conversions to validate repeatability & uncover schema edge cases.
5. Start map refactor skeleton (`StoryMap` with panel placeholder) before animation polish.
6. Introduce `lint:content` script (Zod pass + dead image scan) into CI.

### Risks (Reassessed)
| Risk | Change | Mitigation |
|------|--------|------------|
| Frontmatter regression | Lower | Custom plugin isolates logic. |
| Inconsistent story layouts | Medium | Enforce `StoryLayout` adoption when migrating each story. |
| Map refactor scope creep | Unchanged | Implement minimal panel first. |
| Bulk conversion errors | Emerging | Add dry-run conversion script before Phase 5. |

### Immediate Focus Recommendation
1. MDX dynamic story route replacement.
2. Hook metadata index into homepage (even without animation) to validate coordinate usage.
3. Convert 2–3 more stories to pressure test components & layout.

### Pending Decisions (Still Open)
- Contentlayer adoption (defer until after verifying manual index suffices or build performance suffers).
- Draft stories support (flip later if editorial workflow demands it).

---
End Status Check v0.2.0
