import { fetchFromCowinAPI, emptyRequestCache } from "../integrations/cowin";
import * as messages from '../utils/messages';
import { triggerDevNotification, sendNotification } from '../utils/notification'


const generateResponseContent = (centers) => {
    let notificationMessage = messages.getHeader();
    for (let center of centers) {
        notificationMessage += messages.getShortSuccessMessage(center);
    }
    notificationMessage += messages.getFooter();
    return notificationMessage;
}

const triggerCowinNotifications = async (configurations) => {
    let sessionFound = false;
    emptyRequestCache();
    for (const config of configurations) {
        try {
            let cowinResponse = await fetchFromCowinAPI(config);
            for (const district_id of config.district_ids) {
                if(cowinResponse[district_id] && cowinResponse[district_id].length > 0) {
                    sessionFound = true;
                    let notificationMessage = generateResponseContent(cowinResponse[district_id]);
                    console.log(cowinResponse);
                    await sendNotification(notificationMessage, config.notifications);
                }
            }
        } catch(error) {
            console.error(error);
            triggerDevNotification(messages.getErrorMessage(error), true);
        }
    }
    if(!sessionFound) {
        await triggerDevNotification(messages.getNotAvailableMessage());
    }
}

export {
    triggerCowinNotifications
}