require = require("esm")(module);

const cowinPortalAPI = require('../api/cowin-portal')

var resMock = {
    sendData: {},
    sendStatus: 200,
    send: function(json) {
        this.sendData = json;
        console.log("Status: ", this.sendStatus);
        console.log("Response: ", JSON.stringify(this.sendData))
    },
    json: function(json) {
        this.send(json);
    },
    status: function(status) {
        this.sendStatus = status
        return this;
    }
}

var reqMock = {
    query: {},
    body: {},
    params: {}
}

cowinPortalAPI(reqMock, resMock);