import { sendNotification } from '../integrations/matrix';

module.exports = async (req,res) => {
  sendNotification("Integration testing, Ignore.")
  .then(response => {
    res.send(200);
  });
}