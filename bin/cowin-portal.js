require = require("esm")(module);

const cowinNotify = require('../core/cowin-notify');
const configParser = require('../utils/config-parser');

cowinNotify.triggerCowinNotifications(configParser.getGlobalConfig().cowin)
.then(_ => {
    console.log("Success");
}).catch(error => {
    console.log("Failed", error);
});