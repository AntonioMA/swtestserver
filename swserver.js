// SW simple test server.
// It doesn't keep anything persistent, everything goes the way of the dodo
// when the server is shut down. Tough luck.

// Take a guess :P
var DEFAULT_SERVER_PORT = 8123;

// What we offer:
//   * GET /about that just says hey, mom, it's me
//   * GET /anything/else Tries to find static/anything/else and serves
//         that file, or a 404 if the file does not exist
//   * POST /cspReport  Stores whatever is received as a CSP report and returns
//          a 200
//   * OPTIONS /anything logs the request and returns a 500
//   By default, we're not CORS friendly, not now at least
//   Anything else, returns a 404
function TSWTestServer(serverPort) {
  'use strict';

  function debug() {
    console.log.apply(console,arguments);
  }

  var PathMatcher = require('./pathMatcher.js').PathMatcher;
  var ServerMethods = require('./serverMethods.js').ServerMethods;

  // The order is important, they get evaluated on a top-down basis and the
  // first one that matches wins
  var serverPaths = {
    'GET': {
      '^/about(.html)?(/.*)?$': ServerMethods.getAboutPage,
      '.*': ServerMethods.serveStaticContent
    },
    'POST': {
      '^/cspReport$': ServerMethods.storeCSPReport
//      '.*': ServerMethods.goAway.bind(undefined, 403)
    },
    'OPTIONS': {
      '.*': ServerMethods.doOptions
    },
    'DEFAULT': {
      '.*': ServerMethods.goAway.bind(undefined, 404)
    }
  };

  var matcher = new PathMatcher(serverPaths);

  var http = require('http');
  var urlParser = require('url');
  var httpServer = null;

  function processRequest(aReq, aRes) {
    var method = aReq.method;
    var parsedURL = urlParser.parse(aReq.url);

    debug("Got a %s request!", method);
    debug("Headers: %s", JSON.stringify(aReq.headers));
    debug("Req: %s, %s", parsedURL.pathname, aReq.url);
    var processor = matcher.getProcessor(method, parsedURL.pathname);

    processor && processor(aReq, aRes, parsedURL);

  }

  function start() {
    debug("Creating server at port %d", serverPort);
    httpServer = http.createServer(processRequest);
    httpServer.listen(serverPort);
  }

  return {
    start: start
  };

};

console.log("ARGS: " + JSON.stringify(process.argv) + "\n");
var server = new TSWTestServer(process.argv[2] || DEFAULT_SERVER_PORT);

server.start();
