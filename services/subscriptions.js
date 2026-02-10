import db from '../services/db.js';
import yt from '../services/yt.js';

export async function addSubscription(newSubscription) {
    if (await db.isSubscribedTo(newSubscription)) {
        throw { status: 400, details: "Already subscribed to channel/playlist" };
    }

    var playlistId = null;
    var subId = null;
    if (newSubscription.startsWith("UC")) {
        console.log(`Adding subscription to channel ${newSubscription}`);
        const channelInfo = await yt.getChannelInfos(newSubscription);
        subId = await db.addSubscription(newSubscription, "Channel", channelInfo.snippet.title, 
            channelInfo.snippet.thumbnails.medium.url);
        playlistId = channelInfo.contentDetails.relatedPlaylists.uploads;
    } else if (newSubscription.startsWith("PL")) {
        console.log(`Adding subscription to playlist ${newSubscription}`);
        playlistId = newSubscription;
        const playlistInfo = await yt.getPlaylistInfos(playlistId);
        subId = await db.addSubscription(newSubscription, "Playlist", playlistInfo.snippet.title, playlistInfo.snippet.thumbnails.medium.url);
    } else {
        throw { status: 400, details: "Invalid subscription id" };
    }

    for (var videoInfo of await yt.getPlaylistVideos(playlistId, true)) {
        //TODO: handle better if viewed or not.
        //TODO: make sure video does not exist yet
        if (videoInfo.additionalDetails.duration < 3 * 60) {
            //Skip already viewed videos
            continue;
        }
        await db.addVideo(videoInfo.contentDetails.videoId, videoInfo.snippet.title, videoInfo.additionalDetails.duration, 
            videoInfo.snippet.description, videoInfo.snippet.publishedAt, videoInfo.snippet.thumbnails.medium.url, 
            subId, false);
        console.log(`Adding video ${videoInfo.snippet.title}`); 
    }
}