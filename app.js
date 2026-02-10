import express from 'express';
import path from 'path';

import config from './config.js';
import animes from './routes/animes.js';
import subscriptions from './routes/subscriptions.js';
import videos from './routes/videos.js';

export const app = express();

export const baseUrl = config["base_url"];

app.use(express.json());
app.use(baseUrl, express.static(path.resolve(config["dirname"], 'public')));

app.use(baseUrl + "/animes", animes);
app.use(baseUrl + "/subscriptions", subscriptions);
app.use(baseUrl + "/videos", videos);

// Catch-all route for other requests
app.use((req, res) => {
    res.status(404).send({ status: "Not Found" });
});


