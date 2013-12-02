# backbone-socketio [![Build Status](https://secure.travis-ci.org/JoshMock/backbone-socketio.png?branch=master)](http://travis-ci.org/JoshMock/backbone-socketio)

Realtime two-way data-binding of Backbone model and collection data to a webserver via [Socket.io](http://socket.io). Makes realtime, collaborative editing in Backbone applications (hopefully) much simpler.

## Getting Started

### Server
Install the module: `npm install backbone-socketio`.

Server-side event listeners are added by injecting the Socket.io module as a dependency:

```javascript
var backbone_socketio = require('backbone-socketio'),
    io = require('socket.io');

backbone_socketio.init(io);
```

### Client

**NOTE: Client-side code is not yet finished so this is documentation *from the future.**

The only dependencies the client has are [Underscore](http://documentcloud.github.io/underscore/) and [Backbone.js](http://documentcloud.github.io/backbone/). The developer will be expected to use [Cocktail](https://github.com/onsi/cocktail) to mix this functionality into any models and collections.

Install the client-side code using [Bower](http://bower.io/):

`bower install backbone-socketio`

or by [downloading the minified file](#) and hosting it on your server or CDN.

Include the file:
`<script src="/bower_components/backbone-socketio/client/backbone-socketio.js"></script>`

And use Cocktail to mix in the event listeners necessary to make this whole thing work:

```javascript
var MyModel = Backbone.Model.extend({}),
    MyCollection = Backbone.Model.extend({});

Cocktail.mixin(MyModel, BackboneSocketio.mixins);
Cocktail.mixin(MyCollection, BackboneSocketio.mixins);
```

This will set up listeners on all the necessary change events on models and collections then publish those changes down to the server. The server will then broadcast those changes back out to all other clients connected to the same socket and update the data in their corresponding models and collections.

Handling any DOM manipulation necessary to reflect these changes in your Backbone views is up to you.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## Feature wish list

- Account-specific events
- Server-side hooks to run custom code in response to change events

## License
Copyright (c) 2013 Josh Mock
Licensed under the MIT license.
