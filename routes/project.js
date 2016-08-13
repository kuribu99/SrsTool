var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('underscore');

var subroutesSelectionCriteria = {
    'view': {
        projectName: true,
        generatedRequirements: true
    },
    'domain-data': {
        domainData: true
    },
    'project-data': {
        projectName: true
    },
    'action-control-data': {
        actionControlData: true
    },
    'access-control-data': {
        accessControlData: true
    },
    'performance-constraint-data': {
        performanceConstraintData: true
    },
    'functional-constraint-data': {
        functionalConstraintData: true
    },
    'compatibility-data': {
        compatibilityData: true
    },
    'reliability-data': {
        reliabilityData: true
    },
    'security-data': {
        securityData: true
    },
    'usability-data': {
        usabilityData: true
    },
    'boilerplate-data': {
        boilerplateData: true
    }
};

var subroutesPatchData = {
    'domain-data': {
        domainData: true
    },
    'project-data': {
        projectName: true
    },
    'action-control-data': {
        actionControlData: true
    },
    'access-control-data': {
        accessControlData: true
    },
    'performance-constraint-data': {
        performanceConstraintData: true
    },
    'functional-constraint-data': {
        functionalConstraintData: true
    },
    'compatibility-data': {
        compatibilityData: true
    },
    'reliability-data': {
        reliabilityData: true
    },
    'security-data': {
        securityData: true
    },
    'usability-data': {
        usabilityData: true
    },
    'boilerplate-data': {
        boilerplateData: true
    },
    'generated-requirements': {
        generatedRequirements: true
    }
};

var findProject = function (Project, findCriteria, selectCriteria) {
    var query = Project.findOne(findCriteria);

    if (selectCriteria != null)
        query = query.select(selectCriteria);

    return query;
};

var findProjects = function (Project, findCriteria, selectCriteria) {
    var query = Project.find(findCriteria);

    if (selectCriteria != null)
        query = query.select(selectCriteria);

    return query;
};

var saveProject = function (project, req, res) {
    project
        .save()
        .then(function () {
            return res.json({
                result: true
            });
        }, function (error) {
            return res.json({
                result: error
            });
        });
};

var errorCallback = function (req, res) {
    return function (error) {
        if (error) {
            return res.json({
                result: false,
                error: error.toString()
            });
        }
    }
};

var handleGetRequest = function (wagner, findCriteria, selectCriteria, interceptFunction) {
    return wagner.invoke(function (Project) {
        return function (req, res) {
            findProject(Project, findCriteria, selectCriteria)
                .then(function (project) {
                    if (project == null || (project.userID != '' && project.userID != req.session.passport.user)) {
                        return errorCallback(req, res)(true);
                    }

                    var result = {
                        result: project != null,
                        project: project
                    };

                    if (interceptFunction != null) {
                        interceptFunction(result);
                    }

                    return res.json(result);
                }, errorCallback(req, res));
        };
    });
};

var handlePatchRequest = function (wagner, findCriteria, selectCriteria, patchData, interceptFunction) {
    return wagner.invoke(function (Project) {
        return function (req, res) {
            findProject(Project, findCriteria, selectCriteria)
                .then(function (project) {
                    if (project.userID != '' && project.userID != req.session.passport.user) {
                        return errorCallback(req, res)(true);
                    }

                    if (patchData != null) {
                        for (var key in patchData) {
                            project[key] = patchData[key];
                        }
                    }

                    if (interceptFunction != null) {
                        interceptFunction(project);
                    }

                    return saveProject(project, req, res);
                }, errorCallback(req, res));
        };
    });
};

