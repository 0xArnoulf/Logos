// Locutions live in quotes.json — yes, I chose all of them one by one personally.

const phraseEl = document.getElementById("phrase");
const greekEl = document.getElementById("greek");
const languageEl = document.getElementById("language");
const separatorEl = document.getElementById("separator");
const linkEl = document.getElementById("link");
const boxEl = document.getElementById("locution");

// Same page in two formats: the toolbar popup, or the full new tab
const isTab = document.body.classList.contains("tab");
const SIZES = isTab
	? { latin: [112, 40], greek: [140, 56], tessera: 13 }
	: { latin: [40, 20], greek: [44, 26], tessera: 7.5 };

function render(quote) {
	const isGreek = quote.lang === "grc";
	document.body.dataset.lang = isGreek ? "grc" : "la";

	greekEl.hidden = !isGreek;
	greekEl.textContent = isGreek ? quote.greek : "";
	phraseEl.textContent = quote.text;
	phraseEl.lang = isGreek ? "grc-Latn" : "la";
	languageEl.textContent = isGreek ? "Ancient Greek" : "Latin";

	if (quote.link) {
		linkEl.href = quote.link;
		linkEl.textContent = new URL(quote.link).hostname.includes("wiktionary") ? "Wiktionary" : "Wikipedia";
		linkEl.target = isTab ? "_self" : "_blank";
		linkEl.hidden = false;
	} else {
		linkEl.hidden = true;
	}
	separatorEl.hidden = linkEl.hidden;

	fit(isGreek ? greekEl : phraseEl, isGreek ? SIZES.greek : SIZES.latin);
}

// Shrink the main line until the locution fits its frame
function fit(el, [max, min]) {
	const content = boxEl.firstElementChild;
	for (let size = max; size >= min; size--) {
		el.style.fontSize = size + "px";
		if (content.offsetHeight <= boxEl.clientHeight && content.scrollWidth <= boxEl.clientWidth) break;
	}
}

async function main() {
	const quotes = await (await fetch("quotes.json")).json();
	const day = previewDay() ?? dayOfYear(new Date());
	const quote = quotes[day % quotes.length];

	await document.fonts.ready;
	render(quote);
	Mosaic.start(document.getElementById("mosaic"), {
		seed: day + 1,
		lang: document.body.dataset.lang,
		row: SIZES.tessera,
	});

	// Refit the locution when the new tab is resized
	if (isTab) {
		let pending = 0;
		window.addEventListener("resize", () => {
			clearTimeout(pending);
			pending = setTimeout(() => render(quote), 120);
		});
	}
}

// Day of the year, 0-based (0 = Jan 1, 365 = Dec 31 of a leap year).
// Compared in UTC so daylight saving shifts can't skew the result.
function dayOfYear(date) {
	const startOfYear = Date.UTC(date.getFullYear(), 0, 1);
	const startOfDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
	return (startOfDay - startOfYear) / 86400000;
}

// index.html?day=84 previews a given day
function previewDay() {
	const day = Number.parseInt(new URLSearchParams(location.search).get("day"), 10);
	return Number.isInteger(day) && day >= 0 ? day : null;
}

main().catch((error) => {
	console.error(error);
	render({ text: "Errare humanum est", link: "" });
	Mosaic.start(document.getElementById("mosaic"), { seed: 1, lang: "la", row: SIZES.tessera });
});
