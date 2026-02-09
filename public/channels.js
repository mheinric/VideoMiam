import {db, parseResult, sendRequest, reloadDB} from "./common.js"

const subscriptionList = document.getElementById("subscriptionList");

document.getElementById("addSubscriptionButton").onclick = async () => {
	await sendRequest("addSubscription", {
		channelId : document.getElementById("subscriptionIdInput").value,
	});
};

async function loadSubscriptions() {
	subscriptionList.innerHTML = "";
	for (var sub of parseResult(db.exec("SELECT * FROM Subscriptions"))) {
		const subDiv = document.createElement("div"); 
		subDiv.classList.add("sub");
		if (sub.IsFavorite) {
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
			await sendRequest("markFavorite", {
				id: subInfo.Id, 
				favorite: !subInfo.IsFavorite,
			});
			subInfo.IsFavorite = !subInfo.IsFavorite;
			subDiv.classList.toggle("favSub");
		}
		subDiv.appendChild(markFavButton);

		subscriptionList.appendChild(subDiv);
	}
}

async function main() {
	await reloadDB();
	await loadSubscriptions();
}

main();