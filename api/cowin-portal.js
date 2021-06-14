import { fetchFromCowinAPI } from '../integrations/cowin'
import { sendNotification } from '../integrations/matrix';
import { getErrorJSON } from '../lib/api'

const debug = !!process.env.ENABLE_DEBUG;

const buildSuccessNotificationMessage = (cowinResponse) => {
  var message =
`<b>${cowinResponse.name} ${cowinResponse.address}</b>
<br/>
<br/>
<pre>
Pin Code : ${cowinResponse.pincode}
Available: ${cowinResponse.available}
Min Age  : ${cowinResponse.min_age_limit}
=================================
Date  | Dose 1 | Dose 2 | Vaccine
---------------------------------
${cowinResponse.date} | ${cowinResponse.available_dose1} |  ${cowinResponse.available_dose2} | ${cowinResponse.vaccine}
---------------------------------
</pre>
<br/>`
  return message;
}

const buildInvokeNotificationMessage = (cowinResponse) => {
  return `No slots available at monitored locations
${process.env.PIN_CODES}`;
}

const buildFailureNotificationMesssage = (error) => {
  return "Error occured during execution.\r\nCause:" + JSON.stringify(error);
}

const invokeDebugNotifier = (res, message, forceNotify) => {
  if (debug || forceNotify) {
    return sendNotification(message).catch(_ => Promise.resolve());
  }
  return Promise.resolve();
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
    }, true);
  });
}
