var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('underscore');
var path = require('path');

module.exports = function (wagner) {
    var api = express.Router();

    api.use(bodyparser.json());

    api.get('/all', wagner.invoke(function (Project) {
        return function (req, res) {
            Project.find()
                .select({
                    _id: true,
                    projectName: true,
                })
                .then(function (projects) {
                    return res.json({
                        result: true,
                        projects: projects
                    });
                }, function (error) {
                    if (error) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            result: false,
                            projects: [],
                            error: error.toString()
                        });
                    }
                });
        }
    }))

    api.get('/:id', wagner.invoke(function (Project) {
        return function (req, res) {
            Project.findOne({
                _id: req.params.id
            }).then(function (project) {
                return res.json({
                    result: project != null,
                    project: project
                });
            }, function (error) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({
                        result: false,
                        projects: null,
                        error: error.toString()
                    });
                }
            });
        };
    }));

    api.delete('/:id', wagner.invoke(function (Project) {
        return function (req, res) {
            Project.remove({_id: req.params.id})
                .then(function (project) {
                    return res.json({
                        result: true
                    });
                }, function (error) {
                    if (error) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            result: false,
                            projects: [],
                            error: error.toString()
                        });
                    }
                });
        };
    }));

    api.post('/new', wagner.invoke(function (Project) {
        return function (req, res) {
            var project = null;

            if (req.body.projectName != null)
                project = new Project({
                    projectName: req.body.projectName
                });
            else
                project = new Project();

            project.save()
                .then(function (project) {
                    return res.json({
                        result: true,
                        id: project._id
                    });
                }, function (error) {
                    if (error) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            result: false,
                            error: error.toString()
                        });
                    }
                });
        };
    }));

    api.put('/:id', wagner.invoke(function (Project, Domain) {
        return function (req, res) {
            try {
                var newProject = req.body.project;
                var projectName = req.body.project.projectName;
                var domainData = req.body.project.domainData;
                var accessControlData = req.body.project.accessControlData;

                Project.findOne({_id: req.params.id})
                    .then(function (project) {
                        project.projectName = projectName;
                        project.domainData = domainData;
                        project.accessControlData = accessControlData;

                        console.log(accessControlData);
                        project.save()
                            .then(function () {
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

                                return res.json({
                                    result: true
                                });

                            }, function (error) {
                                console.log(error);
                                if (error) {
                                    return res.status(status.INTERNAL_SERVER_ERROR).json({
                                        result: false,
                                        error: error.toString()
                                    });
                                }
                            });
                    }, function (error) {
                        if (error) {
                            return res.status(status.INTERNAL_SERVER_ERROR).json({
                                result: false,
                                error: error.toString()
                            });
                        }
                    });

            } catch (e) {
                return res.status(status.BAD_REQUEST).json({
                    result: false,
                    error: e.toString()
                });
            }
        };
    }));

    return api;
};