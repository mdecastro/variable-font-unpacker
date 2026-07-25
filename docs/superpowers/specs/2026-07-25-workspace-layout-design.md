# Workspace layout redesign — Variable Font Unpacker

**Date:** 2026-07-25  
**Status:** Approved for implementation planning

## Problem

After inspecting a variable font with many named instances or axes, the workspace uses a two-column layout (`lg:grid-cols-5`: preview 3 cols, controls 2 cols). Controls only use ~40% of the horizontal space, so the list grows very tall. The page background gradient is painted once on `body` with `background-repeat: no-repeat` and fixed ellipses, so when content is taller than the viewport the lower scroll area looks like a flat ink cut-off.

## Goals

- Make many instances/axes easier to scan by using full horizontal width for controls.
- Keep preview and all controls visible in one continuous flow (no tabs, no internal scroll panels).
- Ensure the atmospheric gradient covers the viewport for the full scroll height.
- Preserve existing palette, typography, hero, dropzone, and inspect/extract behavior.

## Non-goals

- Redesigning the hero, dropzone, fonts, or color tokens.
- Changing API routes, FastAPI backend, or font inspection/extraction logic.
- Adding search/filter for instances, sticky preview, or tabbed controls.

## Approach

**Stack + dense grid** (chosen over side-by-side with scroll, ultra-dense 4-col sliders, or tabs):

1. Full-width preview on top.
2. Full-width controls panel below: named-instance chips wrap; axes in a responsive multi-column grid; download at the bottom of the panel.
3. Fixed viewport glow layers so the background never “ends” when the document grows.

## Layout

Vertical flow inside the existing `max-w-[1400px]` container:

```
[ Header + dropzone ]
[ Preview — full width ]
[ Controls panel — full width ]
  · Named instances (chip wrap)
  · Axes (responsive grid)
  · Download
```

- Remove `lg:grid-cols-5` and sticky preview (`lg:sticky lg:top-8 lg:col-span-3`).
- Controls panel keeps the current visual language: `rounded-2xl`, border, `bg-ink-2/60`, backdrop blur.
- On mobile: single column for axes (same as today).
- From `md`: 2 columns for axes.
- From `lg`: 3 columns for axes.

## Controls density

- **Named instances:** unchanged chip UI; wrap uses full panel width so many names form short rows instead of a tall narrow column.
- **Axes:** each axis is one grid cell (label with name/tag, value, range input). Same accent-color rotation and change handlers; layout only.
- **Download:** remains below axes, left-aligned within the panel; not floating.

No tabs and no scroll-inside-panel: everything stays in the document flow; height shrinks because width is used.

## Background

- Keep current radial glow colors and ink base.
- Move glow layers to a fixed full-viewport layer (`position: fixed; inset: 0; z-index: -1` via `body::before` or an equivalent fixed element).
- `body` keeps solid `background-color: var(--color-ink)` (and layout classes); do not rely on non-repeating body background images for page-height coverage.

## Files to change

| File | Change |
|------|--------|
| `app/page.tsx` | Replace two-column workspace with vertical stack; full-width preview then full-width controls. |
| `components/InstanceList.tsx` | Axes list → responsive CSS grid (`1` / `md:2` / `lg:3` columns). |
| `app/globals.css` | Fixed viewport glow layer; remove body background-image ellipses that fail on tall pages. |

## Success criteria

- With a font that has many named instances and several axes, the controls section is shorter than the previous two-column layout on a typical desktop width.
- Preview sits above controls at full content width.
- Scrolling past the first viewport does not reveal a flat cut-off where the gradient stops.
- Keyboard focus and existing interaction behavior (select instance, drag axes, download) remain intact.
- `prefers-reduced-motion` behavior for the hero title is unchanged.

## Out of scope follow-ups (optional later)

- Compact 4-column axis layout for extreme axis counts.
- Search/filter for named instances.
- Sticky mini-preview while scrolling controls.
