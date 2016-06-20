var controllers = require('./controllers');
var directives = require('./directives');
var services = require('./services');
var _ = require('underscore');

var components = angular.module('srs-tool.components', ['ng']);

_.each(controllers, function (controller, name) {
    components.controller(name, controller);
});

_.each(directives, function (directive, name) {
    components.directive(name, directive);
});

_.each(services, function (factory, name) {
    components.factory(name, factory);
});

var app = angular.module('srs-tool', ['srs-tool.components', 'ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            template: '<home></home>'
        })

        .when('/projects/:id', {
            template: '<project-view></project-view>'
        })

        .when('/projects/:id/edit', {
            template: '<edit-project-view></edit-project-view>'
        })

        .when('/projects/:id/access-control', {
            template: '<access-control></access-control>'
        });
});
