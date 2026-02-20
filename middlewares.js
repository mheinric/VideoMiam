

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
    if (req.session.userId === undefined) {
        error(res, 401, "You must login first");
    }
    else {
        next()
    }
}