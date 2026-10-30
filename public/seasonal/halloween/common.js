document.querySelector("html").classList.add("halloween");
let cssElt = document.createElement("link");
cssElt.rel = "stylesheet";
cssElt.href = "seasonal/halloween/style.css"
document.querySelector("head").appendChild(cssElt);
document.querySelector("#pageBar a:first-child img").src = "seasonal/halloween/img/videomiam.svg";