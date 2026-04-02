import express from 'express'; 
import { body } from 'express-validator'; 
import { ok, assertAuth, assertInput, isStrictInt, error } from '../middlewares.js';
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
    body("channelId").custom(isStrictInt), 
    assertInput,
    async (req, res) => {
        if (!await db.getSubscription(req.body.channelId))
        {
            error(res, 404, "Channel not found");
            return;
        }
        ok(res, await db.getSubscription(req.body.channelId, req.session.userId));
    }
)

router.post('/add', 
    assertAuth,
    body("channelURL").notEmpty(),
    assertInput,
    async (req, res) => { await subscribeUserTo(req.session.userId, req.body.channelURL); ok(res); }
);

router.post('/markFavorite', 
    assertAuth,
    body("channelId").custom(isStrictInt), 
    body("favorite").isBoolean({ strict: true }),
    assertInput,
    async (req, res) => { 
        if (!await db.getSubscription(req.body.channelId, req.session.userId))
        {
            error(res, 404, 'Channel not found');
            return;
        }
        await db.setChannelFavorite(req.session.userId, req.body.channelId, req.body.favorite); ok(res);
    }
);

export default router;