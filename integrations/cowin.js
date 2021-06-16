import fetch from 'node-fetch'
import UserAgent from 'user-agents';

import { getErrorJSON } from "../utils/messages";

const debug = !!process.env.ENABLE_DEBUG;
const PIN_CODES = (process.env.PIN_CODES || process.env.PIN_CODE || "").split(',').map(val => val.trim());
const MIN_AGE_LIMITS = (process.env.MIN_AGE__LIMITS || "18,40,45").split(',').map(val => Number.parseInt(val.trim()));

// let DEFAULT_URL_TYPE = Math.floor(Math.random() * URL_TYPE.length)
let DEFAULT_URL_TYPE = 1; // DISTRICT only mode

const URL_TYPES = [
    'PIN_CODE',
    'DISTRICT'
]

const getCurrentDate = () => {
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
    var matched_rows = {};
    if (Array.isArray(response.centers)) {
        response.centers.forEach((center) => {
            if (PIN_CODES.includes(center.pincode.toString())) {
                if (Array.isArray(center.sessions)) {
                    center.sessions.forEach( session => {
                        if (MIN_AGE_LIMITS.includes(session.min_age_limit)) {
                            var matched_row = {}
                            matched_row.name = center.name;
                            matched_row.pincode = center.pincode;
                            matched_row.address = center.address;
                            
                            matched_row.date = session.date;
                            matched_row.available = session.available_capacity;
                            matched_row.available_dose1 = session.available_capacity_dose1;
                            matched_row.available_dose2 = session.available_capacity_dose2;
                            matched_row.min_age_limit = session.min_age_limit;
                            matched_row.vaccine = session.vaccine;

                            matched_rows[center.pincode + '__' + session.min_age_limit] = matched_row;
                        }
                    });
                }
            }
        });
        return matched_rows;
    }
    return getErrorJSON();
};


const generateAPIUrl = () => {
    
    let URL = "";
    const today = getCurrentDate();

    switch (URL_TYPES[DEFAULT_URL_TYPE]) {
        case 'PIN_CODE':
            const pincode = process.env.PIN_CODE;
            URL = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${today}`;
            break;
        case 'DISTRICT':
            const district_id = process.env.DISTRICT_ID
            URL = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${today}`;
            break;
    }
    return [URL, URL_TYPES[DEFAULT_URL_TYPE]];
}

const constructURL = () => {
    const randomUserAgent = new UserAgent().random().toString();
    const [url, urlType] = generateAPIUrl();
    return {
        url: url,
        type: urlType,
        opts: {
            "credentials": "omit",
            "headers": {
                "User-Agent": randomUserAgent,
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.5",
            },
            "referrer": "https://www.cowin.gov.in/",
            "method": "GET",
            "mode": "cors"
        }
    }
}

const fetchFromCowinAPI = () => {
    const urlSpec = constructURL();
    if (debug) {
        console.log(`Constructed CoWin URL: ${urlSpec.url}`);
    }
    return fetch(urlSpec.url, urlSpec.opts)
        .then(response => response.json())
        .then(data => {
            if (debug) {
                console.log("API response from upstream CoWin API", data);
            }
            return new Promise((resolve, reject) => {
                var result = parseAPIResponse(data);
                if (debug) {
                    console.log("Restructured response: ", result);
                }
                if (typeof result.status === 'number' && result.status >= 500) {
                    reject(data);
                }
                resolve(result);
            });
        });
}


export {
    fetchFromCowinAPI
};
