const express = require('express');
const schedule = require('node-schedule');
const db = require('./db.js');
const yt = require('./yt.js');
const mal = require('./mal.js');
const app = express();
const PORT = 8741;
const enableSMSNotifs = true;

app.use(express.json());
app.use('/videomiam', express.static(__dirname + '/public'));

app.post('/videomiam/addSubscription', async (req, res) => {
    if (!req.body.channelId) {
        console.log("addSubscription: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return;
    }
    //TODO: handle subscriptions to playlists
    //TODO: handle the case where we already have a subscription to the channel.
    const newSubscription = req.body.channelId;
    if (await db.isSubscribedTo(newSubscription)) {
        console.log("addSubscription: Already subscribed to channel/playlist");
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
        console.log(`addSubscription: Invalid subscription id: ${newSubscription}`);
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

app.post("/videomiam/markViewed", async (req, res) => {
    if (typeof req.body.id == 'undefined' || typeof req.body.viewed == 'undefined' || typeof req.body.viewDate == 'undefined') {
        console.log("markViewed: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return; 
    }
    console.log(`Marking video ${req.body.id} as viewed=${req.body.viewed}`);
    await db.setViewed(req.body.id, req.body.viewed, req.body.viewDate != null ? new Date(req.body.viewDate) : null);
    res.send({ status: "OK"});
});

app.post("/videomiam/markFavorite", async (req, res) => {
    if (typeof req.body.id == 'undefined' || typeof req.body.favorite == 'undefined') {
        console.log("markFavorite: Invalid input");
        res.status(400).send({status: "Invalid"});
        return; 
    }
    console.log(`Marking channel ${req.body.id} as favorite=${req.body.favorite}`);
    await db.setChannelFavorite(req.body.id, req.body.favorite);
    res.send({ status: "OK" });
});

app.post("/videomiam/addAnime", async (req, res) => {
    if (!req.body.malId) {
        console.log("addAnime: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return;
    }
    const animeInfo = await mal.getAnimeInfos(req.body.malId);
    const genres = [];
    for (var g of animeInfo["genres"]) {
        genres.push(g["name"]);
    }
    var status = "InProgress";
    if (animeInfo["status"] == "finished_airing") 
    {
        status = "Completed";
    }
    else if (animeInfo["status"] == "not_yet_aired")
    {
        status = "Planned";
    }
    await db.addAnime(req.body.malId, animeInfo["title"], animeInfo["num_episodes"], 
        genres, animeInfo["main_picture"]["large"], status, animeInfo["synopsis"]);
    console.log(`Added Anime '${animeInfo['title']}' to the database`);
    res.send({ status: "OK" });
});

app.post("/videomiam/animes/markWatched", async (req, res) => {
    if (!req.body.id) {
        console.log("animes/markWatched: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return;
    }
    await db.markAnimeViewed(req.body.id, true, new Date());
    console.log(`Anime ${req.body.id} marked as watched`);
    res.send({ status: "OK" });
});

app.post("/videomiam/animes/markNotInterested", async (req, res) => {
    if (!req.body.id) {
        console.log("animes/markNotInterested: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return;
    }
    await db.markAnimeInterest(req.body.id, false);
    console.log(`Anime ${req.body.id} marked as not interested`);
    res.send({ status: "OK" });
});

// Catch-all route for other requests
app.use((req, res) => {
    res.status(404).send({ status: "Not Found" });
});

async function sendSMS(msg) {
    const res = await fetch("https://smsapi.free-mobile.fr/sendmsg?user=17879914&pass=EEMcXR0NrUaKbi&msg=" + encodeURIComponent(msg));
    if (res.status != 200) {
        console.log("Failed to send SMS"); 
        console.log(res);
    }
}

async function retrieveData() {
    for (var sub of await db.getAllSubscriptions()) {
        try {
            console.log(`Checking new videos for ${sub.Title}`);
            var playlistId = null; 
            if (sub.Kind == "Channel") {
                const channelInfo = await yt.getChannelInfos(sub.YoutubeId);
                playlistId = channelInfo.contentDetails.relatedPlaylists.uploads
                await db.updateSubscriptionIcon(sub.YoutubeId, channelInfo.snippet.thumbnails.medium.url);
            } else if (sub.Kind == "Playlist") {
                playlistId = sub.YoutubeId;
                const playlistInfo = await yt.getPlaylistInfos(playlistId); 
                await db.updateSubscriptionIcon(playlistId, playlistInfo.snippet.thumbnails.medium.url);
            } else {
                console.log(`Skipping unknown subscription type ${sub.Kind} for subscription ${sub.Id}`);
                continue;
            }

            for (var videoInfo of await yt.getPlaylistVideos(playlistId)) {
                if (videoInfo.additionalDetails.duration > 3 * 60 && !await db.hasVideo(videoInfo.contentDetails.videoId)) {
                    //TODO: refactor with addSubscription
                    await db.addVideo(videoInfo.contentDetails.videoId, videoInfo.snippet.title, videoInfo.additionalDetails.duration, 
                        videoInfo.snippet.description, videoInfo.snippet.publishedAt, videoInfo.snippet.thumbnails.medium.url, 
                        sub.Id, false);
                    console.log(`Adding video ${videoInfo.snippet.title}`);
                }
            }
        } catch(e) {
            console.log(`Failed to retrieve infos for subscription ${sub.Title}`); 
            console.log(e);
            if (enableSMSNotifs)
            {
                await sendSMS(`Failed to retrieve infos for ${sub.Title}`);
            }
        }
    }
}

schedule.scheduleJob('0 17 * * *', retrieveData);

// Start the server
app.listen(PORT, async () => {
    console.log(`Serving at http://localhost:${PORT}`);
    if (process.argv.indexOf("--dev") == -1)
    {
        await retrieveData();
    }
});
