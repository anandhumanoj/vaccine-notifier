import { sendNotification as sendMatrixNotification } from "../integrations/matrix";
import { sendNotification as sendTelegramNotification } from "../integrations/telegram";

const debug = !!process.env.ENABLE_DEBUG;

const invokeDebugNotifier = (message, forceNotify) => {
    if (debug || forceNotify) {
        return sendNotification(message).catch(_ => Promise.resolve());
    }
    return Promise.resolve();
}

const sendNotification = async messages => {
    try {
        await sendTelegramNotification(messages);
    } catch(err){
        console.error("Error while sending Telegram message", err);
    }
    try {
        await sendMatrixNotification(messages);
    } catch(err){
        console.error("Error while sending Matrix message", err);
    }
}

export {
    invokeDebugNotifier,
    sendNotification
}