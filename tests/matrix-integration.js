require = require("esm")(module);

var mockRequest = require('mock-req-res').mockRequest
var mockResponse = require('mock-req-res').mockResponse

var matrix = require('../api/matrix-integration')


var req = mockRequest()
var res = mockResponse()

matrix(req, res);

