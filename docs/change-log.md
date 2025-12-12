# Change Log

## 2025-09-14
- Added Tailwind CSS tooling: `tailwind.config.js`, `postcss.config.js`, `src/styles/tailwind.css`.
- Extended theme with preliminary colors, radii, shadows, typography plugin.
- Added MDX support via `@next/mdx` and configured `next.config.js` with pageExtensions.
- Created pilot MDX page at `src/pages/demo.mdx`.
- Updated `_app.js` to import Tailwind stylesheet.
- Added new dependencies to `package.json` (Tailwind, PostCSS, autoprefixer, typography plugin, @next/mdx, clsx).
- Created change log document.

### Later (same day)
- Replaced `@next/mdx` integration with manual webpack rule using `@mdx-js/loader` to gain control over remark pipeline.
- Added `remark-frontmatter` + `remark-mdx-frontmatter` initially for frontmatter export.
- Encountered build error: "empty preset" originating from MDX plugin chain; isolated by progressively removing plugins.
- Simplified MDX config to zero remark/rehype plugins (temporary) to restore successful build.
- Identified prerender failure on `/demo` due to missing `StoryImage` mapping at static export time; added explicit import in `demo.mdx` as short-term fix.
- Confirmed successful `next build` after adjustments.
- Deferred re‑introducing frontmatter plugin chain until we implement story metadata consumption logic.

Pending (updated):
- Reintroduce frontmatter extraction once consumer code (story listing, map metadata) is ready.
- Convert first real story (`ayse.md` recommended) to `ayse.mdx` with structured frontmatter (title, coordinates, hero, tags, excerpt).
- Build shared MDX layout wrapper (typography container, breadcrumb / back link, metadata header block).
- Implement image gallery component (responsive grid + lightbox modal) and video embed component.
- Refactor map homepage to consume centralized story metadata JSON (generated at build from MDX frontmatter).

Pending:
- Run `npm install` to fetch new dependencies.
- Decide on generated output (JIT) build integration (may create a dedicated build step if needed).
- Convert one real story to MDX after verifying pipeline.

### 2025-09-14 (Audit Addendum 23:50 UTC)
Previous internal notes (later sections of migration doc) implied a fully completed MDX + Tailwind migration (all legacy markdown removed). Repository audit shows:
- Legacy markdown pipeline removed from homepage aggregation (Sept 14 2025). MDX-only source of truth; legacy loader subsequently deleted after Trish Tips migration.
- Only one real story converted to MDX (`src/content/stories/ayse.mdx`).
- Tailwind utilities coexist with significant styled-jsx and bespoke global CSS.
- Map → story transition partially implemented via CSS (no framer-motion / focus management yet).
- Hero image path in pilot MDX story references `/static/img/...` (not in `public/`).

Action Items (captured in migration strategy doc):
1. Standardize asset paths under `public/` and update hero references.
2. Implement shallow routing + accessible focus when opening a story from the map.
3. Begin batch MDX conversion with lint script enforcement.
4. Consolidate frontmatter parsing (remove duplicate regex extraction once pipeline finalized).

This addendum ensures the change log reflects current factual state before further migration steps.

### 2025-09-14 (Later – Map & Content Enhancements)
- Implemented cluster click inward zoom (tight extent fit, animated) and standardized zoom animation easing/duration.
- Added initial extent auto-fit to encompass all story coordinates on first load.
- Introduced map marker hover preview card (title, excerpt snippet, optional hero thumbnail); later enlarged for readability.
- Added build-time validation script (`scripts/validate-content.js`) integrated into build process.
- Extended lint/schema with `heroAlt` accessibility rule (warn when hero lacks alt for published stories).
- Upgraded image presentation: `ImageGrid` now enforces uniform aspect boxes with caption overlay; `Figure`/`StoryImage` updated to cooperate with wrappers.
- Standardized Mary story video embeds by replacing raw `<video>` tags with `<Video>` component (mp4 provider path handled).
- Simplified draft UI legend & removed instructional query string text.

Pending (new focus):
- Sidebar Tailwind refinement (typography scale, spacing rhythm, scroll/overflow cues, anchor style unification).
- Unused image detection and raw `<img>` lint rule.
- Arrow key navigation between markers & prefetch on hover.
