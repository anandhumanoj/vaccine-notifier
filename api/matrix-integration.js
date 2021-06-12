import { sendNotification } from '../integrations/matrix';

module.exports = (req,res) => {
  sendNotification("Integration testing, Ignore.");
  res.send(200);
}