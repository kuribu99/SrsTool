var _ = require('underscore');

var failCallBack = function (error) {
    if (error) {
        console.log('Error from: ' + failCallBack.caller);
        console.log(error);
    }
};

exports.HomeController = function ($scope, $http, $location) {
    $scope.projectName = "";

    $scope.newProject = function () {
        $http.post('/api/v1/projects/new', {
            projectName: $scope.projectName
        }).then(function (json) {
            if (json.data.result)
                $location.path('/projects/' + json.data.id);
            else
                console.log(json.data);
        }, failCallBack);
    }
}

exports.ProjectViewController = function ($scope, $routeParams, $http, $location) {
    var encoded = encodeURIComponent($routeParams.id);

    $scope.tbxModule = "";
    $scope.tbxActor = "";
    $scope.tbxAction = "";
    
    $http.get('/api/v1/projects/' + encoded)
        .then(function (json) {
            if (json.data.result)
                $scope.project = json.data.project;
            else
                $location.path('/');

        }, failCallBack);

    $http.get('/api/v1/domains/all')
        .then(function (json) {
            $scope.domains = json.data.domains;
            $scope.newDomains = _.without($scope.domains, $scope.project.domainData.domainName);
        }, failCallBack());

    $http.get('/api/v1/modules/all')
        .then(function (json) {
            $scope.modules = json.data.modules;
            $scope.newModules = _.without($scope.modules, $scope.project.domainData.modules);
        }, failCallBack());

    $http.get('/api/v1/actors/all')
        .then(function (json) {
            $scope.actors = json.data.actors;
            $scope.newActors = _.without($scope.actors, $scope.project.domainData.actors);
        }, failCallBack());

    $http.get('/api/v1/actions/all')
        .then(function (json) {
            $scope.actions = json.data.actions;
            $scope.newActions = _.without($scope.actions, $scope.project.domainData.actions);
        }, failCallBack());

    $scope.saveProject = function () {
        $http.put('/api/v1/projects/' + encoded, {
            project: $scope.project
        }).then(function (json) {
            if (json.data.result)
                $location.path('/');
            else
                alert('Something bad happened\nJSON:' + json.data);
        }, failCallBack);
    };

    $scope.getNewModuleNames = function () {
        return _.without($scope.modules, $scope.project.domainData.modules);
    };

    setTimeout(function () {
        $scope.$emit('ProjectController');
    }, 0);
};

exports.SrsAppController = function ($scope, $routeParams, $http) {

    setTimeout(function () {
        $scope.$emit('ProjectController');
    }, 0);

}

exports.ProjectListController = function ($scope, $routeParams, $http) {

    $scope.refreshList = function () {
        $http.get('/api/v1/projects/all').then(function (json) {
            $scope.projects = json.data.projects;
        }, failCallBack);
    };

    $scope.deleteProject = function (project, index) {
        $http.delete('/api/v1/projects/' + project._id)
            .then(function (json) {
                if (json.data.result)
                    $scope.projects.splice(index, 1);
            }, failCallBack);
    };

    $scope.refreshList();
    setTimeout(function () {
        $scope.$emit('ProjectController');
    }, 0);

}