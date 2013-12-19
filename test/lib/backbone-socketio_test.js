'use strict';

var backbone_socketio = require('../../lib/backbone-socketio.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['init'] = {
    setUp: function (done) {
        done();
    },

    'throws error when no arguments are passed': function (test) {
        test.expect(1);
        test.throws(function () { backbone_socketio.init(); }, Error, "Expected one argument; received zero");
        test.done();
    },

    'throws no error when the socket.io is passed': function (test) {
        test.expect(1);
        test.doesNotThrow(function () {
            backbone_socketio.init({ sockets: { on: function () {} } });
        }, Error, "Expected one argument; received zero");
        test.done();
    }
};
