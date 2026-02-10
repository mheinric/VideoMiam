import { app, baseUrl } from './common.js'
import db from '../db.js';
import yt from '../yt.js';

app.post(baseUrl + 'subscriptions/add', async (req, res) => {
    if (!req.body.channelId) {
        console.log("subscriptions/add: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return;
    }
    //TODO: handle subscriptions to playlists
    //TODO: handle the case where we already have a subscription to the channel.
    const newSubscription = req.body.channelId;
    if (await db.isSubscribedTo(newSubscription)) {
        console.log("subscriptions/add: Already subscribed to channel/playlist");
        res.status(400).send({status: "Already subscribed"});
        return;
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
        console.log(`subscriptions/add: Invalid subscription id: ${newSubscription}`);
        res.status(400).send({status: "Invalid ID"});
        return;
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

    res.send({ status: "OK"});
});