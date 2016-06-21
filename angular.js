var controllers = require('./controllers');
var directives = require('./directives');
var services = require('./services');
var _ = require('underscore');

var components = angular.module('srs-tool.components', ['ng']);

_.each(services, function (factory, name) {
    components.factory(name, factory);
});

_.each(controllers, function (controller, name) {
    components.controller(name, controller);
});

_.each(directives, function (directive, name) {
    components.directive(name, directive);
});

var app = angular.module('srs-tool', ['srs-tool.components', 'ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            title: 'Home',
            template: '<home></home>'
        })

        .when('/projects/:id', {
            title: 'View Project',
            template: '<project-view></project-view>'
        })

        .when('/projects/:id/edit', {
            title: 'Edit Project',
            template: '<edit-project-view></edit-project-view>'
        })

        .when('/projects/:id/generate', {
            title: 'Generate Requirements',
            template: '<generate-requirement></generate-requirement>'
        })

        .when('/projects/:id/access-control', {
            title: 'Configure Access Control',
            template: '<access-control></access-control>'
        })

        .when('/projects/:id/action-control', {
            title: 'Configure Action Control',
            template: '<action-control></action-control>'
        });
});

app.run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);