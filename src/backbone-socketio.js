/*
 * backbone-socketio
 * https://github.com/JoshMock/backbone-socketio
 *
 * Copyright (c) 2013 Josh Mock
 * Licensed under the MIT license.
 */

'use strict';
var Emitter = require('events').EventEmitter;

exports.init = function (socketio) {
    if (!socketio) {
        throw new Error("Expected one argument; received zero");
    }

    // set up websockets
    socketio.on('connection', function (socket) {
        var eventTypes = [
            'Backbone.Model.change',
            'Backbone.Collection.add',
            'Backbone.Collection.remove',
            'Backbone.Collection.sort'
        ];

        // thin wrapper that broadcasts all Backbone changes to all other sockets
        eventTypes.forEach(function (type) {
            socket.on(type, function (data) {
                socket.broadcast.emit(type, data);
                Emitter.prototype.emit.call(socketio, type, data);
            });
        });
    });
};
