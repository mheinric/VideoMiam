import config from './config.js'

export function ok(res, data = null) {
    if (data === null) {
        res.send({ status: "OK" });
    }
    else {
        res.send({ status: "OK", data: data });
    }
}

export function error(res, status, message) {
    res.status(status).send({ status: "Error", data: message });
}

export function assertAuth(req, res, next) {
    //If user management is disabled, the website serves a single user.
    if (!config.users.enable) {
        req.session.userId = 0; 
        next();
        return;
    }
    if (req.session.userId === undefined) {
        error(res, 401, "You must login first");
    }
    else {
        next()
    }
}