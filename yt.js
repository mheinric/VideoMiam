import Duration from 'tinyduration';
import config from './config.js';

const API_KEY = config["youtube_api_key"];

async function query(url) {
    console.log(`Sending request to ${url}`);
    const res = await fetch(url + "&key=" + API_KEY);
    const resJson = await res.json(); 
    //console.log("Result:"); 
    //console.log(JSON.stringify(resJson));
    return resJson; //TODO: error handling
}

function parseDuration(durationStr) {
    const durationStruct = Duration.parse(durationStr); 
    //Assuming months, years... are 0 because it does not really make sense here.
    var res = 0; 
    if (durationStruct.seconds) {
        res += durationStruct.seconds; 
    }
    if (durationStruct.minutes) {
        res += durationStruct.minutes * 60;
    }
    if (durationStruct.hours) {
        res += durationStruct.hours * 60 * 60;
    }
    return res;
}

// List the 50 most recent videos of a playlist
export async function getPlaylistVideos(playlistId, all=false, nextPage = null) {
    const nextPagePart = nextPage ? `&pageToken=${nextPage}` : ""; 
    const res = await query(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails,status&maxResults=50&playlistId=${playlistId}${nextPagePart}`);
    res.items = res.items.filter((item) => item.status.privacyStatus == "public");
    for (var video of res.items) {
        video.snippet.publishedAt = new Date(video.snippet.publishedAt);
    }
    //We need to make an other request to get the duration of the videos
    if (res.items.length == 0) {
        return res.items;
    }
    var idParam = `${res.items[0].contentDetails.videoId}`; 
    for (var i = 1; i < res.items.length; i++) {
        idParam += `,${res.items[i].contentDetails.videoId}`;
    }
    const resVid = await query(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${idParam}`); 
    for (var i = 0; i < res.items.length; i++) {
        resVid.items[i].contentDetails.duration = parseDuration(resVid.items[i].contentDetails.duration);
        res.items[i].additionalDetails = resVid.items[i].contentDetails;
    }
    if (all && res.nextPageToken) {
        console.log("Trying next page");
        const rest = await getPlaylistVideos(playlistId, true, res.nextPageToken);
        res.items = res.items.concat(rest);
    }

    return res.items;
}

// List the 50 most recent videos of a channel, given by channel id.
//TODO: apparently this is dead code?
async function channelVideos(channelId) {
    //First retrieve playlist id for uploads of the channel
    const queryRes = await query(`https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=snippet,contentDetails`);
    //TODO: error handling
    const playlistId = queryRes.items[0].contentDetails.relatedPlaylists.uploads;
    return await getPlaylistVideos(playlistId);
}

export async function getChannelInfos(channelId) {
    //TODO error handling
    const queryRes = await query(`https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=snippet,contentDetails`);
    return queryRes.items[0];
}

export async function getPlaylistInfos(playlistId) {
    //TODO error handling
    const queryRes = await query(`https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}&part=snippet,contentDetails`);
    return queryRes.items[0];
}

export default {
    getChannelInfos,
    getPlaylistInfos,
    getPlaylistVideos
}