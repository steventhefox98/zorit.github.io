# Design Brief

## Direction

ZoritLegends Purple Pixel — established oklch(295) retro-Minecraft system; v32 adds the Profile page (avatar preview + preset gallery + image upload) and avatar display integration across the navbar, messages staff list, and message bubbles.

## Tone

Premium retro-Minecraft community hub — pixel-bordered cards, VT323 terminal metadata, Press Start 2P labels; the profile page reads as a Minecraft character-select screen where preset avatars are pixel-art tiles and the upload dropzone is a dashed pixel portal with a segmented progress bar.

## Differentiation

A profile page that feels like a Minecraft character-select screen — preset avatars live as pixel-art tiles that pulse purple on selection with a green checkmark corner mark, the large preview renders pixelated with a glowing purple ring, and the upload dropzone shows a pixel-segmented progress bar that flips green on success or red on error — all in the established purple pixel system.

## Color Palette

| Token                  | OKLCH           | Role                                          |
| ---------------------- | --------------- | --------------------------------------------- |
| background             | 0.12 0.04 295   | deep purple-black canvas (existing)            |
| card                   | 0.16 0.06 295   | elevated surface (existing)                    |
| primary                | 0.62 0.22 295   | purple accent / glow / selected tile (existing)|
| accent                 | 0.55 0.25 295   | saturated purple highlight (existing)          |
| avatar-preview-bg      | 0.10 0.04 295   | large avatar preview backdrop                  |
| avatar-preview-ring     | 0.62 0.22 295   | large avatar preview border + glow             |
| avatar-tile            | 0.14 0.05 295   | preset gallery tile fill                       |
| avatar-tile-hover      | 0.22 0.09 295   | preset tile hover fill                         |
| avatar-tile-selected   | 0.62 0.22 295   | selected preset tile border + glow             |
| upload-dropzone        | 0.12 0.05 295   | upload dropzone background                      |
| upload-dropzone-hover  | 0.18 0.08 295   | upload dropzone hover/dragover fill            |
| upload-progress        | 0.55 0.25 295   | upload progress bar purple segments            |
| upload-success         | 0.65 0.18 145   | upload success state (green progress + text)   |
| upload-error           | 0.58 0.24 27    | upload error state (red progress + text)      |
| navbar-avatar-ring     | 0.45 0.18 295   | navbar user-chip avatar border                  |
| message-avatar-ring    | 0.30 0.10 295   | message list/bubble avatar border               |
| success / warning / destructive | (existing) | reused for upload status accents     |

## Typography

- Display: Press Start 2P — profile header title, upload dropzone label, save/cancel buttons
- Mono: VT323 — header subtitle, dropzone hint, upload status text, fallback initial letters
- Body: Cinzel — unchanged for any descriptive copy
- Scale: header title `font-pixel 0.9rem`, subtitle `font-vt 1.15rem`, dropzone label `font-pixel 0.55rem`, fallback letters `font-vt 4rem` (preview) / `1.4-1.5rem` (chips)

## Elevation & Depth

Existing 4px hard pixel box-shadows retained. Large avatar preview uses 4px pixel shadow + 24px purple glow + inset dark frame. Preset tiles use 3px pixel shadow (compress to 1px on press). Upload dropzone uses inset purple tint, no hard shadow. Navbar/message avatars use 2px pixel shadow. Selected tile adds 20px purple glow + inset ring + green corner checkmark.

## Structural Zones

| Zone                    | Background              | Border         | Notes                                                  |
| ----------------------- | ----------------------- | -------------- | ------------------------------------------------------ |
| Profile header          | profile-header          | pixel-purple   | "PROFILE" `font-pixel` title + VT323 subtitle          |
| Avatar preview          | avatar-preview-bg       | avatar-preview-ring | Large square, pixelated, 24px purple glow          |
| Preset gallery          | card (existing)         | pixel-purple   | `.avatar-gallery` grid, `.avatar-tile` + `.is-selected`|
| Upload dropzone         | upload-dropzone         | dashed purple  | `.upload-dropzone` + `.is-dragover`, icon + label + hint|
| Upload progress         | (inline)                | pixel-purple   | `.upload-progress` + `.is-complete`/`.is-error`        |
| Action bar              | card (existing)         | pixel-purple   | `.profile-save-btn` + `.profile-cancel-btn`            |
| Navbar user chip        | (existing navbar)       | navbar-avatar-ring | `.navbar-avatar` 32px, fallback first-letter        |
| Messages staff list     | (existing sidebar)      | message-avatar-ring | `.message-avatar` 36px beside username + role badge|
| Message bubbles         | (existing bubbles)      | message-avatar-ring | `.message-avatar` 36px beside bubble (optional)    |
| Footer                  | bg-background           | pixel-divider  | unchanged                                               |

## Spacing & Rhythm

Profile header padding 1.25rem 1.5rem. Avatar preview 192px square on md+, 128px on mobile. Gallery grid `auto-fill minmax(72px,1fr)` with 0.75rem gap. Upload dropzone padding 1.5rem. Action bar gap 0.75rem, right-aligned. Navbar avatar 32px, message avatar 36px, both with 2px border.

## Component Patterns

- Profile header: `.profile-header` + `.profile-header-title` + `.profile-header-subtitle`
- Avatar preview: `.avatar-preview` (pixelated img) + `.avatar-preview-fallback` (VT323 initial)
- Preset tile: `.avatar-tile` + `.is-selected` (purple glow + green corner checkmark via clip-path)
- Upload dropzone: `.upload-dropzone` + `.is-dragover` + `.upload-dropzone-icon`/`.upload-dropzone-label`/`.upload-dropzone-hint`
- Upload progress: `.upload-progress` > span + `.is-complete`/`.is-error` + `.upload-status-text`
- Navbar avatar: `.navbar-avatar` (img) + `.navbar-avatar-fallback` (first letter)
- Message avatar: `.message-avatar` (img) + `.message-avatar-fallback` (first letter)
- Action buttons: `.profile-save-btn` (purple fill + glow) + `.profile-cancel-btn` (secondary)
- All avatar `<img>` use `image-rendering: pixelated` to match the pixel theme

## Motion

- Entrance: existing FadeSection + hero-reveal (unchanged)
- Tile selection: `avatar-select-pulse` one-shot purple ring expand 0→6px→0 on `.is-selected` (0.5s)
- Upload progress: width transition 0.2s ease-out on the segmented fill span
- Hover: purple glow on preset tiles + dropzone; save button intensifies glow
- Reduced-motion: `avatar-select-pulse` disabled via `prefers-reduced-motion`

## Constraints

- Do NOT replace the oklch(295) purple palette — new tokens layer on top
- Profile page is picture-only — NO display name editing (deferred by user choice)
- NO in-browser avatar cropping/rotation editor — uploaded image is square-cropped server-side or via simple object-fit cover
- All avatar images render with `image-rendering: pixelated` to match the pixel theme
- Upload progress bar uses pixel segments (purple → green on success → red on error)
- Navbar avatar falls back to existing first-letter purple square when no image is set
- Messages hide the current user from their own staff list; no self-conversation threads shown
- Message avatars are optional beside bubbles — only when sender avatar is set or for richer context
- Keep all existing tokens, classes, and functionality intact — additive update only
- No glitch classes (removed wholesale; do not re-add)
- Respect `prefers-reduced-motion` — disable `avatar-select-pulse`

## Signature Detail

Selecting a preset avatar lands as a one-shot purple ring pulse with a tiny green pixel checkmark appearing in the tile's corner — the moment of choice rendered as a crisp Minecraft-iconography confirmation, while the large preview above glows purple and renders every pixel edge crisply.
