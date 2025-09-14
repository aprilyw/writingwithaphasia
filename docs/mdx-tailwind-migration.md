# MDX + Tailwind Migration Strategy
Date: 2025-09-14
Status: Working Draft (Chronologically Organized)
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

## 11. Migration Phases (Planned)
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
---
## 19. Chronological Timeline

This section records actual progress in time order. Earlier fictional / speculative future sections have been removed to avoid confusion. Only verifiable repository state changes are listed.

### v0.1.0 (2025-09-14T19:00Z) – Bootstrap
Summary:
- Tailwind configured (`tailwind.config.js`, typography plugin) and imported in `_app.js`.
- Initial MDX wiring via custom webpack rule + provider mapping.
- Demo MDX page renders (no real story converted yet).
Gaps Identified:
- Frontmatter extraction strategy unstable (plugins temporarily removed pending schema work).
- No story components (ImageGrid, Figure, VideoEmbed) implemented yet.
Next Focus (then): add schema + convert first story.

### v0.2.0 (2025-09-14T21:30Z) – Pilot Components (Partial)
Implemented:
- Zod frontmatter schema draft (`schema.js`).
- Custom remark frontmatter export plugin to avoid preset instability.
- Story media components (`Figure`, `ImageGrid`, `VideoEmbed`), `StoryLayout` scaffold.
- First real MDX story `ayse.mdx` converted.
- Metadata index utility (`getStoriesMeta.js`).
Open Items:
- Dynamic story route still hybrid / legacy; map not consuming MDX metadata yet.
- Need validation + lint pass.

### v0.2.1 (2025-09-14T22:15Z) – Hybrid Enablement Note
Internal checkpoint documenting intent to support both markdown + MDX during transition.

### v0.2.2 (2025-09-14T22:40Z) – Lint & Test Story
Additions:
- Test MDX story exercising all components.
- `scripts/lint-content.js` added with `npm run lint:content` for schema + image existence validation.
- Homepage now merges legacy markdown data with MDX metadata for a hybrid index.
Outstanding:
- Frontmatter parsed twice (webpack export + regex in route) – unify later.
- Map still CSS-only transitions, no shallow routing.

### v0.3.0 (2025-09-14T23:30Z) – API / On‑Demand Loading
Additions:
- API route (or logic) for dynamic sidebar MDX fetch (hybrid loading) – reduces initial payload.
- Sidebar renders MDX stories via `MDXRemote` mapping; semantic cleanup (no nested figures).
Still Pending:
- Shallow routing from markers, focus management, animation choreography.
- Batch conversion of remaining markdown stories.

### v0.4.0 (2025-09-14T23:59Z) – StoryMap Extraction & MDX Hardening
Additions:
- Extracted map + sidebar orchestration into dedicated `StoryMap` component (clean separation for future animation layer).
- Implemented shallow routing (`router.push('/stories/[id]', undefined, { shallow: true })`) and story auto-open on direct visit; basic focus restoration (heading focus on open, marker focus on close) in place.
- Converted navbar styling from styled-jsx to Tailwind utilities; removed large legacy CSS block in `_app.js`.
- Fixed MDX rendering edge cases:
  - Standardized on remark frontmatter export plugin during both webpack and `next-mdx-remote` serialization paths.
  - Sanitized legacy HTML comments (`<!-- -->` → `{/* */}`) in stories to prevent MDX parse errors (introduced preprocessing step in `[id].js`).
  - Added `scope: { frontmatter }` to MDX serialization for reliable variable access in content.
- Updated Next.js `<Link>` usages to new API (removed nested `<a>` in story page) eliminating runtime navigation error.

Improvements:
- Reduced duplication / cognitive overhead in `index.js`; logic now centralized, enabling easier animation refactor (Framer Motion integration next).
- De-risked migration by ensuring hybrid legacy + MDX stories now load consistently in both dedicated route and sidebar dynamic fetch.

Outstanding (Carried Forward):
- Batch conversion of additional markdown stories to MDX.
- Animation scaffold (map shrink + panel slide) still CSS-only; will replace with motion primitives.
- Asset normalization beyond pilot (`ayse`) pending (update hero + inline references after moves).

Notes:
- Add follow-up lint rule to forbid raw `<!--` sequences in MDX to prevent regression.
- Consider moving HTML comment sanitization into a small remark plugin (future cleanup).

Next High-Impact Steps:
1. Introduce animation layer (Framer Motion) with reduced-motion safe fallbacks.
2. Convert 2–3 more stories and normalize assets (`/public/stories/<id>/`).
3. Add CI workflow running `npm run lint:content` on PR.
4. Begin Tailwind refactor of map/container layout styles (remove residual styled-jsx except where needed for OpenLayers specifics).

