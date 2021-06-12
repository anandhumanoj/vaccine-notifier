import { fetchFromCowinAPI } from '../integrations/cowin'
import { sendNotification } from '../integrations/matrix';
import {getErrorJSON} from '../lib/api'

const debug = !!process.env.ENABLE_DEBUG;

const constructSuccessMessage = (cowinResponse) => {
  var message = 
`Hey You!,
${cowinResponse.vaccine} is available at the configured facility. 
  Number of slot available: ${cowinResponse.available}
  Date: ${cowinResponse.date}
  Minimum age limit: ${cowinResponse.min_age}
Book now! ✨✨✨`;
  return message;
}

module.exports = (req, res) => {
  fetchFromCowinAPI().then(response =>{
    if(response.available > 0){
      sendNotification(constructSuccessMessage(response)).then(resp => {
        res.status(200).send({status: 200});
      });
    }
  }).catch(error => {
    console.error(error);
    res.status(500).json(getErrorJSON());
  });
}
