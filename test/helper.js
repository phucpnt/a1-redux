var fs = require('fs');
var expect = require('chai').expect;

require.extensions['.txt'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

global.expect = expect;
