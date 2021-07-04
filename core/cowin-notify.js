import { fetchFromCowinAPI } from "../integrations/cowin";
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
    for (const config of configurations) {
        try{
            let cowinResponse = await fetchFromCowinAPI(config);
            let sessionFound = false;
            for (const district_id of config.district_ids) {
                if(cowinResponse[district_id]){
                    sessionFound = true;
                    let notificationMessage = generateResponseContent(cowinResponse[district_id]);
                    console.log(config.notifications)
                    await sendNotification(notificationMessage, config.notifications);
                }
            }
            if(!sessionFound) {
                await triggerDevNotification(messages.getNotAvailableMessage());
            }
        } catch(error) {
            console.error(error);
            triggerDevNotification(messages.getErrorMessage(error), true);
        }
    }
}

export {
    triggerCowinNotifications
}