### Audit (2025-09-14T23:45Z)
Reality check replaced premature “complete” claims. Only one converted story; legacy markdown pipeline still active. Action plan created for asset normalization, routing, accessibility, and batch conversion.

### v0.5.0 (2025-09-15T01:10Z) – Asset Normalization & Lint Hardening
Additions:
- Canonical asset path finalized: `public/stories/<id>/` with runtime usage via root-relative `/stories/<id>/...`.
- Batch migration script executed for early stories (sample set) – all legacy `/static/img/<id>/` references rewritten in MDX.
- Canonical Ayse story consolidation: removed stub, merged `ayse-og.mdx` into `ayse.mdx` with normalized frontmatter and consistent coordinates.
- Extended content lint script: surfaces legacy `/static/img/` usage (now zero), enforces hero existence (warn for published only), and validates frontmatter via Zod.
- Converted demo story image paths to normalized structure.

Improvements:
- Eliminated risk of mixed asset roots; future optimization (blur placeholders / responsive sizing) now has uniform path assumptions.
- Lint output reduced to informational hero notices for drafts plus a single published missing-hero warning (`mary.mdx`).

Outstanding:
- Demo story decision (retain as `demo.mdx` draft or remove pre-launch).
- Build-time (not just lint-time) schema enforcement still pending.
- Hero accessibility: need `heroAlt` frontmatter field addition and enforcement.
- Additional markdown → MDX conversions (only subset converted so far).

Next Focus:
1. Frontmatter unification (remove regex parse path).
2. Hero policy + alt text schema extension.
3. Batch convert next 3 varied stories.
4. Accessibility polish (Escape to close, keyboard marker nav).
5. Image optimization plan (lossless compression + eventual Next `<Image>` adoption strategy).

Notes:
- Introduce unused image detection in lint to catch orphaned assets after edits.
- Consider adding a build guard script hooking into `prebuild` to fail early on schema errors (mirrors CI).


---
## 20. Reality Check / Audit (Most Recent)

Periodic migration tracking entry.

### High-Level
Tailwind + base MDX wiring completed. Advanced story components, frontmatter-driven metadata, and map refactor pending. Build is stable after debugging remark plugin chain.

### Phase Progress
| Phase | Status (Current) | Delta vs Original Plan |
|-------|------------------|------------------------|
| 1 Tooling bootstrap | DONE | Matches plan. |
| 2 MDX infra | PARTIAL → NEAR COMPLETE | Frontmatter schema + validation + dynamic fetch path in place; duplicate parsing path remains. |
| 3 Story components | PARTIAL | Core media (Figure, ImageGrid, VideoEmbed, Separator, heading/link overrides) done; Callout/Lightbox pending. |
| 4 Map refactor | PARTIAL | Query-param shallow routing, focus restore, basic shrink animation; motion polish + keyboard nav pending. |
| 5 Batch conversion | NOT STARTED | Only pilot subset converted; bulk script & remaining stories outstanding. |
| 6 Cleanup & hardening | STARTED | Navbar + map/sidebar in Tailwind; legacy table/grid CSS & duplicate frontmatter parse remain. |
| 7 Enhancements | NOT STARTED | Prefetch partially (neighbor cache); anchor UI, dark mode, keyboard marker cycling not begun. |

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
End Status Check (superseded earlier v0.1.0 table — preserved historically above; current state reflected here.)

The audit below summarizes current status vs original objectives. (See Timeline above for incremental history.)

### Implementation Matrix vs Objectives
| Objective | Current Status | Notes / Gaps |
|-----------|----------------|--------------|
| 1. Rich MDX story content | PARTIAL | Core components shipped; majority of legacy markdown still unconverted. Need batch conversion + auxiliary components (Callout, Lightbox). |
| 2. Tailwind design system replacing styled-jsx | IMPROVING | Major surfaces migrated (navbar, map/sidebar). Residual global table/grid CSS & any remaining styled‑jsx to remove post-conversion. |
| 3. Polished map → story transition | PARTIAL | Query-driven shallow routing, focus management, base animation present; framer-motion polish + reduced-motion & keyboard traversal outstanding. |
| 4. Unified asset handling & optimization | PARTIAL | Canonical `/stories/<id>/` path adopted for pilots; must verify all remaining stories’ assets migrated before removing legacy CSS assumptions. Optimization (Next <Image>) pending. |
| 5. Authoring ergonomics (schema, lint, preview) | PARTIAL | Zod schema + build/lint validation working; no preview mode; duplicate frontmatter parse path to unify. |

