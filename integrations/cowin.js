import fetch from 'node-fetch'
import UserAgent from 'user-agents';

import { getErrorJSON } from "../utils/messages";

const debug = !!process.env.ENABLE_DEBUG;

const COWIN_REQUEST_CACHE = {};

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

const getCriteriaForPincode = (criterias, pincode) => {
    for(let criteria of criterias){
        if(!Array.isArray(criteria.pincode)){
            continue;
        }
        if(criteria.pincode.includes('*') || criteria.pincode.includes(pincode)){
            return criteria;
        }
    }
};

const isSessionMatchesCriteria = (session, criteria) => {
    if (criteria.min_age && session.min_age_limit != criteria.min_age){
        return false;
    }
    if (criteria.max_age && session.max_age_limit != criteria.max_age){
        return false;
    }
    return session[criteria.dosage_key] > 0;
}

const parseAPIResponse = (response, config) => {
    var availableCenters = [];
    if (Array.isArray(response.centers)) {
        response.centers.forEach((center) => {
            const matchedCriteria = getCriteriaForPincode(config.criteria, center.pincode.toString());
            if (matchedCriteria && Array.isArray(center.sessions)) {
                center.sessions.forEach( session => {
                    if (isSessionMatchesCriteria(session, matchedCriteria)) {
                        var availableCenter = {}
                        availableCenter.name = center.name;
                        availableCenter.pincode = center.pincode;
                        availableCenter.address = center.address;
                        
                        availableCenter.date = session.date;
                        availableCenter.available = session.available_capacity;
                        availableCenter.available_dose1 = session.available_capacity_dose1;
                        availableCenter.available_dose2 = session.available_capacity_dose2;
                        availableCenter.min_age_limit = session.min_age_limit;
                        availableCenter.max_age_limit = session.max_age_limit;
                        availableCenter.vaccine = session.vaccine;

                        availableCenters.push(availableCenter);
                    }
                });
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

const cowinFetchImpl = async (district_id) => {
    if(!COWIN_REQUEST_CACHE[district_id]){
        let urlSpec = constructURL(district_id);
        let rawResponse = await fetch(urlSpec.url, urlSpec.opts).then(response => response.json());
        if (debug) {
            console.log("Upstream CoWin API response", rawResponse);
        }
        COWIN_REQUEST_CACHE[district_id] = rawResponse;
    }
    return COWIN_REQUEST_CACHE[district_id];
}

const fetchFromCowinAPI = async (config) => {
    return new Promise(async (resolve, reject) => {
        let result = {};
        let failures = [];
        for(let district_id of config.district_ids){
            var rawResponse = await cowinFetchImpl(district_id);
            let response = parseAPIResponse(rawResponse, config);
            if (typeof response.status === 'number' && response.status >= 500) {
                failures.push({district_id: district_id, response: rawResponse});
                continue;
            }
            result[district_id] = response;
        }
        if(failures.length == config.district_ids.length){
            reject(failures);
        }
        resolve(result);
    });
}

export {
    fetchFromCowinAPI
};
