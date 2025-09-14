# MDX + Tailwind Migration TODOs
Date: 2025-09-14
Source: Derived from `mdx-tailwind-migration.md` audit & timeline.

## Legend
- [ ] Not started
- [~] In progress / partial
- [x] Complete

(Use one-way edits; when closing an item, add a short result note.)

---
## A. Immediate (Week 1 Focus)
1. Asset normalization
   - [x] Decide canonical path: `public/stories/<storyId>/` (legacy `/static/img/<id>/` will be migrated). (2025-09-14) ✓
   - [ ] Move existing hero + inline images for converted MDX stories (start with `ayse`).
   - [ ] Update references in existing MDX (`ayse.mdx`) to `/stories/<id>/...` and adjust lint script to enforce (lint script updated for new path; refs still pending).
2. Shallow routing & accessibility
   - [ ] On marker click: `router.push('/stories/[id]', undefined, { shallow: true })`.
   - [ ] On load: if `router.query.id` present, auto-open panel & focus first heading.
   - [ ] Implement focus restore to marker on panel close.
   - [ ] Add `aria-expanded` & `aria-controls` between map container and panel.
3. Frontmatter parsing unification
   - [ ] Replace manual regex parse in `pages/stories/[id].js` with import of compiled MDX `frontmatter` (or shared util).
   - [ ] Apply Zod validation in build step; fail build on required field errors (title, coordinates for mapped stories).
4. Additional story conversions
   - [ ] Select 3 candidate markdown stories with varied media layouts.
   - [ ] Convert & replace table-based galleries with `<ImageGrid>` + `<Figure>`.
   - [ ] Run `npm run lint:content` and resolve issues.
5. Map / layout refactor foundation
   - [x] Extract current map + sidebar into `StoryMap` component. (2025-09-14) ✓
   - [ ] Introduce animation scaffold (Framer Motion or improved CSS transitions) without polish.
   - Note: Added HTML comment sanitization (legacy `<!-- -->` converted to `{/* */}` at build) to unblock MDX compilation errors. (2025-09-14)
6. Tailwind adoption – critical surfaces
   - [x] Port navbar styled-jsx to Tailwind utility classes. (2025-09-14) ✓
   - [ ] Port home map container layout styling (keeping only animation-specific CSS).
7. Lint & CI
   - [ ] Add CI step to run `npm run lint:content`.
   - [ ] (Optional) Fail on warnings above configurable threshold.

---
## B. Near-Term (After Week 1 / Phase 3–4 Support)
1. Image component hardening
   - [ ] Ensure all images flow through `<StoryImage>` or `<Figure>`; no raw `<img>` in MDX except intentional.
   - [ ] Add optional blur placeholder / `sizes` prop heuristics.
2. Heading ergonomics
   - [ ] Add anchor link UI (hover-visible link icon or hash).
   - [ ] Keyboard skip link to main story content.
3. Accessibility & UX
   - [ ] Add Escape key to close panel.
   - [ ] Consider arrow key navigation between markers when panel open.
4. API improvements
   - [ ] Cache headers on story API responses (`s-maxage=60, stale-while-revalidate`).
   - [ ] 404 & error JSON shape standardization.
5. Content lint enhancements
   - [ ] Detect unused images in `public/stories/<id>`.
   - [ ] Check external links (HEAD request or pattern heuristic) – optional.
6. Styled-jsx deprecation
   - [ ] Remove table/gallery-specific global CSS after all conversions.
   - [ ] Eliminate remaining story-specific styled-jsx blocks.
7. Story metadata enrichment
   - [ ] Optional excerpt support surfaced on map listing / index panels.
   - [ ] Tag filtering prototype.

---
## C. Mid-Term / Optional Enhancements
1. Lightbox / Modal
   - [ ] Implement `<Lightbox>` with focus trap & ESC close.
   - [ ] Integrate with `Figure` (click to enlarge; optional grouping).
2. Keyboard Navigation
   - [ ] Global shortcut (e.g. `]` / `[` ) to jump to next/prev story (shallow route).
3. Draft & Visibility Controls
   - [ ] Hide `status: draft` from default list unless `?draft=1`.
4. Dark / High-Contrast Theme
   - [ ] Tokenize color palette; add `dark:` variants.
5. Prefetch & Performance
   - [ ] Preload MDX bundle on marker hover / focus.
   - [ ] Intersection-based lazy mount of heavy media.
6. Contentlayer Evaluation
   - [ ] Spike: replace manual metadata index with Contentlayer.
   - [ ] Measure build time & DX improvements.
7. Migration Completion Milestone
   - [ ] Criteria met: all stories MDX, shallow routing + focus mgmt, unified frontmatter parse, styled-jsx removed (non-map), assets normalized.
   - [ ] Tag `v1.0.0-mdx`.

---
## D. Technical Debt & Risks
| Item | Risk | Mitigation Plan |
|------|------|-----------------|
| Dual frontmatter parse | Drift/bugs | Unify import path early (Immediate #3). |
| Mixed asset roots | Broken prod images | Asset normalization (Immediate #1). |
| Large `mdxSource` JSON payload | Bigger initial sidebar fetch | Transition to ESM import post conversion. |
| Styled-jsx retention | Inconsistent design system | Incremental Tailwind refactor tasks (Immediate #6). |
| Accessibility gaps | Reduced usability | Focus, keyboard, ARIA tasks (Immediate #2 & Near-Term #3). |

---
## E. Decision Log (Active)
| Topic | Current Leaning | Revisit When |
|-------|-----------------|--------------|
| Contentlayer adoption | Defer | After 3–5 MDX conversions stable |
| Asset path structure | `public/stories/<id>` | Before batch conversion start |
| Dark mode | Postpone | After core milestone (v1 readiness) |

---
## F. Completion Criteria (For Milestone Tag)
All of the following must be true:
- [ ] 100% stories in MDX.
- [ ] Shallow routing + accessible animation & focus mgmt implemented.
- [ ] Unified frontmatter import (no regex parsing).
- [ ] Navbar + map layout styling in Tailwind; legacy table CSS removed.
- [ ] Lint script clean (no errors) + enforced in CI.
- [ ] Assets standardized under agreed public path.

---
## G. Fast Reference (Top 5 Next)
1. Asset normalization.
2. Shallow routing + focus management.
3. Frontmatter parsing unification.
4. Convert 3 more stories.
5. Extract `StoryMap` + animation scaffold.

(Keep this section updated as tasks complete.)
