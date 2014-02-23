describe("BackboneSocketio client", function () {
    'use strict';

    global._ = require('underscore');
    global.Backbone = require('backbone');

    var sinon = require("sinon"),
        assert = require("assert"),
        BackboneSocketio = require('../../client/backbone-socketio.min.js'),
        FauxIo = function () {
            this.emit = sinon.spy();
            this.on = sinon.spy();
        };

    after(function () {
        delete global.Backbone;
        delete global._;
    });

    describe("init", function () {
        it("should have a `mixins` property with expected keys", function () {
            var bbsio = new BackboneSocketio({});

            assert(_.has(bbsio, "mixins"));
            assert(_.has(bbsio.mixins, "collection"));
            assert(_.has(bbsio.mixins, "model"));
        });
    });

    describe("collection", function () {
        it('should throw an exception if applied to a non-Backbone.Collection object', function () {
            var bbsio = new BackboneSocketio(new FauxIo()),
                NotACollection = Backbone.Model.extend(bbsio.mixins.collection);

            assert.throws(function () {
                new NotACollection();
            }, Error, "This object is not a Backbone.Collection");
        });

        it('should create a unique socket identifier', function () {
            var bbsio = new BackboneSocketio(new FauxIo()),
                MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
                col = new MyCol();

            assert(_.isString(col.socketId));
            assert.equal(col.socketId.indexOf("socketEventCollection"), 0);
        });

        it('should emit a socket event whenever an add event happens', function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({ model: MyModel });

            col.add({});
            assert(fauxIo.emit.calledWith("Backbone.Collection.add", {
                id: col.socketId,
                model: {},
                modelSocketId: col.at(0).socketId,
                index: 1
            }));

            col.add({something: "hey"});
            assert(fauxIo.emit.calledWith("Backbone.Collection.add", {
                id: col.socketId,
                model: {something: "hey"},
                modelSocketId: col.at(1).socketId,
                index: 2
            }));

            col.add([{a: 1}, {b: 2}]);

            assert.equal(fauxIo.emit.callCount, 4);
        });

        it("should not emit a socket event if an add event happens but triggeredBySocket option is true", function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
                col = new MyCol({ model: Backbone.Model.extend(bbsio.mixins.model) });

            col.add({}, {triggeredBySocket: true});
            assert.equal(fauxIo.emit.callCount, 0);
        });

        it('should emit a socket event whenever a remove event happens', function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({ model: MyModel }),
                m1 = new MyModel();

            col.add(m1);
            col.remove(m1);
            assert.deepEqual(fauxIo.emit.getCall(1).args, ["Backbone.Collection.remove", {
                id: col.socketId,
                modelSocketId: m1.socketId
            }]);
        });

        it("shouldn't emit a socket event if a remove event happens but triggeredBySocket option is true", function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({ model: MyModel }),
                m1 = new MyModel();

            col.add(m1);
            col.remove(m1, {triggeredBySocket: true});
            assert.equal(fauxIo.emit.callCount, 1);
        });

        it('should emit a socket event whenever a sort event happens', function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(_.extend(bbsio.mixins.collection, {
                    comparator: function (item) {
                        return item.get("a");
                    }
                })),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({ model: MyModel }),
                m1 = new MyModel({ a: 4 });

            col.add(m1, { sort: false });
            col.sort();
            assert.deepEqual(fauxIo.emit.getCall(1).args, ["Backbone.Collection.sort", {
                id: col.socketId
            }]);
        });

        it("should not emit a socket event if a sort event happens but triggeredBySocket option is true", function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(_.extend(bbsio.mixins.collection, {
                    comparator: function (item) {
                        return item.get("a");
                    }
                })),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({ model: MyModel }),
                m1 = new MyModel({ a: 45 });

            col.add(m1, { sort: false });
            col.sort({triggeredBySocket: true});
            assert.equal(fauxIo.emit.callCount, 1);
        });

        it('collection is updated if matching socket add event is fired', function (done) {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({model: MyModel}),
                // this is kind of brittle but it's the easiest way to get the socket.io callback
                socketCallback = fauxIo.on.getCall(0).args[1],
                m1 = new MyModel({ aThing: 37 });

            col.on("add", function (m, c, options) {
                assert.equal(options.triggeredBySocket, true);
                assert.equal(options.at, 1);
                assert.equal(m.get("aThing"), 37);
                done();
            });

            socketCallback({
                id: col.socketId,
                model: m1.toJSON(),
                modelSocketId: m1.socketId,
                index: 1
            });
        });

        it('should not update the collection if non-maching socket add event is fired', function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({model: MyModel}),
                socketCallback = fauxIo.on.getCall(0).args[1],
                m1 = new MyModel({ aThing: 37 }),
                addSpy = sinon.spy();

            col.on("add", addSpy);

            socketCallback({
                id: "someRandomId1",
                model: m1.toJSON(),
                modelSocketId: m1.socketId,
                index: 1
            });

            assert.equal(addSpy.callCount, 0);
        });

        it('should update the collection if matching socket remove event is fired', function (done) {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({model: MyModel}),
                socketCallback = fauxIo.on.getCall(1).args[1],
                m1 = new MyModel();

            col.add(m1);

            col.on("remove", function (m, c, options) {
                assert.equal(options.triggeredBySocket, true);
                done();
            });

            socketCallback({
                id: col.socketId,
                modelSocketId: m1.socketId
            });
        });

        it('should not update the collection if non-maching socket remove event is fired', function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({model: MyModel}),
                socketCallback = fauxIo.on.getCall(1).args[1],
                m1 = new MyModel({ aThing: 37 }),
                removeSpy = sinon.spy();

            col.add(m1);
            col.on("remove", removeSpy);

            socketCallback({
                id: "someRandomId1",
                modelSocketId: m1.socketId
            });

            assert.equal(removeSpy.callCount, 0);
        });

        it('should not update the collection if matching socket sort event is fired', function (done) {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(_.extend(bbsio.mixins.collection, {
                    comparator: function (item) {
                        return item.get("a");
                    }
                })),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({ model: MyModel }),
                socketCallback = fauxIo.on.getCall(2).args[1],
                m1 = new MyModel({ a: 3 });

            col.add(m1, {sort: false});

            col.on("sort", function (c, options) {
                assert.equal(options.triggeredBySocket, true);
                done();
            });

            socketCallback({
                id: col.socketId
            });
        });

        it('collection is not updated if non-maching socket sort event is fired', function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyCol = Backbone.Collection.extend(_.extend(bbsio.mixins.collection, {
                    comparator: function (item) {
                        return item.get("a");
                    }
                })),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                col = new MyCol({ model: MyModel }),
                socketCallback = fauxIo.on.getCall(2).args[1],
                m1 = new MyModel({ a: 37 }),
                sortSpy = sinon.spy();

            col.add(m1, {sort: false});
            col.on("sort", sortSpy);

            socketCallback({
                id: "someRandomId1"
            });

            assert.equal(sortSpy.callCount, 0);
        });
    });

    describe("model", function () {
        it('should throw an exception if applied to a non-Backbone.Model object', function () {
            var bbsio = new BackboneSocketio(new FauxIo()),
                NotAModel = Backbone.Collection.extend(bbsio.mixins.model);

            assert.throws(function () {
                var m = new NotAModel();
                m.set("x", 1);
            }, Error, "This object is not a Backbone.Model");
        });

        it('should create a unique socket identifier', function () {
            var bbsio = new BackboneSocketio(new FauxIo()),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                model = new MyModel();

            assert(_.isString(model.socketId));
            assert.equal(model.socketId.indexOf("socketEventModel"), 0);
        });

        it('should emit a socket event whenever a change is made to the model, with only changed data', function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                model = new MyModel();

            model.set("something", "something else");
            assert(fauxIo.emit.calledOnce);
            assert(fauxIo.emit.calledWith("Backbone.Model.change", {
                id: model.socketId,
                updates: {
                    "something": "something else"
                }
            }));

            model.set("anotherThing", 22);
            assert.equal(fauxIo.emit.callCount, 2);
            assert(fauxIo.emit.calledWith("Backbone.Model.change", {
                id: model.socketId,
                updates: {
                    "anotherThing": 22
                }
            }));
        });

        it('should not emit a socket event if a change was triggered by a socket event', function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                model = new MyModel();

            model.set("something", "something else", {
                triggeredBySocket: true
            });
            assert.equal(fauxIo.emit.callCount, 0);
        });

        it('should update the model if matching socket change event is fired', function (done) {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                model = new MyModel(),
                socketCallback = fauxIo.on.getCall(0).args[1];

            model.on("change", function (m, options) {
                assert.equal(options.triggeredBySocket, true);
                assert.equal(model.get("myThing"), 1);
                done();
            });

            socketCallback({
                id: model.socketId,
                updates: { "myThing": 1 }
            });
        });

        it('should not update the model if non-matching socket change event is fired', function () {
            var fauxIo = new FauxIo(),
                bbsio = new BackboneSocketio(fauxIo),
                MyModel = Backbone.Model.extend(bbsio.mixins.model),
                model = new MyModel(),
                socketCallback = fauxIo.on.getCall(0).args[1],
                changeSpy = sinon.spy();

            model.on("change", changeSpy);
            socketCallback({
                id: "someRandomId1",
                updates: { "myOtherThing": 2 }
            });

            assert.equal(changeSpy.callCount, 0);
        });
    });
});
