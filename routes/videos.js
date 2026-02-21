import express from 'express'; 
import { ok, assertAuth } from '../middlewares.js';
import db from '../services/db.js';

const router = express.Router();

router.post("/listRecent", 
    assertAuth,
    //TODO input validation
    async (req, res) => { ok(res, await db.listRecentVideos(req.session.userId, req.body.favorites, req.body.limit)); }
)

router.post("/listForSubscription", 
    assertAuth,
    //TODO input validation
    async (req, res) => { ok(res, await db.listVideosForSubscription(req.session.userId, req.body.channelId, req.body.newVideosOnly)); }
);

router.post("/markViewed", 
    assertAuth,
    async (req, res) => { await db.setViewed(req.session.userId, req.body.videoId, req.body.viewed, req.body.viewDate != null ? new Date(req.body.viewDate) : null); ok(res); }
);

export default router;