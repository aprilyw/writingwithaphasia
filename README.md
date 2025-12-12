
## Development

Install dependencies and start the dev server:
```bash
npm install
npm run dev
```

## Content Model (MDX-Only)
All stories live as MDX files in `src/content/stories/*.mdx`.

Required / common frontmatter fields:
```yaml
title: "Example Story"
name: "Full Name"        # optional if title covers it
location: "City, State"  # optional; displayed if present
coordinates: [-71.05, 42.36]  # [lon, lat] for map pin (recommended)
hero: "/static/img/example/hero.jpg"  # optional hero image path
status: draft | published               # defaults to draft if incomplete
tags: [recovery, advocacy]
excerpt: "Short descriptive summary."   # used in listings
```

### Adding a New Story
1. Create `src/content/stories/<slug>.mdx` with frontmatter.
2. Add any images under `static/img/<slug>/` (or `public/`).
3. Use MDX components for structure:
   - `<Figure src="..." caption="..." />`
   - `<ImageGrid columns={2}>...</ImageGrid>`
   - `<VideoEmbed src="https://youtu.be/..." title="..." />`
   - `<Separator />` for thematic breaks.
4. Run the content lint:
```bash
npm run lint:content
```
5. Provide coordinates + hero; then set `status: published`.

### MDX Components
The renderer maps semantic components to tailored UI. Plain markdown works, but using components ensures consistent spacing, responsive images, and accessible media.

### Linting & Validation
`npm run lint:content` validates frontmatter (Zod), confirms referenced images exist, and reports warnings for drafts or missing coordinates/hero.

### Map Integration
Stories with valid `coordinates` appear as pins on the home page map. Draft stories can still resolve directly by URL but you can extend the code later to filter them out of the map/listings.

## Architecture Highlights
- Next.js + Tailwind CSS (typography plugin for prose styling)
- MDX serialization via `next-mdx-remote`
- Frontmatter schema enforcement with Zod
- Sidebar + API endpoint (`/api/story/[id]`) serve MDX payloads only

## Editorial Workflow Summary
Create → Lint → Add media & coordinates → Publish → Verify map pin.

## Post-Migration Notes
- Legacy markdown pipeline and conversion tooling have been removed.
- All new narrative or media enhancements occur directly in MDX.
- Consider adding heading slug/anchor support and Next `<Image>` optimization as future improvements.

## License
(Add license details here if applicable.)