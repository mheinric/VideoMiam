import {reloadDB, loadVideos} from "./common.js"

const videoList = document.getElementById("videoList");

async function main() {
	await reloadDB();
	await loadVideos(videoList, "SELECT * FROM Videos WHERE Viewed = FALSE;", true);
}

main();