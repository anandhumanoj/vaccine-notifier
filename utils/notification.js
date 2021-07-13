import {getDevOptions} from "../utils/config-parser";
import { sendNotification as sendMatrixNotification } from "../integrations/matrix";
import { sendNotification as sendTelegramNotification } from "../integrations/telegram";

const debug = !!process.env.ENABLE_DEBUG;

const triggerDevNotification = (message, forceNotify) => {
    let devOptions = getDevOptions();
    if (devOptions.enable_dev_events || forceNotify) {
        return sendNotification(message, devOptions.notifications).catch(_ => Promise.resolve());
    }
    return Promise.resolve();
}

const sendNotificationImpl = async (message, config) => {
    try {
        switch (config.type) {
            case 'TELEGRAM':
                await sendTelegramNotification(message,config);
                break;
            case 'MATRIX':
                await sendMatrixNotification(message,config);
                break;
            default:
                console.error(`Invalid notification type: ${config.type}`);
                break;
        }
    } catch(err){
        console.error(`Error while sending ${config.type} message`, err);
    }
}

const sendNotification = async (message, configs) => {
    if(getDevOptions().dev_mode){
        configs = getDevOptions().notifications;
    }
    for(const config of configs) {
        await sendNotificationImpl(message, config);
    }
}

export {
    triggerDevNotification,
    sendNotification
}