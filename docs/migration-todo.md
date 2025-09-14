# MDX + Tailwind Migration TODOs
Date: 2025-09-14 (UPDATED)
Source: Derived from `mdx-tailwind-migration.md` audit & timeline.

## Legend
- [ ] Not started
- [~] In progress / partial
- [x] Complete

(Use one-way edits; when closing an item, add a short result note.)

---
## A. Immediate (Week 1 Focus)
1. Asset normalization
   - [x] Decide canonical path: `public/stories/<storyId>/` (legacy `/static/img/<id>/` migrated). (2025-09-14) ✓
   - [x] Migrate and normalize images for pilot + additional stories (`ayse` canonical merge, plus `brian`, `mary`, `sherry`, `trish`). (2025-09-14) ✓
   - [x] Rewrite all MDX references to `/stories/<id>/...` (lint confirms zero legacy `/static/img/` usages). (2025-09-14) ✓
   - [x] Add lint rule surface for legacy path suggestion (non-blocking) now showing 0 occurrences. (2025-09-14) ✓
2. Shallow routing & accessibility (UPDATED: now query param based)
   - [x] On marker click: transition to `/?id=<storyId>` (query param keeps map mounted). (2025-09-14)
   - [x] On load with `?id=` present: auto-open panel & focus heading. (2025-09-14)
   - [x] Focus restore to previously focused marker on close. (2025-09-14)
   - [x] `aria-expanded` & `aria-controls` added between map container and panel. (2025-09-14)
   - [x] Legacy deep link `/stories/[id]` now redirects client-side to `/?id=` for continuity. (2025-09-14)
3. Frontmatter parsing unification
   - [x] Zod schema present (`schema.js`) & lint integrated. (2025-09-14)
   - [x] Build-time fail-fast added (`scripts/validate-content.js` run before `next build`). (2025-09-14)
   - [~] Confirm & remove any remaining ad‑hoc frontmatter parse logic (central helper now used in lint + meta aggregation; validate no residual custom regex callers before closing).
4. Additional story conversions
   - [ ] Identify & prioritize next 3 stories (coverage: image-heavy, video, minimal-media) for conversion sequencing.
   - [ ] Replace any residual non-semantic layouts with `<ImageGrid>` / `<Figure>`.
   - [ ] Run `npm run lint:content` after each conversion (document in PR template guidance).
   - [ ] Track conversion velocity (stories/week) to forecast milestone readiness.
5. Map / layout refactor foundation
   - [x] Extract current map + sidebar into `StoryMap` component. (2025-09-14) ✓
   - [x] Introduce basic animation (CSS/Tailwind transitions & easing) for map shrink/expand; may enhance later. (2025-09-14)
   - [x] Persistent map: detail view now overlay via query param instead of separate page. (2025-09-14)
   - [x] Cluster zoom now directional inward with animated fit; smooth zoom easing standardized (420ms). (2025-09-14)
   - [x] Initial extent auto-fit of all story coordinates (once) at load. (2025-09-14)
   - [x] Marker hover preview card (title + excerpt + hero thumb) with enlargement follow-up. (2025-09-14)
   - Note: Added HTML comment sanitization (legacy `<!-- -->` converted to `{/* */}` at build + API). (2025-09-14)
6. Tailwind adoption – critical surfaces
   - [x] Port navbar styled-jsx to Tailwind utility classes. (2025-09-14) ✓
   - [x] Port home map + sidebar layout (StoryMap) from styled-jsx to Tailwind utilities. (2025-09-14) ✓
   - [~] Sidebar content panel refinement (typography spacing, section headings, scroll affordances) – planned dedicated refactor pass. (2025-09-14)
   - [ ] Audit legacy global CSS for removable blocks (tables/galleries) post first 5 additional conversions.
   - [ ] Decide on utility vs extracted component classes for recurring panel typographic patterns.
7. Lint & CI
   - [x] Add CI step to run `npm run lint:content`. (2025-09-14)
   - [ ] (Optional) Introduce severity threshold flag (e.g. `--max-warn 5`) to gate merges if hero coverage incomplete.
   - [x] Add rule enhancements: missing `heroAlt` (warn) once schema extended. (2025-09-14)
   - [x] Build-time validation script integrated (fail-fast on schema errors). (2025-09-14)
   - [x] Add lint for raw `<img>` usage (error) implemented. (2025-09-14)
   - [x] Add unused image detection (warn) implemented. (2025-09-14)
   - [ ] Add external link checker (allowlist YouTube/Vimeo + canonical domains) -> optional step.

---
## B. Near-Term (After Week 1 / Phase 3–4 Support)
1. Image component hardening
   - [x] Grid alignment pass: uniform aspect wrappers in `<ImageGrid>`; caption overlay within ratio box. (2025-09-14)
   - [ ] Enforce images via `<Figure>` / `<StoryImage>` (lint: detect raw `<img>` after conversions complete).
   - [ ] Add optional blur placeholder / `sizes` heuristics (defer until Next `<Image>` adoption decision).
   - [ ] Evaluate migration to Next `<Image>` (analyze viability with story-specific asset paths & map layout constraints) and produce decision note.
2. Heading ergonomics
   - [ ] Add anchor link UI (hover-visible link icon or hash).
   - [ ] Keyboard skip link to main story content.
3. Accessibility & UX
   - [x] Add Escape key to close panel. (2025-09-14)
   - [x] Hover preview card for map markers (improves discoverability). (2025-09-14)
   - [x] Implement arrow key / [ ] navigation between published stories (wraps; skips drafts). (2025-09-14)
   - [ ] Add focus outline improvements & consistent focus ring tokens.
   - [ ] Introduce heading skip link target inside panel (anchors to first content heading).
