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
    };

    this.performanceConstraintOptions = Object.keys(this.boilerplateTemplates.performanceConstraint);
    this.functionalConstraintOptions = {
        'will perform action if': true,
        'will not perform action if': false
    };

    return this;
};