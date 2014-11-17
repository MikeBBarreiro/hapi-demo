/* port makes a flexiable port*/
var Joi    = require('joi');
var db     = process.env.DB;
var port   = process.env.PORT;
var Hapi   = require('hapi');
var server = new Hapi.Server(port);
var mongoose = require('mongoose');

mongoose.connect(db);

var Dog = mongoose.model('Dog', { name: String, age: Number, gender: String });


server.route({
    /* This takes Notes, the config */
    config:{
        description: 'this is the home page route',
        notes: 'these are my awesome notes',
        tags: ['Home', 'a', 'b', 'c'],
    },
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
            /*age*/
    path: '/{name}',
    /*-----------------req and res---- in express  */
    handler: function (request, reply) {
        reply('Hello, ' + request.params.name + '!' + request.query.limit);
    },
    config: {
        validate: {
            params: {
                /*age*/
                name: Joi.string().min(3).max(7)
            },
            query: {
                limit: Joi.number().required().min(9)
            }
        }
    }
});

/* loads Static files */
server.route({
    method: 'GET',
    path: '/static/{param*}',
    handler: {
        directory: {
            path: 'static'
        }
    }
});

server.route({
   method: 'POST',
    path: '/dogs',
    handler: function(request, reply){
        var puppy = new Dog(request.payload);
        puppy.save(function() {
            reply(request.payload);
        });
    }
});

/* Show all the requests , we used morgan in express to see this before */
server.pack.register(
    [{

        plugin: require('good'),
        options: {
            reporters: [{
                reporter: require('good-console'),
                args: [{log: '*', request: '*'}]
            }]
            }
        },
        { plugin: require('lout') }
], function (err) {
    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});
