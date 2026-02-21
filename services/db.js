import fs from 'node:fs';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import config from '../config.js'

const dbExists = fs.existsSync('data.db');
const db = new Database('data.db');
if (!dbExists) {
    db.exec(fs.readFileSync('databaseSchema.sql', 'utf-8'));
}

const statementCache = new Map();
function prepare(statement) {
    if (!statementCache.has(statement)) {
        statementCache.set(statement, db.prepare(statement));
    }
    return statementCache.get(statement)
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

export async function getAllSubscriptions(userId = null) {
    if (userId === null) {
        return prepare("SELECT * FROM Subscriptions").all();
    }
    else {
        return prepare(`
            SELECT Subscriptions.*, UserSubscriptions.Favorite
            FROM Subscriptions INNER JOIN UserSubscriptions ON Subscriptions.Id = UserSubscriptions.ChannelId
            WHERE UserId = ?
        `).all(userId);
    }
}

export async function getSubscription(channelId, userId = null) {
    if (userId === null) {
        return prepare("SELECT * FROM Subscriptions WHERE Id = ?").get(channelId);
    } else {
        return prepare(`
            SELECT Subscriptions.*, UserSubscriptions.Favorite 
            FROM Subscriptions INNER JOIN UserSubscriptions ON Subscriptions.Id = UserSubscriptions.ChannelId
            WHERE UserSubscriptions.ChannelId = ? AND UserSubscriptions.UserId = ?`).get(channelId, userId);
    }
}

export async function getSubscriptionByYoutubeId(youtubeId) {
    return prepare("SELECT * FROM Subscriptions WHERE YoutubeId = ?").get(youtubeId);
}

export async function addSubscription(youtubeId, kind, title, iconURL) {
    const res = prepare("INSERT INTO Subscriptions(YoutubeId, Kind, Title, IconURL) VALUES (?, ?, ?, ?)")
        .run(youtubeId, kind, title, iconURL);
    return res.lastInsertRowid;
}

export async function updateSubscriptionIcon(youtubeId, iconUrl) {
    prepare("UPDATE Subscriptions SET IconURL = ? WHERE YoutubeId = ?").run(iconUrl, youtubeId); 
}

export async function removeSubscription(id) {
    //Should also remove all videos associated with this subscription
    //TODO: sql queries
}

export async function isSubscribedTo(youtubeId) {
    return prepare("SELECT COUNT(*) AS Result FROM Subscriptions WHERE YoutubeId = ?").get(youtubeId).Result != 0;
}

export async function subscribeUserTo(userId, channelId) {
    prepare("INSERT INTO UserSubscriptions(UserId, ChannelId, Favorite) VALUES(?, ?, FALSE)").run(userId, channelId);
}

export async function listVideosForSubscription(channelId, viewedCondition) {
    if (viewedCondition === null) {
        return prepare("SELECT * FROM Videos WHERE SubscriptionId = ? ORDER BY UploadDate DESC").all(channelId);
    } else {
        // The viewed * 1 is because better-sqlite3 does not handle booleans
        return db.prepare(`
            SELECT * FROM Videos 
            WHERE SubscriptionId = ? AND Viewed = ? 
            ORDER BY UploadDate DESC
        `).all(channelId, viewedCondition * 1);
    }
}

export async function listRecentVideos(userId, favorites, limit) {
    // The viewed * 1 is because better-sqlite3 does not handle booleans
    return prepare(`
        SELECT Videos.* 
        FROM Videos 
            INNER JOIN UserSubscriptions ON Videos.SubscriptionId = UserSubscriptions.ChannelId
            LEFT JOIN VideoStatus ON VideoStatus.VideoId = Videos.Id
        WHERE ViewedStatus = NULL AND UserSubscriptions.Favorite = ? AND UserSubscriptions.UserId = ?
        ORDER BY Videos.UploadDate DESC LIMIT ?;
    `).all(favorites * 1, userId, limit);
}


export async function hasVideo(youtubeId) {
    return prepare("SELECT COUNT(*) AS Result FROM Videos WHERE YoutubeId = ?").get(youtubeId).Result != 0;
}

export async function addVideo(youtubeId, title, durationSec, details, uploadDate, thumbnailURL, subscriptionId, viewed) {
    // The viewed * 1 is because better-sqlite3 does not handle booleans
    return prepare(`
        INSERT INTO Videos (YoutubeId, Title, DurationSec, Details, UploadDate, ThumbnailURL, SubscriptionId, Viewed, ViewDate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(youtubeId, title, durationSec, details, uploadDate.toISOString(), thumbnailURL, subscriptionId, viewed * 1, null)
    .lastInsertRowid; 
}

export async function setViewed(videoId, viewed, viewDate) {
    prepare("UPDATE Videos SET Viewed = ?, ViewDate = ? WHERE Id = ?").run(viewed * 1, viewDate != null ? viewDate.toISOString() : null, videoId);
}

export async function setChannelFavorite(userId, channelId, favorite) {
    prepare(`
        UPDATE UserSubscriptions 
        SET Favorite = ? 
        WHERE UserId = ? AND ChannelId = ?
    `).run(favorite * 1, userId, channelId);
}

export async function addAnime(malId, title, nbEpisodes, genres, thumbnailURL, currentStatus, synopsis) {
    return prepare(`
        INSERT INTO Animes(MalId, Title, NbEpisodes, Genres, Viewed, NotInterested, ViewDate, ThumbnailURL, CurrentStatus, Synopsis) VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(malId, title, nbEpisodes, genres.join(","), 0, 0, null, thumbnailURL, currentStatus, synopsis)
    .lastInsertRowid;
}

export async function markAnimeViewed(animeId, viewed, viewDate) {
    prepare("UPDATE Animes SET Viewed = ?, ViewDate = ? WHERE Id = ?")
        .run(viewed * 1, viewDate != null ? viewDate.toISOString() : null, animeId);
}

export async function markAnimeInterest(animeId, interested) {
    prepare("UPDATE Animes SET NotInterested = ? WHERE Id = ?").run(1 - interested * 1, animeId);
}

export async function listViewedAnimes() {
    return prepare("SELECT * FROM Animes WHERE Viewed = TRUE").all();
}

export async function listUpcomingAnimes() {
    return prepare("SELECT * FROM Animes WHERE Viewed = FALSE AND CurrentStatus != 'Completed'").all();
}

export async function listSuggestedAnimes() {
    return prepare("SELECT * FROM Animes WHERE Viewed = FALSE AND CurrentStatus = 'Completed'").all();
}

export async function updateAnimeStatus(id, newStatus) {
    prepare("UPDATE Animes SET CurrentStatus = ? WHERE Id = ?").run(newStatus, id);
}

export async function malAnimeIsPresent(malId) {
    return prepare("SELECT COUNT(*) AS NbEntries FROM Animes WHERE MalId = ?").get(malId).NbEntries > 0;
}

export async function addUser(email, password) {
    let res = prepare("INSERT INTO Users(Email, PasswordHash) VALUES (?, ?)").run(email, await bcrypt.hash(password, config["passwords"]["bcrypt_rounds"]));
    return res.lastInsertRowid;
}

export async function userExists(email) {
    return prepare("SELECT COUNT(*) AS NbEntries FROM Users WHERE Email = ?").get(email).NbEntries > 0;
}

export async function checkUserPassword(id, password) {
    let entries = prepare("SELECT * FROM Users WHERE Email = ?").all(id); 
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