### Current Phase Progress (Audited)
| Phase | Planned Outcome | Actual Status | Key Work Remaining |
|-------|-----------------|---------------|--------------------|
| 1 Tooling bootstrap | Tailwind + base MDX enabled | DONE | — |
| 2 MDX infra | Frontmatter extraction + pilot story | PARTIAL | Consolidate frontmatter usage; decide on Contentlayer adoption. |
| 3 Story components | Layout + media primitives | PARTIAL | Add Callout, heading anchor UI, lightbox, image placeholders. |
| 4 Map refactor | Animated panel + shallow routing | PARTIAL | Add motion choreography & reduced-motion handling; refine accessibility. |
| 5 Batch conversion | All stories in MDX | NOT STARTED | Write conversion script; normalize assets; manual review for complex tables. |
| 6 Cleanup & hardening | Remove styled-jsx duplication | STARTED | Map/Sidebar & legacy tables still styled-jsx; move to Tailwind utilities. |
| 7 Enhancements | Prefetch, keyboard nav, dark mode | NOT STARTED | Defer until core migration stable. |

### Key Discrepancies Identified
1. Legacy markdown pipeline still present (expected until batch conversion phase).
2. Asset migration appears complete for pilot set; must audit completeness before declaring milestone.
3. Mixed styling: global table/grid CSS persists until story conversion removes `<table>` usage.
4. Frontmatter parsing duplicated (regex + MDX export) — unify soon.
5. Map transition missing advanced animation choreography + reduced-motion branch + keyboard marker cycling.
6. Image optimization (Next `<Image>`) not yet implemented; current `<img>` usage limits performance.

### Recommended Immediate Actions (Week 1)
1. Standardize asset location: move required story images from `static/img/*` to `public/stories/<id>/...` (or keep `public/img/<id>`), update references, then enforce in lint script.
2. Enhance frontmatter validation inside build: in `getStaticProps` for `[id].js`, parse with Zod and throw build error on invalid required fields (for early failure).
3. Replace regex duplicate frontmatter parse with import of exported `frontmatter` (leverage the MDX ESM export produced by `remark-frontmatter-export`).
4. (DONE) Introduce shallow routing on marker click; ensure deep links open panel with focus.
5. Add animation scaffold (map shrink + panel motion) with accessibility & reduced-motion support.
6. (Re-number) Continue Tailwind refactor for map container & sidebar; remove related styled-jsx.
5. Begin bulk conversion script (dry-run) to turn each `static/md/*.md` into `.mdx` and flag table-based image grids so they can be manually refactored to `<ImageGrid/> + <Figure/>`.
6. Migrate navbar and index page styled-jsx to Tailwind (incrementally) to reduce dual styling systems.
7. Add basic focus management: on open focus first heading; on close restore last marker; add `aria-expanded` on map shrink state.

### Medium-Term Enhancements
* Lightbox modal for `Figure` (esc key + focus trap).
* Automatic slug anchor link buttons for headings (already have ids, need UI affordance + skip link pattern).
* Optional Contentlayer adoption if type safety & faster metadata aggregation become pressing.

### Updated Open Questions
| Topic | Current Leaning | Decision Deadline |
|-------|-----------------|-------------------|
| Contentlayer adoption | Defer until after 3–5 story conversions | After Phase 3 completion |
| Asset folder strategy | Consolidate under `public/` | Before batch conversion |
| Dark mode tokens | Postpone | After core migration |

---
End Reality Check Audit

### Current Architecture Snapshot (Reference)
| Concern | Implementation (Updated) |
|---------|-------------------------|
| Content Sources | Hybrid: legacy markdown + `src/content/stories/*.mdx` (pilot subset converted) |
| Frontmatter Validation | Zod schema via lint + build script; duplicate parse path awaiting unification |
| Rendering (MDX) | API-driven `MDXRemote` + component map; neighbor prefetch cache in sidebar |
| Components | Core media + heading/link overrides; auxiliary (Callout, Lightbox) pending |
| Styling | Tailwind utilities across major surfaces; legacy table/grid CSS remains until conversion complete |
| Map → Story | Query-param shallow routing + focus restore + basic shrink animation |

### Residual / Optional Hardening
1. Autolink heading anchors UI.
2. Draft visibility filter.
3. Centralized image wrapper + ensure all hero images under `public/`.
4. Keyboard navigation & focus restoration between markers and panel.
5. CI integration: enforce `npm run lint:content` + (future) stylelint.

