import { sendRequest, listChannels } from "./common.js"

const subscriptionList = document.getElementById("subscriptionList");

/**
 * Populates the view with the list of subscriptions retrieved from the server.
 */
async function loadSubscriptions() {
	subscriptionList.innerHTML = "";
	for (let sub of await listChannels()) {
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

		const markFavButton = document.createElement("div");
		markFavButton.classList.add("markFav");
		subDiv.appendChild(markFavButton);

		const editBtn = document.createElement("button");
		editBtn.classList.add("editSubBtn");
		subDiv.appendChild(editBtn);

		const editMenu = document.createElement("div");
		editMenu.classList.add("editMenu");

		const item1 = document.createElement("button");
		item1.classList.add("editMenuItem");
		const updateFavItem = () => {
			item1.textContent = subInfo.Favorite ? "Unset as favorite" : "Set as favorite";
			item1.classList.toggle("favMenuItem", !subInfo.Favorite);
			item1.classList.toggle("unfavMenuItem", subInfo.Favorite);
		};
		updateFavItem();
		item1.onclick = async (e) => {
			e.stopPropagation();
			await sendRequest("subscriptions/markFavorite", {
				channelId: subInfo.Id,
				favorite: !subInfo.Favorite,
			});
			subInfo.Favorite = !subInfo.Favorite;
			subDiv.classList.toggle("favSub");
			updateFavItem();
			editMenu.classList.remove("show");
		};
		editMenu.appendChild(item1);

		const item2 = document.createElement("button");
		item2.classList.add("editMenuItem", "removeMenuItem");
		item2.textContent = "Remove";
		item2.onclick = (e) => {
			e.stopPropagation();
			editMenu.classList.remove("show");
			document.getElementById("confirmRemoveOverlay").style.display = "block";
			document.getElementById("confirmRemoveYesButton").onclick = async () => {
				await sendRequest("subscriptions/remove", {
					channelId: subInfo.Id,
				});
				document.getElementById("confirmRemoveOverlay").style.display = "none";
				subscriptionList.removeChild(subDiv);
			};
		};
		editMenu.appendChild(item2);

		subDiv.appendChild(editMenu);

		editBtn.onclick = (e) => {
			e.stopPropagation();
			closeAllEditMenus(editMenu);
			editMenu.classList.toggle("show");
		};

		subscriptionList.appendChild(subDiv);
	}
}

loadSubscriptions();

function closeAllEditMenus(except) {
	document.querySelectorAll(".editMenu.show").forEach(m => {
		if (m !== except) m.classList.remove("show");
	});
}

document.addEventListener("click", () => {
	closeAllEditMenus();
});

const confirmOverlay = document.getElementById("confirmRemoveOverlay");
confirmOverlay.onclick = (e) => {
	if (e.target.id == "confirmRemoveOverlay") {
		confirmOverlay.style.display = "none";
	}
};
document.getElementById("confirmRemoveNoButton").onclick = () => {
	confirmOverlay.style.display = "none";
};