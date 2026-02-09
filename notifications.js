/**
 * This file contains code for notifying the website maintainer when error occurs 
 * (such as failure to retrieve video information, for example)
 */
const config = require('./config.js');
const enableSMS = config["sms"]["enable"]
const smsUser = config["sms"]["id"]
const smsPassword = config["sms"]["password"]

async function sendSMS(msg) {
    if (enableSMS) {
        const res = await fetch(`https://smsapi.free-mobile.fr/sendmsg?user=${smsUser}&pass=${smsPassword}&msg=${encodeURIComponent(msg)}`);
        if (res.status != 200) {
            console.log("Failed to send SMS"); 
            console.log(res);
        }
    }
};

module.exports = {
    sendSMS
};