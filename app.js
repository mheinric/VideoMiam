import express from 'express';
import session from 'express-session';
import path from 'path';

import config from './config.js';
import animes from './routes/animes.js';
import subscriptions from './routes/subscriptions.js';
import videos from './routes/videos.js';
import user from './routes/user.js'

export const app = express();

export const baseUrl = config["base_url"];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: config["passwords"]["cookies_secret"],
    resave: false, //Not sure what this is about
    saveUninitialized: false, //Not sure what this is about
    cookie: { secure: config["passwords"]["secure_cookies"] }
}));
app.use(baseUrl, express.static(path.resolve(config["dirname"], 'public')));

app.use(baseUrl + "/animes", animes);
app.use(baseUrl + "/subscriptions", subscriptions);
app.use(baseUrl + "/videos", videos);
app.use(baseUrl + "/user", user);

// Catch-all route for other requests
app.use((req, res) => {
    res.status(404).send({ status: "Not Found" });
});


