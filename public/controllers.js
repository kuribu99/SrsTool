var failCallBack = function (error) {
    console.log('Error:');
    console.log(error);
};

exports.HomeController = function ($scope, $http, $location) {
    $scope.projectName = "untitled";

    $scope.newProject = function () {
        $http.post('/api/v1/projects/new', {
            projectName: $scope.projectName
        }).then(function (json) {
            if (json.data.result) {
                $location.path('/projects/' + json.data.project._id);
            }
            else
                console.log(json.data);
        }, failCallBack);
    }
}

exports.ProjectViewController = function ($scope, $routeParams, $http) {
    var encoded = encodeURIComponent($routeParams.id);

    $http.get('/api/v1/projects/' + encoded)
        .then(function (json) {
            if (json.data.result)
                $scope.project = json.data.project;
            else
                $scope.project = null;
        }, failCallBack);

    $http.get('/api/v1/domains/names/all')
        .then(function (json) {
            $scope.domainNames = json.data.domainNames;
        }, failCallBack())

    $scope.saveProject = function () {
        $http.put('/api/v1/projects/' + encoded, {
            project: $scope.project
        }).then(function (json) {
            if (json.data.result)
                console.log('Successfully saved');
            else
                console.log(json);
        }, failCallBack);
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

    $scope.RefreshList = function () {
        $http.get('/api/v1/projects/all').then(function (json) {
            $scope.projects = json.data.projects;
        }, failCallBack);
    };

    $scope.DeleteProject = function(id) {
        $http.delete
    }


    $scope.RefreshList();
    setTimeout(function () {
        $scope.$emit('ProjectController');
    }, 0);

}