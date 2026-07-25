# Browser language detection (EN/ES) — Variable Font Unpacker

**Date:** 2026-07-25  
**Status:** Approved for implementation planning

## Problem

The entire interface is hard-coded in Spanish (`app/page.tsx` and the four components under `components/`), while `app/layout.tsx` declares `lang="en"` and ships English metadata. Non-Spanish-speaking visitors get a Spanish UI with no way to change it.

## Goals

- Serve the interface in the visitor's browser language, limited to English and Spanish.
- Let the visitor override the detected language and have that choice persist across reloads.
- Keep the change small: no i18n dependency, no routing changes, no backend changes.

## Non-goals

- Locale-prefixed URLs (`/es`, `/en`), Next.js i18n routing, or middleware.
- Languages beyond English and Spanish.
- Translating font-derived data: family names, named-instance names, and axis tags/names come from the uploaded file and stay as-is.
- Translating the product name "Variable Font Unpacker" in the hero.
- Localized number, date, or currency formatting (the UI has none).

## Approach

**Client-side context with a plain dictionary** (chosen over `next-intl`, which adds a dependency and config for ~20 strings, and over cookie + middleware negotiation, which adds server-side machinery to avoid a single frame of flicker).

A new `lib/i18n.tsx` owns three responsibilities:

1. **Dictionary** — `const dictionaries = { es, en }` where every key exists in both. The English object is typed against the Spanish one (`Record<keyof typeof es, string>`) so a missing translation is a compile error.
2. **Resolution** — on mount, read `localStorage` first; fall back to `navigator.language.toLowerCase().startsWith("es") ? "es" : "en"`. An explicit choice always beats browser detection.
3. **Distribution** — a `LanguageProvider` client component holding `lang` state, plus a `useI18n()` hook returning `{ t, lang, setLang }`. `setLang` writes to `localStorage`.

Components call `useI18n()` directly rather than receiving translated strings as props, so no prop threading is needed.

## Initial render behavior

`navigator` does not exist during server rendering, so the provider's initial state is `"es"` and detection runs in a `useEffect` after hydration. An English-language browser therefore sees one frame of Spanish before the switch. This is a deliberate trade: eliminating it requires reading `Accept-Language` in middleware and persisting a cookie, which is out of scope.

Because the pre-hydration render is Spanish, `app/layout.tsx` changes its server-rendered `<html lang="en">` to `lang="es"` so the attribute matches the markup it ships with. The provider effect then updates `document.documentElement.lang` to the resolved language, keeping it accurate for screen readers.

## Language toggle

A small `ES / EN` control in the top-right of the header in `app/page.tsx`, styled with the existing `font-mono text-xs uppercase` treatment. The inactive language is dimmed (`text-paper/50`); the active one uses `text-axis-teal`. Clicking switches and persists.

## Strings to translate

| Source | Strings |
|--------|---------|
| `app/page.tsx` | Hero subtitle, "Inspeccionando fuente…", inspect-failure and unexpected-error fallbacks |
| `components/Dropzone.tsx` | Drop prompt, supported-formats line, wrong-extension error |
| `components/FontPreview.tsx` | "Fuente cargada" / "Cargando fuente…", preview input placeholder |
| `components/InstanceList.tsx` | "Instancias con nombre", "Ejes de variación" |
| `components/DownloadButton.tsx` | "Descargar instancia estática", "Extrayendo…", extract-failure and unexpected-error fallbacks |

The preview's default sample text ("The quick brown fox…") stays English in both languages: it is a pangram chosen to exercise glyphs, not UI copy.

Error responses from `/api/extract` return a generic English `detail` ("Extraction failed"); the client keeps using its own translated fallback message rather than surfacing that string.

## Files to change

| File | Change |
|------|--------|
| `lib/i18n.tsx` | **New.** Dictionary, detection, `LanguageProvider`, `useI18n`. |
| `app/layout.tsx` | Wrap `children` in `LanguageProvider`; set the server-rendered `<html lang>` to `"es"`. |
| `app/page.tsx` | Replace literals with `t.*`; add the `ES / EN` toggle to the header. |
| `components/Dropzone.tsx` | Replace literals with `t.*`. |
| `components/FontPreview.tsx` | Replace literals with `t.*`. |
| `components/InstanceList.tsx` | Replace literals with `t.*`. |
| `components/DownloadButton.tsx` | Replace literals with `t.*`. |

## Success criteria

- A browser set to English renders the English UI after hydration; a browser set to any Spanish variant (`es`, `es-AR`, `es-ES`) renders Spanish.
- Clicking the toggle switches every visible string, including errors and loading states.
- The chosen language survives a page reload and overrides the browser language.
- `document.documentElement.lang` matches the active language.
- No Spanish string literals remain in `app/page.tsx` or `components/*.tsx`.
- Upload, axis manipulation, and download behavior are unchanged.

## Verification

The repository has no test suite, so verification is manual against `npm run dev`:

1. Load with the browser in English, then in Spanish, and confirm the rendered language each time.
2. Toggle to the other language, reload, and confirm the choice persisted.
3. Upload a `.png` (or other rejected extension) in both languages and confirm the error text is translated.
4. Run `npm run build` (or `npx tsc --noEmit`) to confirm no type errors from the dictionary typing.

## Out of scope follow-ups (optional later)

- Cookie + middleware negotiation to remove the first-frame flicker.
- Localized `<title>` and `<meta description>`.
- Additional languages.
