import express from 'express'; 
import { ok } from '../middlewares.js';
import { addSubscription } from '../services/subscriptions.js';
import db from '../services/db.js';

const router = express.Router();

router.post('/add', 
    //TODO input validation
    async (req, res, next) => { await addSubscription(req.body.channelId); next(); },
    ok
);
router.post('/markFavorite', 
    //TODO input validation
    async (req, res, next) => { await db.setChannelFavorite(req.body.id, req.body.favorite); next();},
    ok
);

export default router;