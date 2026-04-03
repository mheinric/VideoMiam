import { getChannelInfos, insertAllVideos, sendRequest} from "./common.js"

const channelVideoList = document.getElementById("channelVideoList");
const channelDisplayNewOnly = document.getElementById("channelDisplayNewOnly");
const currentChannelId = parseInt(new URLSearchParams(window.location.search).get("id"));

var allVideos = []

async function fetchVideos() {
	let newVideosOnly = channelDisplayNewOnly.checked;
	let res = await sendRequest("videos/listForSubscription", {
		channelId : currentChannelId,
		newVideosOnly : newVideosOnly,
	});
	if (res.status == "OK") {
		allVideos = res.data;
		return res.data;
	}
	else {
		allVideos = [];
		return [];
	}
}

async function updateChannelInfos()
{
	let titleElt = document.querySelector("#channelPage h1");
	let details = await getChannelInfos(currentChannelId);
	titleElt.textContent = details.Title;
	let icon = document.createElement("img");
	icon.src = details.IconURL;
	titleElt.insertBefore(icon, titleElt.firstChild);
}

channelDisplayNewOnly.onclick = async function() {
	await insertAllVideos(channelVideoList, await fetchVideos());
}

async function markAllWatched(watched) {
	document.getElementById("markAllButton").value = 0;
	let videoIds = []; 
	for (let vid of allVideos) {
		videoIds.push(vid.Id);
	}
	await sendRequest("videos/markViewed", {
		videoIds: videoIds, 
		viewed: watched,
		viewDate: null,
	});
	for (let videoDiv of document.querySelectorAll(".vid")) {
		if (watched) {
			videoDiv.classList.add("vidSeen");
		}
		else {
			videoDiv.classList.remove("vidSeen");
		}
	}
	for (let videoData of allVideos) {
		videoData.ViewedStatus = watched ? 'Viewed' : null; 
	}
}

document.getElementById("markAllWatched").onclick = async () => {
	await markAllWatched(true);
}

document.getElementById("markAllNotWatched").onclick = async () => {
	await markAllWatched(false);
}

main();

async function main() {
	await updateChannelInfos();
	await insertAllVideos(channelVideoList, await fetchVideos());
}