var _ = require('underscore');

var failCallBack = function (error) {
    if (error) {
        console.log(error);
        toast(error.data);
    }
};

var toast = function (message, time) {
    if (!time)
        time = 2000;
    Materialize.toast(message, time);
};

var confirmBack = function () {
    return confirm("You have not saved the project yet!\n" +
        "Do you want to save your project?");
};

var countTrue = function (arr) {
    return _.filter(arr, function (val) {
        return val;
    }).length;
};

var isSameObject = function (v1, v2) {
    for (var key in v1) {
        if (v2[key] == null || v1[key] != v2[key])
            return false;
    }
    return true;
};

var arrayHasObject = function (arr, obj) {
    for (var index in arr) {
        if (isSameObject(arr[index], obj))
            return true;
    }
    return false;
};

var toastNotFound = function () {
    toast('Project not found');
};

exports.NavBarController = function ($scope, $http, $location, $user) {
    $scope.$user = $user;
    $user.loadUser();
    setTimeout(function () {
        $scope.$emit('NavBarController');
    }, 0);
};

exports.HomeController = function ($scope, $http, $location) {
    $scope.projectName = "";
    $scope.domainName = "default";
    $scope.type = "";

    $http.get('/api/v1/domains/names/')
        .then(function (json) {
            $scope.domains = json.data.domains;
        }, failCallBack());

    $scope.newProject = function () {
        if ($scope.projectName.length == 0)
            toast('Project name is required');

        else if ($scope.domainName.length == 0)
            toast('Domain name is required');

        else if ($scope.type.length == 0)
            toast('Project type is required');

        else {
            $http.post('/api/v1/projects/', {
                projectName: $scope.projectName,
                domainName: $scope.domainName,
                type: $scope.type
            }).then(function (json) {
                if (json.data.result)
                    $location.path('/projects/' + json.data.id);
                else
                    toast(json.data.error);
            }, failCallBack);
        }
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

exports.ProjectListController = function ($scope, $routeParams, $http, $user) {
    $scope.$user = $user;

    $scope.refreshList = function () {
        $http.get('/api/v1/projects/public').then(function (json) {
            $scope.publicProjects = json.data.projects;
        }, failCallBack);

        $http.get('/api/v1/projects/private').then(function (json) {
            $scope.privateProjects = json.data.projects;
        }, failCallBack);
    };

    $scope.deletePublicProject = function (project, index) {
        if (confirm('Are you sure to delete this project?')) {
            $http.delete('/api/v1/projects/' + project._id)
                .then(function (json) {
                    if (json.data.result)
                        $scope.publicProjects.splice(index, 1);
                    else {
                        console.log(json.data);
                        toastNotFound();
                    }
                }, failCallBack);
        }
    };

    $scope.deletePrivateProject = function (project, index) {
        if (confirm('Are you sure to delete this project?')) {
            $http.delete('/api/v1/projects/' + project._id)
                .then(function (json) {
                    if (json.data.result)
                        $scope.privateProjects.splice(index, 1);
                    else {
                        console.log(json.data);
                        toastNotFound();
                    }
                }, failCallBack);
        }
    };

    $scope.refreshList();
    setTimeout(function () {
        $scope.$emit('ProjectController');
    }, 0);
};

exports.ProjectViewController = function ($scope, $routeParams, $http, $location, $formatter, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;
    $scope.$modules = $template.modules;
    $scope.toast = toast;
    $scope.changed = false;
    $scope.numberFunctionalRequirement = 0;
    $scope.numberNonFunctionalRequirement = 0;

    $http.get('/api/v1/projects/' + projectID + '/view')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;
                if ($scope.project.generatedRequirements == null)
                    $scope.project.generatedRequirements = {};

                for (var key in $scope.project.generatedRequirements) {
                    if ($scope.$modules.Functional.indexOf(key) >= 0)
                        $scope.numberFunctionalRequirement += $scope.project.generatedRequirements[key].length;
                    else if ($scope.$modules.NonFunctional.indexOf(key) >= 0)
                        $scope.numberNonFunctionalRequirement += $scope.project.generatedRequirements[key].length;
                }
            }
            else {
                $location.path('/');
                toastNotFound();
            }
        }, failCallBack);

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/generated-requirements', {
            generatedRequirements: $scope.project.generatedRequirements
        }).then(function (json) {
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/home');
    };

    $scope.removeRequirement = function (moduleName, index) {
        $scope.project.generatedRequirements[moduleName].splice(index, 1);
        $scope.changed = true;
    };

    setTimeout(function () {
        $scope.$emit('ProjectViewController');
    }, 0);
};

exports.SpecifyNonFunctionalRequirementController = function ($scope, $routeParams, $http, $location) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.toast = toast;
    $scope.modules = [];

    $http.get('/api/v1/projects/' + projectID + '/view')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                $scope.modules = [
                    {
                        name: 'Access Control',
                        description: 'Decide who can access to which module',
                        path: 'access-control',
                        show: $scope.project.domainData.modules.length > 0 && $scope.project.domainData.actors.length > 0,
                        errorMessage: 'Please add at least one module and one actor to do so'
                    },
                    {
                        name: 'Performance Constraint',
                        description: 'Take into consideration of performance, time behaviour or resource usage',
                        path: 'performance-constraint',
                        show: $scope.project.domainData.actions.length > 0,
                        errorMessage: 'Please add at least one action to do so'
                    },
                    {
                        name: 'Functional Constraint',
                        description: 'Define interfaces that should be provided although not performed by user explicitly and stating rules',
                        path: 'functional-constraint',
                        show: true
                    },
                    {
                        name: 'Compatibility',
                        description: 'Making a system that is compatible with most operating system and environment, as well as backward compatibility of system output',
                        path: 'configure-compatibility',
                        show: true
                    },
                    {
                        name: 'Reliability',
                        description: 'Ensure a system that has high availability, fault tolerant and fast recovery from error',
                        path: 'configure-reliability',
                        show: true
                    },
                    {
                        name: 'Security',
                        description: 'Protect the system by limiting accessible items, checking file integrity and encrypt data',
                        path: 'configure-security',
                        show: true
                    },
                    {
                        name: 'Usability',
                        description: 'Provide best user experience and imply user interface requirements',
                        path: 'configure-usability',
                        show: true
                    }
                ];
            }
            else
                $location.path('/');
        }, failCallBack);

    $scope.goto = function (path) {
        $location.path('/projects/' + $scope.project._id + '/' + path);
    }

    $scope.back = function () {
        $location.path('/projects/' + $scope.project._id);
    };

    setTimeout(function () {
        $scope.$emit('SpecifyNonFunctionalRequirementController');
    }, 0);
};

