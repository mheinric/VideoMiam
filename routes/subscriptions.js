import express from 'express'; 
import { ok, assertAuth } from '../middlewares.js';
import { subscribeUserTo } from '../services/subscriptions.js';
import db from '../services/db.js';

const router = express.Router();

router.post('/list', 
    assertAuth,
    async (req, res) => { 
        let chanList = await db.getAllSubscriptions(req.session.userId);
        ok(res, chanList)
    }
);

router.post('/details', 
    assertAuth,
    //TODO input validation
    async (req, res) => {
        ok(res, await db.getSubscription(req.body.channelId));
    }
)

router.post('/add', 
    assertAuth,
    //TODO input validation
    async (req, res) => { await subscribeUserTo(req.session.userId, req.body.channelId); ok(res); }
);
router.post('/markFavorite', 
    assertAuth,
    //TODO input validation
    async (req, res) => { await db.setChannelFavorite(req.body.id, req.body.favorite); ok(res);}
);

export default router;