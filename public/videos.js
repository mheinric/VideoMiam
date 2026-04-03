import {sendRequest, insertAllVideos} from "./common.js"

const videoList = document.getElementById("videoList");
const recentVideoList = document.getElementById("recentVideoList");

async function listRecentVideos(favorites, limit) {
	let res = await sendRequest("videos/listRecent", {
		favorites: favorites, 
		limit: limit
	}); 
	if (res.status == "OK") {
		return res.data;
	}
	else {
		return [];
	}
}

async function main() {
	await insertAllVideos(videoList, await listRecentVideos(true, 15)); 
	await insertAllVideos(recentVideoList, await listRecentVideos(false, 10));
}

main();