import express from 'express'; 
import { ok } from '../middlewares.js';
import db from '../services/db.js';

const router = express.Router();

router.post("/listForSubscription", 
    //TODO input validation
    async (req, res) => { ok(res, await db.listVideosForSubscription(req.body.channelId, req.body.viewed)); }
);

router.post("/markViewed", 
    async (req, res) => { await db.setViewed(req.body.id, req.body.viewed, req.body.viewDate != null ? new Date(req.body.viewDate) : null); ok(res); }
);

export default router;