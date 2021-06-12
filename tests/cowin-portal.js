require = require("esm")(module);

var mockRequest = require('mock-req-res').mockRequest
var mockResponse = require('mock-req-res').mockResponse

var cowinPortalAPI = require('../api/cowin-portal')


var req = mockRequest()
var res = mockResponse()

cowinPortalAPI(req, res);

