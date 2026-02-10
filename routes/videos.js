import { app, baseUrl } from './common.js';
import db from '../db.js';

app.post(baseUrl + "/videos/markViewed", async (req, res) => {
    if (typeof req.body.id == 'undefined' || typeof req.body.viewed == 'undefined' || typeof req.body.viewDate == 'undefined') {
        console.log("videos/markViewed: Invalid input"); 
        res.status(400).send({status: "Invalid"});
        return; 
    }
    console.log(`Marking video ${req.body.id} as viewed=${req.body.viewed}`);
    await db.setViewed(req.body.id, req.body.viewed, req.body.viewDate != null ? new Date(req.body.viewDate) : null);
    res.send({ status: "OK"});
});

app.post(baseUrl + "/videos/markFavorite", async (req, res) => {
    if (typeof req.body.id == 'undefined' || typeof req.body.favorite == 'undefined') {
        console.log("videos/markFavorite: Invalid input");
        res.status(400).send({status: "Invalid"});
        return; 
    }
    console.log(`Marking channel ${req.body.id} as favorite=${req.body.favorite}`);
    await db.setChannelFavorite(req.body.id, req.body.favorite);
    res.send({ status: "OK" });
});