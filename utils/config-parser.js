/**
 * Parse configuration from environment in json format.
 * Desired format is given below:
 * {
 *      cowin:[
 *          {
 *              district_ids: [<id>],
 *              notifications: [
 *                  {
 *                      type:<TELEGRAM|MATRIX>,
 *                      room_id: <room-id>,
 *                      chat_id: <chatid>,
 *                      token: <token>
 *                  }
 *              ],
 *              criteria: [
 *                  {
 *                      pincode: [<pincodes>],
 *                      min_age: <min-age>,
 *                      max_age: <max-age>,
 *                      dosage_key: "available_capacity" | "available_capacity_dose1" | "available_capacity_dose2"
 *                  }
 *              ],
 *          },
 *      ],
 *      dev_options: {
 *          enable_dev_events: <true|false>,
 *          notifications: [
 *              {
 *                  type:<TELEGRAM|MATRIX>,
 *                  room_id: <room-id>,
 *                  chat_id: <chatid>,
 *                  token: <token>
 *              }
 *          ]
 *      }
 * }
 */


var config = null;

const getGlobalConfig = () => {
    if (config === null){
        config = JSON.parse(process.env.JSON_CONFIG);
    }
    return config ? config : {};
}

const getDevOptions = () => {
    let opts = getGlobalConfig();
    return opts.dev_options ? opts.dev_options : {};
}

export { 
    getGlobalConfig, 
    getDevOptions
};


