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

exports.projectView = function () {
    return {
        controller: 'ProjectViewController',
        templateUrl: 'templates/project_view.html'
    };
};

exports.editProjectView = function () {
    return {
        controller: 'EditProjectViewController',
        templateUrl: 'templates/edit_project_view.html'
    };
};

exports.accessControl = function () {
    return {
        controller: 'AccessControlController',
        templateUrl: 'templates/access_control.html'
    };
};