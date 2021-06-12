import fetch from 'node-fetch'

const debug = !!process.env.ENABLE_DEBUG;

const getCurrentDate = () =>{
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;

  var yyyy = today.getFullYear();
  if (dd < 10) {
      dd = '0' + dd;
  }
  if (mm < 10) {
      mm = '0' + mm;
  }
  return dd + '-' + mm + '-' + yyyy;

}

const parseAPIResponse = (response) => {

  if(Array.isArray(response.centers) && response.centers.length === 1){
    const center = response.centers[0];
    if(Array.isArray(center.sessions) && center.sessions.length === 1){
      const session = center.sessions[0];
      return session;
    }
  }
  return {
    __parse_failure: true
  }
};

const getErrorJSON = () => {
  return {
    status: 500,
    message: "Internal Server Error"
  };
}

const generateAPIResult = (data) => {
  if (data.__parse_failure){
    return getErrorJSON();
  }
  return {
    available: data.available_capacity,
    min_age: data.min_age,
    vaccine: data.vaccine,
    date: data.date
  }
}

module.exports = (req, res) => {
  const pincode = process.env.PIN_CODE;
  const today = getCurrentDate();

  const URL = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${today}`
  if(debug) {
    console.log(`Constructed CoWin URL: ${URL}`);
  }
  fetch(URL, {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5"
    },
    "referrer": "https://www.cowin.gov.in/",
    "method": "GET",
    "mode": "cors"
  }).then(response => response.json())
  .then(data =>{
    if(debug){
      console.log("API response from upstream CoWin API", data);
    }
    res.json(generateAPIResult(parseAPIResponse(data)))
  }).catch(error =>{
    console.error(error);
    res.status(500).json(getErrorJSON());
  });
}