4. API improvements
   - [ ] Cache headers on story API responses (`s-maxage=60, stale-while-revalidate`).
   - [ ] 404 & error JSON shape standardization.
5. Content lint enhancements
   - [ ] Detect unused images in `public/stories/<id>` (compare directory listing vs referenced set extracted from MDX AST).
   - [ ] External link checker (optional; skip YouTube embeddeds & well-known domains by allowlist).
   - [x] Enforce `heroAlt` warning now active (validated in lint script). (2025-09-14)
   - [ ] Add enforcement for minimum alt text length threshold (e.g. < 5 chars -> info/warn).
6. Styled-jsx deprecation
   - [ ] Remove table/gallery-specific global CSS after all conversions.
   - [ ] Eliminate remaining story-specific styled-jsx blocks.
7. Story metadata enrichment
   - [x] Excerpt present in schema & used in content (e.g., `ayse.mdx`). (2025-09-14)
   - [x] Surface excerpt in map hover preview card UI. (2025-09-14)
   - [ ] Tag filtering prototype.
   - [ ] Draft visibility toggle UI (map legend control vs query param only) & doc update.

---
## C. Mid-Term / Optional Enhancements
1. Lightbox / Modal
   - [ ] Implement `<Lightbox>` with focus trap & ESC close.
   - [ ] Integrate with `Figure` (click to enlarge; optional grouping).
2. Keyboard Navigation
   - [ ] Global shortcut (e.g. `]` / `[` ) to jump to next/prev story (shallow route) while preserving focus context.
   - [ ] Arrow key marker traversal when panel open (ties to Accessibility & UX item).
3. Draft & Visibility Controls
   - [ ] Hide `status: draft` from default list unless `?draft=1`.
4. Dark / High-Contrast Theme
   - [ ] Tokenize color palette; add `dark:` variants.
5. Prefetch & Performance
   - [x] Basic client-side cache of fetched story payloads + neighbor prefetch (Sidebar). (2025-09-14)
   - [ ] Preload MDX bundle on marker hover / focus (defer until more stories converted).
   - [ ] Intersection-based lazy mount of heavy media (wrap large grids / videos).
   - [ ] Measure bundle impact after 5 additional conversions (baseline metrics doc entry).
6. Contentlayer Evaluation
   - [ ] Spike: replace manual metadata index with Contentlayer.
   - [ ] Measure build time & DX improvements.
7. Migration Completion Milestone
   - [ ] Criteria met: all stories MDX, shallow routing + focus mgmt, unified frontmatter parse, styled-jsx removed (non-map), assets normalized.
   - [ ] Tag `v1.0.0-mdx`.
   - [ ] Publish retrospective (what worked / friction) appended to strategy doc timeline.

---
## D. Technical Debt & Risks
| Item | Risk | Mitigation Plan |
|------|------|-----------------|
| Dual frontmatter parse | Drift/bugs | Unify import path early (Immediate #3) – in progress, verify removal then close. |
| Mixed asset roots | Broken prod images | Asset normalization (Immediate #1). |
| Large `mdxSource` JSON payload | Bigger initial sidebar fetch | Transition to ESM import post conversion; measure baseline first. |
| Styled-jsx retention | Inconsistent design system | Incremental Tailwind refactor tasks (Immediate #6). |
| Accessibility gaps | Reduced usability | Focus, keyboard, ARIA tasks (Immediate #2 & Near-Term #3). |

---
## E. Decision Log (Active)
| Topic | Current Leaning | Revisit When |
|-------|-----------------|--------------|
| Contentlayer adoption | Defer | After 3–5 additional MDX conversions stable |
| Asset path structure | `public/stories/<id>` | Reconfirm before image optimization pipeline |
| Dark mode | Postpone | After core milestone (v1 readiness) |
| Demo story retention | Rename to `demo.mdx` + mark draft OR remove | Decide pre-launch cleanup |
| Sidebar styling approach | Progressive Tailwind utility refactor (preserve semantics) | After initial refactor pass |

---
## F. Completion Criteria (For Milestone Tag)
All of the following must be true / enforced:
- [ ] 100% stories authored in MDX (no residual `.md`).
- [ ] Shallow routing + accessible animation & focus mgmt implemented (escape, focus restore, marker traversal).
- [ ] Unified frontmatter import (single schema path; no ad‑hoc regex parsing left in codebase).
- [ ] Navbar + map layout + sidebar panel styling fully Tailwind; legacy gallery/table/global CSS removed or justified.
- [ ] Lint script passes (0 errors) + CI enforcement; warnings limited to accepted informational categories (e.g. draft hero missing allowed).
- [ ] No legacy image path warnings; all assets under `/public/stories/<id>/`.
- [ ] Hero + heroAlt + excerpt coverage for all published (non-draft) stories.
- [ ] Decision recorded on Next `<Image>` adoption (and implemented if affirmative) OR explicit deferral note.

---
## G. Fast Reference (Top 5 Next)
1. Sidebar Tailwind refinement (spacing scale, heading hierarchy, scroll shadows, link styles consolidation).
2. Remove any remaining manual frontmatter parse logic & delete deprecated markdown copies after MDX parity.
3. Decide demo story retention & hero placeholder policy; fill heroAlt gaps.
4. Implement arrow key navigation between markers + focus outline improvements.
5. Add unused image detection + raw `<img>` lint rule.
6. Evaluate & document Next `<Image>` migration decision.

(Keep this section updated as tasks complete.)
