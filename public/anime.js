import {sendRequest, reloadDB} from "./common.js"

const newAnimeButton = document.getElementById("newAnimeButton");
const newAnimeField = document.getElementById("newAnimeField");
const recommendedAnimeList = document.getElementById("recommendedAnimeList");
const watchedAnimeList = document.getElementById("watchedAnimeList");

newAnimeButton.onclick = async function() {
	await sendRequest("/videomiam/addAnime", {
		malId : newAnimeField.value,
	});
};

async function main() {
	await reloadDB();
}

main();