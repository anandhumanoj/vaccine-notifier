import { sendNotification } from "../integrations/matrix";

const debug = !!process.env.ENABLE_DEBUG;

const invokeDebugNotifier = (message, forceNotify) => {
    if (debug || forceNotify) {
        return sendNotification(message).catch(_ => Promise.resolve());
    }
    return Promise.resolve();
}

export {
    invokeDebugNotifier,
    sendNotification
}