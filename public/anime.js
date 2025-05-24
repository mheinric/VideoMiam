import {db, parseResult, loadVideos, reloadDB} from "./common.js"

const channelVideoList = document.getElementById("channelVideoList");
const channelDisplayNewOnly = document.getElementById("channelDisplayNewOnly");

var currentChannelInfo = null;

async function fetchChannelInfos()
{
	const currentChannelId = new URLSearchParams(window.location.search).get("id");

	for (var sub of parseResult(db.exec("SELECT * FROM Subscriptions"))) {
		if (sub.Id == currentChannelId)
		{
			currentChannelInfo = sub;
			break;
		}
	}
	if (currentChannelInfo == null)
	{
		document.querySelector("h1").textContent = "Channel not found";
	}
	document.querySelector("#channelPage h1").textContent = currentChannelInfo.Title;
}

channelDisplayNewOnly.onclick = async function() {
	if (channelDisplayNewOnly.checked) {
		await loadVideos(channelVideoList, `SELECT * FROM Videos WHERE SubscriptionId = ${currentChannelInfo.Id} AND Viewed = FALSE`);
	}
	else {
		await loadVideos(channelVideoList, `SELECT * FROM Videos WHERE SubscriptionId = ${currentChannelInfo.Id}`);
	}
}

async function main() {
	await reloadDB();
	await fetchChannelInfos();
	await loadVideos(channelVideoList, `SELECT * FROM Videos WHERE SubscriptionId = ${currentChannelInfo.Id}`, false);
}

main();