### Editorial Workflow (Current)
1. Add `<slug>.mdx` with required frontmatter.
2. Run `npm run lint:content` to catch schema & image issues.
3. Place hero image under decided public path; reference with absolute `/` path.
4. Use `Figure`, `ImageGrid`, `Video` components instead of tables/inline HTML.

### Immediate Action Backlog (from Audit)
1. Normalize asset paths.
2. Shallow routing + accessible focus.
3. Convert additional stories (goal: 3–5) & refine schema.
4. Unify frontmatter parsing (drop regex duplication).
5. Begin Tailwind refactor of navbar & map styled-jsx.

### v0.6.0 (2025-09-14T23:59Z) – Map Shallow Routing & Component Consolidation
Additions:
- Query-param based shallow routing (`/?id=`) replaces direct `/stories/[id]` rendering for interactive panel.
- Focus management + Escape key handling + panel heading autofocus implemented.
- Sidebar caching with neighbor prefetch to reduce latency for sequential story viewing.
- Tailwind refactor of map/sidebar layout; removal of large styled-jsx blocks in those areas.
- Expanded media components (Figure, ImageGrid variants, VideoEmbed provider detection) and heading/link customization with slug generation.

Improvements:
- Reduced initial payload by deferring story content fetch.
- Standardized asset path for pilot stories enabling upcoming image optimization work.

Outstanding:
- Full batch conversion of remaining markdown stories.
- Frontmatter unification (remove regex parse route code & rely solely on MDX export or adopt Contentlayer).
- Motion choreography (framer-motion) & reduced-motion safe path.
- Keyboard marker traversal (arrow keys) & heading anchor UI.
- Next `<Image>` adoption & blur placeholder heuristic.

Next Focus (Proposed):
1. Batch convert 5–10 additional stories + remove table-based grids.
2. Add lint rule: disallow `<table>` in MDX story body.
3. Implement frontmatter unification & delete duplicate parse utility where unused.
4. Introduce `StoryImage` wrapper migration path to Next `<Image>`.
5. Add keyboard navigation & reduced-motion fallback for map transitions.

---

---
## 21. Notes & Technical Decisions
**Manual Frontmatter Parse vs MDX Export**: Retained temporarily to avoid coupling build route to loader internals. Will switch to import-based approach or Contentlayer once markdown sources removed.

**Why `next-mdx-remote`**: Provides serialization step compatible with current hybrid fetch approach; can be removed later in favor of native ESM + dynamic import for stories.

**Versioning Strategy**: Tag a milestone only after (a) all stories converted, (b) shallow routing & animation accessible, (c) duplicate parsing removed. Until then remain in pre-1.0 migration phase.

## Status Check v0.2.2 (2025-09-14T22:40:00Z)

### Additions
- Created comprehensive test MDX story: `test-demo.mdx` exercising hero image, Figure, ImageGrid, Video, Separator, headings.
- Homepage (`index.js`) now merges legacy markdown data with MDX frontmatter metadata via `getAllStoriesMeta()` and displays a scrollable hybrid Story Index (labels MDX items and flags metadata errors if any).
- Added content lint script `scripts/lint-content.js` with npm script `lint:content`:
  - Validates frontmatter against Zod schema.
  - Checks existence of `hero` image and inline `<Figure>` / `<img>` src references (basic heuristics).
  - Produces non‑zero exit code on errors (CI ready).

### Rationale
- Test story provides a safe playground for styling and component regression before bulk conversion.
- Early metadata surfacing enables incremental map integration (coordinates already present for MDX stories); next step is wiring markers to MDX coordinates.
- Lint script reduces risk during batch conversion (Phase 5) and encourages consistent schema usage immediately.

### Next Focus Candidates
1. Begin converting 2–3 real stories to MDX (choose varied media complexity) to validate tooling at scale.
2. Refactor map to consume unified metadata (prefer MDX coordinates when available) and render markers accordingly.
3. Introduce `StoryMap` abstraction + initial panel animation scaffold.
4. Extend lint script: dead link detection, unused image detection (optional).

### Cleanup / Tech Debt
- Manual frontmatter parsing duplication (route + lint) to be consolidated after full MDX adoption / potential Contentlayer introduction.
- Styled-jsx blocks still in map & legacy code; removal pending Tailwind component extraction.

---
End Status Check v0.2.2

### Note: Frontmatter Access in Serialized MDX (v0.2.2a)
When using `next-mdx-remote` for hybrid loading we must explicitly supply variables referenced inside MDX via the `scope` prop. The test demo story referenced `{frontmatter.title}` but initial serialization omitted a scope, resulting in empty render. Fix applied:

