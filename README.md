# Logos
Chrome extension to get classical references daily. ≈ -500 to 1800 AD.

# How

The extension displays every day a different latin/greek locution. Below, a wikipedia link to get more context.

# Install

1. Clone or download this repository
2. Open `chrome://extensions` and enable **Developer mode**
3. Click **Load unpacked** and select the project folder
4. Pin Logos from the extensions menu and click the Ω icon

# Add a locution

Locutions live in [`quotes.json`](quotes.json), one per line:

```json
{"text":"Carpe diem","link":"https://en.wikipedia.org/wiki/Carpe_diem"}
```

The list cycles day by day, so it can be any length. Leave `link` empty if there is no page to point to.
