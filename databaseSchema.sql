DROP TABLE IF EXISTS Subscriptions;
CREATE TABLE Subscriptions (
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    YoutubeId CHAR(64) NOT NULL UNIQUE,
    Kind CHAR(16) NOT NULL CHECK( Kind IN ('Playlist','Channel') ),
    Title TEXT NOT NULL,
    IconURL TEXT NOT NULL,
    IsFavorite BOOLEAN NOT NULL DEFAULT FALSE
);

DROP TABLE IF EXISTS Videos;
CREATE TABLE Videos (
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
    YoutubeId CHAR(64) NOT NULL UNIQUE, 
    Title TEXT NOT NULL, 
    DurationSec INT NOT NULL,
    Details TEXT NOT NULL,
    UploadDate DATE NOT NULL,
    ThumbnailURL TEXT NOT NULL,
    SubscriptionId INTEGER NOT NULL,
    Viewed BOOLEAN NOT NULL,
    ViewDate TEXT,
    FOREIGN KEY(SubscriptionId) REFERENCES Subscriptions(Id)
);

DROP TABLE IF EXISTS Animes;
CREATE TABLE Animes (
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
    MalId INTEGER NOT NULL, /* Identifier on the MyAnimeList website */
    Title TEXT NOT NULL,
    NbEpisodes INTEGER NOT NULL, 
    Genres TEXT NOT NULL, /* Comma separated list of items */
    Viewed BOOLEAN NOT NULL,
    NotInterested BOOLEAN NOT NULL,
    ViewDate DATE,
    ThumbnailURL TEXT NOT NULL,
    CurrentStatus CHAR(16) NOT NULL CHECK (CurrentStatus IN ('Completed', 'InProgress', 'Planned')),
    Synopsis TEXT NOT NULL
);

DROP TABLE IF EXISTS RelatedAnimes;
CREATE TABLE RelatedAnimes (
    FirstId INTEGER NOT NULL, 
    SecondId INTEGER NOT NULL,
    FOREIGN KEY(FirstId) REFERENCES Animes(Id), 
    FOREIGN KEY(SecondId) REFERENCES Animes(Id)
);

DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    Email CHAR(64) NOT NULL UNIQUE,
    PasswordHash CHAR(64) NOT NULL
);
CREATE UNIQUE INDEX EmailIndex ON Users(Email);


DROP TABLE IF EXISTS UserSubscriptions;
CREATE TABLE UserSubscriptions (
    UserId INTEGER NOT NULL, 
    ChannelId INTEGER NOT NULL, 
    Favorite BOOLEAN NOT NULL,
    PRIMARY KEY(UserId, ChannelId),
    FOREIGN KEY(UserId) REFERENCES Users(Id)
);

DROP TABLE IF EXISTS VideoStatus;
CREATE TABLE VideoStatus (
    UserId INTEGER NOT NULL, 
    VideoId INTEGER NOT NULL, 
    ViewedStatus CHAR(16) NOT NULL CHECK (ViewedStatus IN ('Viewed', 'NotInterested')),
    ViewDate DATE,
    FOREIGN KEY(UserId) REFERENCES Users(Id), 
    FOREIGN KEY(VideoId) REFERENCES Videos(Id)
);

DROP TABLE IF EXISTS AnimeStatus;
CREATE TABLE AnimeStatus (
    UserId INTEGER NOT NULL, 
    AnimeId INTEGER NOT NULL, 
    ViewedStatus CHAR(16) NOT NULL CHECK (ViewedStatus IN ('Viewed', 'NotInterested')),
    ViewDate DATE,
    FOREIGN KEY(UserId) REFERENCES Users(Id), 
    FOREIGN KEY(AnimeId) REFERENCES Animes(Id)
);

/**
CHANGELOG: Adding Subscriptions.IsFavorite
ALTER TABLE Subscriptions ADD IsFavorite BOOLEAN NOT NULL DEFAULT FALSE;

CHANGELOG: Adding tables Animes and Related Animes

CHANGELOG: Adding Users, UserSubscriptions, VideoStatus, AnimeStatus tables
**/