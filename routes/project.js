var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('underscore');

module.exports = function (wagner) {
    var api = express.Router();
    api.use(bodyparser.json());

    api.get('/list', wagner.invoke(function (Project) {
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
    }));

    api.post('/', wagner.invoke(function (Project) {
        return function (req, res) {
            var project = null;

            if (req.body.projectName != null && req.body.domainName != null)
                project = new Project({
                    projectName: req.body.projectName,
                    domainData: {
                        domainName: req.body.domainName
                    }
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

    api.get('/:id/view', wagner.invoke(function (Project) {
        return function (req, res) {
            Project.findOne({
                _id: req.params.id
            }).select({
                _id: true,
                projectName: true,
                domainData: true,
                generatedRequirements: true
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

    api.get('/:id/project-data', wagner.invoke(function (Project) {
        return function (req, res) {
            Project.findOne({
                _id: req.params.id
            }).select({
                _id: true,
                projectName: true,
                domainData: true
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

    api.patch('/:id/project-data', wagner.invoke(function (Project, Domain) {
        return function (req, res) {
            try {
                var newProject = req.body.project;
                var projectName = req.body.projectName;
                var domainName = req.body.domainName;

                Project.findOne({_id: req.params.id})
                    .then(function (project) {
                        project.projectName = projectName;
                        project.domainData.domainName = domainName;

                        project.save()
                            .then(function () {
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

    api.get('/:id/domain-data', wagner.invoke(function (Project) {
        return function (req, res) {
            Project.findOne({
                _id: req.params.id
            }).select({
                _id: true,
                domainData: true
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

    api.patch('/:id/domain-data', wagner.invoke(function (Project, Domain) {
        return function (req, res) {
            try {
                var newProject = req.body.project;
                var projectName = req.body.project.projectName;
                var domainData = req.body.project.domainData;

                Project.findOne({_id: req.params.id})
                    .then(function (project) {
                        project.domainData = domainData;

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

    api.get('/:id/access-control-data', wagner.invoke(function (Project) {
        return function (req, res) {
            Project.findOne({
                _id: req.params.id
            }).select({
                _id: true,
                domainData: true,
                accessControlData: true
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

    api.patch('/:id/access-control-data', wagner.invoke(function (Project) {
        return function (req, res) {
            try {
                var accessControlData = req.body.accessControlData;

                Project.findOne({_id: req.params.id})
                    .then(function (project) {
                        project.accessControlData = accessControlData;

                        project.save()
                            .then(function () {
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

    api.get('/:id/action-control-data', wagner.invoke(function (Project) {
        return function (req, res) {
            Project.findOne({
                _id: req.params.id
            }).select({
                _id: true,
                domainData: true,
                actionControlData: true
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

    api.patch('/:id/action-control-data', wagner.invoke(function (Project) {
        return function (req, res) {
            try {
                var actionControlData = req.body.actionControlData;

                Project.findOne({_id: req.params.id})
                    .then(function (project) {
                        project.actionControlData = actionControlData;

                        project.save()
                            .then(function () {
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

    api.patch('/:id/generated-requirements', wagner.invoke(function (Project) {
        return function (req, res) {
            try {
                var generatedRequirements = req.body.generatedRequirements;

                Project.findOne({_id: req.params.id})
                    .then(function (project) {
                        project.generatedRequirements = generatedRequirements;

                        project.save()
                            .then(function () {
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

    api.get('/:id/boilerplate-data', wagner.invoke(function (Project) {
        return function (req, res) {
            Project.findOne({
                _id: req.params.id
            }).select({
                _id: true,
                boilerplateData: true
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

    api.patch('/:id/boilerplate-data', wagner.invoke(function (Project) {
        return function (req, res) {
            try {
                var boilerplateData = req.body.boilerplateData;

                Project.findOne({_id: req.params.id})
                    .then(function (project) {
                        project.boilerplateData = boilerplateData;

                        project.save()
                            .then(function () {
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

    api.get('/:id/resource-constraint-data', wagner.invoke(function (Project) {
        return function (req, res) {
            Project.findOne({
                _id: req.params.id
            }).select({
                _id: true,
                domainData: true,
                resourceConstraintData: true
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

    api.patch('/:id/resource-constraint-data', wagner.invoke(function (Project) {
        return function (req, res) {
            try {
                var resourceConstraintData = req.body.resourceConstraintData;

                Project.findOne({_id: req.params.id})
                    .then(function (project) {
                        project.resourceConstraintData = resourceConstraintData;

                        project.save()
                            .then(function () {
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
