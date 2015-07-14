// serverPaths is an object that will have as primary key the HTTP method.
// Each of the serverPaths[method] in turn will hold an object whose key is a
// string (regexp) of a path and whose value is a function that should be
// invoked whenever the method and path matches
function PathMatcher(serverPaths) {
  'use strict';

  var _paths = {};
  for (var method in serverPaths) {
    _paths[method] = [];
    for (var _path in serverPaths[method]) {
      var pathRE = new RegExp(_path);
      _paths[method].push({
        pathRE: pathRE,
        processor: serverPaths[method][_path]
      });
    }
  }

  function getProcessor(method, pathname) {
    var methodPaths = _paths[method] || _paths['DEFAULT'];
    var found = false;
    // Array.find is not in node....
    for(var i = 0, l = methodPaths.length; !found && i < l; i++) {
      found = methodPaths[i].pathRE.test(pathname) && methodPaths[i].processor;
    }
    return found || _paths['DEFAULT'][0].processor;
  }

  return {
    getProcessor: getProcessor
  };

}

module.exports.PathMatcher = PathMatcher;

