CREATE TABLE Subscriptions (
    Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    YoutubeId CHAR(64) NOT NULL UNIQUE,
    Kind CHAR(16) NOT NULL CHECK( Kind IN ('Playlist','Channel') ),
    Title TEXT NOT NULL,
    IconURL TEXT NOT NULL,
    IsFavorite BOOLEAN NOT NULL DEFAULT FALSE,
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


/**
CHANGELOG: Adding Subscriptions.IsFavorite
ALTER TABLE Subscriptions ADD IsFavorite BOOLEAN NOT NULL DEFAULT FALSE;


**/