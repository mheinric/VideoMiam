import express from 'express'; 
import { ok, error } from '../middlewares.js';
import db from '../services/db.js';

const router = express.Router();

router.post("/register", 
    //TODO input validation
    async (req, res) => { 
        const email = req.body.email; 
        const password = req.body.password; 
        if (await db.userExists(email)) {
            error(res, 209, "User already exists");
            return;
        }
        const userId = await db.addUser(email, password);
        req.session.userId = userId;
        ok(res, "Sucessfully registered");
    }
)

router.post("/login", 
    async (req, res) => { 
        const email = req.body.email; 
        const password = req.body.password; 
        const userId = await db.checkUserPassword(email, password);
        if (userId === null) {
            error(res, 408, "Invalid email/password"); //TODO: arbitrary error code
            return;
        }
        req.session.userId = userId;
        ok(res, "Sucessfully connected");
    }
);

export default router;