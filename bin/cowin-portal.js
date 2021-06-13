import cowinPortalAPI from "../api/cowin-portal";

var resMock = {
    sendData: {},
    sendStatus: 200,
    send: function(json) {
        this.sendData = json;
        console.log("Status: ", this.sendStatus);
        console.log("Response: ", JSON.stringify(this.sendData))
    },
    status: function(status){
        this.sendStatus = status
    }
}

cowinPortalAPI({}, resMock);