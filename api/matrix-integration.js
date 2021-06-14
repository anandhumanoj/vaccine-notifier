import { sendNotification } from '../integrations/matrix';

module.exports = async (req,res) => {
  sendNotification("<b>Ignore</b><br/>Testing matrix integration")
  .then(response => {
    res.send(200);
  });
}
