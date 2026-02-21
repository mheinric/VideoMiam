import { sendRequest } from "./common.js"

const subscriptionList = document.getElementById("subscriptionList");

document.getElementById("addSubscriptionButton").onclick = async () => {
	await sendRequest("subscriptions/add", {
		youtubeId : document.getElementById("subscriptionIdInput").value,
	});
	//TODO: feedback if the request fails
	//Reload the list of subscriptions
	await loadSubscriptions();
};

/**
 * Make a request to the server to get a list of all the subscriptions.
 * @returns The list of all the subscriptions and their details.
 */
async function listSubscriptions() {
	let res = await sendRequest("subscriptions/list", {});
	if (res.status == "OK") {
		return res.data;
	}
	else {
		return [];
	}
}

/**
 * Populates the view with the list of subscriptions retrieved from the server.
 */
async function loadSubscriptions() {
	subscriptionList.innerHTML = "";
	for (let sub of await listSubscriptions()) {
		const subDiv = document.createElement("div"); 
		subDiv.classList.add("sub");
		if (sub.Favorite) {
			subDiv.classList.add("favSub");
		}

		const imgDiv = document.createElement("div"); 
		imgDiv.classList.add("subImgDiv");
		const subImg = document.createElement("img"); 
		subImg.src = sub.IconURL;
		subImg.classList.add("subIcon");
		imgDiv.appendChild(subImg);
		const listIconImg = document.createElement("img");
		listIconImg.src = "img/list.svg";
		listIconImg.classList.add("listIcon");
		imgDiv.appendChild(listIconImg);
		subDiv.appendChild(imgDiv)

		const subTitle = document.createElement("h2");
		subTitle.textContent = sub.Title + " ";
		const link = document.createElement("a"); 
		link.classList.add("externalLink");
		link.href = `https://www.youtube.com/channel/${sub.YoutubeId}`;
		link.target = "_blank";
		subTitle.appendChild(link);		
		subDiv.appendChild(subTitle);
		const subInfo = sub;
		subImg.onclick = async () => {
			window.location = `channel.html?id=${subInfo.Id}`;
		}

		const markFavButton = document.createElement("button");
		markFavButton.classList.add("markFav");
		markFavButton.onclick = async () => {
			await sendRequest("subscriptions/markFavorite", {
				channelId: subInfo.Id, 
				favorite: !subInfo.Favorite,
			});
			subInfo.Favorite = !subInfo.Favorite;
			subDiv.classList.toggle("favSub");
		}
		subDiv.appendChild(markFavButton);

		subscriptionList.appendChild(subDiv);
	}
}

loadSubscriptions();