```
<MDXRemote {...mdxSource} scope={{ frontmatter }} />
```

Additionally, component import lines inside MDX (`import Figure from ...`) were removed for the demo because global MDXProvider mapping already supplies those components. Keeping local imports duplicates code and can mask provider mapping issues.

Pending Consolidation: Once all stories are MDX, we can switch from manual serialize + scope to direct ESM imports (leveraging the remark frontmatter export) or adopt Contentlayer for stronger typing.

### Note: MDX v3 Blank Render Issue (v0.2.2b)
`next-mdx-remote@5` is built against the MDX v2 API. Using `@mdx-js/mdx@3.x` / loader 3.x caused serialized output not to hydrate (pages appeared blank). Resolution: pin MDX packages to 2.3.0.

Pinned versions in `package.json`:
```
"@mdx-js/mdx": "2.3.0",
"@mdx-js/react": "2.3.0",
"@mdx-js/loader": "2.3.0"
```

Future: If upgrading to MDX v3, also upgrade to a `next-mdx-remote` version that supports it or remove `next-mdx-remote` in favor of native MDX ESM imports.

---
## Status Check v0.3.0 (2025-09-14T23:30:00Z)

### Additions
- Implemented hybrid dynamic sidebar loading via new API route: `GET /api/story/[id]`.
  - Returns `{ mode: 'mdx', frontmatter, mdxSource }` or `{ mode: 'legacy', legacy: {...} }`.
  - Enables lightweight marker metadata (id + coordinates) while deferring full story payload fetch until user interaction.
- Updated `Sidebar` component to:
  - Display loading + error states.
  - Render MDX stories with `MDXRemote` + component mapping.
  - Fallback to legacy `contentHtml` for markdown stories.
- Modified home `index.js` to pass only minimal story identity (avoids eagerly embedding large HTML into initial bundle / SSG output).
- Added route-based layout in `_app.js` so non-home pages use a centered content wrapper, eliminating perceived blank area overlay issues.
- Semantic cleanup: removed nested `<figure>` elements (refactored `StoryImage` vs `Figure`).

### Rationale
This shifts from eager full-content hydration to on-demand loading, reducing initial page payload and paving the way for smoother map → story transitions without full navigation. MDX stories now appear in the sidebar—closing a major usability gap.

### Phase Progress Snapshot
| Phase | Status | Notes |
|-------|--------|-------|
| 1 Tooling bootstrap | DONE | Stable |
| 2 MDX infra | PARTIAL | Serialization + API fetch path complete |
| 3 Story components | PARTIAL | Core media + layout; still need Callout, TOC |
| 4 Map refactor | STARTED | Functional dynamic fetch; animations & shallow routing pending |
| 5 Batch conversion | NOT STARTED | Await process & scripts |
| 6 Cleanup & hardening | IN PROGRESS | Began semantic cleanup; styled-jsx still prevalent |
| 7 Enhancements | NOT STARTED | Deferred |

### Current Gaps / Next High-Impact Steps
1. Shallow route updates on marker click (`router.push('/stories/[id]', undefined, { shallow: true })`) for shareable URLs while staying on index.
2. Animation layer (`StoryMap` container) to shrink map + reveal sidebar smoothly (Framer Motion or CSS transitions).
3. Convert additional markdown stories to MDX to validate dynamic fetch path at scale.
4. Extend API error handling (404 for missing story id) & add cache headers (short-term revalidation).
5. Consolidate duplicated frontmatter parsing (API + page) after final pipeline decision (Contentlayer vs manual ESM import).

### Metrics (Qualitative)
- Initial home HTML weight reduced (no full legacy story bodies embedded in pageProps for MDX fetch path).
- User interaction latency: MDX serialization served pre-built (no runtime compile), so sidebar content appears after single network round-trip.

### Risks / Watch List
| Risk | Impact | Mitigation |
|------|--------|------------|
| Duplicate parsing logic | Medium | Unify after map animation phase (introduce shared util). |
| Large mdxSource in JSON | Medium | Consider compressing or moving to ESM import once all stories converted. |
| Sidebar layout overflow on media-heavy stories | Low | Add max-height constraints & lazy loading if needed. |

### Immediate Recommendations
1. Implement shallow routing & map shrink animation (Phase 4).
2. Convert 2–3 more stories to MDX; run `lint:content` and note discrepancies.
3. Add a minimal cache layer for `/api/story/[id]` (e.g., `res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate')`).
4. Introduce a reusable `<StoryContentShell>` with loading skeleton to polish UX.

---
