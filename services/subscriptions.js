import db from '../services/db.js';
import yt from '../services/yt.js';

export async function subscribeUserTo(userId, channelURL) {
    let youtubeId = channelURL; 
    if (!channelURL.startsWith("UC") && !channelURL.startsWith("PL")) {
        //The input is probably an url to a youtube page. Try to fetch the id for this page
        const urlObj = new URL(channelURL);
        if (urlObj.searchParams.get("list")) {
            youtubeId = urlObj.searchParams.get("list");
        }
        else {
            //We are dealing with a channel
            let pathElts = urlObj.pathname.split("/");
            youtubeId = pathElts[1];
            if (youtubeId == "channel") {
                youtubeId = pathElts[2];
            }
            if (youtubeId.includes("@")) {
                //This is a channel handle, we need to resolve it to the id
                youtubeId = await yt.resolveChannelHandle(youtubeId);
            }
        }
    }

    let subId = null;
    if (!await db.isSubscribedTo(youtubeId)) {
        subId = await addSubscription(youtubeId);
    }
    else {
        subId = await db.getSubscriptionByYoutubeId(youtubeId).Id;
    }
    await db.subscribeUserTo(userId, subId);
}

export async function addSubscription(youtubeId) {
    if (await db.isSubscribedTo(youtubeId)) {
        throw { status: 400, details: "Already subscribed to channel/playlist" };
    }

    var playlistId = null;
    var subId = null;
    if (youtubeId.startsWith("UC")) {
        console.log(`Adding subscription to channel ${youtubeId}`);
        const channelInfo = await yt.getChannelInfos(youtubeId);
        subId = await db.addSubscription(youtubeId, "Channel", channelInfo.snippet.title, 
            channelInfo.snippet.thumbnails.medium.url);
        playlistId = channelInfo.contentDetails.relatedPlaylists.uploads;
    } else if (youtubeId.startsWith("PL")) {
        console.log(`Adding subscription to playlist ${youtubeId}`);
        playlistId = youtubeId;
        const playlistInfo = await yt.getPlaylistInfos(playlistId);
        subId = await db.addSubscription(youtubeId, "Playlist", playlistInfo.snippet.title, playlistInfo.snippet.thumbnails.medium.url);
    } else {
        throw { status: 400, details: "Invalid subscription id" };
    }

    for (var videoInfo of await yt.getPlaylistVideos(playlistId, true)) {
        //TODO: handle better short videos.
        //TODO: make sure video does not exist yet
        if (videoInfo.additionalDetails.duration < 3 * 60) {
            //Skip short videos
            continue;
        }
        await db.addVideo(videoInfo.contentDetails.videoId, videoInfo.snippet.title, videoInfo.additionalDetails.duration, 
            videoInfo.snippet.description, videoInfo.snippet.publishedAt, videoInfo.snippet.thumbnails.medium.url, 
            subId);
        console.log(new Date());
        console.log(`Adding video ${videoInfo.snippet.title}`); 
    }
    return subId;
}