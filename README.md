# backbone-socketio [![Build Status](https://secure.travis-ci.org/JoshMock/backbone-socketio.png?branch=master)](http://travis-ci.org/JoshMock/backbone-socketio)

Realtime two-way data-binding of Backbone model and collection data to a
webserver via [Socket.io](http://socket.io). Makes realtime, collaborative
editing in Backbone applications (hopefully) much simpler.

## Getting Started

### Server
Install the module: `npm install backbone-socketio`. (TODO: package not on NPM
yet)

Server-side event listeners are added by injecting the Socket.io module as a
dependency:

```javascript
var io = require('socket.io');
require('backbone-socketio').init(io);
// continue to do your normal socket.io stuff here
```

### Client

**NOTE: Client-side code is not yet finished so this is documentation *from the
future.**

The only dependencies the client has are
[Underscore](http://documentcloud.github.io/underscore/) and
[Backbone.js](http://documentcloud.github.io/backbone/). Using
[Cocktail](https://github.com/onsi/cocktail) to apply mixins to models or
collections will make for a much nicer experience, but is not required.

Install the client-side code using [Bower](http://bower.io/):

`bower install backbone-socketio` (TODO: package not Bower-ready yet)

or by [downloading the minified file](#) and hosting it on your server or CDN.
(TODO: no minified file yet)

Include the file:
`<script src="/bower_components/backbone-socketio/client/backbone-socketio.js"></script>`

And mix the event listeners in using
[Cocktail](https://github.com/onsi/cocktail), or manually with `extend`.

With Cocktail:

```javascript
var socket = io.connect('http://localhost:3000'),
    backboneMixins = BackboneSocketio(socket),
    MyModel, MyCollection;

MyModel = Backbone.Model.extend({ /* normal model init code here */ });
Cocktail.mixin(MyModel, backboneMixins.mixins.model);

MyCollection = Backbone.Collection.extend({ /* normal collection init code here */ });
Cocktail.mixin(MyCollection, backboneMixins.mixins.collection);
```

Without Cocktail:

```javascript
var socket = io.connect('http://localhost:3000'),
    backboneMixins = BackboneSocketio(socket),
    SocketModel = Backbone.Model.extend(backboneMixins.mixins.model),
    SocketCollection = Backbone.Collection.extend(backboneMixins.mixins.collection),
    MyModel, MyCollection;

MyModel = SocketModel.extend({
    // normal model init code here
    initialize: function () {
        // if you need an initialize method make sure you call the parent's
        // initialize function
        MyModel.__super__.initialize.call(this);
    }
});

MyCollection = SocketCollection.extend({
    // normal collection init code here
    initialize: function () {
        // if you need an initialize method make sure you call the parent's
        // initialize function
        MyCollection.__super__.initialize.call(this);
    }
});
```

This will set up listeners on all the necessary change events on models and
collections then publish those changes down to the server. The server will then
broadcast those changes back out to all other clients connected to the same
socket and update the data in their corresponding models and collections.

Handling any DOM manipulation necessary to reflect changes in your views is up
to you.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding
style. Add unit tests for any new or changed functionality. Lint and test your
code using [Grunt](http://gruntjs.com/). `grunt` will run unit tests and
JSHint.

## Release History
_(Nothing yet)_

## TODOs/wish list

- Need minified version of client-side code
- Put server component on NPM
- Make client component work with Bower
- Working listener for collection `sort` events (currently stubbed)
- Account-specific events
- Server-side hooks to run custom code in response to change events
- Probably a lot of other things I can't remember right now

## License
Copyright (c) 2013 Josh Mock

Licensed under the MIT license.
