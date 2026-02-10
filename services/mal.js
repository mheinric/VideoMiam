/**
 * Utility function for retrieving data from MyAnimeList
 */
import config from '../config.js';

const CLIENT_ID = config["anime"]["mal_client_id"];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function query(url) {
    console.log(`Sending request to ${url}`);
    const res = await fetch(url, {
        headers: {
            "X-MAL-CLIENT-ID": CLIENT_ID,
          },
    });
    const resJson = await res.json(); 
    //Sleep for 500ms to be nice with their server.
    await sleep(500);
    //console.log("Result:"); 
    //console.log(JSON.stringify(resJson));
    return resJson; //TODO: error handling
}

export async function getAnimeInfos(animeId) {
    return query(`https://api.myanimelist.net/v2/anime/${animeId}?fields=id,title,main_picture,start_date,end_date,synopsis,media_type,status,genres,num_episodes,start_season,broadcast,source,average_episode_duration,pictures,background,related_anime,studios,statistics`);
}

export function convertAnimeStatus(malStatus) {
    if (malStatus == "finished_airing") 
    {
        return "Completed";
    }
    else if (malStatus == "not_yet_aired")
    {
        return "Planned";
    }
    else 
    {
        return "InProgress";
    }
}

export default {
    getAnimeInfos,
    convertAnimeStatus
}