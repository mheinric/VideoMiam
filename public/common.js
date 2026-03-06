
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

/**
 * Make a request to the server to get a list of all the subscriptions.
 * @returns The list of all the subscriptions and their details.
 */
export async function listChannels() {
	let res = await sendRequest("subscriptions/list", {});
	if (res.status == "OK") {
		for (let item of res.data) 
		{
			channelInfoCache.set(item.Id, item);
		}
		return res.data;
	}
	else {
		return [];
	}
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
	const response = await fetch(path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(params)
	});
	//If user is not logged in, redirect to the login page.
	if (response.status == 401) {
		window.location.href = "login.html";
	}
	const res = await response.json();
	if (res.status != "OK") {
		console.log(res);
	}
	return res;
}

export async function insertAllVideos(targetDiv, videos) {
	targetDiv.innerHTML = "";
	for (let video of videos) {
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
	if (video.ViewedStatus == 'Viewed') {
		videoDiv.classList.add("vidSeen");
	}
	const chanTitle = document.createElement("h3"); 
	chanTitle.textContent = chanInfo.Title;
	const channelIcon = document.createElement("img");
	channelIcon.src = chanInfo.IconURL;
	chanTitle.insertBefore(channelIcon, chanTitle.firstChild);
	videoDiv.appendChild(chanTitle);

	const vidImg = document.createElement("img"); 
	vidImg.classList.add("vidIcon");
	vidImg.src = video.ThumbnailURL;
	vidImg.onclick = async () => {
		window.open("https://youtube.com/watch?v=" + vidData.YoutubeId, '_blank').focus();
		await sendRequest("videos/markViewed", {
			videoId: vidData.Id, 
			viewed: true,
			viewDate: new Date().toISOString(),
		})
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
			videoId: vidData.Id, 
			viewed: !(vidData.ViewedStatus == 'Viewed'),
			viewDate: null,
		});
		vidData.ViewedStatus = vidData.ViewedStatus == 'Viewed' ? null : 'Viewed'; 
		videoDiv.classList.toggle("vidSeen");
	};
	const buttonsDiv = document.createElement("div"); 
	buttonsDiv.classList.add("buttonsDiv"); 
	buttonsDiv.appendChild(toggleSeenButton);
	videoDiv.appendChild(buttonsDiv);

	videoDiv.setAttribute("videoId", video.Id);
	videoDiv.setAttribute("videoTitle", video.Title);
	targetDiv.appendChild(videoDiv);
}

async function initChannelList() {

	const chanDiv = document.getElementById("channelShortcuts"); 
	if (!chanDiv)
	{
		return;
	}
	let channels = await listChannels(); 
	for (let chanInfo of channels) 
	{
		const channelIcon = document.createElement("img");
		channelIcon.src = chanInfo.IconURL;
		const link = document.createElement("a");
		link.href = `channel.html?id=${chanInfo.Id}`;
		link.appendChild(channelIcon);
		chanDiv.appendChild(link);
	}
}

initChannelList();