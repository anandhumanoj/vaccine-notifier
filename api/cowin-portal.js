import { triggerCowinNotifications } from '../core/cowin-notify'
import { getGlobalConfig } from '../utils/config-parser'
import { getErrorJSON } from '../utils/messages'

const globalConfig = getGlobalConfig();

module.exports = (req, res) => {
    triggerCowinNotifications(globalConfig.cowin).then(_ => {
      res.status(200).send({
        status: 200,
        message: "Notifications triggered",
      });
    }).catch(error => {
      console.log(error);
      res.status(req.query.disable_status_codes ? 200 : 500).send(getErrorJSON());
    })
}
