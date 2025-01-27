const express = require('express');
const schedule = require('node-schedule');
const db = require('./db.js');
const yt = require('./yt.js');
const app = express();
const PORT = 8741;

app.use(express.json());
app.use('/videomiam', express.static(__dirname + '/public'));
app.use('/favicon.ico', express.static(__dirname + '/public/favicon.ico'));

app.post('/videomiam/addSubscription', async (req, res) => {
    if (!req.body.channelId) {
        console.log("addSubscription: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return;
    }
    //TODO: handle subscriptions to playlists
    //TODO: handle the case where we already have a subscription to the channel.
    const newSubscription = req.body.channelId;
    console.log(`Adding subscription to ${newSubscription}`);
    const channelInfo = await yt.getChannelInfos(newSubscription);
    const channelId = await db.addSubscription(newSubscription, "Channel", channelInfo.snippet.title, 
        channelInfo.snippet.thumbnails.medium.url);
    const playlistId = channelInfo.contentDetails.relatedPlaylists.uploads;
    for (var videoInfo of await yt.getPlaylistVideos(playlistId, true)) {
        //TODO: handle better if viewed or not.
        //TODO: make sure video does not exist yet
        if (videoInfo.videoInfo.additionalDetails.duration < 3 * 60) {
            //Skip already viewed videos
            continue;
        }
        await db.addVideo(videoInfo.contentDetails.videoId, videoInfo.snippet.title, videoInfo.additionalDetails.duration, 
            videoInfo.snippet.description, videoInfo.snippet.publishedAt, videoInfo.snippet.thumbnails.medium.url, 
            channelId, false);
        console.log(`Adding video ${videoInfo.snippet.title}`); 
    }

    res.send({ status: "OK"});
});

app.post("/videomiam/markViewed", async (req, res) => {
    if (typeof req.body.id == 'undefined' || typeof req.body.viewed == 'undefined' || typeof req.body.viewDate == 'undefined') {
        console.log("markViewed: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return; 
    }
    console.log(`Marking video ${req.body.id} as viewed=${req.body.viewed}`);
    await db.setViewed(req.body.id, req.body.viewed, req.body.viewDate != null ? new Date(req.body.viewDate) : null);
    res.send({ status: "OK"});
})

// Catch-all route for other requests
app.use((req, res) => {
    res.status(404).send({ status: "Not Found" });
});

schedule.scheduleJob('0 17 * * *', async () => {
    for (var sub of await db.getAllSubscriptions()) {
        console.log(`Checking new videos for ${sub.Title}`);
        const channelInfo = await yt.getChannelInfos(sub.YoutubeId);
        for (var videoInfo of await yt.getPlaylistVideos(channelInfo.contentDetails.relatedPlaylists.uploads)) {
            if (videoInfo.additionalDetails.duration > 3 * 60 && !await db.hasVideo(videoInfo.contentDetails.videoId)) {
                //TODO: refactor with addSubscription
                await db.addVideo(videoInfo.contentDetails.videoId, videoInfo.snippet.title, videoInfo.additionalDetails.duration, 
                    videoInfo.snippet.description, videoInfo.snippet.publishedAt, videoInfo.snippet.thumbnails.medium.url, 
                    sub.Id, false);
                console.log(`Adding video ${videoInfo.snippet.title}`);
            }
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Serving at port ${PORT}`);
    db.getAllSubscriptions();
    //db.clearDB();
});
