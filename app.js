import fs from 'node:fs';
import express from 'express';
import session from 'express-session';
import path from 'path';
import MemoryStore from 'memorystore';

import config from './config.js';
import animes from './routes/animes.js';
import subscriptions from './routes/subscriptions.js';
import videos from './routes/videos.js';
import user from './routes/users.js'
import { errorHandler } from './middlewares.js';

export const app = express();
const MemoryStoreInstance = MemoryStore(session);

export const baseUrl = config["base_url"];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: config["passwords"]["cookies_secret"],
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: config["passwords"]["secure_cookies"], 
        sameSite: true 
    },
    store: new MemoryStoreInstance({
        checkPeriod: 86400 // Prune expired entries every 24h (in seconds)
    })
}));

app.get(baseUrl + "/", (req, res) => {
    //Note we redirect instead of serving the page directly because the / address does 
    //not work nicely with the relative paths that we use inside the html pages
    res.redirect(baseUrl + "/index.html");
});
app.get(baseUrl + "/index.html", (req, res) => {
    if (req.session.userId || !config["users"]["enable"]) {
        //If we are logged in, redirect directly to the videos page
        res.redirect(baseUrl + "/videos.html");
    } else {
        res.send(fs.readFileSync(path.resolve(config["dirname"], 'public', 'index.html'), 'utf-8'))
    }
});

app.use(baseUrl, express.static(path.resolve(config["dirname"], 'public')));

app.use(baseUrl + "/animes", animes);
app.use(baseUrl + "/subscriptions", subscriptions);
app.use(baseUrl + "/videos", videos);
app.use(baseUrl + "/users", user);

// Catch-all route for other requests
app.use((req, res) => {
    res.status(404).send({ status: "Not Found" });
});

//Error handler
app.use(errorHandler);

export default app;


