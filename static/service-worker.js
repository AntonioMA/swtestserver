'use strict';

var version = 40;

function debug(str) {
  dump(' -*- ServiceWorkers - Worker -*-: ' + str + '\n');
  console.log(' -*- ServiceWorkers - Worker -*-: ' + str + '\n');
}

self.addEventListener('install', function(e) {
  debug('Install event');
  debug('Install version ' + version);
});

self.addEventListener('activate', function(e) {
  debug('Activate event');
});

var cli;

self.addEventListener('fetch', function(event) {
  debug('Fetch event for: ' + event.request.url);
  if (event.request.url.contains('test.xml')) {
    debug("Fetch event for asdasdasdi intercept");
/*
    event.respondWith(fetch('http://www.w3schools.com/xml/note.xml').then(function(response) {
      debug("Fetch response: " + response.status);
      return response;
    })); // PARSE ERROR
*/
    event.respondWith(
      fetch('http://www.w3schools.com/xml/note.xml', {mode: 'no-cors'}).then(function(response) {
        debug("Fetch response: " + response.status);
        debug("Fetch response ok?: " + response.ok);
        return response;
      })
      .catch(function(error) {
        debug('There has been a problem with your fetch operation: ' + error.message);
      })
    ); // OK

    //event.respondWith(fetch('http://www.w3schools.com/xml/note.xml', {mode: 'no-cors'})); // OK
    //event.respondWith(fetch('http://www.w3schools.com/xml/note.xml', {mode: 'cors'})); // PARSE ERROR
    //event.respondWith(fetch('http://www.w3schools.com/xml/note.xml', {mode: 'same-origin'})); // PARSE ERROR
    //event.respondWith(fetch('http://www.w3schools.com/xml/note.xml', {mode: 'cors-with-forced-preflight'})); // PARSE ERROR
  } else if (event.request.method === 'POST' && event.request.url.contains('cspReport')) {
    // does this even work?
    debug("Hello worlding this");
    event.respondWith(new Promise((resolve, reject) => {
      event.request.json().then(reportData => {
        debug("Report Data: " + reportData + " TXT: " + JSON.stringify(reportData));
        var loadedURI = reportData['csp-report'] && reportData['csp-report']['blocked-uri'];
        var h = new Headers();
        h.append("Location", loadedURI);
        resolve(new Response("some text", {status: 302, headers: h}));
//        fetch(loadedURI, {mode: 'no-cors'}).then(response => {
//          // This isn't really used but...
//          resolve(response);
//      });
      });
    }));
  }


//  var result = xmlDoc.load('http://www.w3schools.com/xml/note.xml');



});

function testOpenWindow() {
//  clients.openWindow('about:blank').then(function(result) {
  clients.openWindow('/open_window.html').then(function(result) {
//  clients.openWindow('http://www.google.com').then(function(result) {
    debug("testOpenWindow: " + result);
    for (var a in result) {
      debug('-->' + a + ' - ' + result[a]);
    }

    setTimeout(function(){ debug("Hello " + result.url); }, 1000);
  }).catch(function (error) {
    debug('Error during openWindow: ' + error);
  });
}

function testClient() {
  debug(cli);
  cli.matchAll().then(function (clients) {
    debug('Clients found: ' + clients.length);
    for (var i = 0; i < clients.length; i++) {
      debug("Client Id: " + clients[i].id);
      debug("Client url: " + clients[i].url);
      debug("Client frameType: " + clients[i].frameType);
      debug('Client visibilityState: ' + clients[i].visibilityState);
      debug('Client focused: ' + clients[i].focused);
      if(!clients[i].focus) {
        clients[i].focus();
      }
      clients[i].postMessage('I am a service worker!');
    }
  }).catch(function (error) {
    debug('Error calling matchAll');
  });
}

function testMatchAll() {
  clients.matchAll({includeUncontrolled: true, type: 'all'}).then(function (result) {
    debug('Clients found: ' + result.length);
    for (var i = 0; i < result.length; i++) {
      debug("Client Id: " + result[i].id);
      debug("Client url: " + result[i].url);
      debug("Client frameType: " + result[i].frameType);
    }
  }).catch(function (error) {
    debug('Error calling matchAll');
  });
}

self.onmessage = function(e) {
  debug('Message received ' + version + ': ' + e.data);
  switch (e.data) {
    case 'openWindow':
      testOpenWindow();
      break;
    case 'client':
      testClient();
      break;
    case 'matchAll':
      testMatchAll();
      break;
    default:
      debug('Received unknown message');
  }
}
