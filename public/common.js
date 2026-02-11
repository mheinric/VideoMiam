export const sqlPromise = initSqlJs({
		locateFile: file => `dist/${file}`
	});
export var db = null;

export function parseResult(sqlResult) {
	if (sqlResult.length == 0) 
	{
		return [];
	}
	sqlResult = sqlResult[0];
	const res = [];
	for (var sqlRow of sqlResult.values) {
		const row = {};
		for (var i in sqlResult.columns) {
			row[sqlResult.columns[i]] = sqlRow[i];
		}
		res.push(row);
	}
	return res;
}

const channelInfoCache = new Map();

export async function getChannelInfos(channelId) {
	if (!channelInfoCache.has(channelId)) {
		const res = await sendRequest("subscriptions/details", {
			channelId: channelId
		});
		if (res.status == "OK") {
			channelInfoCache.set(channelId, res.data);
		}
	}
	return channelInfoCache.get(channelId);
}

export function formatTime(timeSec) {
	var result = "";
	if (timeSec > 60 * 60) {
		result += Math.round(timeSec / 60 / 60) + ":";
		timeSec = timeSec % (60 * 60);
	}
	result += String(Math.round(timeSec / 60)).padStart(2, '0') + ":" + String(timeSec % 60).padStart(2, '0');
	return result; 
}

export async function sendRequest(path, params) {
	const res = await fetch(path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(params)
	}).then(response => response.json());
	if (res.status != "OK") {
		console.log(res);
	}
	return res;
}

export async function reloadDB() {
	const dataPromise = fetch("data.db").then(res => res.arrayBuffer());
	const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
	db = new SQL.Database(new Uint8Array(buf));
}

export async function insertAllVideos(targetDiv, videos) {
	targetDiv.innerHTML = "";
	for (let video of videos) {
		await insertVideo(targetDiv, video);
	}
}

export async function loadVideos(targetDiv, query, showFavOnly) {
	targetDiv.innerHTML = "";
	const allVideos = parseResult(db.exec(query));
	for (var video of allVideos) {
		if (video.UploadDate) {
			video.UploadDate = new Date(video.UploadDate);
		}
	}
	//Put more recent videos first
	allVideos.sort((v1, v2) => v2.UploadDate - v1.UploadDate );

	for (var video of allVideos) {
		const chanInfo = await getChannelInfos(video.SubscriptionId);
		if (showFavOnly && !chanInfo.IsFavorite) {
			continue;
		}
		await insertVideo(targetDiv, video);
	}
}

async function insertVideo(targetDiv, video) {
	if (video.UploadDate) {
		video.UploadDate = new Date(video.UploadDate);
	}
	const chanInfo = await getChannelInfos(video.SubscriptionId);
	const videoDiv = document.createElement("div"); 
	videoDiv.classList.add("vid");
	if (video.Viewed) {
		videoDiv.classList.add("vidSeen");
	}
	const chanTitle = document.createElement("h3"); 
	chanTitle.textContent = chanInfo.Title;
	const channelIcon = document.createElement("img");
	channelIcon.src = chanInfo.IconURL;
	channelIcon.width = 20;
	channelIcon.height = 20
	chanTitle.insertBefore(channelIcon, chanTitle.firstChild);
	videoDiv.appendChild(chanTitle);

	const vidImg = document.createElement("img"); 
	vidImg.classList.add("vidIcon");
	vidImg.src = video.ThumbnailURL;
	vidImg.onclick = async () => {
		window.open("https://youtube.com/watch?v=" + vidData.YoutubeId, '_blank').focus();
		await sendRequest("videos/markViewed", {
			id: vidData.Id, 
			viewed: true,
			viewDate: new Date().toISOString(),
		})
		await reloadDB();
		await loadVideos(targetDiv, query, showFavOnly);
	}
	videoDiv.appendChild(vidImg);

	const timeLabel = document.createElement("span"); 
	timeLabel.classList.add("timeLabel");
	timeLabel.textContent = formatTime(video.DurationSec);
	videoDiv.appendChild(timeLabel);

	const vidTitle = document.createElement("h2");
	vidTitle.textContent = video.Title;
	vidTitle.title = video.Title;
	videoDiv.appendChild(vidTitle);
	const vidData = video; 


	const toggleSeenButton = document.createElement("button");
	toggleSeenButton.classList.add("toggleSeen"); 
	toggleSeenButton.onclick = async () => {
		await sendRequest("videos/markViewed", {
			id: vidData.Id, 
			viewed: !vidData.Viewed,
			viewDate: null,
		});
		vidData.Viewed = !vidData.Viewed; 
		videoDiv.classList.toggle("vidSeen");
	};
	videoDiv.appendChild(toggleSeenButton);

	videoDiv.setAttribute("videoId", video.Id);
	videoDiv.setAttribute("videoTitle", video.Title);
	targetDiv.appendChild(videoDiv);
}