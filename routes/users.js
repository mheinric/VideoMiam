import express from 'express'; 
import { body } from 'express-validator'; 
import { baseUrl } from '../app.js';
import { ok, error, assertInput } from '../middlewares.js';
import db from '../services/db.js';

const router = express.Router();

router.post("/register", 
    body("email").isEmail(),
    body("password").notEmpty(),
    assertInput,
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
    body("email").isEmail(),
    body("password").notEmpty(),
    assertInput,
    async (req, res) => { 
        const email = req.body.email; 
        const password = req.body.password; 
        const userId = await db.checkUserPassword(email, password);
        if (userId === null) {
            error(res, 401, "Invalid email/password");
            return;
        }
        req.session.userId = userId;
        ok(res, "Sucessfully connected");
    }
);

router.get("/logout.html", 
    async (req, res) => { 
        req.session.userId = null;
        res.redirect(baseUrl + "/index.html");
    }
);

export default router;