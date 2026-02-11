

export function ok(res, data = null) {
    if (data === null)
    {
        res.send({ status: "OK" });
    }
    else
    {
        res.send({ status: "OK", data: data });
    }
}