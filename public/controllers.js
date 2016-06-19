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
        }, failCallBack());

    $http.get('/api/v1/modules/all')
        .then(function (json) {
            $scope.modules = json.data.modules;
            $scope.newModules = _.difference($scope.modules, $scope.project.domainData.modules);
        }, failCallBack());

    $http.get('/api/v1/actors/all')
        .then(function (json) {
            $scope.actors = json.data.actors;
            $scope.newActors = _.difference($scope.actors, $scope.project.domainData.actors);
        }, failCallBack());

    $http.get('/api/v1/actions/all')
        .then(function (json) {
            $scope.actions = json.data.actions;
            $scope.newActions = _.difference($scope.actions, $scope.project.domainData.actions);
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

    $scope.addModule = function () {
        if ($scope.tbxModule.length > 0 && $scope.project.domainData.modules.indexOf($scope.tbxModule) < 0) {
            $scope.project.domainData.modules.push($scope.tbxModule);

            var index = $scope.newModules.indexOf($scope.tbxModule);
            if (index >= 0)
                $scope.newModules.splice(index, 1);

            $scope.tbxModule = '';
        }
    };

    $scope.deleteModule = function (module, index) {
        $scope.project.domainData.modules.splice(index, 1);
        if ($scope.newModules.indexOf(module) < 0)
            $scope.newModules.push(module);
    };

    $scope.addActor = function () {
        if ($scope.tbxActor.length > 0 && $scope.project.domainData.actors.indexOf($scope.tbxActor) < 0) {
            $scope.project.domainData.actors.push($scope.tbxActor);

            var index = $scope.newActors.indexOf($scope.tbxActor);
            if (index >= 0)
                $scope.newActors.splice(index, 1);

            $scope.tbxActor = '';
        }
    };

    $scope.deleteActor = function (actor, index) {
        $scope.project.domainData.actors.splice(index, 1);
        if ($scope.newActors.indexOf(actor) < 0)
            $scope.newActors.push(actor);
    };

    $scope.addAction = function () {
        if ($scope.tbxAction.length > 0 && $scope.project.domainData.actions.indexOf($scope.tbxAction) < 0) {
            $scope.project.domainData.actions.push($scope.tbxAction);

            var index = $scope.newActions.indexOf($scope.tbxAction);
            if (index >= 0)
                $scope.newActions.splice(index, 1);

            $scope.tbxAction = '';
        }
    };

    $scope.deleteAction = function (action, index) {
        $scope.project.domainData.actions.splice(index, 1);
        if ($scope.newActions.indexOf(action) < 0)
            $scope.newActions.push(action);
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