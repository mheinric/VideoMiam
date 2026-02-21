import express from 'express';

import { ok, assertAuth } from '../middlewares.js';
import { addAnimeToDatabase } from '../services/animes.js';
import db from '../services/db.js';

const router = express.Router();

router.post("/listViewed", 
    assertAuth,
    async (req, res) => ok(res, await db.listViewedAnimes(req.session.userId))
)

router.post("/listUpcoming",
    assertAuth, 
    async (req, res) => ok(res, await db.listUpcomingAnimes(req.session.userId))
)

router.post("/listSuggested", 
    assertAuth,
    async (req, res) => ok(res, await db.listSuggestedAnimes(req.session.userId))
)

router.post("/add", 
    assertAuth,
    //TODO add input validation
    async (req, res) => { await addAnimeToDatabase(req.session.userId, req.body.malId); ok(res); }
);

router.post("/markWatched", 
    assertAuth,
    //TODO add input validation
    async (req, res) => { await db.markAnimeViewed(req.session.userId, req.body.animeId, true, new Date()); ok(res); }
);

router.post("/markNotInterested", 
    assertAuth,
    //TODO add input validation
    async (req, res) => { await db.markAnimeInterest(req.session.userId, req.body.animeId, false); ok(res); }
    
);

export default router;