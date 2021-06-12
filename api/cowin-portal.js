import fetch from 'node-fetch'

module.exports = (req, res) => {
  
  fetch("https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=685515&date=12-06-2021", {
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
    res.json({
      response:data
    })
  }).catch(error =>{
    console.error(error);
  });
}
