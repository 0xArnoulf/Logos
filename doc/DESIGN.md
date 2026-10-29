---
name: Logos
description: A daily classical locution, set in gold glass on a Ravenna mosaic.
colors:
  gold: "#e8c66a"
  gold-dim-latin: "#c9a755"
  gold-dim-greek: "#bfa35e"
  gold-hover: "#f6dc93"
  porphyry-field: "#5c1520"
  porphyry-grout: "#2a0910"
  lapis-field: "#18255a"
  lapis-grout: "#090f2e"
typography:
  phrase:
    fontFamily: "Alegreya SC, serif"
    fontSize: "40px"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "0.03em"
  greek:
    fontFamily: "Alegreya, serif"
    fontSize: "44px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "0em"
  transliteration:
    fontFamily: "Alegreya SC, serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "0.14em"
  colophon:
    fontFamily: "Alegreya SC, serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  none: "0px"
spacing:
  tessera: "7.5px"
  frame: "32px"
components:
  link:
    textColor: "{colors.gold}"
    typography: "{typography.colophon}"
  link-hover:
    textColor: "{colors.gold-hover}"
---

# Design System: Logos

## Overview

The popup is one framed mosaic panel from a Ravenna vault. Each day's locution is set in gold glass on a field of porphyry red (Latin) or Byzantine lapis (Greek). The colour alone tells the language; a small caps label says it in words. The panel is fixed at 320 × 300 like a framed mosaic: the type scales to fit, the frame never stretches.

## Colors

### Primary
- **Gold** (`#e8c66a`): every letter, the frame band, the Ω medallion, the link, the focus ring and the text selection.

### Secondary
- **Porphyry field** (`#5c1520`) with **porphyry grout** (`#2a0910`): the Latin theme.
- **Lapis field** (`#18255a`) with **lapis grout** (`#090f2e`): the Greek theme.

### Named Rules
- **The Two-Ink Rule.** A theme is one field colour plus gold. Nothing else appears: no grey, no white, no third accent. Secondary text is gold dimmed toward the field, never grey.
- **The Language Rule.** Red means Latin, blue means Ancient Greek, always. The colour is never decorative and never varies by day.

## Typography

Alegreya (Huerta Tipográfica, SIL OFL), self-hosted in `fonts/` for Latin, Latin Extended, Greek and polytonic Greek.

### Hierarchy
- **Phrase** (Alegreya SC 500, 40px fitted down to 20px): the Latin locution, balanced lines.
- **Greek** (Alegreya 500, 44px fitted down to 26px): the Greek script, lowercase, above its transliteration.
- **Transliteration** (Alegreya SC 500, 16px, 0.14em tracking): dimmed gold under the Greek.
- **Colophon** (Alegreya SC 500, 14px, 0.1em): language label and link.

### Named Rules
- **The Fit Rule.** The main line starts at its maximum size and steps down a pixel at a time until it fits the 256 × 168 frame. Never truncate, never scroll.

## Layout

Two formats share one page (`styles.css`, `popup.js`, `mosaic.js`).

- **Toolbar popup** (`index.html`): a fixed 320 × 300 panel, tesserae 7.5px.
- **New tab** (`newtab.html`): the whole window is the panel, tesserae 13px; the locution box spans the window minus `max(64px, 12vw)` on each side, phrase fitted from 112px (Greek 140px), colophon 20px. The context link opens in the same tab.

Every mosaic dimension derives from the tessera size, so both formats look alike. In the popup: a frame band of four tessera rings (dark, gold, gold, dark), the Ω medallion straddling its top centre, the locution centred in a 256 × 168 box starting 58px from the top, and the colophon 34px from the bottom.

## Elevation & Depth

No surfaces stack. Depth comes from the glass: letters carry a short offset shadow (`0 1px 1px`) plus a soft 8px haze, as if set slightly proud of the field.

## Shapes

Square tesserae with grout seams. No rounded corners on anything the page draws; the only curve is the medallion.

## Components

### Mosaic (signature)
`mosaic.js` draws the panel on a canvas. Tesserae are laid in rings that follow the frame inward (andamento), and the field calms toward the centre so the letters stay legible. The day number seeds the layout, so each day's mosaic is unique and the same for everyone. Gold tesserae sit at slight tilts and catch a light that follows the pointer; on open the light sweeps in once and settles. With reduced motion the mosaic renders still.

### Link
Gold small caps, 1px underline at 4px offset in half-strength gold; full gold underline and lighter gold on hover; 1px gold outline on keyboard focus. Names its destination (Wikipedia or Wiktionary) and hides when an entry has no link, along with its tessera separator.

## Do's and Don'ts

### Do:
- Draw every new element in the two inks of the current theme.
- Keep the label "Latin" / "Ancient Greek" so the language never depends on colour alone.
- Show the Greek script first and the transliteration beneath it.

### Don't:
- Don't add a third colour, a grey, or a gradient to the text.
- Don't put the locution on a card or any container inside the panel.
- Don't invent translations, authors or dates: the data has none yet.
