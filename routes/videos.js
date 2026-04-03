import express from 'express';
import { body } from 'express-validator';  
import { ok, assertAuth, assertInput, isStrictInt, error } from '../middlewares.js';
import db from '../services/db.js';

const router = express.Router();

router.post("/listRecent", 
    assertAuth,
    body("favorites").isBoolean({ strict: true }),
    body("limit").custom(isStrictInt), 
    assertInput,
    async (req, res) => { ok(res, await db.listRecentVideos(req.session.userId, req.body.favorites, req.body.limit)); }
)

router.post("/listForSubscription", 
    assertAuth,
    body("channelId").custom(isStrictInt),
    body("newVideosOnly").isBoolean({ strict: true }),
    assertInput,
    async (req, res) => {
        if (!await db.getSubscription(req.body.channelId, req.session.userId))
        {
            error(res, 404, "Channel not found/not subscribed to");
            return;
        }
        ok(res, await db.listVideosForSubscription(req.session.userId, req.body.channelId, req.body.newVideosOnly)); 
    }
);

router.post("/markViewed", 
    assertAuth,
    body("videoId").custom(isStrictInt), 
    body("viewed").isBoolean({ strict: true }),
    body("viewDate").isISO8601().optional({ values: 'null' }),
    assertInput,
    async (req, res) => { 
        if (!await db.getVideo(req.body.videoId))
        {
            error(res, 404, "Video not found");
            return;
        }
        await db.setViewed(req.session.userId, req.body.videoId, req.body.viewed, req.body.viewDate != null ? new Date(req.body.viewDate) : null); 
        ok(res); 
    }
);

export default router;