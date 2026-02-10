import { app, baseUrl } from './common.js';
import mal from '../mal.js';
import db from '../db.js'


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

app.post(baseUrl + "/animes/add", async (req, res) => {
    if (!req.body.malId) {
        console.log("animes/add: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return;
    }
    await addAnimeToDatabase(req.body.malId);
    res.send({ status: "OK" });
});

app.post(baseUrl + "/animes/markWatched", async (req, res) => {
    if (!req.body.id) {
        console.log("animes/markWatched: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return;
    }
    await db.markAnimeViewed(req.body.id, true, new Date());
    console.log(`Anime ${req.body.id} marked as watched`);
    res.send({ status: "OK" });
});

app.post(baseUrl + "/animes/markNotInterested", async (req, res) => {
    if (!req.body.id) {
        console.log("animes/markNotInterested: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return;
    }
    await db.markAnimeInterest(req.body.id, false);
    console.log(`Anime ${req.body.id} marked as not interested`);
    res.send({ status: "OK" });
});