exports.EditProjectController = function ($scope, $routeParams, $http, $location) {
    var projectID = encodeURIComponent($routeParams.id);

    $http.get('/api/v1/projects/' + projectID + '/project-data/')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;
            }
            else {
                $location.path('/projects/' + projectID);
                toastNotFound();
            }

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
            toast('Project name and domain name must not be empty');
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
    $scope.changed = false;

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
            domainData: $scope.project.domainData
        }).then(function (json) {
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id);
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.addModule = function () {
        if ($scope.tbxModule.length > 0 && $scope.project.domainData.modules.indexOf($scope.tbxModule) < 0) {
            $scope.project.domainData.modules.push($scope.tbxModule);

            var index = $scope.newModules.indexOf($scope.tbxModule);
            if (index >= 0)
                $scope.newModules.splice(index, 1);

            $scope.tbxModule = '';
            $scope.change();
        }
    };

    $scope.deleteModule = function (module, index) {
        $scope.project.domainData.modules.splice(index, 1);
        if ($scope.newModules.indexOf(module) < 0)
            $scope.newModules.push(module);
        $scope.change();
    };

    $scope.addActor = function () {
        if ($scope.tbxActor.length > 0 && $scope.project.domainData.actors.indexOf($scope.tbxActor) < 0) {
            $scope.project.domainData.actors.push($scope.tbxActor);

            var index = $scope.newActors.indexOf($scope.tbxActor);
            if (index >= 0)
                $scope.newActors.splice(index, 1);

            $scope.tbxActor = '';
            $scope.change();
        }
    };

    $scope.deleteActor = function (actor, index) {
        $scope.project.domainData.actors.splice(index, 1);
        if ($scope.newActors.indexOf(actor) < 0)
            $scope.newActors.push(actor);
        $scope.change();
    };

    $scope.addAction = function () {
        if ($scope.tbxAction.length > 0 && $scope.project.domainData.actions.indexOf($scope.tbxAction) < 0) {
            $scope.project.domainData.actions.push($scope.tbxAction);

            var index = $scope.newActions.indexOf($scope.tbxAction);
            if (index >= 0)
                $scope.newActions.splice(index, 1);

            $scope.tbxAction = '';
            $scope.change();
        }
    };

    $scope.deleteAction = function (action, index) {
        $scope.project.domainData.actions.splice(index, 1);
        if ($scope.newActions.indexOf(action) < 0)
            $scope.newActions.push(action);
        $scope.change();
    };

    setTimeout(function () {
        $scope.$emit('EditDomainController');
    }, 0);
};

exports.ActionControlController = function ($scope, $routeParams, $http, $location) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.changed = false;

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
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id);
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.getAllowedCount = function (arr) {
        return 'Allowed: ' + countTrue(arr) + '/' + Object.keys(arr).length;
    };

    setTimeout(function () {
        $scope.$emit('ActionControlController');
    }, 0);
};

exports.AccessControlController = function ($scope, $routeParams, $http, $location, $formatter) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;
    $scope.changed = false;

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
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id + '/specify-nfr');
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.getAllowedCount = function (arr) {
        return 'Allowed: ' + countTrue(arr) + '/' + Object.keys(arr).length;
    };

    setTimeout(function () {
        $scope.$emit('AccessControlController');
    }, 0);
};

exports.PerformanceConstraintController = function ($scope, $routeParams, $http, $location, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.changed = false;
    $scope.$performanceConstraintOptions = $template.performanceConstraintOptions;
    $scope.performanceConstraintData = {};

    $http.get('/api/v1/projects/' + projectID + '/performance-constraint-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                if (!$scope.project.performanceConstraintData)
                    $scope.project.performanceConstraintData = {};

                _.each($scope.project.domainData.actions, function (action) {
                    if (!$scope.project.performanceConstraintData.hasOwnProperty(action))
                        $scope.project.performanceConstraintData[action] = [];

                    $scope.performanceConstraintData[action] = $scope.newConstraint();
                });

            } else
                $location.path('/projects/' + $scope.project._id);

        }, failCallBack);

    $scope.newConstraint = function (action) {
        return {
            action: action,
            constraint: '',
            option: '',
            value: ''
        };
    };

    $scope.addConstraint = function (action) {
        var newData = $scope.performanceConstraintData[action];
        if (newData.constraint == '')
            toast('Constraint name is required');
        else if (newData.option == '')
            toast('Please choose an option');
        else if (newData.value == '')
            toast('Value is required');
        else if ($scope.hasConstraint(newData, action))
            toast('Constraint/Value pair already exist');
        else {
            $scope.project.performanceConstraintData[action].push(newData);
            $scope.performanceConstraintData[action] = $scope.newConstraint();
            $scope.performanceConstraintData[action].option = newData.option;
            $scope.change();
        }
    };

    $scope.hasConstraint = function (newConstraint, action) {
        return arrayHasObject($scope.project.performanceConstraintData[action], newConstraint);
    };

    $scope.deleteConstraint = function (action, index) {
        $scope.project.performanceConstraintData[action].splice(index, 1);
        $scope.change();
    };

    $scope.getConstraintCount = function (action) {
        var count = $scope.project.performanceConstraintData[action].length;
        switch (count) {
            case 0:
                return 'No constraints';
            case 1:
                return '1 constraint';
            default:
                return count + ' constraints';
        }
    };

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/performance-constraint-data', {
            performanceConstraintData: $scope.project.performanceConstraintData
        }).then(function (json) {
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id + '/specify-nfr');
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    setTimeout(function () {
        $scope.$emit('PerformanceConstraintController');
    }, 0);
};

