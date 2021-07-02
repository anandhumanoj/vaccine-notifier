import fetch from 'node-fetch'
import UserAgent from 'user-agents';

import { getErrorJSON } from "../utils/messages";

const debug = !!process.env.ENABLE_DEBUG;
const PIN_CODES = (process.env.PIN_CODES || process.env.PIN_CODE || "").split(',').map(val => val.trim());
/**
 * Format, <age>:<dose>
 * where accepted values for 'dose' are
 * 0 -> Any dose
 * 1 -> First dose only
 * 2 -> Second dose only
 */
const AGE_AND_DOSE_CRITERIA = {};
(process.env.AGE_AND_DOSE_CRITERIA || "18:0,40:0,45:0")
.split(',').forEach(val => {
    
    let criteria = val.trim().split(':');
    if(criteria.length == 2){
        AGE_AND_DOSE_CRITERIA[Number.parseInt(criteria[0])] = Number.parseInt(criteria[1]);
    }
});
const dosageKeys = ["available_capacity", "available_capacity_dose1", "available_capacity_dose2"];

// let DEFAULT_URL_TYPE = Math.floor(Math.random() * URL_TYPE.length)

/**
 * DISTRICT-only mode is hardcoded for compatibility for now
 */
let DEFAULT_URL_TYPE = 1;

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
    var availableCenters = {};
    if (Array.isArray(response.centers)) {
        response.centers.forEach((center) => {
            if (PIN_CODES.includes(center.pincode.toString())) {
                if (Array.isArray(center.sessions)) {
                    center.sessions.forEach( session => {
                        let dosageId = AGE_AND_DOSE_CRITERIA[session.min_age_limit];
                        if (dosageId != undefined && session[dosageKeys[dosageId]] > 0) {
                            var availableCenter = {}
                            availableCenter.name = center.name;
                            availableCenter.pincode = center.pincode;
                            availableCenter.address = center.address;
                            
                            availableCenter.date = session.date;
                            availableCenter.available = session.available_capacity;
                            availableCenter.available_dose1 = session.available_capacity_dose1;
                            availableCenter.available_dose2 = session.available_capacity_dose2;
                            availableCenter.min_age_limit = session.min_age_limit;
                            availableCenter.vaccine = session.vaccine;
                            availableCenters[center.pincode + '__' + session.min_age_limit] = availableCenter;
                        }
                    });
                }
            }
        });
        return availableCenters;
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
