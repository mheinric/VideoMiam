import fs from 'node:fs';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import config from '../config.js'

const dbExists = fs.existsSync('data.db');
const db = new Database('data.db');
if (!dbExists) {
    db.exec(fs.readFileSync('databaseSchema.sql', 'utf-8'));
}

export async function clearDB() {
    //Note: be careful of order to account for foreign key dependencies.
    //Note: also delete elements from sqlite_sequence to restart id numbering from 0.
    db.exec(`
        DELETE FROM AnimeStatus;
        DELETE FROM VideoStatus;
        DELETE FROM UserSubscriptions;
        DELETE FROM Users;
        DELETE FROM RelatedAnimes;
        DELETE FROM Animes;
        DELETE FROM Videos;
        DELETE FROM Subscriptions;
        DELETE FROM sqlite_sequence;
    `);
}

const listSubStatement = db.prepare("SELECT * FROM Subscriptions");
const listSubByUserStatement = db.prepare(`
    SELECT Subscriptions.* 
    FROM Subscriptions INNER JOIN UserSubscriptions ON Subscriptions.Id = UserSubscriptions.ChannelId
    WHERE UserId = ?`);
export async function getAllSubscriptions(userId = null) {
    if (userId === null) {
        return listSubStatement.all();
    }
    else {
        return listSubByUserStatement.all(userId);
    }
}

const subDetailsStatement = db.prepare("SELECT * FROM Subscriptions WHERE Id = ?");
export async function getSubscription(channelId) {
    return subDetailsStatement.get(channelId);
}

const subDetailsByYoutubeIdStatement = db.prepare("SELECT * FROM Subscriptions WHERE YoutubeId = ?");
export async function getSubscriptionByYoutubeId(youtubeId) {
    return subDetailsByYoutubeIdStatement.get(youtubeId);
}

const addSubStatement = db.prepare("INSERT INTO Subscriptions(YoutubeId, Kind, Title, IconURL) VALUES (?, ?, ?, ?)");
export async function addSubscription(youtubeId, kind, title, iconURL) {
    const res = addSubStatement.run(youtubeId, kind, title, iconURL);
    return res.lastInsertRowid;
}

const updateIconStatement = db.prepare("UPDATE Subscriptions SET IconURL = ? WHERE YoutubeId = ?");
export async function updateSubscriptionIcon(youtubeId, iconUrl) {
    updateIconStatement.run(iconUrl, youtubeId); 
}

export async function removeSubscription(id) {
    //Should also remove all videos associated with this subscription
    //TODO: sql queries
}

const isSubStatement = db.prepare("SELECT COUNT(*) AS Result FROM Subscriptions WHERE YoutubeId = ?");
export async function isSubscribedTo(youtubeId) {
    return isSubStatement.get(youtubeId).Result != 0;
}

const subscribeUserToStatement = db.prepare("INSERT INTO UserSubscriptions(UserId, ChannelId, Favorite) VALUES(?, ?, FALSE)")
export async function subscribeUserTo(userId, channelId) {
    subscribeUserToStatement.run(userId, channelId);
}

const listVideoStatement = db.prepare("SELECT * FROM Videos WHERE SubscriptionId = ? ORDER BY UploadDate DESC");
const listViewedVideoStatement = db.prepare("SELECT * FROM Videos WHERE SubscriptionId = ? AND Viewed = ? ORDER BY UploadDate DESC");
export async function listVideosForSubscription(channelId, viewedCondition) {
    if (viewedCondition === null) {
        return listVideoStatement.all(channelId);
    } else {
        // The viewed * 1 is because better-sqlite3 does not handle booleans
        return listViewedVideoStatement.all(channelId, viewedCondition * 1);
    }
}

const listRecentVidFavStatement = db.prepare("SELECT Videos.* FROM Videos INNER JOIN Subscriptions ON Videos.SubscriptionId = Subscriptions.Id WHERE Viewed = FALSE AND Subscriptions.IsFavorite = ? ORDER BY Videos.UploadDate DESC LIMIT ?;");
export async function listRecentVideos(favorites, limit) {
    // The viewed * 1 is because better-sqlite3 does not handle booleans
    return listRecentVidFavStatement.all(favorites * 1, limit);
}


const containsVideoStatement = db.prepare("SELECT COUNT(*) AS Result FROM Videos WHERE YoutubeId = ?");
export async function hasVideo(youtubeId) {
    return containsVideoStatement.get(youtubeId).Result != 0;
}

const addVideoStatement = db.prepare("INSERT INTO Videos (YoutubeId, Title, DurationSec, Details, UploadDate, ThumbnailURL, SubscriptionId, Viewed, ViewDate) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); ")
export async function addVideo(youtubeId, title, durationSec, details, uploadDate, thumbnailURL, subscriptionId, viewed) {
    // The viewed * 1 is because better-sqlite3 does not handle booleans
    const res = addVideoStatement.run(youtubeId, title, durationSec, details, uploadDate.toISOString(), thumbnailURL, 
        subscriptionId, viewed * 1, null); 
    return res.lastInsertRowid;
}

