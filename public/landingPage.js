
const footnotesDiv = document.querySelector("footer");
let index = 0;
for (var footnoteLink of document.querySelectorAll("a.footnoteRef")) {
	index += 1;
	let footnotePar = document.createElement("p");
	footnotePar.innerHTML = `<a href='#footnote-source-${index}'>↑</a> [${index}] ` + footnoteLink.innerHTML;
	footnoteLink.innerHTML = `[${index}]`;
	footnotePar.id = `footnote-${index}`;
	footnoteLink.href = `#footnote-${index}`;
	footnoteLink.id = `footnote-source-${index}`;
	footnotesDiv.appendChild(footnotePar);
}