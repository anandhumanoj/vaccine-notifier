import { fetchFromCowinAPI } from '../integrations/cowin'
import { sendNotification } from '../integrations/matrix';
import { getErrorJSON } from '../lib/api'

const debug = !!process.env.ENABLE_DEBUG;

const buildSuccessNotificationMessage = (cowinResponse) => {
  var message =
    `Hey You!,
${cowinResponse.vaccine} is available at ${cowinResponse.name}, ${cowinResponse.address}. 
  Number of slot available: ${cowinResponse.available}
  Dose 1: ${cowinResponse.available_dose1}
  Dose 2: ${cowinResponse.available_dose2}
  Date: ${cowinResponse.date}
  Minimum age limit: ${cowinResponse.min_age_limit}
Book now! ✨✨✨`;
  return message;
}

const buildInvokeNotificationMessage = (cowinResponse) => {
  return "No slots available at monitored locations.";
}

const buildFailureNotificationMesssage = (error) => {
  return "Error occured during execution.\r\n Cause:" + JSON.stringify(error);
}

const invokeDebugNotifier = (res, message) => {
  if (debug) {
    return sendNotification(message).catch(_ => new Promise(() => null).resolve());
  }
  return new Promise(() => null).resolve();
}

module.exports = (req, res) => {
  fetchFromCowinAPI().then(async centers => {
    let anyZoneAvailable = false;
    for (let center in centers) {
      if (centers[center].available > 0) {
        anyZoneAvailable = true;
        await sendNotification(buildSuccessNotificationMessage(centers[center]));
      }
    }
    if (anyZoneAvailable) {
      res.status(200).send({
        status: 200,
        message: "Hurry! free allotment found, Book Now!",
      });
    } else {
      invokeDebugNotifier(res, buildInvokeNotificationMessage(centers)).then(_ => {
        res.status(200).send({
          status: 200,
          message: "No slot available this time"
        });
      });
    }
  }).catch(error => {
    console.error(error);
    invokeDebugNotifier(res, buildFailureNotificationMesssage(error)).then(_ => {
      res.status(req.query.disable_status_codes ? 200 : 500).send(getErrorJSON());
    });
  });
}
