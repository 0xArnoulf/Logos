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

	// Day of the year (1-365)
	const today = new Date();
	const dayOfYear = Math.ceil((today - new Date(today.getFullYear(), 0, 1)) / 86400000);

	render(quotes[dayOfYear - 1]);
}

main().catch((error) => {
	console.error(error);
	render({ text: "Errare humanum est", link: "" });
});
