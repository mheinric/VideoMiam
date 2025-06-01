import {sendRequest, reloadDB, db, parseResult } from "./common.js"

const newAnimeButton = document.getElementById("newAnimeButton");
const newAnimeField = document.getElementById("newAnimeField");
const recommendedAnimeList = document.getElementById("recommendedAnimeList");
const watchedAnimeList = document.getElementById("watchedAnimeList");

newAnimeButton.onclick = async function() {
	await sendRequest("/videomiam/addAnime", {
		malId : newAnimeField.value,
	});
	await reloadDB();
	await updateAnimeList();
};

async function populateList(targetDiv, query, imageOnly) {
	targetDiv.innerHTML = "";
	const animes = parseResult(db.exec(query));
	
	for (var anime of animes)
	{
		const animeDiv = document.createElement("div");
		animeDiv.classList.add("animeItem");
		if (imageOnly)
		{
			animeDiv.classList.add("animeImageItem");
		}

		const animeTitle = document.createElement("h3");
		animeTitle.textContent = anime.Title;
		animeDiv.appendChild(animeTitle);

		const animePicture = document.createElement("img");
		animePicture.src = anime.ThumbnailURL;
		animeDiv.appendChild(animePicture);

		if (!imageOnly)
		{
			const animeGenres = document.createElement("div"); 
			animeGenres.classList.add("genres");
			for (var genre of anime.Genres.split(","))
			{
				const genreElt = document.createElement("span"); 
				genreElt.textContent = genre;
				animeGenres.appendChild(genreElt);
				animeGenres.appendChild(document.createTextNode(" "));
			}
			animeDiv.appendChild(animeGenres);
	
			const animeSynopsis = document.createElement("div");
			animeSynopsis.classList.add("synopsis");
			animeSynopsis.textContent = anime.Synopsis;
			animeDiv.appendChild(animeSynopsis);
	
			const buttonDiv = document.createElement("div");
			buttonDiv.classList.add("buttonsDiv");
			const watchedButton = document.createElement("button");
			watchedButton.textContent = "Watched";
			const itemId = anime.Id;
			watchedButton.onclick = async function() {
				await sendRequest("/videomiam/animes/markWatched", {
					id : itemId,
				});
				await reloadDB();
				await updateAnimeList();
			}
	
			const notInterestedButton = document.createElement("button");
			notInterestedButton.textContent = "Not interested";
			notInterestedButton.onclick = async function() {
				await sendRequest("/videomiam/animes/markNotInterested", {
					id : itemId,
				});
				await reloadDB();
				await updateAnimeList();
			}
	
			buttonDiv.appendChild(watchedButton);
			buttonDiv.appendChild(notInterestedButton);
			animeDiv.appendChild(buttonDiv);
		}

		targetDiv.appendChild(animeDiv);
	}
}

async function updateAnimeList() {
	await populateList(recommendedAnimeList, "SELECT * FROM Animes WHERE Viewed = FALSE AND NotInterested = FALSE;", false);
	await populateList(watchedAnimeList, "SELECT * FROM Animes WHERE Viewed = TRUE;", true);
}

async function main() {
	await reloadDB();
	await updateAnimeList();
}

main();