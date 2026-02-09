/**
 * This file contains code for notifying the website maintainer when error occurs 
 * (such as failure to retrieve video information, for example)
 */
import config from './config.js';
const enableSMS = config["sms"]["enable"]
const smsUser = config["sms"]["id"]
const smsPassword = config["sms"]["password"]

export async function sendSMS(msg) {
    if (enableSMS) {
        const res = await fetch(`https://smsapi.free-mobile.fr/sendmsg?user=${smsUser}&pass=${smsPassword}&msg=${encodeURIComponent(msg)}`);
        if (res.status != 200) {
            console.log("Failed to send SMS"); 
            console.log(res);
        }
    }
};