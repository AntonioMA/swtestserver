'use strict';

function debug(str) {
  console.log(' -*- ServiceWorkers - Worker2 -*-: ' + str + '\n');
}

self.addEventListener('install', function(e) {
  debug('Install event');
});

self.addEventListener('activate', function(e) {
  debug('Activate event');
});

self.addEventListener('fetch', function(e) {
  debug('Fetch event');
  debug('uhiuhiuhiuhiFetch event');
});
