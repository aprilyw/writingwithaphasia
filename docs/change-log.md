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
