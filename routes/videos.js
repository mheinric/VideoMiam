import express from 'express'; 
import { ok } from '../middlewares.js';

const router = express.Router();

router.post("/markViewed", 
    async (req, res) => { await db.setViewed(req.body.id, req.body.viewed, req.body.viewDate != null ? new Date(req.body.viewDate) : null); ok(res); }
);

export default router;