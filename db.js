const db = require('better-sqlite3')('public/data.db');

//TODO: put this into a class so that we can have several different dbs.
//Keep a dict with a cache of the connected dbs.

async function clearDB() {
    db.prepare("DELETE FROM Videos").run(); 
    db.prepare("DELETE FROM Subscriptions").run(); 
}

const listSubStatement = db.prepare("SELECT * FROM Subscriptions");
async function getAllSubscriptions() {
    return listSubStatement.all();
}

const addSubStatement = db.prepare("INSERT INTO Subscriptions(YoutubeId, Kind, Title, IconURL) VALUES (?, ?, ?, ?)");
async function addSubscription(youtubeId, kind, title, iconURL) {
    const res = addSubStatement.run(youtubeId, kind, title, iconURL);
    return res.lastInsertRowid;
}

const updateIconStatement = db.prepare("UPDATE Subscriptions SET IconURL = ? WHERE YoutubeId = ?");
async function updateSubscriptionIcon(youtubeId, iconUrl) {
    updateIconStatement.run(iconUrl, youtubeId); 
}

async function removeSubscription(id) {
    //Should also remove all videos associated with this subscription
    //TODO: sql queries
}

const isSubStatement = db.prepare("SELECT COUNT(*) AS Result FROM Subscriptions WHERE YoutubeId = ?");
async function isSubscribedTo(youtubeId) {
    return isSubStatement.get(youtubeId).Result != 0;
}

const containsVideoStatement = db.prepare("SELECT COUNT(*) AS Result FROM Videos WHERE YoutubeId = ?");
async function hasVideo(youtubeId) {
    return containsVideoStatement.get(youtubeId).Result != 0;
}

const addVideoStatement = db.prepare("INSERT INTO Videos (YoutubeId, Title, DurationSec, Details, UploadDate, ThumbnailURL, SubscriptionId, Viewed, ViewDate) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); ")
async function addVideo(youtubeId, title, durationSec, details, uploadDate, thumbnailURL, subscriptionId, viewed) {
    // The viewed * 1 is because better-sqlite3 does not handle booleans
    const res = addVideoStatement.run(youtubeId, title, durationSec, details, uploadDate.toISOString(), thumbnailURL, 
        subscriptionId, viewed * 1, null); 
    return res.lastInsertRowid;
}

const markViewedStatement = db.prepare("UPDATE Videos SET Viewed = ?, ViewDate = ? WHERE Id = ?");
async function setViewed(videoId, viewed, viewDate) {
    markViewedStatement.run(viewed * 1, viewDate != null ? viewDate.toISOString() : null, videoId);
}

const markFavStatement = db.prepare("UPDATE Subscriptions SET IsFavorite = ? WHERE Id = ?")
async function setChannelFavorite(channelId, favorite) {
    markFavStatement.run(favorite * 1, channelId);
}

const addAnimeStatement = db.prepare("INSERT INTO Animes(MalId, Title, NbEpisodes, Genres, Viewed, NotInterested, ViewDate, ThumbnailURL, CurrentStatus, Synopsis) VALUES (?,?,?,?,?,?,?,?,?,?);")
async function addAnime(malId, title, nbEpisodes, genres, thumbnailURL, currentStatus, synopsis) {
    const res = addAnimeStatement.run(malId, title, nbEpisodes, genres.join(","), 0, 0, null, thumbnailURL, currentStatus, synopsis);
    res.lastInsertRowid
}

module.exports = {
    clearDB,
    addSubscription, 
    updateSubscriptionIcon,
    getAllSubscriptions, 
    removeSubscription, 
    isSubscribedTo, 

    hasVideo,
    addVideo, 
    setViewed,
    setChannelFavorite,

    addAnime,
}