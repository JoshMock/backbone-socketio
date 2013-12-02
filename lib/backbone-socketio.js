/*
 * backbone-socketio
 * https://github.com/JoshMock/backbone-socketio
 *
 * Copyright (c) 2013 Josh Mock
 * Licensed under the MIT license.
 */

'use strict';

exports.init = function (io) {
    if (!io) {
        throw new Error("Expected one argument; received zero");
    }

    // set up websockets
    io.sockets.on('connection', function (socket) {
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
            });
        });
    });
};
