'use strict';

(function() {

  function debug(str) {
    dump(' -*- ServiceWorkersCSP -*-: ' + str + '\n');
    console.log(' -*- ServiceWorkersCSP -*-: ' + str + '\n');
  }

  function debug_separator() {
    debug('');
    dump(' -*- ServiceWorkersCSP -*-: ----------------------------\n');
    console.log(' -*- ServiceWorkersCSP -*-: ----------------------------\n');
  }

  // Reload with CSP
  var reload_btn = document.querySelector('#reload_csp');
  reload_btn.addEventListener('click', function(e) {
    debug_separator();
    document.location.search = "?add_header=Content-Security-Policy:script-src%20%27self%27&add_header=Content-Security-Policy-Report-Only:%20script-src%20%27self%27;%20%20report-uri%20/cspReport";
  });

  // Create a script that will work, or not, depending on the CSP...
  var createScript_btn = document.querySelector('#create_script');
  createScript_btn.addEventListener('click', function(e) {
    debug_separator();
    var script = document.createElement('script');
    script.setAttribute('src', 'http://antonioma.github.io/edRareTravel/js/ed_route.js?' + Math.random());
    document.body.appendChild(script);
  });


}());