const markViewedStatement = db.prepare("UPDATE Videos SET Viewed = ?, ViewDate = ? WHERE Id = ?");
export async function setViewed(videoId, viewed, viewDate) {
    markViewedStatement.run(viewed * 1, viewDate != null ? viewDate.toISOString() : null, videoId);
}

const markFavStatement = db.prepare("UPDATE Subscriptions SET IsFavorite = ? WHERE Id = ?")
export async function setChannelFavorite(channelId, favorite) {
    markFavStatement.run(favorite * 1, channelId);
}

const addAnimeStatement = db.prepare("INSERT INTO Animes(MalId, Title, NbEpisodes, Genres, Viewed, NotInterested, ViewDate, ThumbnailURL, CurrentStatus, Synopsis) VALUES (?,?,?,?,?,?,?,?,?,?);")
export async function addAnime(malId, title, nbEpisodes, genres, thumbnailURL, currentStatus, synopsis) {
    const res = addAnimeStatement.run(malId, title, nbEpisodes, genres.join(","), 0, 0, null, thumbnailURL, currentStatus, synopsis);
    return res.lastInsertRowid;
}

const markAnimeWatchedStatement = db.prepare("UPDATE Animes SET Viewed = ?, ViewDate = ? WHERE Id = ?");
export async function markAnimeViewed(animeId, viewed, viewDate) {
    markAnimeWatchedStatement.run(viewed * 1, viewDate != null ? viewDate.toISOString() : null, animeId);
}

const markAnimeInterestStatement = db.prepare("UPDATE Animes SET NotInterested = ? WHERE Id = ?");
export async function markAnimeInterest(animeId, interested) {
    markAnimeInterestStatement.run(1 - interested * 1, animeId);
}

const listViewedAnimesStatement = db.prepare("SELECT * FROM Animes WHERE Viewed = TRUE");
export async function listViewedAnimes() {
    return listViewedAnimesStatement.all();
}

const listUpcomingAnimesStatement = db.prepare("SELECT * FROM Animes WHERE Viewed = FALSE AND CurrentStatus != 'Completed'");
export async function listUpcomingAnimes() {
    return listUpcomingAnimesStatement.all();
}

const listSuggestedAnimesStatement = db.prepare("SELECT * FROM Animes WHERE Viewed = FALSE AND CurrentStatus = 'Completed'");
export async function listSuggestedAnimes() {
    return listSuggestedAnimesStatement.all();
}

const updateAnimeStatusStatement = db.prepare("UPDATE Animes SET CurrentStatus = ? WHERE Id = ?");
export async function updateAnimeStatus(id, newStatus) {
    updateAnimeStatusStatement.run(newStatus, id);
}

const malAnimeIsPresentStatement = db.prepare("SELECT COUNT(*) AS NbEntries FROM Animes WHERE MalId = ?")
export async function malAnimeIsPresent(malId) {
    return malAnimeIsPresentStatement.get(malId).NbEntries > 0;
}

const addUserStatement = db.prepare("INSERT INTO Users(Email, PasswordHash) VALUES (?, ?)");
export async function addUser(email, password) {
    let res = addUserStatement.run(email, await bcrypt.hash(password, config["passwords"]["bcrypt_rounds"]));
    return res.lastInsertRowid;
}

const userExistsStatement = db.prepare("SELECT COUNT(*) AS NbEntries FROM Users WHERE Email = ?");
export async function userExists(email) {
    return userExistsStatement.get(email).NbEntries > 0;
}

const checkUserStatement = db.prepare("SELECT * FROM Users WHERE Email = ?")
export async function checkUserPassword(id, password) {
    let entries = checkUserStatement.all(id); 
    if (entries.length == 0 || !await bcrypt.compare(password, entries[0].PasswordHash)) {
        return null; 
    }
    return entries[0].Id;
}

export default {
    clearDB,
    addSubscription, 
    updateSubscriptionIcon,
    getSubscription,
    getAllSubscriptions, 
    removeSubscription, 
    isSubscribedTo, 
    subscribeUserTo,

    listVideosForSubscription,
    listRecentVideos,
    hasVideo,
    addVideo, 
    setViewed,
    setChannelFavorite,

    addAnime,
    markAnimeViewed,
    markAnimeInterest,
    listViewedAnimes,
    listUpcomingAnimes,
    listSuggestedAnimes,
    updateAnimeStatus,
    malAnimeIsPresent,

    addUser,
    userExists, 
    checkUserPassword,
}