module.exports = function (wagner) {
    var api = express.Router();
    api.use(bodyparser.json());

    // GET for list of public project
    api.get('/public', wagner.invoke(function (Project) {
        return function (req, res) {
            var findCriteria = {
                userID: ""
            };
            var selectCriteria = {
                _id: true,
                projectName: true
            };

            findProjects(Project, findCriteria, selectCriteria)
                .then(function (projects) {
                    return res.json({
                        result: true,
                        projects: projects || []
                    });
                }, errorCallback(req, res));
        }
    }));

    // GET for list of private project
    api.get('/private', wagner.invoke(function (Project) {
        return function (req, res) {
            if (req.session.passport.user == null) {
                return res.json({
                    result: false,
                    projects: []
                });
            }

            var findCriteria = {
                userID: req.session.passport.user
            };
            var selectCriteria = {
                _id: true,
                projectName: true
            };

            findProjects(Project, findCriteria, selectCriteria)
                .then(function (projects) {
                    return res.json({
                        result: true,
                        projects: projects || []
                    });
                }, errorCallback(req, res));
        }
    }));

    // POST endpoint to create project
    api.post('/', wagner.invoke(function (Project) {
        return function (req, res) {
            var project = null;
            var isPublicProject = req.body.type != "private";
            var userID = (isPublicProject || req.session.passport.user == null) ? "" : req.session.passport.user;

            if (req.body.projectName != null && req.body.domainName != null)
                project = new Project({
                    userID: userID,
                    projectName: req.body.projectName,
                    domainData: {
                        domainName: req.body.domainName
                    }
                });
            else
                return res.json({
                    result: false,
                    error: 'Insufficient data'
                });

            project
                .save()
                .then(function () {
                    return res.json({
                        id: project._id,
                        result: true
                    });
                }, function (error) {
                    return res.json({
                        result: error
                    });
                });
        };
    }));

    // DELETE endpoint to delete project
    api.delete('/:id', wagner.invoke(function (Project) {
        return function (req, res) {
            var findCriteria = {
                _id: req.params.id
            };
            findProject(Project, findCriteria)
                .then(function (project) {
                    if (project == null || (project.userID != '' && project.userID != req.session.passport.user)) {
                        return errorCallback(req, res)(true);
                    }
                    project.remove(function () {
                        return res.json({
                            result: true
                        });
                    })
                }, errorCallback(req, res));
        }
    }));

    // GET endpoint for whole project
    api.get('/:id', function (req, res) {
        var findCriteria = {
            _id: req.params.id
        };
        return handleGetRequest(wagner, findCriteria, null)(req, res);
    });

    // GET endpoints
    api.get('/:id/:subroute', function (req, res) {
        var subroute = req.params.subroute;

        if (!subroutesSelectionCriteria.hasOwnProperty(subroute))
            return errorCallback(req, res)(true);

        var findCriteria = {
            _id: req.params.id
        };
        var selectCriteria = subroutesSelectionCriteria[subroute];

        // Add in default needed parameters
        selectCriteria._id = true;
        selectCriteria.userID = true;
        selectCriteria.domainData = true;

        return handleGetRequest(wagner, findCriteria, selectCriteria)(req, res);
    });

    // PATCH endpoint for projectData with different action
    api.patch('/:id/project-data', wagner.invoke(function (Project) {
        return function (req, res) {
            try {
                var newProject = req.body.project;
                var projectName = req.body.projectName;
                var domainName = req.body.domainName;

                findProject(Project, {_id: req.params.id})
                    .then(function (project) {
                        project.projectName = projectName;
                        project.domainData.domainName = domainName;

                        return saveProject(project, req, res);
                    }, errorCallback(req, res));

            } catch (e) {
                return errorCallback(req, res)(e);
            }
        };
    }));

    // PATCH endpoint of domainData with different action
    api.patch('/:id/domain-data', wagner.invoke(function (Project, Domain) {
        return function (req, res) {
            try {
                var domainData = req.body.domainData;

                var findCriteria = {
                    _id: req.params.id
                };

                var patchData = {
                    domainData: domainData
                };

                Domain.findOne({
                    _id: domainData.domainName
                }).then(function (domain) {
                    if (domain == null)
                        domain = new Domain({
                            _id: domainData.domainName
                        });

                    domain.modules = _.union(domain.modules, domainData.modules);
                    domain.actors = _.union(domain.actors, domainData.actors);
                    domain.actions = _.union(domain.actions, domainData.actions);

                    domain.save();
                });

                return handlePatchRequest(wagner, findCriteria, null, patchData)(req, res);
            } catch (e) {
                return errorCallback(req, res)(e);
            }
        };
    }));

    // PATCH endpoints
    api.patch('/:id/:subroute', wagner.invoke(function () {
        return function (req, res) {
            try {
                var subroute = req.params.subroute;

                if (!subroutesPatchData.hasOwnProperty(subroute))
                    return errorCallback(req, res)(true);

                var findCriteria = {
                    _id: req.params.id
                };

                var patchData = {};
                for (var key in subroutesPatchData[subroute]) {
                    if (req.body[key] == null)
                        return errorCallback(req, res)(true);

                    patchData[key] = req.body[key];
                }

                return handlePatchRequest(wagner, findCriteria, null, patchData)(req, res);
            } catch (e) {
                return errorCallback(req, res)(e);
            }
        };
    }));

    return api;
}
;
