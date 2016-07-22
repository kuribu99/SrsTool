(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var updateUI = function () {
    // Make all <select> to use materialize
    $('select').material_select();

    // Set collapsible to accordions
    $('.collapsible').collapsible({
        accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });

    // Set dropdown button to materialize dropdown button
    $('.dropdown-button').dropdown();

    // Set instant drop dropdown button
    $('.dropdown-button.instant-drop').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: true, // Does not change width of dropdown to that of the activator
        hover: true,
        gutter: 0, // Spacing from edge
        belowOrigin: false, // Displays dropdown below the button
        alignment: 'left' // Displays dropdown with edge aligned to the left of button
    });

    // Set all tabs
    $('ul.tabs').tabs();

    // Set all lightbox
    $('.materialboxed').materialbox();

    // Update all text fields
    Materialize.updateTextFields();
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

exports.NavBarController = function ($scope, $http, $location, $user, $timeout) {
    $scope.$user = $user;
    $user.loadUser().then(function () {
        $timeout(updateUI);
    });

    setTimeout(function () {
        $scope.$emit('NavBarController');
    }, 0);
};

exports.HomeController = function ($scope, $http, $location, $timeout) {
    $scope.projectName = "";
    $scope.domainName = "default";
    $scope.type = "";

    $http.get('/api/v1/domains/names/')
        .then(function (json) {
            $scope.domains = json.data.domains;
            $timeout(updateUI);
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
            $scope.privateProjects = json.data.projects
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

exports.ProjectViewController = function ($scope, $routeParams, $http, $location, $formatter, $template, $timeout) {
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

                $timeout(updateUI);
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
        if ($scope.changed && confirmBack()) {
            $scope.saveProject();
            $location.path('/home');
        }
        else
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

exports.SpecifyNonFunctionalRequirementController = function ($scope, $routeParams, $http, $location, $timeout) {
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

                $timeout(function () {
                    var moduleCards = $('.nfr-module-card').toArray();
                    var maximumHeight = _.max(
                        _.map(moduleCards,
                            function (card) {
                                return $(card).height();
                            }));

                    _.each(moduleCards, function (card) {
                        $(card).height(maximumHeight);
                    });
                });
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

exports.EditProjectController = function ($scope, $routeParams, $http, $location, $timeout) {
    var projectID = encodeURIComponent($routeParams.id);

    $http.get('/api/v1/projects/' + projectID + '/project-data/')
        .then(function (json) {
            if (json.data.result) {
                $scope.project = json.data.project;
                $timeout(updateUI);
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

exports.EditDomainController = function ($scope, $routeParams, $http, $location, $timeout) {
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

                $timeout(updateUI);
            }
            else
                $location.path('/');

        }, failCallBack);

    $scope.handleKeyPress = function (event, fn) {
        if (event.keyCode == 13)
            fn();
    };

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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
            $location.path('/projects/' + $scope.project._id);
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    $scope.addModule = function () {
        if ($scope.tbxModule.length == 0)
            toast('Module name cannot be empty');
        else if ($scope.project.domainData.modules.indexOf($scope.tbxModule) >= 0)
            toast('Module name already exist');
        else {
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
        if ($scope.tbxActor.length == 0)
            toast('Actor name cannot be empty');
        else if ($scope.project.domainData.actors.indexOf($scope.tbxActor) >= 0)
            toast('Actor name already exist');
        else {
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
        if ($scope.tbxAction.length == 0)
            toast('Action name cannot be empty');
        else if ($scope.project.domainData.actions.indexOf($scope.tbxAction) >= 0)
            toast('Action name already exist');
        else {
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

exports.ActionControlController = function ($scope, $routeParams, $http, $location, $timeout) {
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

                $timeout(updateUI);

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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
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

exports.AccessControlController = function ($scope, $routeParams, $http, $location, $formatter, $timeout) {
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

                $timeout(updateUI);

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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
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

exports.PerformanceConstraintController = function ($scope, $routeParams, $http, $location, $template, $timeout) {
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

                $timeout(updateUI);

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
        var count = $scope.project ? $scope.project.performanceConstraintData[action].length : 0;
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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
            $location.path('/projects/' + $scope.project._id + '/specify-nfr');
    };

    $scope.change = function () {
        $scope.changed = true;
    };

    setTimeout(function () {
        $scope.$emit('PerformanceConstraintController');
    }, 0);
};

exports.FunctionalConstraintController = function ($scope, $routeParams, $http, $location, $template, $timeout) {
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

                $timeout(updateUI);

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
        var count = $scope.project ? $scope.project.functionalConstraintData.interfaces.length : 0;
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
        var count = $scope.project ? $scope.project.functionalConstraintData.actionDependencies.length : 0;
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
        var count = $scope.project ? $scope.project.functionalConstraintData.actionRules.length : 0;
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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
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

exports.ConfigureCompatibilityController = function ($scope, $routeParams, $http, $location, $template, $timeout) {
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

                $timeout(updateUI);

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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
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

exports.ConfigureReliabilityController = function ($scope, $routeParams, $http, $location, $timeout) {
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

                $timeout(updateUI);

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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
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

exports.ConfigureSecurityController = function ($scope, $routeParams, $http, $location, $template, $timeout) {
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

                $timeout(updateUI);

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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
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

exports.ConfigureUsabilityController = function ($scope, $routeParams, $http, $location, $timeout) {
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

                $timeout(updateUI);

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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
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

exports.GenerateRequirementController = function ($scope, $routeParams, $http, $location, $formatter, $template, $timeout) {
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
                $timeout(updateUI);

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

    $scope.checkAll = function (moduleName) {
        _.each($scope.generatedRequirements[moduleName], function (requirement) {
            requirement.checked = true;
        });
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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
            $location.path('/projects/' + $scope.project._id);
    };

    setTimeout(function () {
        $scope.$emit('GenerateRequirementController');
    }, 0);
};

exports.ConfigureBoilerplateController = function ($scope, $routeParams, $http, $location, $formatter, $template, $timeout) {
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

                $timeout(updateUI);

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
        if ($scope.changed) {
            if (confirmBack()) {
                $scope.saveProject();
                $location.path('/projects/' + $scope.project._id);
            }
        }
        else
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

exports.PreviewExportController = function ($scope, $routeParams, $http, $location, $formatter, $template, $timeout) {
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

                $scope.actionControlRequirements = {};
                var data = $scope.project.generatedRequirements['Action Control'];
                for (var index in data) {
                    var actorName = data[index].values['<actor>'];
                    if (!$scope.actionControlRequirements.hasOwnProperty(actorName))
                        $scope.actionControlRequirements[actorName] = [];
                    $scope.actionControlRequirements[actorName].push(data[index]);
                }

                $scope.accessControlRequirements = {};
                var data = $scope.project.generatedRequirements['Access Control'];
                for (var index in data) {
                    var moduleName = data[index].values['<module>'];
                    if (!$scope.accessControlRequirements.hasOwnProperty(moduleName))
                        $scope.accessControlRequirements[moduleName] = [];
                    $scope.accessControlRequirements[moduleName].push(data[index]);
                }

                $timeout(function () {
                    updateUI();

                    $('#exportDocx').click(function () {
                        var projectName = $('#projectName').text();
                        $('#content').wordExport(projectName);
                    });
                    $('#exportPDF').click(function () {
                        var projectName = $('#projectName').text();
                        var doc = new jsPDF('p', 'mm', [297, 210]);

                        // We'll make our own renderer to skip this editor
                        var specialElementHandlers = {
                            '#editor': function (element, renderer) {
                                return true;
                            }
                        };

                        // All units are in the set measurement for the document
                        // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
                        doc.fromHTML($('#content').get(0), 15, 15, {
                            'height': 297,
                            'width': 210,
                            'elementHandlers': specialElementHandlers
                        });

                        doc.save(projectName + '.pdf');
                    });
                    $('#exportHTML').click(function () {
                        var projectName = $('#projectName').text();
                        var print = window.open();

                        print.document.write('<html><head><title>' + projectName + '</title>');
                        print.document.write('<title>' + projectName + '</title>');
                        print.document.write('</head><body >');
                        print.document.write($('div#content').html());
                        print.document.write('</body></html>');

                        print.document.close(); // necessary for IE >= 10
                        print.focus(); // necessary for IE >= 10
                    });
                });
            }
            else
                $location.path('/');
        }, failCallBack);

    setTimeout(function () {
        $scope.$emit('PreviewExportController');
    }, 0);
};
},{"underscore":5}],2:[function(require,module,exports){
exports.landingPage = function () {
    return {
        templateUrl: './templates/landing_page.html'
    };
};

exports.home = function () {
    return {
        controller: 'HomeController',
        templateUrl: './templates/home.html'
    };
};

exports.navBar = function () {
    return {
        controller: 'NavBarController',
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

exports.specifyNfr = function () {
    return {
        controller: 'SpecifyNonFunctionalRequirementController',
        templateUrl: './templates/specify_nfr.html'
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

exports.actionControl = function () {
    return {
        controller: 'ActionControlController',
        templateUrl: './templates/action_control.html'
    };
};

exports.accessControl = function () {
    return {
        controller: 'AccessControlController',
        templateUrl: './templates/access_control.html'
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

exports.configureReliability = function () {
    return {
        controller: 'ConfigureReliabilityController',
        templateUrl: './templates/configure_reliability.html'
    };
};

exports.configureSecurity = function () {
    return {
        controller: 'ConfigureSecurityController',
        templateUrl: './templates/configure_security.html'
    };
};

exports.configureUsability = function () {
    return {
        controller: 'ConfigureUsabilityController',
        templateUrl: './templates/configure_usability.html'
    };
};

exports.generateRequirement = function () {
    return {
        controller: 'GenerateRequirementController',
        templateUrl: './templates/generate_requirement.html'
    };
};

exports.configureBoilerplate = function () {
    return {
        controller: 'ConfigureBoilerplateController',
        templateUrl: './templates/configure_boilerplate.html'
    };
};

exports.previewExport = function () {
    return {
        controller: 'PreviewExportController',
        templateUrl: './templates/preview_export.html'
    };
};

},{}],3:[function(require,module,exports){
var controllers = require('./controllers');
var directives = require('./directives');
var services = require('./services');
var _ = require('underscore');

var components = angular.module('srs-tool.components', ['ng']);

_.each(services, function (factory, name) {
    components.factory(name, factory);
});

_.each(controllers, function (controller, name) {
    components.controller(name, controller);
});

_.each(directives, function (directive, name) {
    components.directive(name, directive);
});

var app = angular.module('srs-tool', ['srs-tool.components', 'ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            title: 'Home',
            template: '<landing-page></landing-page>'
        })

        .when('/home', {
            title: 'Home',
            template: '<home></home>'
        })

        .when('/projects/:id', {
            title: 'View Project',
            template: '<project-view></project-view>'
        })

        .when('/projects/:id/specify-nfr', {
            title: 'Specify Non-Functional Requirement',
            template: '<specify-nfr></specify-nfr>'
        })

        .when('/projects/:id/edit', {
            title: 'Edit Project',
            template: '<edit-project></edit-project>'
        })

        .when('/projects/:id/domain', {
            title: 'Edit Domain',
            template: '<edit-domain></edit-domain>'
        })

        .when('/projects/:id/action-control', {
            title: 'Configure Action Control',
            template: '<action-control></action-control>'
        })

        .when('/projects/:id/access-control', {
            title: 'Configure Access Control',
            template: '<access-control></access-control>'
        })

        .when('/projects/:id/performance-constraint', {
            title: 'Configure Performance Constraint',
            template: '<performance-constraint></performance-constraint>'
        })

        .when('/projects/:id/functional-constraint', {
            title: 'Configure Functional Constraint',
            template: '<functional-constraint></functional-constraint>'
        })

        .when('/projects/:id/configure-compatibility', {
            title: 'Configure Compatibility',
            template: '<configure-compatibility></configure-compatibility>'
        })

        .when('/projects/:id/configure-reliability', {
            title: 'Configure Reliability',
            template: '<configure-reliability></configure-reliability>'
        })

        .when('/projects/:id/configure-security', {
            title: 'Configure Security',
            template: '<configure-security></configure-security>'
        })

        .when('/projects/:id/configure-usability', {
            title: 'Configure Usability',
            template: '<configure-usability></configure-usability>'
        })

        .when('/projects/:id/generate', {
            title: 'Generate Requirements',
            template: '<generate-requirement></generate-requirement>'
        })

        .when('/projects/:id/boilerplate', {
            title: 'Configure Boilerplate',
            template: '<configure-boilerplate></configure-boilerplate>'
        })

        .when('/projects/:id/export', {
            title: 'Preview Export',
            template: '<preview-export></preview-export>'
        });
});

app.run(['$rootScope', '$document', function ($rootScope, $document) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        try {
            $rootScope.title = current.$$route.title;
            $rootScope.loading = false;
        }
        catch (e) {
            $rootScope.title = '';
        }
    });

    $rootScope.$on('$routeChangeStart', function () {
        $rootScope.loading = true;
    });

    $document.bind('keypress', function(e) {
        $rootScope.$broadcast('keypress', e);
        $rootScope.$broadcast('keypress:' + e.which, e);
    });

    $rootScope.$on('')
}]);
},{"./controllers":1,"./directives":2,"./services":6,"underscore":5}],4:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
module.exports = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Large',
  415: 'Unsupported Media Type',
  416: 'Requested Range not Satisfiable',
  417: 'Expectation Failed',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Time-out',
  505: 'HTTP Version not Supported',
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  REQUEST_ENTITY_TOO_LARGE: 413,
  REQUEST_URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505
};

},{}],5:[function(require,module,exports){
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array, using the modern version of the 
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from an array.
  // If **n** is not specified, returns a single random element from the array.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (arguments.length < 2 || guard) {
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}],6:[function(require,module,exports){
var status = require('http-status');

exports.$formatter = function () {
    this.asSentence = function (str) {
        str = str[0].toUpperCase() + str.substring(1);
        if (!str.endsWith('.'))
            str += '.';
        return str;
    };

    this.requirementToString = function (requirement) {
        var str = requirement.boilerplate;
        for (var placeholder in requirement.values) {
            str = str.replace(placeholder, requirement.values[placeholder]);
        }
        return this.asSentence(str);
    };

    this.asHtmlID = function (str) {
        return '#' + str.replace(' ', '_');
    };

    return this;
};

exports.$template = function () {
    this.modules = {
        Functional: [
            'Action Control'
        ],
        NonFunctional: [
            'Access Control',
            'Performance Constraint',
            'Functional Constraint',
            'Compatibility',
            'Reliability',
            'Security',
            'Usability'
        ]
    };

    this.boilerplateTemplates = {
        accessControl: {
            true: "<actor> shall be able to access to <module> module",
            false: "<actor> shall not be able to access to <module> module"
        },
        actionControl: {
            true: "<actor> shall be able to <action>",
            false: "<actor> shall not be able to <action>"
        },
        performanceConstraint: {
            'exactly': 'The <constraint> of <action> shall be exactly <value>',
            'less than': 'The <constraint> of <action> shall be less than <value>',
            'more than': 'The <constraint> of <action> shall be more than <value>',
            'at least': 'The <constraint> of <action> shall be at least <value>',
            'at most': 'The <constraint> of <action> shall be at most <value>',
            'minimum': 'The minimum <constraint> of <action> shall be <value>',
            'maximum': 'The maximum <constraint> of <action> shall be <value>',
            'within': 'The <constraint> of <action> shall be within <value>'
        },
        functionalConstraint: {
            interface: {
                0: "The <system> shall provide <interface>",
                1: "The <system> shall provide <interface> required by <dependency>",
                2: "The <system> shall provide <interface> if <condition>",
                3: "The <system> shall provide <interface> required by <dependency> if <condition>"
            },
            actionDependencies: {
                true: "The <system> shall <dependentAction> when <action>",
                false: "The <system> shall not <dependentAction> when <action>"
            },
            actionRules: {
                true: "The <system> shall <action> based on <rule>",
                false: "The <system> shall not <action> based on  <rule>"
            }
        },
        compatibility: {
            operatingSystem: {
                0: "The <system> shall be able to execute in <operatingSystem> with no compatibility issue",
                1: "The <system> shall be able to execute in <operatingSystem> <version> and above with no compatibility issue",
                2: "The <system> shall be able to execute in <operatingSystem> with <issue>",
                3: "The <system> shall be able to execute in <operatingSystem> <version> and above with <issue>"
            },
            executionEnvironment: {
                0: "The <system> shall be able to execute with <software> with no compatibility issue",
                1: "The <system> shall be able to execute with <software> <version> and above with no compatibility issue",
                2: "The <system> shall be able to execute with <software> with <issue>",
                3: "The <system> shall be able to execute with <software> <version> and above with <issue>"
            },
            outputCompatibility: {
                true: "The <output> of the <system> <newVersion> shall be compatible with <oldVersion>",
                false: "The <output> of the <system> <newVersion> shall not be compatible with <oldVersion>"
            }
        },
        reliability: {
            availability: "The <system> shall be available <value>% of the time",
            maintenance: "The <system> shall be down for maintenance for <value> every <period>",
            recoveryPeriod: {
                true: "The <system> shall be able to <action> within <time> in case of <failure>",
                false: "The <system> shall be able to restart and continue operation as usual within <time> in case of <failure>"
            },
            redundancyOption: {
                true: "The <system> shall be provide <name> to prevent <failure>",
                false: "The <system> shall be provide <name>"
            },
            recoveryItem: {
                true: "The <system> shall be able to recover <item> from <source> in case of <failure>",
                false: "The <system> shall be able to recover <item> in case of <failure>"
            }
        },
        security: {
            itemAccess: {
                true: {
                    0: "The <item> shall only be accessible by <actor>",
                    1: "The <item> shall only be accessible if <condition>",
                    2: "The <item> shall only be accessible by <actor> if <condition>"
                },
                false: {
                    0: "The <item> shall not be accessible by <actor>",
                    1: "The <item> shall not be accessible if <condition>",
                    2: "The <item> shall not be accessible by <actor> if <condition>"
                }
            },
            validation: "The <system> shall validate <item> by <algorithm>",
            encryption: "The <system> shall use <encryption> to <action>"
        },
        usability: {
            userInterface: {
                true: "The user interface of the <system> shall <attribute> so that <reason>",
                false: "The user interface of the <system> shall <attribute>"
            },
            tutorial: {
                true: "The <system> shall provide tutorial to teach <actor> how to <action>",
                false: "The <system> shall provide tutorial on how to <action>"
            },
            inputValidation: {
                true: "The <system> shall validate user input for <field> to prevent <error>",
                false: "The <system> shall validate user input for <field>"
            },
            errorPrevention: {
                true: "The <system> shall prevent user from <action> to <reason>",
                false: "The <system> shall prevent user from <action>"
            },
            accessibility: "The <system> shall <accessibilityOption> for <target>"
        }
    };

    this.boilerplateValues = {
        accessControl: {
            '<actor>': 'lecturer',
            '<module>': 'user authentication'
        },
        actionControl: {
            '<actor>': 'lecturer',
            '<action>': 'register account'
        },
        performanceConstraint: {
            '<action>': 'register account',
            '<constraint>': 'response time',
            '<value>': '1 seconds'
        },
        functionalConstraint: {
            interface: {
                '<system>': 'system',
                '<interface>': 'REST API',
                '<dependency>': 'login module',
                '<condition>': 'the user is logged in'
            },
            actionDependencies: {
                '<system>': 'system',
                '<action>': 'user finish registering account',
                '<dependentAction>': 'login to the system'
            },
            actionRules: {
                '<system>': 'system',
                '<action>': 'calculate GST charge',
                '<rule>': 'GST rate of Malaysia'
            }
        },
        compatibility: {
            operatingSystem: {
                '<system>': 'system',
                '<operatingSystem>': 'Microsoft Windows',
                '<version>': '10',
                '<issue>': 'no GPU acceleration'
            },
            executionEnvironment: {
                '<system>': 'system',
                '<software>': 'Java',
                '<version>': '1.8',
                '<issue>': 'higher heap size'
            },
            outputCompatibility: {
                '<output>': 'save file',
                '<system>': 'system',
                '<newVersion>': 'v1.4',
                '<oldVersion>': 'v1.3'
            }
        },
        reliability: {
            availability: {
                '<system>': 'system',
                '<value>': '99.9999'
            },
            maintenance: {
                '<system>': 'system',
                '<value>': '1 hour',
                '<period>': 'week'
            },
            recoveryPeriod: {
                '<system>': 'system',
                '<time>': '1 hour',
                '<failure>': 'power failure',
                '<action>': 'restore database'
            },
            redundancyOption: {
                '<system>': 'system',
                '<name>': 'database redundancy',
                '<failure>': 'database corruption'
            },
            recoveryItem: {
                '<system>': 'system',
                '<item>': 'database',
                '<source>': 'backup disc',
                '<failure>': 'database corruption'
            }
        },
        security: {
            itemAccess: {
                true: {
                    '<item>': 'project',
                    '<actor>': 'owner',
                    '<condition>': 'they are logged in'
                },
                false: {
                    '<item>': 'project',
                    '<actor>': 'other user',
                    '<condition>': 'not are logged in'
                }
            },
            validation: {
                '<system>': 'system',
                '<item>': 'patch file',
                '<algorithm>': 'MD5 checksum'
            },
            encryption: {
                '<system>': 'system',
                '<encryption>': 'HTTPS protocol',
                '<action>': 'transfer data over Internet'
            }
        },
        usability: {
            userInterface: {
                '<system>': 'system',
                '<attribute>': 'be consistent',
                '<reason>': 'user will not confuse'
            },
            tutorial: {
                '<system>': 'system',
                '<actor>': 'user',
                '<action>': 'create new project'
            },
            inputValidation: {
                '<system>': 'system',
                '<field>': 'email address',
                '<error>': 'invalid email addresses'
            },
            errorPrevention: {
                '<system>': 'system',
                '<action>': 'using invalid email address',
                '<reason>': 'ensure they receive important emails'
            },
            accessibility: {
                '<system>': 'system',
                '<accessibilityOption>': 'use contrasting color',
                '<target>': 'colour blind user'
            }
        }
    };

    this.performanceConstraintOptions = [
        'exactly',
        'less than',
        'more than',
        'at least',
        'at most',
        'minimum',
        'maximum',
        'within'
    ];
    this.actionDependenciesOptions = {
        true: 'shall perform dependent action',
        false: 'shall not perform dependent action'
    };
    this.actionRulesOptions = {
        true: 'based on',
        false: 'not based on'
    };
    this.compatibilityOptions = {
        true: 'Yes',
        false: 'No'
    };
    this.itemAccessOptions = {
        true: "Accessible",
        false: "Inaccessible"
    };

    return this;
};

exports.$user = function ($http) {
    var s = {};

    s.loadUser = function () {
        return $http.get('/api/v1/me').then(function (data) {
            s.user = data.data.user;
        }, function (data, status) {
            s.user = null;
        });
    };

    s.loadUser();

    setInterval(s.loadUser, 60 * 60 * 1000);

    return s;
};
},{"http-status":4}]},{},[3])