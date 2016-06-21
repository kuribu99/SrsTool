var status = require('http-status');

exports.$user = function ($http) {
    var s = {};

    s.loadUser = function () {
        return; // TODO: implemented
        $http.get('/api/v1/me').success(function (data) {
            s.user = data.user;
        }).error(function (data, status) {
            if (status === status.UNAUTHORIZED) {
                s.user = null;
            }
        });
    };

    s.loadUser();

    setInterval(s.loadUser, 60 * 60 * 1000);

    return s;
};

exports.$projectService = function ($http) {

    // Service variables
    this.project = null;

    // Service methods
    this.loadProject = function (projectID) {
        return $http.get('/api/v1/projects/' + projectID)
            .then(
                function (json) {
                    if (json.data.result) {
                        this.project = json.data.project;
                    } else
                        this.project = null;
                }.bind(this),
                function (error) {
                    console.log(error);
                    this.project = null;
                }.bind(this));
    };

    this.setProject = function (project) {
        this.project = project;
    };

    this.getProject = function (project) {
        return this.project;
    };

    return this;
};
