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
            title: 'SRS Tool',
            template: '<landing-page></landing-page>'
        })

        .when('/home', {
            title: 'My Projects',
            template: '<home></home>'
        })

        .when('/projects/:id', {
            title: 'View Project',
            template: '<project-view></project-view>'
        })

        .when('/projects/:id/specify-nfr', {
            title: 'Specify Non-Functional Requirement',
            template: '<specify-nfr></specify-nfr>'
        })

        .when('/projects/:id/edit', {
            title: 'Edit Project',
            template: '<edit-project></edit-project>'
        })

        .when('/projects/:id/domain', {
            title: 'Edit Domain',
            template: '<edit-domain></edit-domain>'
        })

        .when('/projects/:id/action-control', {
            title: 'Configure Action Control',
            template: '<action-control></action-control>'
        })

        .when('/projects/:id/access-control', {
            title: 'Configure Access Control',
            template: '<access-control></access-control>'
        })

        .when('/projects/:id/performance-constraint', {
            title: 'Configure Performance Constraint',
            template: '<performance-constraint></performance-constraint>'
        })

        .when('/projects/:id/functional-constraint', {
            title: 'Configure Functional Constraint',
            template: '<functional-constraint></functional-constraint>'
        })

        .when('/projects/:id/configure-compatibility', {
            title: 'Configure Compatibility',
            template: '<configure-compatibility></configure-compatibility>'
        })

        .when('/projects/:id/configure-reliability', {
            title: 'Configure Reliability',
            template: '<configure-reliability></configure-reliability>'
        })

        .when('/projects/:id/configure-security', {
            title: 'Configure Security',
            template: '<configure-security></configure-security>'
        })

        .when('/projects/:id/configure-usability', {
            title: 'Configure Usability',
            template: '<configure-usability></configure-usability>'
        })

        .when('/projects/:id/generate', {
            title: 'Generate Requirements',
            template: '<generate-requirement></generate-requirement>'
        })

        .when('/projects/:id/boilerplate', {
            title: 'Configure Boilerplate',
            template: '<configure-boilerplate></configure-boilerplate>'
        })

        .when('/projects/:id/export', {
            title: 'Preview Export',
            template: '<preview-export></preview-export>'
        });
});

app.run(['$rootScope', '$document', function ($rootScope, $document) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        try {
            $rootScope.title = current.$$route.title;
            $rootScope.loading = false;
        }
        catch (e) {
            $rootScope.title = '';
        }
    });

    $rootScope.$on('$routeChangeStart', function () {
        $rootScope.loading = true;
    });

    $document.bind('keypress', function (e) {
        $rootScope.$broadcast('keypress', e);
        $rootScope.$broadcast('keypress:' + e.which, e);
    });

    $rootScope.$on('')
}]);