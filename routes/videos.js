import express from 'express'; 
import { ok, assertAuth } from '../middlewares.js';
import db from '../services/db.js';

const router = express.Router();

router.post("/listRecent", 
    assertAuth,
    //TODO input validation
    async (req, res) => { ok(res, await db.listRecentVideos(req.body.favorites, req.body.limit)); }
)

router.post("/listForSubscription", 
    assertAuth,
    //TODO input validation
    async (req, res) => { ok(res, await db.listVideosForSubscription(req.body.channelId, req.body.viewed)); }
);

router.post("/markViewed", 
    assertAuth,
    async (req, res) => { await db.setViewed(req.body.id, req.body.viewed, req.body.viewDate != null ? new Date(req.body.viewDate) : null); ok(res); }
);

export default router;