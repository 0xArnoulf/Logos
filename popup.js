// Locutions live in quotes.json — yes, I chose all of them one by one personally.

const textEl = document.getElementById("dynamic-text");
const linkEl = document.getElementById("dynamic-link");

function render({ text, link }) {
	textEl.textContent = text;
	if (link) {
		linkEl.href = link;
		linkEl.hidden = false;
	} else {
		linkEl.hidden = true;
	}
}

async function main() {
	const quotes = await (await fetch("quotes.json")).json();

	// Cycle through the list so it works whatever its length
	render(quotes[dayOfYear(new Date()) % quotes.length]);
}

// Day of the year, 0-based (0 = Jan 1, 365 = Dec 31 of a leap year).
// Compared in UTC so daylight saving shifts can't skew the result.
function dayOfYear(date) {
	const startOfYear = Date.UTC(date.getFullYear(), 0, 1);
	const startOfDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
	return (startOfDay - startOfYear) / 86400000;
}

main().catch((error) => {
	console.error(error);
	render({ text: "Errare humanum est", link: "" });
});
