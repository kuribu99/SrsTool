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

exports.loading = function () {
    return {
        controller: 'LoadingController',
        templateUrl: './templates/loading.html'
    };
};

exports.projectList = function () {
    return {
        controller: 'ProjectListController',
        templateUrl: './templates/project_list.html'
    };
};

exports.projectView = function () {
    return {
        controller: 'ProjectViewController',
        templateUrl: './templates/project_view.html'
    };
};

exports.editProject = function () {
    return {
        controller: 'EditProjectController',
        templateUrl: './templates/edit_project.html'
    };
};

exports.editDomain = function () {
    return {
        controller: 'EditDomainController',
        templateUrl: './templates/edit_domain.html'
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

exports.configureBoilerplate = function () {
    return {
        controller: 'ConfigureBoilerplateController',
        templateUrl: './templates/configure_boilerplate.html'
    };
};

exports.performanceConstraint = function () {
    return {
        controller: 'PerformanceConstraintController',
        templateUrl: './templates/performance_constraint.html'
    };
};

exports.functionalConstraint = function () {
    return {
        controller: 'FunctionalConstraintController',
        templateUrl: './templates/functional_constraint.html'
    };
};

exports.configureCompatibility = function () {
    return {
        controller: 'ConfigureCompatibilityController',
        templateUrl: './templates/configure_compatibility.html'
    };
};

exports.previewExport = function () {
    return {
        controller: 'PreviewExportController',
        templateUrl: './templates/preview_export.html'
    };
};
