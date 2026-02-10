
import { sendSMS } from './services/notifications.js';
import config from './config.js';
import { app, baseUrl } from './app.js';

if (process.argv.indexOf("--test-sms") != -1) {
    sendSMS("This is a test");
}
else 
{
    let port = config["port"];
    // Start the server
    app.listen(port, async () => {
        console.log(`Serving at http://localhost:${port}${baseUrl}`);
    });
}
