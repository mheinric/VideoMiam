import express from 'express';
import { body } from 'express-validator';

import { ok, assertAuth, assertInput, isStrictInt, error } from '../middlewares.js';
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
    body("malId").isString().notEmpty(),
    assertInput,
    async (req, res) => { await addAnimeToDatabase(req.session.userId, req.body.malId); ok(res); }
);

router.post("/markWatched", 
    assertAuth,
    body("animeId").custom(isStrictInt),
    assertInput,
    async (req, res) => { 
        if (!await db.getAnime(req.body.animeId))
        {
            error(res, 404, "Anime not found");
            return;
        }
        await db.markAnimeViewed(req.session.userId, req.body.animeId, true, new Date()); 
        ok(res); 
    }
);

router.post("/markNotInterested", 
    assertAuth,
    body("animeId").custom(isStrictInt),
    assertInput,
    async (req, res) => { 
        if (!await db.getAnime(req.body.animeId))
        {
            error(res, 404, "Anime not found");
            return;
        }
        await db.markAnimeInterest(req.session.userId, req.body.animeId, false); ok(res); 
    }
    
);

export default router;