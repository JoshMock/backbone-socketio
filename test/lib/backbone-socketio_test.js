'use strict';

var sinon = require("sinon"),
    backbone_socketio = require('../../lib/backbone-socketio.js'),
    MockIo = function () {
        this.sockets = {
            on: sinon.spy()
        };
    };

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
            backbone_socketio.init(new MockIo());
        }, Error, "Expected one argument; received zero");
        test.done();
    },

    'listens to all the expected event types on connection': function (test) {
        test.expect(6);

        var mockIo = new MockIo(),
            mockSocket = { on: sinon.spy() },
            connectionCallback;

        backbone_socketio.init(mockIo);
        test.equal(mockIo.sockets.on.getCall(0).args[0], 'connection');
        connectionCallback = mockIo.sockets.on.getCall(0).args[1];
        connectionCallback(mockSocket);

        test.equal(mockSocket.on.getCall(0).args[0], 'Backbone.Model.change');
        test.equal(mockSocket.on.getCall(1).args[0], 'Backbone.Collection.add');
        test.equal(mockSocket.on.getCall(2).args[0], 'Backbone.Collection.remove');
        test.equal(mockSocket.on.getCall(3).args[0], 'Backbone.Collection.sort');
        test.equal(mockSocket.on.callCount, 4);

        test.done();
    },

    'broadcasts data unchanged back to all other socket connections': function (test) {
        test.expect(2);

        var mockIo = new MockIo(),
            mockSocket = {
                on: sinon.spy(),
                broadcast: {
                    emit: sinon.spy()
                }
            },
            fauxData = {z: "a", y: "b", x: 4},
            connectionCallback, broadcastEmitCallback;

        backbone_socketio.init(mockIo);
        connectionCallback = mockIo.sockets.on.getCall(0).args[1];
        connectionCallback(mockSocket);
        broadcastEmitCallback = mockSocket.on.getCall(0).args[1];

        broadcastEmitCallback(fauxData);

        test.deepEqual(mockSocket.broadcast.emit.getCall(0).args[1], fauxData);
        test.equal(mockSocket.broadcast.emit.callCount, 1);

        test.done();
    }
};
