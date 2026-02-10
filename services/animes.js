import mal from '../services/mal.js';
import db from '../services/db.js';

export async function addAnimeToDatabase(malId) {
    //TODO: check that the anime does not already exists.
    const animeInfo = await mal.getAnimeInfos(malId);
    const genres = [];
    for (var g of animeInfo["genres"]) {
        genres.push(g["name"]);
    }
    var status = mal.convertAnimeStatus(animeInfo["status"]);
    await db.addAnime(malId, animeInfo["title"], animeInfo["num_episodes"], 
        genres, animeInfo["main_picture"]["large"], status, animeInfo["synopsis"]);
    console.log(`Added Anime '${animeInfo['title']}' to the database`);
}