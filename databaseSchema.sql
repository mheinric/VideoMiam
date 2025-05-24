CREATE TABLE Subscriptions (
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    YoutubeId CHAR(64) NOT NULL UNIQUE,
    Kind CHAR(16) NOT NULL CHECK( Kind IN ('Playlist','Channel') ),
    Title TEXT NOT NULL,
    IconURL TEXT NOT NULL,
    IsFavorite BOOLEAN NOT NULL DEFAULT FALSE
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
    Viewed BOOLEAN NOT NULL,
    ViewDate TEXT,
    FOREIGN KEY(SubscriptionId) REFERENCES Subscriptions(Id)
);

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
    UploadDate DATE NOT NULL,
    CurrentStatus CHAR(16) NOT NULL CHECK (CurrentStatus IN ('Completed', 'InProgress', 'Planned')),
    Synopsis TEXT NOT NULL
);

CREATE TABLE RelatedAnimes (
    FirstId INTEGER NOT NULL, 
    SecondId INTEGER NOT NULL,
    FOREIGN KEY(FirstId) REFERENCES Animes(Id), 
    FOREIGN KEY(SecondId) REFERENCES Animes(Id)
);


/**
CHANGELOG: Adding Subscriptions.IsFavorite
ALTER TABLE Subscriptions ADD IsFavorite BOOLEAN NOT NULL DEFAULT FALSE;

CHANGELOG: Adding tables Animes and Related Animes
**/