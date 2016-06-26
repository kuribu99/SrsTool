var _ = require('underscore');

var failCallBack = function (error) {
    if (error) {
        console.log(error);
        toast(error.data, 2000);
    }
};

var toast = function (message, time) {
    Materialize.toast(message, time);
};

exports.HomeController = function ($scope, $http, $location) {
    $scope.projectName = "";
    $scope.domainName = "default";

    $http.get('/api/v1/domains/names/')
        .then(function (json) {
            $scope.domains = json.data.domains;
        }, failCallBack());

    $scope.newProject = function () {
        if ($scope.projectName.length > 0 && $scope.domainName.length > 0) {
            $http.post('/api/v1/projects/', {
                projectName: $scope.projectName,
                domainName: $scope.domainName
            }).then(function (json) {
                if (json.data.result)
                    $location.path('/projects/' + json.data.id);
                else
                    console.log(json.data);
            }, failCallBack);
        }
        else
            alert('Project name and domain name must not be empty');
    };

    setTimeout(function () {
        $scope.$emit('HomeController');
    }, 0);
};

exports.LoadingController = function ($scope, $rootScope, $window) {

    $rootScope.title = 'Loading...';

    $scope.back = function () {
        $window.history.back();
    };

    setTimeout(function () {
        $scope.$emit('LoadingController');
    }, 0);
};

exports.ProjectListController = function ($scope, $routeParams, $http) {

    $scope.refreshList = function () {
        $http.get('/api/v1/projects/list').then(function (json) {
            $scope.projects = json.data.projects;
        }, failCallBack);
    };

    $scope.deleteProject = function (project, index) {
        if (confirm('Are you sure to delete this project?')) {
            $http.delete('/api/v1/projects/' + project._id)
                .then(function (json) {
                    if (json.data.result)
                        $scope.projects.splice(index, 1);
                    else
                        console.log(json.data);
                }, failCallBack);
        }
    };

    $scope.refreshList();
    setTimeout(function () {
        $scope.$emit('ProjectController');
    }, 0);
};

exports.ProjectViewController = function ($scope, $routeParams, $http, $location, $formatter) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;
    $scope.toast = toast;

    $http.get('/api/v1/projects/' + projectID + '/view')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;
                if ($scope.project.generatedRequirements == null)
                    $scope.project.generatedRequirements = {};
            }
            else
                $location.path('/');
        }, failCallBack);

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/generated-requirements', {
            generatedRequirements: $scope.project.generatedRequirements
        }).then(function (json) {
            if (json.data.result) {
                $location.path('/projects/' + $scope.project._id);
                $scope.toast('Saved successfully', 2000);
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.removeRequirement = function (moduleName, index) {
        $scope.project.generatedRequirements[moduleName].splice(index, 1);
    };

    setTimeout(function () {
        $scope.$emit('ProjectViewController');
    }, 0);
};

exports.EditProjectController = function ($scope, $routeParams, $http, $location) {
    var projectID = encodeURIComponent($routeParams.id);

    $http.get('/api/v1/projects/' + projectID + '/project-data/')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;
            }
            else
                $location.path('/');

        }, failCallBack);

    $http.get('/api/v1/domains/names/')
        .then(function (json) {
            $scope.domains = json.data.domains;
        }, failCallBack());

    $scope.saveProject = function () {
        if ($scope.project.projectName.length > 0 && $scope.project.domainData.domainName.length > 0) {
            $http.patch('/api/v1/projects/' + projectID + '/project-data/', {
                projectName: $scope.project.projectName,
                domainName: $scope.project.domainData.domainName
            }).then(function (json) {
                if (json.data.result)
                    $location.path('/projects/' + $scope.project._id);
                else
                    console.log(json.data);
            }, failCallBack);
        }
        else
            alert('Project name and domain name must not be empty');
    };

    setTimeout(function () {
        $scope.$emit('EditProjectController');
    }, 0);
};

exports.EditDomainController = function ($scope, $routeParams, $http, $location) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.tbxModule = "";
    $scope.tbxActor = "";
    $scope.tbxAction = "";

    $http.get('/api/v1/projects/' + projectID + '/domain-data/')
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

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/domain-data/', {
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
        $scope.$emit('EditDomainController');
    }, 0);
};

