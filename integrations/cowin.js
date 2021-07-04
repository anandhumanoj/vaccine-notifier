import fetch from 'node-fetch'
import UserAgent from 'user-agents';

import { getErrorJSON } from "../utils/messages";

const debug = !!process.env.ENABLE_DEBUG;
const DISTRICT_IDS = (process.env.DISTRICT_IDS || process.env.DISTRICT_ID || "").split(',').map(val => val.trim()); ;
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
    var availableCenters = [];
    if (Array.isArray(response.centers)) {
        response.centers.forEach((center) => {
            if (PIN_CODES.includes('*') || PIN_CODES.includes(center.pincode.toString())) {
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
                            availableCenters.push(availableCenter);
                        }
                    });
                }
            }
        });
        return availableCenters;
    }
    return getErrorJSON();
};

const generateAPIUrl = (districtId) => {
    const today = getCurrentDate();
    let URL = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${today}`;
    if (debug) {
        console.log(`Constructed CoWin URL: ${URL}`);
    }
    return URL;
}

const constructURL = (districtId) => {
    const randomUserAgent = new UserAgent().random().toString();
    const url = generateAPIUrl(districtId);
    return {
        url: url,
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

const fetchFromCowinAPI = async () => {
    return new Promise(async (resolve, reject) => {
        let result = [];
        let failures = [];
        for(let district of DISTRICT_IDS){
            let urlSpec = constructURL(district);
            let rawResponse = await fetch(urlSpec.url, urlSpec.opts).then(response => response.json());
            if (debug) {
                console.log("Upstream CoWin API response", rawResponse);
            }
            let response = parseAPIResponse(rawResponse);
            if (typeof response.status === 'number' && response.status >= 500) {
                failures.push({district_id: district, response: rawResponse});
                continue;
            }
            result = result.concat(response);
        }
        if(failures.length == DISTRICT_IDS.length){
            reject(failures);
        }
        if (debug) {
            console.log("Returning response: ", result);
        }
        resolve(result);
    });
}

export {
    fetchFromCowinAPI
};
