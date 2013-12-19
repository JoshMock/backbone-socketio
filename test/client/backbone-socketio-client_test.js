'use strict';

global.Backbone = require('backbone');
global._ = require('underscore');

var BackboneSocketio = require('../../client/backbone-socketio-client.js');

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

exports['BackboneSocketio'] = {
    setUp: function (done) {
        done();
    },

    'has `mixins` property with expected keys': function (test) {
        test.expect(3);

        var bbsio = new BackboneSocketio({});

        test.ok(_.has(bbsio, "mixins"));
        test.ok(_.has(bbsio.mixins, "collection"));
        test.ok(_.has(bbsio.mixins, "model"));
        test.done();
    }
};
