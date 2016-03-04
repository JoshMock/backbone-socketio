/** @license
 * backbone-socketio 0.2.1
 * (c) 2013-2014 Josh Mock
 * This may be freely distributed under the MIT license. */
(function () {
    "use strict";

    var defineBackboneSocketio = function(global, Backbone, _) {

        // ## initialization function
        //
        // usage (with [Cocktail](https://github.com/onsi/cocktail)):
        //
        //     var socket = io.connect('http://localhost:3000'),
        //         backboneMixins = new BackboneSocketio(socket),
        //         MyModel, MyCollection;
        //     
        //     MyModel = Backbone.Model.extend({ /* normal model init code here */ });
        //     Cocktail.mixin(MyModel, backboneMixins.mixins.model);
        //     
        //     MyCollection = Backbone.Collection.extend({ /* normal collection init code here */});
        //     Cocktail.mixin(MyCollection, backboneMixins.mixins.collection);
        //
        // usage (without Cocktail):
        //
        //     var socket = io.connect('http://localhost:3000'),
        //         backboneMixins = new BackboneSocketio(socket),
        //         SocketModel = Backbone.Model.extend(backboneMixins.mixins.model),
        //         SocketCollection = Backbone.Collection.extend(backboneMixins.mixins.collection),
        //         MyModel, MyCollection;
        //     
        //     MyModel = SocketModel.extend({
        //         // normal model init code here
        //         initialize: function () {
        //             // if you need an initialize method make sure you call the parent's
        //             // initialize function
        //             MyModel.__super__.initialize.call(this);
        //         }
        //     });
        //     
        //     MyCollection = SocketCollection.extend({
        //         // normal collection init code here
        //         initialize: function () {
        //             // if you need an initialize method make sure you call the parent's
        //             // initialize function
        //             MyCollection.__super__.initialize.call(this);
        //         }
        //     });
        var BackboneSocketio = function (ioSocket) {
            var backboneSocket = this;
            this.generateUuid4 = function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
                    /[xy]/g,
                    function(c) {
                        var r = Math.random() * 16|0;
                        if (c === 'y') {
                            r = r & 0x3 | 0x8;
                        }
                        return r.toString(16);
                    }
                );
            };
            this.matchObjectIds = function (a, b) {
                return ((a.id !== undefined && b.id === a.id) ||
                        (a.id === undefined && b.cid === a.cid));
            };
            this.mixins = {
                collection: {
                    constructor: function (models, options) {
                      Backbone.Collection.call(this, models, options);
                      this.id = options.id;
                    },
                    initialize: function () {
                        if (!(this instanceof Backbone.Collection)) {
                            throw new Error("This object is not a Backbone.Collection");
                        }

                        var that = this;

                        // give the collection globally a unique ID so we can make sure events
                        // only are applied to the correct collection(s)
                        that.cid = backboneSocket.generateUuid4();

                        // publish `add` collection event to socket
                        this.on("add", function (model, changedCollection, options) {
                            if (!options.triggeredBySocket) {
                                var modelData = model.toJSON();
                                modelData.cid = model.cid;
                                ioSocket.emit("Backbone.Collection.add", {
                                    id: that.id,
                                    cid: that.cid,
                                    model: modelData,
                                    index: changedCollection.models.indexOf(model)
                                });
                            }
                        });

                        // publish `remove` collection event to socket
                        this.on("remove", function (model, changedCollection, options) {
                            if (!options.triggeredBySocket) {
                                ioSocket.emit("Backbone.Collection.remove", {
                                    id: that.id,
                                    cid: that.cid,
                                    model: {cid: model.cid, id: mode.id}
                                });
                            }
                        });

                        // publish `sort` collection event to socket
                        this.on("sort", function (changedCollection, options) {
                            if (!options.triggeredBySocket) {
                                ioSocket.emit("Backbone.Collection.sort", {
                                    id: that.id,
                                    cid: that.cid
                                });
                            }
                        });

                        // apply `add` socket event back to the appropriate collection
                        ioSocket.on("Backbone.Collection.add", function (data) {
                            if (backboneSocket.matchObjectIds(that, data)) {
                                that.add(data.model, {
                                    at: data.index,
                                    triggeredBySocket: true
                                });
                            }
                        });

                        // apply `remove` socket event back to the appropriate collection
                        ioSocket.on("Backbone.Collection.remove", function (data) {
                            if (backboneSocket.matchObjectIds(that, data)) {
                                var modelToRemove;

                                that.each(function (model) {
                                    if (backboneSocket.matchObjectIds(model, data.model)) {
                                        modelToRemove = model;
                                    }
                                });
                                that.remove(modelToRemove, { triggeredBySocket: true });
                            }
                        });

                        // apply `sort` socket event back to the appropriate collection
                        ioSocket.on("Backbone.Collection.sort", function (data) {
                            if (backboneSocket.matchObjectIds(that, data)) {
                                that.sort({ triggeredBySocket: true });
                            }
                        });
                    }
                },

                model: {
                    initialize: function () {
                        if (!(this instanceof Backbone.Model)) {
                            throw new Error("This object is not a Backbone.Model");
                        }

                        var that = this;

                        // give the model a globally unique ID so we can make sure events
                        // only are applied to the correct collection(s)
                        that.cid = backboneSocket.generateUuid4();

                        // publish model `change` events to socket
                        this.on("change", function (changedModel, options) {
                            if (!options.triggeredBySocket) {
                                ioSocket.emit("Backbone.Model.change", {
                                    id: that.id,
                                    cid: that.cid,
                                    updates: that.changed
                                });
                            }
                        });

                        // apply socket events to appropriate model
                        ioSocket.on("Backbone.Model.change", function (data) {
                            if (backboneSocket.matchObjectIds(that, data)) {
                                that.set(data.updates, { triggeredBySocket: true });
                            }
                        });
                    }
                }
            };
        };

        return BackboneSocketio;
    };

    // module definition setup
    var g = this;
    if (typeof define === 'function' && define.amd) {
        define(["backbone", "underscore"], function (Backbone, _) {
            return defineBackboneSocketio(g, Backbone, _);
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        var Backbone = require("backbone");
        var _ = require("underscore");
        module.exports = defineBackboneSocketio(g, Backbone, _);
    } else {
        g.BackboneSocketio = defineBackboneSocketio(g, g.Backbone, g._);
    }
})();
