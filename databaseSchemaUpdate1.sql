/* Script to execute to upgrade an existing database */
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