
/* Note: remove tables in reverse order of creation to avoid FOREIGN KEY contraint issues*/
DROP TABLE IF EXISTS AnimeStatus;
DROP TABLE IF EXISTS VideoStatus;
DROP TABLE IF EXISTS UserSubscriptions;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS RelatedAnimes;
DROP TABLE IF EXISTS Animes;
DROP TABLE IF EXISTS Videos;
DROP TABLE IF EXISTS Subscriptions;


CREATE TABLE Subscriptions (
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    YoutubeId CHAR(64) NOT NULL UNIQUE,
    Kind CHAR(16) NOT NULL CHECK( Kind IN ('Playlist','Channel') ),
    Title TEXT NOT NULL,
    IconURL TEXT NOT NULL
);

CREATE TABLE Videos (
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
    YoutubeId CHAR(64) NOT NULL UNIQUE, 
    Title TEXT NOT NULL, 
    DurationSec INT NOT NULL,
    Details TEXT NOT NULL,
    UploadDate DATE NOT NULL,
    ThumbnailURL TEXT NOT NULL,
    SubscriptionId INTEGER NOT NULL,
    FOREIGN KEY(SubscriptionId) REFERENCES Subscriptions(Id)
);

CREATE TABLE Animes (
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
    MalId INTEGER NOT NULL, /* Identifier on the MyAnimeList website */
    Title TEXT NOT NULL,
    NbEpisodes INTEGER NOT NULL, 
    Genres TEXT NOT NULL, /* Comma separated list of items */
    ThumbnailURL TEXT NOT NULL,
    CurrentStatus CHAR(16) NOT NULL CHECK (CurrentStatus IN ('Completed', 'InProgress', 'Planned')),
    Synopsis TEXT NOT NULL
);

CREATE TABLE RelatedAnimes (
    FirstId INTEGER NOT NULL, 
    SecondId INTEGER NOT NULL,
    FOREIGN KEY(FirstId) REFERENCES Animes(Id), 
    FOREIGN KEY(SecondId) REFERENCES Animes(Id)
);

CREATE TABLE Users (
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    Email CHAR(64) NOT NULL UNIQUE,
    PasswordHash CHAR(64) NOT NULL
);
CREATE UNIQUE INDEX EmailIndex ON Users(Email);


CREATE TABLE UserSubscriptions (
    UserId INTEGER NOT NULL, 
    ChannelId INTEGER NOT NULL, 
    Favorite BOOLEAN NOT NULL,
    PRIMARY KEY(UserId, ChannelId),
    FOREIGN KEY(UserId) REFERENCES Users(Id)
);

CREATE TABLE VideoStatus (
    UserId INTEGER NOT NULL, 
    VideoId INTEGER NOT NULL, 
    ViewedStatus CHAR(16) NOT NULL CHECK (ViewedStatus IN ('Viewed', 'NotInterested')),
    ViewDate DATE,
    FOREIGN KEY(UserId) REFERENCES Users(Id), 
    FOREIGN KEY(VideoId) REFERENCES Videos(Id)
);

CREATE TABLE AnimeStatus (
    UserId INTEGER NOT NULL, 
    AnimeId INTEGER NOT NULL, 
    ViewedStatus CHAR(16) NOT NULL CHECK (ViewedStatus IN ('Viewed', 'NotInterested', 'Suggested', 'Interested')),
    ViewDate DATE,
    FOREIGN KEY(UserId) REFERENCES Users(Id), 
    FOREIGN KEY(AnimeId) REFERENCES Animes(Id)
);

/**
CHANGELOG: Adding Subscriptions.IsFavorite
ALTER TABLE Subscriptions ADD IsFavorite BOOLEAN NOT NULL DEFAULT FALSE;

CHANGELOG: Adding tables Animes and Related Animes

CHANGELOG: Adding Users, UserSubscriptions, VideoStatus, AnimeStatus tables
INSERT INTO VideoStatus(UserId, VideoId, ViewedStatus, ViewDate) SELECT 0, Id, 'Viewed', ViewDate FROM Videos WHERE Videos.Viewed = TRUE;
INSERT INTO UserSubscriptions(UserId, ChannelId, Favorite) SELECT 0, Id, IsFavorite FROM Subscriptions;
INSERT INTO AnimeStatus(UserId, AnimeId, ViewedStatus, ViewDate) SELECT 0, Id, 'Viewed', ViewDate FROM Animes WHERE Animes.Viewed = TRUE;
INSERT INTO AnimeStatus(UserId, AnimeId, ViewedStatus, ViewDate) SELECT 0, Id, 'NotInterested', ViewDate FROM Animes WHERE Animes.Viewed = FALSE AND Animes.NotInterested = TRUE;
INSERT INTO AnimeStatus(UserId, AnimeId, ViewedStatus, ViewDate) SELECT 0, Id, 'Interested', ViewDate FROM Animes WHERE Animes.Viewed = FALSE AND Animes.NotInterested = FALSE;

CHANGELOG: Removal of the Viewed and ViewDate columns for Videos and Anime Tables and IsFavorite for Subscriptions
ALTER TABLE Videos DROP COLUMN Viewed;
ALTER TABLE Videos DROP COLUMN ViewDate;
ALTER TABLE Animes DROP COLUMN Viewed;
ALTER TABLE Animes DROP COLUMN ViewDate;
ALTER TABLE Animes DROP COLUMN NotInterested;
ALTER TABLE Subscriptions DROP COLUMN IsFavorite;
**/