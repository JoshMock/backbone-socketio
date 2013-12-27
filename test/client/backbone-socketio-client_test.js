'use strict';

global.Backbone = require('backbone');
global._ = require('underscore');

var sinon = require("sinon"),
    BackboneSocketio = require('../../client/backbone-socketio-client.js'),
    FauxIo = function () {
        this.emit = sinon.spy();
        this.on = sinon.spy();
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

exports['BackboneSocketio init'] = {
    'has `mixins` property with expected keys': function (test) {
        test.expect(3);

        var bbsio = new BackboneSocketio({});

        test.ok(_.has(bbsio, "mixins"));
        test.ok(_.has(bbsio.mixins, "collection"));
        test.ok(_.has(bbsio.mixins, "model"));
        test.done();
    }
};

exports['BackboneSocketio collection'] = {
    'throws exception if applied to a non-Backbone.Collection object': function (test) {
        test.expect(1);

        var bbsio = new BackboneSocketio(new FauxIo()),
            NotACollection = Backbone.Model.extend(bbsio.mixins.collection);

        test.throws(function () {
            new NotACollection();
        }, Error, "This object is not a Backbone.Collection");

        test.done();
    },

    'creates a unique socket identifier': function (test) {
        test.expect(2);

        var bbsio = new BackboneSocketio(new FauxIo()),
            MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
            col = new MyCol();

        test.ok(_.isString(col.socketId));
        test.equal(col.socketId.indexOf("socketEventCollection"), 0);

        test.done();
    },

    'emits a socket event whenever an add event happens': function (test) {
        test.expect(3);

        var fauxIo = new FauxIo(),
            bbsio = new BackboneSocketio(fauxIo),
            MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
            MyModel = Backbone.Model.extend(bbsio.mixins.model),
            col = new MyCol({ model: MyModel });

        col.add({});
        test.ok(fauxIo.emit.calledWith("Backbone.Collection.add", {
            id: col.socketId,
            model: {},
            modelSocketId: col.at(0).socketId,
            index: 1
        }));

        col.add({something: "hey"});
        test.ok(fauxIo.emit.calledWith("Backbone.Collection.add", {
            id: col.socketId,
            model: {something: "hey"},
            modelSocketId: col.at(1).socketId,
            index: 2
        }));

        col.add([{a: 1}, {b: 2}]);

        test.equal(fauxIo.emit.callCount, 4);

        test.done();
    },

    "doesn't emit a socket event if an add event happens but triggeredBySocket option is true": function (test) {
        test.expect(1);

        var fauxIo = new FauxIo(),
            bbsio = new BackboneSocketio(fauxIo),
            MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
            col = new MyCol({ model: Backbone.Model.extend(bbsio.mixins.model) });

        col.add({}, {triggeredBySocket: true});
        test.equal(fauxIo.emit.callCount, 0);

        test.done();
    },

    'emits a socket event whenever a remove event happens': function (test) {
        test.expect(1);

        var fauxIo = new FauxIo(),
            bbsio = new BackboneSocketio(fauxIo),
            MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
            MyModel = Backbone.Model.extend(bbsio.mixins.model),
            col = new MyCol({ model: MyModel }),
            m1 = new MyModel();

        col.add(m1);
        col.remove(m1);
        test.deepEqual(fauxIo.emit.getCall(1).args, ["Backbone.Collection.remove", {
            id: col.socketId,
            modelSocketId: m1.socketId
        }]);

        test.done();
    },

    "doesn't emit a socket event if an remove event happens but triggeredBySocket option is true": function (test) {
        test.expect(1);

        var fauxIo = new FauxIo(),
            bbsio = new BackboneSocketio(fauxIo),
            MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
            MyModel = Backbone.Model.extend(bbsio.mixins.model),
            col = new MyCol({ model: MyModel }),
            m1 = new MyModel();

        col.add(m1);
        col.remove(m1, {triggeredBySocket: true});
        test.equal(fauxIo.emit.callCount, 1);

        test.done();
    },

    'collection is updated if matching socket add event is fired': function (test) {
        test.expect(3);

        var fauxIo = new FauxIo(),
            bbsio = new BackboneSocketio(fauxIo),
            MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
            MyModel = Backbone.Model.extend(bbsio.mixins.model),
            col = new MyCol({model: MyModel}),
            // this is kind of brittle but it's the easiest way to get the socket.io callback
            socketCallback = fauxIo.on.getCall(0).args[1],
            m1 = new MyModel({ aThing: 37 });

        col.on("add", function (m, c, options) {
            test.equal(options.triggeredBySocket, true);
            test.equal(options.at, 1);
            test.equal(m.get("aThing"), 37);
            test.done();
        });

        socketCallback({
            id: col.socketId,
            model: m1.toJSON(),
            modelSocketId: m1.socketId,
            index: 1
        });
    },

    'collection is not updated if non-maching socket add event is fired': function (test) {
        test.expect(1);

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

        test.equal(addSpy.callCount, 0);
        test.done();
    },

    'collection is updated if matching socket remove event is fired': function (test) {
        test.expect(1);

        var fauxIo = new FauxIo(),
            bbsio = new BackboneSocketio(fauxIo),
            MyCol = Backbone.Collection.extend(bbsio.mixins.collection),
            MyModel = Backbone.Model.extend(bbsio.mixins.model),
            col = new MyCol({model: MyModel}),
            socketCallback = fauxIo.on.getCall(1).args[1],
            m1 = new MyModel();

        col.add(m1);

        col.on("remove", function (m, c, options) {
            test.equal(options.triggeredBySocket, true);
            test.done();
        });

        socketCallback({
            id: col.socketId,
            modelSocketId: m1.socketId
        });
    },

    'collection is not updated if non-maching socket remove event is fired': function (test) {
        test.expect(1);

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

        test.equal(removeSpy.callCount, 0);
        test.done();
    }
};

exports['BackboneSocketio model'] = {
    'throws exception if applied to a non-Backbone.Model object': function (test) {
        test.expect(1);

        var bbsio = new BackboneSocketio(new FauxIo()),
            NotAModel = Backbone.Collection.extend(bbsio.mixins.model);

        test.throws(function () {
            var m = new NotAModel();
            m.set("x", 1);
        }, Error, "This object is not a Backbone.Model");

        test.done();
    },

    'creates a unique socket identifier': function (test) {
        test.expect(2);

        var bbsio = new BackboneSocketio(new FauxIo()),
            MyModel = Backbone.Model.extend(bbsio.mixins.model),
            model = new MyModel();

        test.ok(_.isString(model.socketId));
        test.equal(model.socketId.indexOf("socketEventModel"), 0);

        test.done();
    },

    'emits a socket event whenever a change is made to the model': function (test) {
        test.expect(4);

        var fauxIo = new FauxIo(),
            bbsio = new BackboneSocketio(fauxIo),
            MyModel = Backbone.Model.extend(bbsio.mixins.model),
            model = new MyModel();

        model.set("something", "something else");
        test.ok(fauxIo.emit.calledOnce);
        test.ok(fauxIo.emit.calledWith("Backbone.Model.change", {
            id: model.socketId,
            updates: {
                "something": "something else"
            }
        }));

        model.set("anotherThing", 22);
        test.equal(fauxIo.emit.callCount, 2);
        test.ok(fauxIo.emit.calledWith("Backbone.Model.change", {
            id: model.socketId,
            updates: {
                "something": "something else",
                "anotherThing": 22
            }
        }));

        test.done();
    },

    'does not emit a socket event if a change was triggered by a socket event': function (test) {
        test.expect(1);

        var fauxIo = new FauxIo(),
            bbsio = new BackboneSocketio(fauxIo),
            MyModel = Backbone.Model.extend(bbsio.mixins.model),
            model = new MyModel();

        model.set("something", "something else", {
            triggeredBySocket: true
        });
        test.equal(fauxIo.emit.callCount, 0);

        test.done();
    },

    'model is updated if matching socket change event is fired': function (test) {
        test.expect(2);

        var fauxIo = new FauxIo(),
            bbsio = new BackboneSocketio(fauxIo),
            MyModel = Backbone.Model.extend(bbsio.mixins.model),
            model = new MyModel(),
            socketCallback = fauxIo.on.getCall(0).args[1];

        model.on("change", function (m, options) {
            test.equal(options.triggeredBySocket, true);
            test.equal(model.get("myThing"), 1);
            test.done();
        });

        socketCallback({
            id: model.socketId,
            updates: { "myThing": 1 }
        });
    },

    'model is not updated if non-matching socket change event is fired': function (test) {
        test.expect(1);

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

        test.equal(changeSpy.callCount, 0);
        test.done();
    }
};
