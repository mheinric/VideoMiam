import { getChannelInfos, insertAllVideos, sendRequest} from "./common.js"

const channelVideoList = document.getElementById("channelVideoList");
const channelDisplayNewOnly = document.getElementById("channelDisplayNewOnly");
const currentChannelId = parseInt(new URLSearchParams(window.location.search).get("id"));

async function fetchVideos() {
	let newVideosOnly = channelDisplayNewOnly.checked;
	let res = await sendRequest("videos/listForSubscription", {
		channelId : currentChannelId,
		newVideosOnly : newVideosOnly,
	});
	if (res.status == "OK") {
		return res.data;
	}
	else {
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

async function main() {
	await updateChannelInfos();
	await insertAllVideos(channelVideoList, await fetchVideos());
}

main();