exports.FunctionalConstraintController = function ($scope, $routeParams, $http, $location, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.changed = false;
    $scope.$actionDependenciesOptions = $template.actionDependenciesOptions;
    $scope.$actionRulesOptions = $template.actionRulesOptions;

    $http.get('/api/v1/projects/' + projectID + '/functional-constraint-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                if (!$scope.project.functionalConstraintData)
                    $scope.project.functionalConstraintData = {
                        interfaces: [],
                        actionDependencies: [],
                        actionRules: []
                    };

            } else
                $location.path('/projects/' + $scope.project._id);

        }, failCallBack);

    $scope.newInterface = function () {
        return {
            interfaceName: '',
            dependency: '',
            condition: ''
        }
    };

    $scope.addInterface = function () {
        if ($scope.tbxInterface.interfaceName == '')
            toast('Interface/Functionality name is required');
        else if ($scope.hasInterface($scope.tbxInterface))
            toast('Interface/Functionality already exist');
        else {
            $scope.project.functionalConstraintData.interfaces.push($scope.tbxInterface);
            $scope.tbxInterface = $scope.newInterface();
            $scope.changed = true;
        }
    };

    $scope.hasInterface = function (newInterface) {
        return arrayHasObject($scope.project.functionalConstraintData.interfaces, newInterface);
    };

    $scope.deleteInterface = function (index) {
        $scope.project.functionalConstraintData.interfaces.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getInterfaceCount = function () {
        var count = $scope.project.functionalConstraintData.interfaces.length;
        switch (count) {
            case 0:
                return 'No dependencies';
            case 1:
                return '1 dependency';
            default:
                return count + ' dependencies';
        }
    };

    $scope.newActionDependency = function () {
        return {
            action: '',
            dependentAction: '',
            relation: ''
        }
    };

    $scope.addActionDependency = function () {
        if ($scope.tbxActionDependency.action == '')
            toast('Action is required');
        else if ($scope.tbxActionDependency.relation == '')
            toast('Relation is required');
        else if ($scope.tbxActionDependency.dependentAction == '')
            toast('Dependent action is required');
        else if ($scope.hasActionDependency($scope.tbxActionDependency))
            toast('Action/Dependency pair already exist');
        else {
            var newData = $scope.tbxActionDependency;
            $scope.project.functionalConstraintData.actionDependencies.push(newData);
            $scope.tbxActionDependency = $scope.newActionDependency();
            $scope.tbxActionDependency.relation = newData.relation;
            $scope.changed = true;
        }
    };

    $scope.hasActionDependency = function (newActionDependency) {
        return arrayHasObject($scope.project.functionalConstraintData.actionDependencies, newActionDependency);
    };

    $scope.deleteActionDependency = function (index) {
        $scope.project.functionalConstraintData.actionDependencies.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getActionDependencyCount = function () {
        var count = $scope.project.functionalConstraintData.actionDependencies.length;
        switch (count) {
            case 0:
                return 'No dependencies';
            case 1:
                return '1 dependency';
            default:
                return count + ' dependencies';
        }
    };

    $scope.newActionRule = function () {
        return {
            action: '',
            rule: '',
            relation: ''
        }
    };

    $scope.addActionRule = function () {
        if ($scope.tbxActionRule.action == '')
            toast('Action name is required');
        else if ($scope.tbxActionRule.relation == '')
            toast('Relation is required');
        else if ($scope.tbxActionRule.rule == '')
            toast('Rule is required');
        else if ($scope.hasActionRule($scope.tbxActionRule))
            toast('Action/Rule pair already exist');
        else {
            $scope.project.functionalConstraintData.actionRules.push($scope.tbxActionRule);
            $scope.tbxActionRule = $scope.newActionRule();
            $scope.changed = true;
        }
    };

    $scope.hasActionRule = function (newActionRule) {
        return arrayHasObject($scope.project.functionalConstraintData.actionRules, newActionRule);
    };

    $scope.deleteActionRule = function (index) {
        $scope.project.functionalConstraintData.actionRules.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getActionRuleCount = function () {
        var count = $scope.project.functionalConstraintData.actionRules.length;
        switch (count) {
            case 0:
                return 'No rules';
            case 1:
                return '1 rule';
            default:
                return count + ' rules';
        }
    };

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/functional-constraint-data', {
            functionalConstraintData: $scope.project.functionalConstraintData
        }).then(function (json) {
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id + '/specify-nfr');
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.tbxInterface = $scope.newInterface();
    $scope.tbxActionDependency = $scope.newActionDependency();
    $scope.tbxActionRule = $scope.newActionRule();

    setTimeout(function () {
        $scope.$emit('FunctionalConstraintController');
    }, 0);
};

exports.ConfigureCompatibilityController = function ($scope, $routeParams, $http, $location, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$compatibilityOptions = $template.compatibilityOptions;
    $scope.changed = false;

    $http.get('/api/v1/projects/' + projectID + '/compatibility-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                if (!$scope.project.compatibilityData)
                    $scope.project.compatibilityData = {
                        operatingSystem: [],
                        executionEnvironment: [],
                        outputCompatibility: []
                    };

            } else
                $location.path('/projects/' + $scope.project._id);

        }, failCallBack);

    $scope.newOperatingSystem = function () {
        return {
            operatingSystem: '',
            version: '',
            issue: ''
        };
    };

    $scope.addOperatingSystem = function () {
        if ($scope.tbxOperatingSystem.operatingSystem == '')
            toast('Operating system name is required');
        else if ($scope.hasOperatingSystem($scope.tbxOperatingSystem))
            toast('Operating system name or version or issue already exist');
        else {
            $scope.project.compatibilityData.operatingSystem.push($scope.tbxOperatingSystem);
            $scope.tbxOperatingSystem = $scope.newOperatingSystem();
            $scope.changed = true;
        }
    };

    $scope.hasOperatingSystem = function (newOperatingSystem) {
        return arrayHasObject($scope.project.compatibilityData.operatingSystem, newOperatingSystem);
    };

    $scope.deleteOperatingSystem = function (index) {
        $scope.project.compatibilityData.operatingSystem.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getOperatingSystemCount = function () {
        var count = $scope.project ? $scope.project.compatibilityData.operatingSystem.length : 0;
        switch (count) {
            case 0:
                return 'None';
            case 1:
                return '1 OS';
            default:
                return count + ' OS';
        }
    };

    $scope.newExecutionEnvironment = function () {
        return {
            software: '',
            version: '',
            issue: ''
        };
    };

    $scope.addExecutionEnvironment = function () {
        if ($scope.tbxExecutionEnvironment.software == '')
            toast('Software name is required');
        else if ($scope.hasExecutionEnvironment($scope.tbxExecutionEnvironment))
            toast('Software or version or issue already exist');
        else {
            $scope.project.compatibilityData.executionEnvironment.push($scope.tbxExecutionEnvironment);
            $scope.tbxExecutionEnvironment = $scope.newExecutionEnvironment();
            $scope.changed = true;
        }
    };

    $scope.hasExecutionEnvironment = function (newExecutionEnvironment) {
        return arrayHasObject($scope.project.compatibilityData.executionEnvironment, newExecutionEnvironment);
    };

    $scope.deleteExecutionEnvironment = function (index) {
        $scope.project.compatibilityData.executionEnvironment.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getExecutionEnvironmentCount = function () {
        var count = $scope.project ? $scope.project.compatibilityData.executionEnvironment.length : 0;
        switch (count) {
            case 0:
                return 'None';
            default:
                return count + ' software';
        }
    };

    $scope.newOutputCompatibility = function () {
        return {
            output: '',
            newVersion: '',
            oldVersion: '',
            compatibility: ''
        };
    };

    $scope.addOutputCompatibility = function () {
        if ($scope.tbxOutputCompatibility.output == '')
            toast('Output is required');
        else if ($scope.tbxOutputCompatibility.oldVersion == '' || $scope.tbxOutputCompatibility.newVersion == '')
            toast('Software versions are required');
        else if ($scope.tbxOutputCompatibility.compatibility == '')
            toast('Compatibility option is required');
        else if ($scope.hasOutputCompatibility($scope.tbxOutputCompatibility))
            toast('Output or software version already exist');
        else {
            var newData = $scope.tbxOutputCompatibility;
            $scope.project.compatibilityData.outputCompatibility.push(newData);
            $scope.tbxOutputCompatibility = $scope.newOutputCompatibility();
            $scope.tbxOutputCompatibility.compatibility = newData.compatibility;
            $scope.changed = true;
        }
    };

    $scope.hasOutputCompatibility = function (newOutputCompatibility) {
        return arrayHasObject($scope.project.compatibilityData.outputCompatibility, newOutputCompatibility);
    };

    $scope.deleteOutputCompatibility = function (index) {
        $scope.project.compatibilityData.outputCompatibility.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getOutputCompatibilityCount = function () {
        var count = $scope.project ? $scope.project.compatibilityData.outputCompatibility.length : 0;
        switch (count) {
            case 0:
                return 'None';
            case 1:
                return '1 compatibility';
            default:
                return count + ' compatibilities';
        }
    };

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/compatibility-data', {
            compatibilityData: $scope.project.compatibilityData
        }).then(function (json) {
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id + '/specify-nfr');
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.tbxOperatingSystem = $scope.newOperatingSystem();
    $scope.tbxExecutionEnvironment = $scope.newExecutionEnvironment();
    $scope.tbxOutputCompatibility = $scope.newOutputCompatibility();

    setTimeout(function () {
        $scope.$emit('ConfigureCompatibilityController');
    }, 0);
};

exports.ConfigureReliabilityController = function ($scope, $routeParams, $http, $location) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.changed = false;

    $http.get('/api/v1/projects/' + projectID + '/reliability-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                if (!$scope.project.reliabilityData)
                    $scope.project.reliabilityData = {
                        availability: {
                            enabled: false,
                            value: 99
                        },
                        maintenance: {
                            enabled: false,
                            value: '1 hour',
                            period: 'week'
                        },
                        recoveryPeriod: [],
                        redundancyOption: [],
                        recoveryItem: []
                    };

            } else
                $location.path('/projects/' + $scope.project._id);

        }, failCallBack);

    $scope.newRecoveryPeriod = function () {
        return {
            failure: '',
            time: '',
            action: ''
        };
    };

    $scope.addRecoveryPeriod = function () {
        if ($scope.tbxRecoveryPeriod.failure == '')
            toast('Failure/case name is required');
        else if ($scope.tbxRecoveryPeriod.time == '')
            toast('Time taken for recovery is required');
        else if ($scope.hasRecoveryPeriod($scope.tbxRecoveryPeriod))
            toast('Failure/case or time or action already exist');
        else {
            $scope.project.reliabilityData.recoveryPeriod.push($scope.tbxRecoveryPeriod);
            $scope.tbxRecoveryPeriod = $scope.newRecoveryPeriod();
            $scope.changed = true;
        }
    };

    $scope.hasRecoveryPeriod = function (newRecoveryPeriod) {
        return arrayHasObject($scope.project.reliabilityData.recoveryPeriod, newRecoveryPeriod);
    };

    $scope.deleteRecoveryPeriod = function (index) {
        $scope.project.reliabilityData.recoveryPeriod.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getRecoveryPeriodCount = function () {
        var count = $scope.project ? $scope.project.reliabilityData.recoveryPeriod.length : 0;
        switch (count) {
            case 0:
                return 'None';
            default:
                return count + ' defined';
        }
    };

    $scope.newRedundancyOption = function () {
        return {
            name: '',
            failure: ''
        };
    };

    $scope.addRedundancyOption = function () {
        if ($scope.tbxRedundancyOption.name == '')
            toast('Redundancy name is required');
        else if ($scope.hasRedundancyOption($scope.tbxRedundancyOption))
            toast('Redundancy or failure already exist');
        else {
            $scope.project.reliabilityData.redundancyOption.push($scope.tbxRedundancyOption);
            $scope.tbxRedundancyOption = $scope.newRedundancyOption();
            $scope.changed = true;
        }
    };

    $scope.hasRedundancyOption = function (newRedundancyOption) {
        return arrayHasObject($scope.project.reliabilityData.redundancyOption, newRedundancyOption);
    };

    $scope.deleteRedundancyOption = function (index) {
        $scope.project.reliabilityData.redundancyOption.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getRedundancyOptionCount = function () {
        var count = $scope.project ? $scope.project.reliabilityData.redundancyOption.length : 0;
        switch (count) {
            case 0:
                return 'None';
            default:
                return count + ' defined';
        }
    };

    $scope.newRecoveryItem = function () {
        return {
            failure: '',
            item: '',
            source: ''
        };
    };

    $scope.addRecoveryItem = function () {
        if ($scope.tbxRecoveryItem.failure == '')
            toast('Failure/Case name is required');
        else if ($scope.tbxRecoveryItem.item == '')
            toast('Item name is required');
        else if ($scope.hasRecoveryItem($scope.tbxRecoveryItem))
            toast('Failure/Case or item already exist');
        else {
            $scope.project.reliabilityData.recoveryItem.push($scope.tbxRecoveryItem);
            $scope.tbxRecoveryItem = $scope.newRecoveryItem();
            $scope.changed = true;
        }
    };

    $scope.hasRecoveryItem = function (newRecoveryItem) {
        return arrayHasObject($scope.project.reliabilityData.recoveryItem, newRecoveryItem);
    };

    $scope.deleteRecoveryItem = function (index) {
        $scope.project.reliabilityData.recoveryItem.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getRecoveryItemCount = function () {
        var count = $scope.project ? $scope.project.reliabilityData.recoveryItem.length : 0;
        switch (count) {
            case 0:
                return 'None';
            case 1:
                return count + ' item';
            default:
                return count + ' items';
        }
    };

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/reliability-data', {
            reliabilityData: $scope.project.reliabilityData
        }).then(function (json) {
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id + '/specify-nfr');
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.tbxRecoveryPeriod = $scope.newRecoveryPeriod();
    $scope.tbxRedundancyOption = $scope.newRedundancyOption();
    $scope.tbxRecoveryItem = $scope.newRecoveryItem();

    setTimeout(function () {
        $scope.$emit('ConfigureReliabilityController');
    }, 0);
};

exports.ConfigureSecurityController = function ($scope, $routeParams, $http, $location, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$itemAccessOptions = $template.itemAccessOptions;
    $scope.changed = false;

    $http.get('/api/v1/projects/' + projectID + '/security-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                if (!$scope.project.securityData)
                    $scope.project.securityData = {
                        itemAccess: [],
                        validation: [],
                        encryption: []
                    };

            } else
                $location.path('/projects/' + $scope.project._id);

        }, failCallBack);

    $scope.newItemAccess = function () {
        return {
            item: '',
            actor: '',
            condition: '',
            allowed: ''
        };
    };

    $scope.addItemAccess = function () {
        if ($scope.tbxItemAccess.item == '')
            toast('Item name is required');
        else if ($scope.tbxItemAccess.actor == '')
            toast('Actor name is required');
        else if ($scope.tbxItemAccess.allowed == '')
            toast('Item accessible is required');
        else if ($scope.hasItemAccess($scope.tbxItemAccess))
            toast('Item or actor or item accessible already exist');
        else {
            var newData = $scope.tbxItemAccess;
            $scope.project.securityData.itemAccess.push(newData);
            $scope.tbxItemAccess = $scope.newItemAccess();
            $scope.tbxItemAccess.allowed = newData.allowed;
            $scope.change();
        }
    };

    $scope.hasItemAccess = function (newItemAccess) {
        return arrayHasObject($scope.project.securityData.itemAccess, newItemAccess);
    };

    $scope.deleteItemAccess = function (index) {
        $scope.project.securityData.itemAccess.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getItemAccessCount = function () {
        var count = $scope.project ? $scope.project.securityData.itemAccess.length : 0;
        switch (count) {
            case 0:
                return 'None';
            case 1:
                return count + ' item';
            default:
                return count + ' items';
        }
    };

    $scope.newValidation = function () {
        return {
            item: '',
            algorithm: ''
        };
    };

    $scope.addValidation = function () {
        if ($scope.tbxValidation.item == '')
            toast('Item name is required');
        else if ($scope.tbxValidation.algorithm == '')
            toast('Algorithm is required');
        else if ($scope.hasValidation($scope.tbxValidation))
            toast('Item or validation already exist');
        else {
            $scope.project.securityData.validation.push($scope.tbxValidation);
            $scope.tbxValidation = $scope.newValidation();
            $scope.changed = true;
        }
    };

    $scope.hasValidation = function (newValidation) {
        return arrayHasObject($scope.project.securityData.validation, newValidation);
    };

    $scope.deleteValidation = function (index) {
        $scope.project.securityData.validation.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getValidationCount = function () {
        var count = $scope.project ? $scope.project.securityData.validation.length : 0;
        switch (count) {
            case 0:
                return 'None';
            default:
                return count + ' defined';
        }
    };

    $scope.newEncryption = function () {
        return {
            encryption: '',
            action: ''
        };
    };

    $scope.addEncryption = function () {
        if ($scope.tbxEncryption.encryption == '')
            toast('Encryption name is required');
        else if ($scope.tbxEncryption.action == '')
            toast('Action is required');
        else if ($scope.hasEncryption($scope.tbxEncryption))
            toast('Encryption or action already exist');
        else {
            $scope.project.securityData.encryption.push($scope.tbxEncryption);
            $scope.tbxEncryption = $scope.newEncryption();
            $scope.changed = true;
        }
    };

    $scope.hasEncryption = function (newEncryption) {
        return arrayHasObject($scope.project.securityData.encryption, newEncryption);
    };

    $scope.deleteEncryption = function (index) {
        $scope.project.securityData.encryption.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getEncryptionCount = function () {
        var count = $scope.project ? $scope.project.securityData.encryption.length : 0;
        switch (count) {
            case 0:
                return 'None';
            default:
                return count + ' defined';
        }
    };

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/security-data', {
            securityData: $scope.project.securityData
        }).then(function (json) {
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id + '/specify-nfr');
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.tbxItemAccess = $scope.newItemAccess();
    $scope.tbxValidation = $scope.newValidation();
    $scope.tbxEncryption = $scope.newEncryption();

    setTimeout(function () {
        $scope.$emit('ConfigureSecurityController');
    }, 0);
};

exports.ConfigureUsabilityController = function ($scope, $routeParams, $http, $location) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.changed = false;

    $http.get('/api/v1/projects/' + projectID + '/usability-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;

                if (!$scope.project.usabilityData)
                    $scope.project.usabilityData = {
                        userInterface: [],
                        tutorial: [],
                        inputValidation: [],
                        errorPrevention: [],
                        accessibility: []
                    };

            } else
                $location.path('/projects/' + $scope.project._id);

        }, failCallBack);

    $scope.newUserInterface = function () {
        return {
            attribute: '',
            reason: ''
        };
    };

    $scope.addUserInterface = function () {
        if ($scope.tbxUserInterface.attribute == '')
            toast('Attribute name is required');
        else if ($scope.hasUserInterface($scope.tbxUserInterface))
            toast('Attribute name or reason already exist');
        else {
            $scope.project.usabilityData.userInterface.push($scope.tbxUserInterface);
            $scope.tbxUserInterface = $scope.newUserInterface();
            $scope.changed = true;
        }
    };

    $scope.hasUserInterface = function (newData) {
        return arrayHasObject($scope.project.usabilityData.userInterface, newData);
    };

    $scope.deleteUserInterface = function (index) {
        $scope.project.usabilityData.userInterface.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getUserInterfaceCount = function () {
        var count = $scope.project ? $scope.project.usabilityData.userInterface.length : 0;
        switch (count) {
            case 0:
                return 'None';
            case 1:
                return count + ' attribute';
            default:
                return count + ' attributes';
        }
    };

    $scope.newTutorial = function () {
        return {
            actor: '',
            action: ''
        };
    };

    $scope.addTutorial = function () {
        if ($scope.tbxTutorial.action == '')
            toast('Action name is required');
        else if ($scope.hasTutorial($scope.tbxTutorial))
            toast('Actor or action already exist');
        else {
            $scope.project.usabilityData.tutorial.push($scope.tbxTutorial);
            $scope.tbxTutorial = $scope.newTutorial();
            $scope.changed = true;
        }
    };

    $scope.hasTutorial = function (newData) {
        return arrayHasObject($scope.project.usabilityData.tutorial, newData);
    };

    $scope.deleteTutorial = function (index) {
        $scope.project.usabilityData.tutorial.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getTutorialCount = function () {
        var count = $scope.project ? $scope.project.usabilityData.tutorial.length : 0;
        switch (count) {
            case 0:
                return 'None';
            case 1:
                return count + ' tutorial';
            default:
                return count + ' tutorials';
        }
    };

    $scope.newInputValidation = function () {
        return {
            field: '',
            error: ''
        };
    };

    $scope.addInputValidation = function () {
        if ($scope.tbxInputValidation.field == '')
            toast('Input field is required');
        else if ($scope.hasInputValidation($scope.tbxInputValidation))
            toast('Input field or error already exist');
        else {
            $scope.project.usabilityData.inputValidation.push($scope.tbxInputValidation);
            $scope.tbxInputValidation = $scope.newInputValidation();
            $scope.changed = true;
        }
    };

    $scope.hasInputValidation = function (newData) {
        return arrayHasObject($scope.project.usabilityData.inputValidation, newData);
    };

    $scope.deleteInputValidation = function (index) {
        $scope.project.usabilityData.inputValidation.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getInputValidationCount = function () {
        var count = $scope.project ? $scope.project.usabilityData.inputValidation.length : 0;
        switch (count) {
            case 0:
                return 'None';
            case 1:
                return count + ' input';
            default:
                return count + ' inputs';
        }
    };

    $scope.newErrorPrevention = function () {
        return {
            action: '',
            reason: ''
        };
    };

    $scope.addErrorPrevention = function () {
        if ($scope.tbxErrorPrevention.action == '')
            toast('Action name is required');
        else if ($scope.hasErrorPrevention($scope.tbxErrorPrevention))
            toast('Action name or reason already exist');
        else {
            $scope.project.usabilityData.errorPrevention.push($scope.tbxErrorPrevention);
            $scope.tbxErrorPrevention = $scope.newErrorPrevention();
            $scope.changed = true;
        }
    };

    $scope.hasErrorPrevention = function (newData) {
        return arrayHasObject($scope.project.usabilityData.errorPrevention, newData);
    };

    $scope.deleteErrorPrevention = function (index) {
        $scope.project.usabilityData.errorPrevention.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getErrorPreventionCount = function () {
        var count = $scope.project ? $scope.project.usabilityData.errorPrevention.length : 0;
        switch (count) {
            case 0:
                return 'None';
            case 1:
                return count + ' prevention';
            default:
                return count + ' preventions';
        }
    };

    $scope.newAccessibility = function () {
        return {
            accessibilityOption: '',
            target: ''
        };
    };

    $scope.addAccessibility = function () {
        if ($scope.tbxAccessibility.accessibilityOption == '')
            toast('Accessibility option is required');
        if ($scope.tbxAccessibility.target == '')
            toast('Target name is required');
        else if ($scope.hasAccessibility($scope.tbxAccessibility))
            toast('Accessibility option or target name already exist');
        else {
            $scope.project.usabilityData.accessibility.push($scope.tbxAccessibility);
            $scope.tbxAccessibility = $scope.newAccessibility();
            $scope.changed = true;
        }
    };

    $scope.hasAccessibility = function (newData) {
        return arrayHasObject($scope.project.usabilityData.accessibility, newData);
    };

    $scope.deleteAccessibility = function (index) {
        $scope.project.usabilityData.accessibility.splice(index, 1);
        $scope.changed = true;
    };

    $scope.getAccessibilityCount = function () {
        var count = $scope.project ? $scope.project.usabilityData.accessibility.length : 0;
        switch (count) {
            case 0:
                return 'None';
            default:
                return count + ' defined';
        }
    };

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/usability-data', {
            usabilityData: $scope.project.usabilityData
        }).then(function (json) {
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id + '/specify-nfr');
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.tbxUserInterface = $scope.newUserInterface();
    $scope.tbxTutorial = $scope.newTutorial();
    $scope.tbxInputValidation = $scope.newInputValidation();
    $scope.tbxErrorPrevention = $scope.newErrorPrevention();
    $scope.tbxAccessibility = $scope.newAccessibility();

    setTimeout(function () {
        $scope.$emit('ConfigureSecurityController');
    }, 0);
};

exports.GenerateRequirementController = function ($scope, $routeParams, $http, $location, $formatter, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;
    $scope.$boilerplateTemplates = $template.boilerplateTemplates;
    $scope.$modules = $template.modules;
    $scope.generatedRequirements = [];
    $scope.changed = false;

    $http.get('/api/v1/projects/' + projectID)
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;
                if ($scope.project.boilerplateData == null)
                    $scope.project.boilerplateData = {};

                if ($scope.project.generatedRequirements == null)
                    $scope.project.generatedRequirements = {};

                if ($scope.project.accessControlData == null)
                    $scope.project.accessControlData = {};

                if ($scope.project.actionControlData == null)
                    $scope.project.actionControlData = {};

                if ($scope.project.performanceConstraintData == null)
                    $scope.project.performanceConstraintData = {};

                if ($scope.project.functionalConstraintData == null)
                    $scope.project.functionalConstraintData = {
                        interfaces: [],
                        actionDependencies: [],
                        actionRules: []
                    };

                if ($scope.project.compatibilityData == null)
                    $scope.project.compatibilityData = {
                        operatingSystem: [],
                        executionEnvironment: [],
                        outputCompatibility: []
                    };

                if ($scope.project.reliabilityData == null)
                    $scope.project.reliabilityData = {
                        availability: {
                            enabled: false,
                            value: 99
                        },
                        maintenance: {
                            enabled: false,
                            value: '1 hour',
                            period: 'week'
                        },
                        recoveryPeriod: [],
                        redundancyOption: [],
                        recoveryItem: []
                    }

                if ($scope.project.usabilityData == null)
                    $scope.project.usabilityData = {
                        userInterface: [],
                        tutorial: [],
                        inputValidation: [],
                        errorPrevention: [],
                        accessibility: []
                    };

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
            'Performance Constraint': [],
            'Functional Constraint': [],
            'Compatibility': [],
            'Reliability': [],
            'Security': [],
            'Usability': []
        };

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

        moduleName = 'Performance Constraint';
        for (var action in $scope.project.performanceConstraintData) {
            for (var index in $scope.project.performanceConstraintData[action]) {
                var item = $scope.project.performanceConstraintData[action][index];
                var boilerplate = $scope.project.boilerplateData.performanceConstraint[item.option];
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

        moduleName = 'Functional Constraint';
        for (var index in $scope.project.functionalConstraintData.interfaces) {
            var item = $scope.project.functionalConstraintData.interfaces[index];
            var boilerplateNo = (item.dependency == '' ? 0 : 1) + (item.condition == '' ? 0 : 2);
            var boilerplate = $scope.project.boilerplateData.functionalConstraint.interface[boilerplateNo];
            var values = {
                '<system>': $scope.project.projectName,
                '<interface>': item.interfaceName,
                '<dependency>': item.dependency,
                '<condition>': item.condition
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.functionalConstraintData.actionDependencies) {
            var item = $scope.project.functionalConstraintData.actionDependencies[index];
            var boilerplate = $scope.project.boilerplateData.functionalConstraint.actionDependencies[item.relation];
            var values = {
                '<system>': $scope.project.projectName,
                '<action>': item.action,
                '<dependentAction>': item.dependentAction,
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.functionalConstraintData.actionRules) {
            var item = $scope.project.functionalConstraintData.actionRules[index];
            var boilerplate = $scope.project.boilerplateData.functionalConstraint.actionRules[item.relation];
            var values = {
                '<system>': $scope.project.projectName,
                '<action>': item.action,
                '<rule>': item.rule
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        moduleName = 'Compatibility';
        for (var index in $scope.project.compatibilityData.operatingSystem) {
            var item = $scope.project.compatibilityData.operatingSystem[index];
            var boilerplateNo = (item.version == '' ? 0 : 1) + (item.issue == '' ? 0 : 2);
            var boilerplate = $scope.project.boilerplateData.compatibility.operatingSystem[boilerplateNo];
            var values = {
                '<system>': $scope.project.projectName,
                '<operatingSystem>': item.operatingSystem,
                '<version>': item.version,
                '<issue>': item.issue
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.compatibilityData.executionEnvironment) {
            var item = $scope.project.compatibilityData.executionEnvironment[index];
            var boilerplateNo = (item.version == '' ? 0 : 1) + (item.issue == '' ? 0 : 2);
            var boilerplate = $scope.project.boilerplateData.compatibility.executionEnvironment[boilerplateNo];
            var values = {
                '<system>': $scope.project.projectName,
                '<software>': item.software,
                '<version>': item.version,
                '<issue>': item.issue
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.compatibilityData.outputCompatibility) {
            var item = $scope.project.compatibilityData.outputCompatibility[index];
            var boilerplate = $scope.project.boilerplateData.compatibility.outputCompatibility[item.compatibility];
            var values = {
                '<system>': $scope.project.projectName,
                '<output>': item.output,
                '<oldVersion>': item.oldVersion,
                '<newVersion>': item.newVersion
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        moduleName = 'Reliability';
        if ($scope.project.reliabilityData.availability.enabled) {
            var boilerplate = $scope.project.boilerplateData.reliability.availability;
            var values = {
                '<system>': $scope.project.projectName,
                '<value>': $scope.project.reliabilityData.availability.value
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        if ($scope.project.reliabilityData.maintenance.enabled) {
            var boilerplate = $scope.project.boilerplateData.reliability.maintenance;
            var values = {
                '<system>': $scope.project.projectName,
                '<value>': $scope.project.reliabilityData.maintenance.value,
                '<period>': $scope.project.reliabilityData.maintenance.period
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.reliabilityData.recoveryPeriod) {
            var item = $scope.project.reliabilityData.recoveryPeriod[index];
            var boilerplate = $scope.project.boilerplateData.reliability.recoveryPeriod[item.action != ''];
            var values = {
                '<system>': $scope.project.projectName,
                '<time>': item.time,
                '<failure>': item.failure,
                '<action>': item.action
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.reliabilityData.redundancyOption) {
            var item = $scope.project.reliabilityData.redundancyOption[index];
            var boilerplate = $scope.project.boilerplateData.reliability.redundancyOption[item.failure != ''];
            var values = {
                '<system>': $scope.project.projectName,
                '<name>': item.name,
                '<failure>': item.failure
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.reliabilityData.recoveryItem) {
            var item = $scope.project.reliabilityData.recoveryItem[index];
            var boilerplate = $scope.project.boilerplateData.reliability.recoveryItem[item.source != ''];
            var values = {
                '<system>': $scope.project.projectName,
                '<item>': item.item,
                '<failure>': item.failure,
                '<source>': item.source
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        moduleName = 'Security';
        for (var index in $scope.project.securityData.itemAccess) {
            var item = $scope.project.securityData.itemAccess[index];
            var boilerplateNo = (item.condition == '' ? 0 : item.actor == '' ? 1 : 2);
            var boilerplate = $scope.project.boilerplateData.security.itemAccess[item.allowed][boilerplateNo];
            var values = {
                '<item>': item.item,
                '<actor>': item.actor,
                '<condition>': item.condition
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.securityData.validation) {
            var item = $scope.project.securityData.validation[index];
            var boilerplate = $scope.project.boilerplateData.security.validation;
            var values = {
                '<system>': $scope.project.projectName,
                '<item>': item.item,
                '<algorithm>': item.algorithm
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.securityData.encryption) {
            var item = $scope.project.securityData.encryption[index];
            var boilerplate = $scope.project.boilerplateData.security.encryption;
            var values = {
                '<system>': $scope.project.projectName,
                '<encryption>': item.encryption,
                '<action>': item.action
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        moduleName = 'Usability';
        for (var index in $scope.project.usabilityData.userInterface) {
            var item = $scope.project.usabilityData.userInterface[index];
            var boilerplate = $scope.project.boilerplateData.usability.userInterface[item.reason != ''];
            var values = {
                '<system>': $scope.project.projectName,
                '<attribute>': item.attribute,
                '<reason>': item.reason
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.usabilityData.tutorial) {
            var item = $scope.project.usabilityData.tutorial[index];
            var boilerplate = $scope.project.boilerplateData.usability.tutorial[item.actor != ''];
            var values = {
                '<system>': $scope.project.projectName,
                '<actor>': item.actor,
                '<action>': item.action
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.usabilityData.inputValidation) {
            var item = $scope.project.usabilityData.inputValidation[index];
            var boilerplate = $scope.project.boilerplateData.usability.inputValidation[item.error != ''];
            var values = {
                '<system>': $scope.project.projectName,
                '<field>': item.field,
                '<error>': item.error
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.usabilityData.errorPrevention) {
            var item = $scope.project.usabilityData.errorPrevention[index];
            var boilerplate = $scope.project.boilerplateData.usability.errorPrevention[item.reason != ''];
            var values = {
                '<system>': $scope.project.projectName,
                '<action>': item.action,
                '<reason>': item.reason
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
        }

        for (var index in $scope.project.usabilityData.accessibility) {
            var item = $scope.project.usabilityData.accessibility[index];
            var boilerplate = $scope.project.boilerplateData.usability.accessibility;
            var values = {
                '<system>': $scope.project.projectName,
                '<accessibilityOption>': item.accessibilityOption,
                '<target>': item.target
            };

            if (!$scope.hasRequirement(moduleName, values))
                $scope.generatedRequirements[moduleName].push($scope.newRequirement(moduleName, boilerplate, values));
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
            if (isSameObject(requirements[index].values, values))
                return true;
        }
        return false;
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
                    $scope.change();
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
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id);
    };

    setTimeout(function () {
        $scope.$emit('GenerateRequirementController');
    }, 0);
};

exports.ConfigureBoilerplateController = function ($scope, $routeParams, $http, $location, $formatter, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;
    $scope.$boilerplateTemplates = $template.boilerplateTemplates;
    $scope.$values = $template.boilerplateValues;
    $scope.toast = toast;
    $scope.changed = false;

    $http.get('/api/v1/projects/' + projectID + '/boilerplate-data')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;
                if ($scope.project.boilerplateData == null)
                    $scope.project.boilerplateData = {};

                for (var key in $scope.$boilerplateTemplates)
                    if ($scope.project.boilerplateData[key] == null)
                        $scope.project.boilerplateData[key] = JSON.parse(JSON.stringify($scope.$boilerplateTemplates[key]));
            }
            else
                $location.path('/');
        }, failCallBack);

    $scope.requirementToString = function (template, values) {
        if (template == null || template == '')
            return '';
        return $formatter.requirementToString({
            boilerplate: template,
            values: values
        });
    };

    $scope.saveProject = function () {
        $http.patch('/api/v1/projects/' + projectID + '/boilerplate-data', {
            boilerplateData: $scope.project.boilerplateData
        }).then(function (json) {
            if (json.data.result) {
                $scope.changed = false;
                toast("Saved successfully");
            }
            else
                console.log(json.data);
        }, failCallBack);
    };

    $scope.back = function () {
        if ($scope.changed && confirmBack())
            $scope.saveProject();
        $location.path('/projects/' + $scope.project._id);
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.restore = function (key) {
        $scope.project.boilerplateData[key] = JSON.parse(JSON.stringify($scope.$boilerplateTemplates[key]));
        toast('Default boilerplate restored');
        $scope.change();
    };

    setTimeout(function () {
        $scope.$emit('ConfigureBoilerplateController');
    }, 0);
};

exports.PreviewExportController = function ($scope, $routeParams, $http, $location, $formatter, $template) {
    var projectID = encodeURIComponent($routeParams.id);

    $scope.$formatter = $formatter;
    $scope.$modules = $template.modules;
    $scope.toast = toast;
    $scope.numberFunctionalRequirement = 0;
    $scope.numberNonFunctionalRequirement = 0;

    $http.get('/api/v1/projects/' + projectID + '/view')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;
                if ($scope.project.generatedRequirements == null)
                    $scope.project.generatedRequirements = {};

                for (var key in $scope.project.generatedRequirements) {
                    if ($scope.$modules.Functional.indexOf(key) >= 0)
                        $scope.numberFunctionalRequirement += $scope.project.generatedRequirements[key].length;
                    else if ($scope.$modules.NonFunctional.indexOf(key) >= 0)
                        $scope.numberNonFunctionalRequirement += $scope.project.generatedRequirements[key].length;
                }
            }
            else
                $location.path('/');
        }, failCallBack);

    setTimeout(function () {
        $scope.$emit('PreviewExportController');
    }, 0);
};