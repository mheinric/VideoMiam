import schedule from 'node-schedule';

import db from './services/db.js';
import yt from './services/yt.js';
import mal from './services/mal.js';
import { sendSMS } from './services/notifications.js';

import { addAnimeToDatabase } from './services/animes.js'


export async function retrieveYoutubeData() {
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
                        sub.Id);
                    console.log(`Adding video ${videoInfo.snippet.title}`);
                }
            }
        } catch (e) {
            console.log(`Failed to retrieve infos for subscription ${sub.Title}`); 
            console.log(e);
            if (enableSMSNotifs)
            {
                await sendSMS(`Failed to retrieve infos for ${sub.Title}`);
            }
        }
    }
}

//Schedule every day at 5pm
schedule.scheduleJob('0 17 * * *', retrieveYoutubeData);

export async function retrieveMALData() {
    const animes = await db.listViewedAnimes();
    for (var anime of animes) {
        try {
            console.log(`Updating data for ${anime.Title}`);
            const animeData = await mal.getAnimeInfos(anime.MalId);
            const newStatus = mal.convertAnimeStatus(animeData["status"]);
            await db.updateAnimeStatus(anime.Id, newStatus);
            for (var relatedAnimeData of animeData["related_anime"]) {
                const animeInDb = await db.malAnimeIsPresent(relatedAnimeData["node"]["id"]);
                if (!animeInDb) {
                    await addAnimeToDatabase(relatedAnimeData["node"]["id"]);
                }
            }
        } catch(e) {
            console.log(`Failed to retrieve infos for Anime ${anime.Title}`); 
            console.log(e);
            if (enableSMSNotifs)
            {
                await sendSMS(`Failed to retrieve infos for Anime ${anime.Title}`);
            }
        }
    }
}

//schedule ever first of the month at midnight
schedule.scheduleJob('0 0 1 * *', retrieveMALData);