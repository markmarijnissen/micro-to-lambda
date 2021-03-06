var Stream = require('stream');
var { run } = require('micro');
var qs = require('query-string');

function createRequest(event) {
    var request = new Stream.Readable();
    request._read = function noop(){};
    if(event.body){
      request.push(event.body);
    }
    request.push(null);

    request.url = event.path;
    if(event.queryStringParameters) {
      request.url += "?" + qs.stringify(event.queryStringParameters);
    }
    request.headers = {};
    request.rawHeaders = [];
    request.httpVersion = "1.1";
    request.method = event.httpMethod;

    Object.keys(event.headers || {})
      .forEach(key => {
        request.headers[key.toLowerCase()] = event.headers[key];
        request.rawHeaders.push(key);
        request.rawHeaders.push(event.headers[key]);
      });

    return request;
}

function createResponse() {
    var response = new Stream.Writable();
    response.statusCode = 200;
    response.headers = {};
    response.body = "";
    response.setHeader = function(key,val) {
      response.headers[key] = val;
    };
    response.getHeader = function(key) {
      return response.headers[key];
    };
    response._write = function (chunk, encoding, done) {
      response.body += chunk.toString();
      done();
    };
    response.toLambdaResponse = function(){
      return {
        statusCode: response.statusCode,
        headers: response.headers,
        body: response.body
      };
    }
    return response;
}

module.exports = function microToLambdaHandler(fn) {
  return function lambdaHandler(event, context, callback) {
    var req = createRequest(event);
    var res = createResponse();
    run(req,res,fn)
      .then(() => callback(null,res.toLambdaResponse()))
  }
}