exports.GenerateRequirementController = function ($scope, $routeParams, $http, $location, $formatter, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;
    $scope.$boilerplateTemplates = $template.boilerplateTemplates;
    $scope.generatedRequirements = [];

    $http.get('/api/v1/projects/' + projectID)
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;
                if ($scope.project.boilerplateData == null)
                    $scope.project.boilerplateData = {};

                if ($scope.project.generatedRequirements == null)
                    $scope.project.generatedRequirements = {};

                for (var key in $scope.$boilerplateTemplates)
                    if ($scope.project.boilerplateData[key] == null)
                        $scope.project.boilerplateData[key] = $scope.$boilerplateTemplates[key];

                $scope.generateRequirements();
            }
            else
                $location.path('/');
        }, failCallBack);

    $scope.generateRequirements = function () {
        $scope.generatedRequirements = {
            'Access Control': [],
            'Action Control': [],
            'Resource Constraint': []
        };

        // Access Control
        var moduleName = 'Access Control';
        for (var module in $scope.project.accessControlData) {
            for (var actor in $scope.project.accessControlData[module]) {
                var allowed = $scope.project.accessControlData[module][actor];
                var boilerplate = $scope.project.boilerplateData.accessControl[allowed];
                var values = {
                    '<module>': module,
                    '<actor>': actor
                };

                if (!$scope.hasRequirement(moduleName, values))
                    $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
            }
        }

        // Action Control
        moduleName = 'Action Control';
        for (var actor in $scope.project.actionControlData) {
            for (var action in $scope.project.actionControlData[actor]) {
                var allowed = $scope.project.actionControlData[actor][action];
                var boilerplate = $scope.project.boilerplateData.actionControl[allowed];
                var values = {
                    '<actor>': actor,
                    '<action>': action
                };

                if (!$scope.hasRequirement(moduleName, values))
                    $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
            }
        }

        // Resource constraint
        moduleName = 'Resource Constraint';
        for (var action in $scope.project.resourceConstraintData) {
            for (var index in $scope.project.resourceConstraintData[action]) {
                var item = $scope.project.resourceConstraintData[action][index];
                var boilerplate = $scope.project.boilerplateData.resourceConstraint[item.option];
                var values = {
                    '<action>': action,
                    '<constraint>': item.constraint,
                    '<option>': item.option,
                    '<value>': item.value
                };

                if (!$scope.hasRequirement(moduleName, values))
                    $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
            }
        }

        $scope.numberRequirements = _.flatten($scope.generatedRequirements).length;
        $scope.numberModules = Object.keys($scope.generatedRequirements).length;
        $scope.numberNewRequirements = 0;
    };

    $scope.hasRequirement = function (moduleName, values) {
        var requirements = $scope.project.generatedRequirements[moduleName];
        if (requirements == null)
            return false;
        for (var index in requirements) {
            if ($scope.isSameValue(requirements[index].values, values))
                return true;
        }
        return false;
    };

    $scope.isSameValue = function (v1, v2) {
        for (var key in v1) {
            if (v2[key] == null || v1[key] != v2[key])
                return false;
        }
        return true;
    };

    $scope.addCheckedRequirements = function () {
        var addedRequirements = [];

        for (var moduleName in $scope.generatedRequirements) {
            if ($scope.project.generatedRequirements[moduleName] == null)
                $scope.project.generatedRequirements[moduleName] = [];

            _.each($scope.generatedRequirements[moduleName], function (requirement) {
                if (requirement.checked) {
                    $scope.project.generatedRequirements[moduleName].push(requirement);
                    delete requirement.checked;
                    addedRequirements.push(requirement);
                }
            });

            $scope.generatedRequirements[moduleName] = _.difference($scope.generatedRequirements[moduleName], addedRequirements);
        }

        $scope.numberNewRequirements += addedRequirements.length;
    };

    $scope.newRequirement = function (module, boilerplate, values) {
        return {
            module: module,
            boilerplate: boilerplate,
            values: values,
            checked: false
        };
    };

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/generated-requirements', {
            generatedRequirements: $scope.project.generatedRequirements
        }).then(function (json) {
            if (json.data.result)
                $location.path('/projects/' + $scope.project._id);
            else
                console.log(json.data);
        }, failCallBack);
    };

    setTimeout(function () {
        $scope.$emit('GenerateRequirementController');
    }, 0);
};

exports.AccessControlController = function ($scope, $routeParams, $http, $location, $formatter) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;

    $http.get('/api/v1/projects/' + projectID + '/access-control-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                if (!$scope.project.accessControlData)
                    $scope.project.accessControlData = {};

                _.each($scope.project.domainData.modules, function (module) {
                    if (!$scope.project.accessControlData.hasOwnProperty(module))
                        $scope.project.accessControlData[module] = {};

                    _.each($scope.project.domainData.actors, function (actor) {
                        if (!$scope.project.accessControlData[module].hasOwnProperty(actor))
                            $scope.project.accessControlData[module][actor] = false;
                    });

                    _.each(
                        _.difference(Object.keys($scope.project.accessControlData[module]), $scope.project.domainData.actors),
                        function (key) {
                            delete $scope.project.accessControlData[module][key];
                        });
                });
                _.each(
                    _.difference(Object.keys($scope.project.accessControlData), $scope.project.domainData.modules),
                    function (key) {
                        delete $scope.project.accessControlData[key];
                    });
            } else
                $location.path('/projects/' + $scope.project._id);

        }, failCallBack);

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/access-control-data', {
            accessControlData: $scope.project.accessControlData
        }).then(function (json) {
            if (json.data.result)
                $location.path('/projects/' + $scope.project._id);
            else
                console.log(json.data);
        }, failCallBack);
    };

    setTimeout(function () {
        $scope.$emit('AccessControlController');
    }, 0);
};

