describe("BackboneSocketio server", function () {
    'use strict';

    var sinon = require("sinon"),
        assert = require("assert"),
        backbone_socketio = require('../../src/backbone-socketio.js'),
        MockIo = function () {
            this.sockets = {
                on: sinon.spy()
            };
        };

    it('should throw an error when no arguments are passed', function () {
        assert.throws(function () { backbone_socketio.init(); }, Error, "Expected one argument; received zero");
    });

    it('should not throws an error when the socket.io is passed', function () {
        assert.doesNotThrow(function () {
            backbone_socketio.init(new MockIo());
        }, Error, "Expected one argument; received zero");
    });

    it('should listen to all the expected event types on connection', function () {
        var mockIo = new MockIo(),
            mockSocket = { on: sinon.spy() },
            connectionCallback;

        backbone_socketio.init(mockIo);
        assert.equal(mockIo.sockets.on.getCall(0).args[0], 'connection');
        connectionCallback = mockIo.sockets.on.getCall(0).args[1];
        connectionCallback(mockSocket);

        assert.equal(mockSocket.on.getCall(0).args[0], 'Backbone.Model.change');
        assert.equal(mockSocket.on.getCall(1).args[0], 'Backbone.Collection.add');
        assert.equal(mockSocket.on.getCall(2).args[0], 'Backbone.Collection.remove');
        assert.equal(mockSocket.on.getCall(3).args[0], 'Backbone.Collection.sort');
        assert.equal(mockSocket.on.callCount, 4);
    });

    it('broadcasts data unchanged back to all other socket connections', function () {
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

        assert.deepEqual(mockSocket.broadcast.emit.getCall(0).args[1], fauxData);
        assert.equal(mockSocket.broadcast.emit.callCount, 1);
    });
});
