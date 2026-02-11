import express from 'express'; 
import { ok } from '../middlewares.js';
import { addSubscription } from '../services/subscriptions.js';
import db from '../services/db.js';

const router = express.Router();

router.post('/list', 
    async (req, res) => { 
        let chanList = await db.getAllSubscriptions();
        ok(res, chanList)
    }
);

router.post('/add', 
    //TODO input validation
    async (req, res) => { await addSubscription(req.body.channelId); ok(res); }
);
router.post('/markFavorite', 
    //TODO input validation
    async (req, res) => { await db.setChannelFavorite(req.body.id, req.body.favorite); ok(res);}
);

export default router;