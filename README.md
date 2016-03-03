# backbone-socketio [![Build Status](https://secure.travis-ci.org/JoshMock/backbone-socketio.png?branch=master)](http://travis-ci.org/JoshMock/backbone-socketio)

Realtime two-way data-binding of Backbone model and collection data to a
webserver via [Socket.io](http://socket.io). Makes realtime, collaborative
editing in Backbone applications (hopefully) much simpler.

## Getting Started

### Server
Install the module: `npm install backbone-socketio`.

Server-side event listeners are added by injecting the Socket.io module as a
dependency:

```javascript
var io = require('socket.io');
require('backbone-socketio').init(io.sockets);

// Alternatively to use a specific socket.io namespace:
// require('backbone-socketio').init(io.sockets.of("/namespace"));

// continue to do your normal socket.io stuff here
```



### Client

The only dependencies the client has are
[Underscore](http://documentcloud.github.io/underscore/) and
[Backbone.js](http://documentcloud.github.io/backbone/). Using
[Cocktail](https://github.com/onsi/cocktail) to apply mixins to models or
collections will make for a much nicer experience, but is not required.

Install the client-side code using [Bower](http://bower.io/):

`bower install backbone-socketio`

or by [downloading the minified file](https://github.com/JoshMock/backbone-socketio/blob/master/client/backbone-socketio.min.js) and hosting it on your server or CDN.

Include the file:
`<script src="/bower_components/backbone-socketio/client/backbone-socketio.min.js"></script>`

And mix the event listeners in using
[Cocktail](https://github.com/onsi/cocktail), or manually with `extend`.

With Cocktail:

```javascript
var socket = io.connect('http://localhost:3000'),
    backboneMixins = new BackboneSocketio(socket),
    MyModel, MyCollection;

MyModel = Backbone.Model.extend({ /* normal model init code here */ });
Cocktail.mixin(MyModel, backboneMixins.mixins.model);

MyCollection = Backbone.Collection.extend({ /* normal collection init code here */ });
Cocktail.mixin(MyCollection, backboneMixins.mixins.collection);
```

Without Cocktail:

```javascript
var socket = io.connect('http://localhost:3000'),
    backboneMixins = new BackboneSocketio(socket),
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


### Using the client library on the server

It's often usefull to have access to the same backbone models on the
server side as on the client side, with the same interfaces and data.

Install the module Backbone: `npm install backbone`.

```javascript
var Backbone = require("backbone");
var BackboneSocketio = require("backbone-socketio/client/backbone-socketio-client");
var BackboneSocketioServer = require("backbone-socketio/src/backbone-socketio");
var io = require('socket.io');

var socket = io.connect('http://localhost:3000'),
BackboneSocketioServer.init(socket.sockets);

var backboneMixins = new BackboneSocketio(socket.sockets);
var SocketModel = Backbone.Model.extend(backboneMixins.mixins.model);
var SocketCollection = Backbone.Collection.extend(backboneMixins.mixins.collection);

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


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding
style. Add unit tests for any new or changed functionality. Lint and test your
code using [Grunt](http://gruntjs.com/). `grunt` will run unit tests and
JSHint.

## Release History

### 0.2.1

- Added minified version of client file with source map file
- Only a model's changed data is sent over socket rather than entire model's
  JSON
- Reorganized file structure
- Rewrote unit tests using Mocha

### 0.2.0

- Support for Backbone.Collection `sort` events
- Minor bug fixes

### 0.1.0

Basic proof of concept. Full support for add and remove (collection) and change
(model) events.

## TODOs/wish list

- Put server component on NPM
- Make client component work with Bower
- Account/room-specific events
- Server-side hooks to run custom code in response to change events
- Probably a lot of other things I can't remember right now

## License
Copyright (c) 2013-2014 Josh Mock

Licensed under the MIT license.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/JoshMock/backbone-socketio/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

