import './animes.js';
import './subscriptions.js';
import './videos.js';
import { app } from './common.js';
export { app, baseUrl } from './common.js';


// Catch-all route for other requests
app.use((req, res) => {
    res.status(404).send({ status: "Not Found" });
});
