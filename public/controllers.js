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
        if ($scope.projectName.length > 0) {
            $http.post('/api/v1/projects/new', {
                projectName: $scope.projectName
            }).then(function (json) {
                if (json.data.result)
                    $location.path('/projects/' + json.data.id + '/edit');
                else
                    console.log(json.data);
            }, failCallBack);
        }
    }
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
                else
                    console.log(json.data);
            }, failCallBack);
    };

    $scope.refreshList();
    setTimeout(function () {
        $scope.$emit('ProjectController');
    }, 0);

}

exports.ProjectViewController = function ($scope, $routeParams, $http, $location) {
    var projectID = encodeURIComponent($routeParams.id);

    $http.get('/api/v1/projects/' + projectID)
        .then(function (json) {
            if (json.data.result)
                $scope.project = json.data.project;
            else
                $location.path('/#/');
        }, failCallBack);

    setTimeout(function () {
        $scope.$emit('ProjectViewController');
    }, 0);

};

exports.EditProjectViewController = function ($scope, $routeParams, $http, $location) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.tbxModule = "";
    $scope.tbxActor = "";
    $scope.tbxAction = "";

    $http.get('/api/v1/projects/' + projectID)
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                $http.get('/api/v1/domains/' + encodeURIComponent($scope.project.domainData.domainName))
                    .then(function (json) {
                        if (json.data.result) {
                            $scope.newModules = _.difference(json.data.domain.modules, $scope.project.domainData.modules);
                            $scope.newActors = _.difference(json.data.domain.actors, $scope.project.domainData.actors);
                            $scope.newActions = _.difference(json.data.domain.actions, $scope.project.domainData.actions);
                        }
                    }, failCallBack());
            }
            else
                $location.path('/');

        }, failCallBack);

    $http.get('/api/v1/domains/names/all')
        .then(function (json) {
            $scope.domains = json.data.domains;
        }, failCallBack());

    $scope.saveProject = function () {
        $http.put('/api/v1/projects/' + projectID, {
            project: $scope.project
        }).then(function (json) {
            if (json.data.result)
                $location.path('/projects/' + $scope.project._id);
            else
                console.log(json.data);
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

exports.AccessControlController = function ($scope, $routeParams, $http, $location) {
    var projectID = encodeURIComponent($routeParams.id);

    $http.get('/api/v1/projects/' + projectID)
        .then(function (json) {
            if (json.data.result)
                $scope.project = json.data.project;
            else
                $location.path('/#/projects/' + $scope.project._id);

        }, failCallBack);

    setTimeout(function () {
        $scope.$emit('AccessControlController');
    }, 0);
}