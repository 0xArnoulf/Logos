# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Public Chrome users who install Logos from the Chrome Web Store. They open the toolbar popup for a few seconds, usually once a day, to read the day's locution. The popup must make sense on its own to someone who has never seen it.

## Product Purpose
Logos shows one classical locution per day (Latin or Ancient Greek, roughly -500 to 1800 AD) with a link to learn more. Success: the visitor reads the phrase, recognises whether it is Latin or Greek, and can follow the link for context.

## Positioning
A hand-curated list chosen one by one by the author, not a generated or scraped feed.

## Capabilities and Constraints
- Chrome extension, Manifest V3, toolbar popup (`index.html`), no network permissions.
- Data lives in `quotes.json`: `text`, `link` (Wikipedia/Wiktionary, may be empty), and for Greek entries `lang: "grc"` plus the original spelling in Greek script.
- One locution per day, cycling through the list in order.
- Greek locutions use a blue theme, Latin locutions a red theme (user requirement).
- Greek entries display the Greek script with the transliteration beneath.

## Brand Commitments
- Name: Logos.
- Emblem: the Ω (omega) icon.
- No other visual element of the previous design is binding.

## Evidence on Hand
229 curated locutions in `quotes.json` (27 Greek, 202 Latin). No translations, authors or dates yet: do not invent them in the UI.

## Product Principles
- The locution is the whole interface; everything else steps back.
- Language is identity: Latin and Greek must be distinguishable at a glance.
- Works offline and instantly, with no external dependency.
