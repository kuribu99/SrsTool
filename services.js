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
            'Functional Constraint',
            'Compatibility',
            'Reliability',
            'Security'
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