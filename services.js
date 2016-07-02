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
    this.modules = {
        Functional: [
            'Action Control'
        ],
        NonFunctional: [
            'Access Control',
            'Performance Constraint',
            'Functional Constraint'
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
                true: "The <output> of the <system> <version1> shall be compatible with <version2>",
                false: "The <output> of the <system> <version1> shall not be compatible with <version2>"
            }
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
                '<output>': 'PDF generated',
                '<system>': 'system',
                '<newVersion>': 'v1.4',
                '<oldVersion>': 'v1.3'
            }
        }
    };

    this.performanceConstraintOptions = Object.keys(this.boilerplateTemplates.performanceConstraint);
    this.actionDependenciesOptions = {
        true: 'shall perform dependent action',
        false: 'shall not perform dependent action'
    };
    this.actionRulesOptions = {
        true: 'based on',
        false: 'not based on'
    };

    return this;
};