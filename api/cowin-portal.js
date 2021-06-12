import { fetchFromCowinAPI } from '../integrations/cowin'
import { sendNotification } from '../integrations/matrix';
import {getErrorJSON} from '../lib/api'

const debug = !!process.env.ENABLE_DEBUG;

const buildSuccessNotificationMessage = (cowinResponse) => {
  var message = 
`Hey You!,
${cowinResponse.vaccine} is available at the configured facility. 
  Number of slot available: ${cowinResponse.available}
  Date: ${cowinResponse.date}
  Minimum age limit: ${cowinResponse.min_age}
Book now! ✨✨✨`;
  return message;
}

const buildInvokeNotificationMessage = (cowinResponse) => {
  return "No slots available. Executed at: " + new Date();
}

const buildFailureNotificationMesssage = (error) => {
  return "Error occured during execution: error:" + JSON.stringify(error);  
}

const invokeDebugNotifier = (res, message) => {
  if(debug){
    return sendNotification(message).catch(_ => new Promise().resolve());
  }
  return new Promise().resolve();
}

module.exports = (req, res) => {
  fetchFromCowinAPI().then(response =>{
    if(response.available > 0){
      sendNotification(buildSuccessNotificationMessage(response)).then(resp => {
        res.status(200).send({
          status: 200,
          message: "Hurry! free allotment found, Book Now!",
          raw_response: response
        });
      });
    }
    invokeDebugNotifier(res, buildInvokeNotificationMessage(response)).then(_ => {
      res.status(200).send({
        status: 200,
        message: "No slot available this time"
      });
    });
  }).catch(error => {
    console.error(error);
    invokeDebugNotifier(res, buildFailureNotificationMesssage(error)).then(_ => {
      res.status(500).json(getErrorJSON());
    });
  });
}
