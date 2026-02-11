import { sendRequest } from "./common.js"

const newAnimeButton = document.getElementById("newAnimeButton");
const newAnimeField = document.getElementById("newAnimeField");
const recommendedAnimeList = document.getElementById("recommendedAnimeList");
const watchedAnimeList = document.getElementById("watchedAnimeList");
const upcomingAnimeList = document.getElementById("upcomingAnimeList");

newAnimeButton.onclick = async function() {
	await sendRequest("animes/add", {
		malId : newAnimeField.value,
	});
	await updateAnimeList();
};

async function populateList(targetDiv, endpoint, imageOnly) {
	targetDiv.innerHTML = "";
	let res = await sendRequest(endpoint, {});
	if (res.status != "OK") {
		return;
	}

	let animes = res.data;
	
	for (var anime of animes)
	{
		const animeDiv = document.createElement("div");
		animeDiv.classList.add("animeItem");
		if (imageOnly)
		{
			animeDiv.classList.add("animeImageItem");
		}

		const animeTitle = document.createElement("h3");
		const animeLink = document.createElement("a");
		animeLink.href = `https://myanimelist.net/anime/${anime.MalId}`;
		animeLink.textContent = anime.Title;
		animeTitle.appendChild(animeLink);
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
				await sendRequest("animes/markWatched", {
					id : itemId,
				});
				await updateAnimeList();
			}
	
			const notInterestedButton = document.createElement("button");
			notInterestedButton.textContent = "Not interested";
			notInterestedButton.onclick = async function() {
				await sendRequest("animes/markNotInterested", {
					id : itemId,
				});
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
	await populateList(recommendedAnimeList, "animes/listSuggested", false);
	await populateList(upcomingAnimeList, "animes/listUpcoming", true);
	await populateList(watchedAnimeList, "animes/listViewed", true);
}

updateAnimeList();