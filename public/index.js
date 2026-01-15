import {reloadDB, loadVideos} from "./common.js"

const videoList = document.getElementById("videoList");
const recentVideoList = document.getElementById("recentVideoList");

async function main() {
	await reloadDB();
	await loadVideos(videoList, "SELECT * FROM Videos WHERE Viewed = FALSE;", true);
	await loadVideos(recentVideoList, "SELECT * FROM Videos INNER JOIN Subscriptions ON Videos.SubscriptionId = Subscriptions.Id WHERE Viewed = FALSE AND Subscriptions.IsFavorite = FALSE ORDER BY Videos.UploadDate DESC LIMIT 10;");
}

main();