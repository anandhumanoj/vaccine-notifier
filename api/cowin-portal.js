import { fetchFromCowinAPI } from '../integrations/cowin'
import * as messages from '../utils/messages'
import {sendNotification, invokeDebugNotifier} from '../utils/notification'


module.exports = (req, res) => {
  fetchFromCowinAPI().then(async centers => {
    let notificationMessage = "<br/><br/>";
    for (let center of centers) {
      notificationMessage += messages.getShortSuccessMessage(center);
    }
    notificationMessage += "<hr/>"
    if (notificationMessage !== "") {
      await sendNotification(notificationMessage);
      res.status(200).send({
        status: 200,
        message: "Hurry! free allotment(s) found, Book Now!",
      });
    } else {
      invokeDebugNotifier(messages.getNotAvailableMessage(process.env.PIN_CODES)).then(_ => {
        res.status(200).send({
          status: 200,
          message: "No slot available this time"
        });
      });
    }
  }).catch(error => {
    console.error(error);
    invokeDebugNotifier(messages.getErrorMessage(error), true).then(_ => {
      res.status(req.query.disable_status_codes ? 200 : 500).send(getErrorJSON());
    });
  });
}
