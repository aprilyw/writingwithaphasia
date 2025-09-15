# Palette Workflow

This project now supports rapid color palette iteration without manual find/replace.

## Files & Structure
- `src/design/palettes.js`: Registry of all semantic palettes.
- `src/design/getActivePalette.js`: Chooses palette via `PALETTE` or `NEXT_PUBLIC_PALETTE` env var (falls back to `current`).
- `scripts/generate-palette.js`: Emits CSS variables to `src/styles/palette.generated.css`.
- `tailwind.config.js`: Imports the active palette and maps semantic keys → Tailwind `colors`.
- `src/styles/palette.generated.css`: Generated file (committed) so production builds don't need a pre-step on platforms that just run `next build`.

## Adding a New Palette
1. Open `src/design/palettes.js`.
2. Duplicate one palette entry and change hex values. Keep the same semantic keys:
   ```js
   coolExperiment: {
     name: 'cool-experiment',
     inkStrong: '#182024',
     ink: '#1e1b18',
     accent: '#2656F5',
     accentHover: '#1d44c4',
     accentActive: '#15379d',
     highlight: '#FFB347',
     surface: '#f5f7fa',
     surfaceAlt: '#ffffff',
     surfaceMist: '#e4edf7',
     focus: '#2656F5'
   }
   ```
3. Regenerate:
   ```bash
   PALETTE=coolExperiment npm run palette
   ```
4. Start dev (or refresh) and review.

## Switching Palettes Quickly
Preset scripts added:
```bash
npm run palette          # regenerates using default (current)
npm run palette:altWarm  # altWarm palette
npm run palette:highContrast
```
Or ad-hoc:
```bash
PALETTE=altWarm npm run palette && npm run dev
```

## Semantic Token Reference
| Token (CSS Variable) | Meaning | Source Field |
| -------------------- | ------- | ------------ |
| `--color-ink-strong` | Primary headings | `inkStrong` |
| `--color-ink` | Body text | `ink` |
| `--color-accent-rust` | Primary action / link | `accent` |
| `--color-accent-rust-hover` | Hover state | `accentHover` or derived |
| `--color-accent-rust-active` | Active/pressed | `accentActive` or derived |
| `--color-accent-warm` | Secondary highlight | `highlight` |
| `--color-surface-bg` | Body background | `surface` |
| `--color-surface-alt` | Panels / cards | `surfaceAlt` |
| `--color-surface-mist` | Subtle tinted bg (nav) | `surfaceMist` |
| `--color-focus-ring` | Focus outline | `focus` or `accent` |

## Tailwind Color Keys
Mapped in `tailwind.config.js` for utility classes:
- `ink` → headings (`inkStrong`)
- `inkBody` → body text (`ink`)
- `accent`, `accentHover`, `accentActive`
- `highlight`
- `surface`, `surfaceAlt`, `mist`
- `focus`

## Guidelines
- Keep contrast ratio ≥ 4.5:1 for body text vs background.
- Test link color vs background and hover vs original (avoid too subtle change).
- Focus ring should be visible on both light and mist surfaces.

## Potential Enhancements
- Add dark mode palette variant (e.g. `brandRedDark`).
- Provide a live palette switcher in dev sidebar.
- Derive hover/active automatically via HSL/OKLCH manipulation.

## Troubleshooting
If colors don't change:
1. Confirm `PALETTE=name` matches key in `palettes.js`.
2. Re-run `npm run palette` (the generated file must update).
3. Ensure browser cache cleared / dev server restarted.
4. Verify no hard-coded hex left in components (search for old value).

Happy experimenting! 🎨
