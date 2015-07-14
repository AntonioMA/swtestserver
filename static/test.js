'use strict';

function debug(str) {
  dump(' -*- ServiceWorkers -*-: ' + str + '\n');
  console.log(' -*- ServiceWorkers -*-: ' + str + '\n');
}

function debug_separator() {
  debug('');
  dump(' -*- ServiceWorkers -*-: ----------------------------\n');
  console.log(' -*- ServiceWorkers -*-: ----------------------------\n');
}

(function() {

  // Check service workers availability
  if (!('serviceWorker' in navigator)) {
    debug('ServiceWorker NOT found in navigator');
  }

  navigator.serviceWorker.addEventListener('controllerchange', function(e){
    debug("controllerChange event");
  });

  // Check ServiceWorkerContainer
  var controller_btn = document.querySelector('#check_container_btn');
  controller_btn.addEventListener('click', function(e) {
    debug_separator();
    var worker = navigator.serviceWorker.controller;
    debug('ServiceWorker (controller): ' + worker);
    for (var i in worker) {
      debug('  ' + i + ' - ' + worker[i]);
    }

    navigator.serviceWorker.ready.then(function(registration) {
      debug('Registration ready: ' + registration);
      for (var i in registration) {
        debug('  ' + i + ' - ' + registration[i]);
      }
    });
  });

  // Register action
  var register_btn = document.querySelector('#register_btn');
  register_btn.addEventListener('click', function(e) {
    debug_separator();
    navigator.serviceWorker.register('service-worker.js', {scope: './'}).then(function(registration) {
      debug('Service-worker register success');

      registration.addEventListener('updatefound', function(e) {
        debug("Received onupdatefound");
      });

      var serviceWorker;
      if (registration.installing) {
        serviceWorker = registration.installing;
        debug('Worker state ' + registration.installing.state);
        serviceWorker.onstatechange = function(evt) {
          debug('Worker state ' + serviceWorker.state + '\n');
          debug('wait: ' + registration.wait);
          debug('active: ' + registration.active);
        };

      } else if (registration.waiting) {
        serviceWorker = registration.waiting;
        debug('registration -> waitting');
      } else if (registration.active) {
        serviceWorker = registration.active;
        debug('registration -> active');
      }

    }).catch(function(error) {
      debug('Error during registration: ' + error);
    });
  });

  // Get registrations action
  var get_registrations_btn = document.querySelector('#get_registrations_btn');
  get_registrations_btn.addEventListener('click', function(e) {
    debug_separator();
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      debug(registrations.length + ' registration/s found');
      registrations.forEach(function (registration) {
        debug('');
        debug('Scope: ' + registration.scope);
        var sw = registration.installing || registration.waiting || registration.active;
        if (sw) {
          debug('Script URL: ' + sw.scriptURL);
        }
      });
    });
  });

  // Get registration action
  var get_registration_btn = document.querySelector('#get_registration_btn');
  get_registration_btn.addEventListener('click', function(e) {
    var clientUrl = document.querySelector('#getRegClientURL').value;
    debug_separator();
    navigator.serviceWorker.getRegistration(clientUrl).then(function(registration) {
      debug(registration);
      debug('');
      debug('Scope: ' + registration.scope);
      var sw = registration.installing || registration.waiting || registration.active;
      if (sw) {
        debug('Script URL: ' + sw.scriptURL);
      }
    });
  });

  // Unregister one action
  var unregister_btn = document.querySelector('#unregister_one_btn');
  unregister_btn.addEventListener('click', function(e) {
    var clientUrl = document.querySelector('#clientURL');
    debug_separator();
    navigator.serviceWorker.getRegistration(clientUrl).then(function(registration) {
      registration.unregister().then(function(result) {
        debug('Unregister done -> ' + result);
      });
    });
  });

  // Unregister all action
  var unregister_all_btn = document.querySelector('#unregister_all_btn');
  unregister_all_btn.addEventListener('click', function(e) {
    debug_separator();
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      registrations.forEach(function (registration) {
        registration.unregister().then(function(result) {
          debug('Unregister done -> ' + result);
        });
      });
    });
  });

  // Open window action
  var open_window_btn = document.querySelector('#open_window_btn');
  open_window_btn.addEventListener('click', function(e) {
    debug_separator();
    debug('Send open_window message to worker');
    navigator.serviceWorker.controller.postMessage('openWindow');
  });

/* Notification.requestPermission(function() {
    if (!navigator.serviceWorker.controller)
      alert('Please reload');
  });*/

  // Update action
  var update_btn = document.querySelector('#update_btn');
  update_btn.addEventListener('click', function(e) {
    debug_separator();
    debug('Update worker');
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      debug(registrations.length + ' registration/s found');
      registrations.forEach(function (registration) {
        registration.update();
      });
    });
  });

  // client action
  var client_btn = document.querySelector('#client_btn');
  client_btn.addEventListener('click', function(e) {
    debug_separator();
    debug('Send client message to worker');
    navigator.serviceWorker.controller.postMessage('client');
  });

  // matchAll action
  var matchall_btn = document.querySelector('#matchall_btn');
  matchall_btn.addEventListener('click', function(e) {
    debug_separator();
    debug('Send matchall message to worker');
    navigator.serviceWorker.controller.postMessage('matchAll');
  });

  navigator.serviceWorker.onmessage = function(msg) {
    debug('Message received from worker: ' + msg.data);
  };

}());
