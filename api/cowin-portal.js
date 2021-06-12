
import { fetchFromCowinAPI } from '../integrations/cowin'
import { sendNotification } from '../integrations/matrix';

const debug = !!process.env.ENABLE_DEBUG;


module.exports = (req, res) => {

  fetchFromCowinAPI().then(response =>{
    if(response.available > 0){
      sendNotification("Available now!");
    }
  }).catch(error => {
    console.error(error);
    res.status(500).json(getErrorJSON());
  });
}
