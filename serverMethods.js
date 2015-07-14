function ServerMethods() {
  'use strict';

  // Might want to make this configurable at some point
  var STATIC_PREFIX = "./static";

  function debug() {
    console.log.apply(console,arguments);
  };

  function allowCORS(aReq, aRes) {
    // Always allow CORS!!!
    if (aReq.headers.origin) {
      aRes.setHeader("Access-Control-Allow-Origin","*");
    }

    // Lets be VERY promiscuous... just don't do that on any serious server
    aRes.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    aRes.setHeader("Access-Control-Allow-Origin", "*");

    // If the request has Access-Control-Request-Headers headers, we should
    // answer with an Access-Control-Allow-Headers...
    var rh = aReq.headers["access-control-request-headers"];
    if (rh) { // We don't really care much about this...
      aRes.setHeader("Access-Control-Allow-Headers", rh);
    }
  }

  function doOptions(aReq, aRes, aPathname) {
    debug("doOptions: " + aPathname);
    returnData(aRes, 500, "Not supported", "text/html");
  }

  var fs = require('fs');
  var Promise = require('promise');
  var readFile = Promise.denodeify(fs.readFile);
  var mime = require('mime-types');
  var qs = require('querystring');


  var DEFAULT_TYPE = 'text/html';
  function getMimeType(aFile) {
    return mime.lookup(aFile) || DEFAULT_TYPE;
  }

  var VALID_HEADERS = [
      'content-security-policy',
      'content-security-policy-report-rnly'
  ];
  function addHeaders(aRes, additionalHeaders) {
    if (typeof additionalHeaders === 'string') {
      additionalHeaders = [additionalHeaders];
    }
    additionalHeaders.forEach(function(additionalHeader) {
      var header = additionalHeader.split(':');
      if (VALID_HEADERS.indexOf(header[0].toLowerCase()) != -1) {
        aRes.setHeader(header[0], header[1]);
      }
    });
  }


  // Serves a static content that was requested on a GET petition
  // Aditionally, adds as headers whatever is requested on the query string
  // (?add_header=header1:value&add_header=header2:value2 and so on)
  function serveStaticContent(aReq, aRes, aParsedURL) {
    var realFile = STATIC_PREFIX + aParsedURL.pathname;
    addHeaders(aRes, qs.parse(aParsedURL.query).add_header || []);

    readFile(realFile).then(function(filecontent) {
      debug("Read file: " + realFile);
      returnData(aRes, 200, filecontent, getMimeType(aParsedURL.pathname));
    }).catch(function(error) {
      debug("Error reading file: " + realFile + ". ERR: " +
            JSON.stringify(error));
      goAway(404, aReq, aRes, aParsedURL.pathname);
    });
  }

  // Returns a nice HTML about page
  function getAboutPage(aReq, aRes, aParsedURL) {
    debug("aboutPage");
    serveStaticContent(aReq, aRes, {pathname: "/about.html"});
  }

  function storeCSPReport(aReq, aRes, aParsedURL) {
    aReq.on('readable', function() {
      aReq.setEncoding('ascii');
      var report = aReq.read();
      debug("Got a report: " + report + " from " +
          JSON.stringify(aReq.headers) + " on " + aParsedURL.pathname);
      returnData(aRes, 200, "Success", "text/html");
    });
  }

  function returnData(aRes, aStatusCode, aResult, aContentType) {
    aRes.statusCode = aStatusCode;
    aRes.setHeader("Content-Length", aResult.length);
    aRes.setHeader("Content-Type", aContentType);
    aRes.end(aResult);
  }

  function goAway(aRetCode, aReq, aRes, aParsedURL) {
    debug("goAway: " + aParsedURL.pathname);
    returnData(aRes, aRetCode || 404, "", "text/html");
  }

  return {
    goAway: goAway,
    getAboutPage: getAboutPage,
    doOptions: doOptions,
    serveStaticContent: serveStaticContent,
    storeCSPReport: storeCSPReport
  };

};

module.exports.ServerMethods = new ServerMethods();
