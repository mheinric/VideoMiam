import express from 'express';

import { ok, assertAuth } from '../middlewares.js';
import { addAnimeToDatabase } from '../services/animes.js';
import db from '../services/db.js';

const router = express.Router();

router.post("/listViewed", 
    assertAuth,
    async (req, res) => ok(res, await db.listViewedAnimes())
)

router.post("/listUpcoming",
    assertAuth, 
    async (req, res) => ok(res, await db.listUpcomingAnimes())
)

router.post("/listSuggested", 
    assertAuth,
    async (req, res) => ok(res, await db.listSuggestedAnimes())
)

router.post("/add", 
    assertAuth,
    //TODO add input validation
    async (req, res) => { await addAnimeToDatabase(req.body.malId); ok(res); }
);

router.post("/markWatched", 
    assertAuth,
    //TODO add input validation
    async (req, res) => { await db.markAnimeInterest(req.body.id, false); ok(res); }
);

router.post("/markNotInterested", 
    assertAuth,
    //TODO add input validation
    async (req, res) => { await db.markAnimeViewed(req.body.id, true, new Date()); ok(res); }
    
);

export default router;