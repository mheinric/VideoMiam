import express from 'express';

import { ok } from '../middlewares.js';
import { addAnimeToDatabase } from '../services/animes.js';
import db from '../services/db.js';

const router = express.Router();

router.post("/add", 
    //TODO add input validation
    async (req, res, next) => { await addAnimeToDatabase(req.body.malId); ok(); }
);

router.post("/markWatched", 
    //TODO add input validation
    async (req, res, next) => { await db.markAnimeInterest(req.body.id, false); ok(); }
);

router.post("/markNotInterested", 
    //TODO add input validation
    async (req, res, next) => { await db.markAnimeViewed(req.body.id, true, new Date()); next(); ok(); }
    
);

export default router;