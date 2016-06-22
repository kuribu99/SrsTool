exports.home = function () {
    return {
        controller: 'HomeController',
        templateUrl: './templates/home.html'
    };
};

exports.navBar = function () {
    return {
        templateUrl: './templates/nav_bar.html'
    };
};

exports.breadcrumbs = function () {
    return {
        controller: 'BreadcrumbsController',
        templateUrl: './templates/breadcrumbs.html'
    };
};

exports.loading = function () {
    return {
        templateUrl: './templates/loading.html'
    };
};

exports.projectList = function () {
    return {
        controller: 'ProjectListController',
        templateUrl: './templates/project_list.html'
    };
};

exports.projectView = function ($routeParams) {
    return {
        controller: 'ProjectViewController',
        templateUrl: './templates/project_view.html'
    };
};

exports.editProjectView = function () {
    return {
        controller: 'EditProjectViewController',
        templateUrl: './templates/edit_project_view.html'
    };
};

exports.generateRequirement = function () {
    return {
        controller: 'GenerateRequirementController',
        templateUrl: './templates/generate_requirement.html'
    };
};

exports.accessControl = function () {
    return {
        controller: 'AccessControlController',
        templateUrl: './templates/access_control.html'
    };
};

exports.actionControl = function () {
    return {
        controller: 'ActionControlController',
        templateUrl: './templates/action_control.html'
    };
};