exports.ActionControlController = function ($scope, $routeParams, $http, $location, $formatter) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;

    $http.get('/api/v1/projects/' + projectID + '/action-control-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                if (!$scope.project.actionControlData)
                    $scope.project.actionControlData = {};

                _.each($scope.project.domainData.actors, function (actor) {
                    if (!$scope.project.actionControlData.hasOwnProperty(actor))
                        $scope.project.actionControlData[actor] = {};

                    _.each($scope.project.domainData.actions, function (action) {
                        if (!$scope.project.actionControlData[actor].hasOwnProperty(action))
                            $scope.project.actionControlData[actor][action] = false;
                    });

                    // Delete existing removed action data
                    _.each(
                        _.difference(Object.keys($scope.project.actionControlData[actor]), $scope.project.domainData.actions),
                        function (key) {
                            delete $scope.project.actionControlData[actor][key];
                        });
                });

                // Delete existing removed actor data
                _.each(
                    _.difference(Object.keys($scope.project.actionControlData), $scope.project.domainData.actors),
                    function (key) {
                        delete $scope.project.actionControlData[key];
                    });
            } else
                $location.path('/projects/' + $scope.project._id);

        }, failCallBack);

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/action-control-data', {
            actionControlData: $scope.project.actionControlData
        }).then(function (json) {
            if (json.data.result)
                $location.path('/projects/' + $scope.project._id);
            else
                console.log(json.data);
        }, failCallBack);
    };

    setTimeout(function () {
        $scope.$emit('ActionControlController');
    }, 0);
};

exports.ConfigureBoilerplateController = function ($scope, $routeParams, $http, $location, $formatter, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;
    $scope.$boilerplateTemplates = $template.boilerplateTemplates;
    $scope._ = _;
    $scope.toast = toast;

    $http.get('/api/v1/projects/' + projectID + '/boilerplate-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;
                if ($scope.project.boilerplateData == null)
                    $scope.project.boilerplateData = {};

                for (var key in $scope.$boilerplateTemplates)
                    if ($scope.project.boilerplateData[key] == null)
                        $scope.project.boilerplateData[key] = $scope.$boilerplateTemplates[key];
            }
            else
                $location.path('/');
        }, failCallBack);

    $scope.requirementToString = function (template) {
        if (template == null || template == '')
            return '';
        return $formatter.requirementToString({
            boilerplate: template,
            values: {
                '<actor>': 'lecturer',
                '<module>': 'user authentication',
                '<action>': 'register account',
                '<constraint>': 'response time',
                '<value>': '1 seconds',
            }
        });
    }

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/boilerplate-data', {
            boilerplateData: $scope.project.boilerplateData
        }).then(function (json) {
            if (json.data.result)
                $location.path('/projects/' + $scope.project._id);
            else
                console.log(json.data);
        }, failCallBack);
    };

    setTimeout(function () {
        $scope.$emit('ConfigureBoilerplateController');
    }, 0);
};

exports.ResourceConstraintController = function ($scope, $routeParams, $http, $location, $formatter, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;
    $scope.$resourceConstraintOptions = $template.resourceConstraintOptions;
    $scope.resourceConstraintData = {};

    $http.get('/api/v1/projects/' + projectID + '/resource-constraint-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                if (!$scope.project.resourceConstraintData)
                    $scope.project.resourceConstraintData = {};

                _.each($scope.project.domainData.actions, function (action) {
                    if (!$scope.project.resourceConstraintData.hasOwnProperty(action))
                        $scope.project.resourceConstraintData[action] = [];

                    $scope.resourceConstraintData[action] = $scope.emptyConstraint();
                });

            } else
                $location.path('/projects/' + $scope.project._id);

        }, failCallBack);

    $scope.emptyConstraint = function (action) {
        return {
            action: action,
            constraint: '',
            option: '',
            value: ''
        };
    };

    $scope.addConstraint = function (action) {
        var newData = $scope.resourceConstraintData[action];
        if (newData.constraint == '')
            toast('Constraint name is required', 2000);
        else if (newData.option == '')
            toast('Please choose an option', 2000);
        else if (newData.value == '')
            toast('Value is required', 2000);
        else {
            $scope.project.resourceConstraintData[action].push(newData);
            $scope.resourceConstraintData[action] = $scope.emptyConstraint();
            $scope.resourceConstraintData[action].option = newData.option;
        }
    };

    $scope.deleteConstraint = function (action, index) {
        $scope.project.resourceConstraintData[action].splice(index, 1);
    }

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/resource-constraint-data', {
            resourceConstraintData: $scope.project.resourceConstraintData
        }).then(function (json) {
            if (json.data.result)
                $location.path('/projects/' + $scope.project._id);
            else
                console.log(json.data);
        }, failCallBack);
    };

    setTimeout(function () {
        $scope.$emit('ResourceConstraintController');
    }, 0);
};
