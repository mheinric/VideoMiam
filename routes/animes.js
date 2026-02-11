import express from 'express';

import { ok } from '../middlewares.js';
import { addAnimeToDatabase } from '../services/animes.js';
import db from '../services/db.js';

const router = express.Router();

router.post("/listViewed", 
    async (req, res) => ok(res, await db.listViewedAnimes())
)

router.post("/listUpcoming", 
    async (req, res) => ok(res, await db.listUpcomingAnimes())
)

router.post("/listSuggested", 
    async (req, res) => ok(res, await db.listSuggestedAnimes())
)

router.post("/add", 
    //TODO add input validation
    async (req, res) => { await addAnimeToDatabase(req.body.malId); ok(res); }
);

router.post("/markWatched", 
    //TODO add input validation
    async (req, res) => { await db.markAnimeInterest(req.body.id, false); ok(res); }
);

router.post("/markNotInterested", 
    //TODO add input validation
    async (req, res) => { await db.markAnimeViewed(req.body.id, true, new Date()); ok(res); }
    
);

export default router;