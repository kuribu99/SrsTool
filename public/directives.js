exports.projectView = function () {
    return {
        controller: 'ProjectViewController',
        templateUrl: 'templates/project_view.html'
    };
};

exports.srsApp = function () {
    return {
        controller: 'SrsAppController',
        templateUrl: 'templates/main.html'
    };
};

exports.home = function () {
    return {
        controller: 'HomeController',
        templateUrl: 'templates/home.html'
    };
};

exports.projectList = function () {
    return {
        controller: 'ProjectListController',
        templateUrl: 'templates/project_list.html'
    };
};