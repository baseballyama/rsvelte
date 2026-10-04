use super::CaseConfiguration;
use rsvelte_kernel::diagnostics::diagnostic::Severity;
use rsvelte_markup::button_type::Allowed;
use rsvelte_svelte_lint::RuleConfiguration;

pub(crate) const CASES: &[CaseConfiguration] = &[
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/button-has-type/invalid/button-false/in",
            "valid-button.svelte"
        ),
        document: "button-has-type/invalid/button-false/invalid-button.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: false,
                submit: true,
                reset: true,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/button-has-type/invalid/reset-false/inv",
            "alid-reset.svelte"
        ),
        document: "button-has-type/invalid/reset-false/invalid-reset.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: true,
                submit: true,
                reset: false,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/button-has-type/invalid/submit-false/in",
            "valid-submit.svelte"
        ),
        document: "button-has-type/invalid/submit-false/invalid-submit.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: true,
                submit: false,
                reset: true,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/button-has-type/invalid/test01.svelte",
        document: "button-has-type/invalid/test01.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: true,
                submit: true,
                reset: true,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/button-has-type/valid/test01.svelte",
        document: "button-has-type/valid/test01.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: true,
                submit: true,
                reset: true,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/valid-each-key/invalid/const-key01.svelte",
        document: "valid-each-key/invalid/const-key01.svelte",
        rules: &[RuleConfiguration::ValidEachKey(Severity::Error)],
        strict: true,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/valid-each-key/invalid/out-vars-key01.s",
            "velte"
        ),
        document: "valid-each-key/invalid/out-vars-key01.svelte",
        rules: &[RuleConfiguration::ValidEachKey(Severity::Error)],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/valid-each-key/valid/call-key01.svelte",
        document: "valid-each-key/valid/call-key01.svelte",
        rules: &[RuleConfiguration::ValidEachKey(Severity::Error)],
        strict: true,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/valid-each-key/valid/destructure-key01.",
            "svelte"
        ),
        document: "valid-each-key/valid/destructure-key01.svelte",
        rules: &[RuleConfiguration::ValidEachKey(Severity::Error)],
        strict: true,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/valid-each-key/valid/expression-key01.s",
            "velte"
        ),
        document: "valid-each-key/valid/expression-key01.svelte",
        rules: &[RuleConfiguration::ValidEachKey(Severity::Error)],
        strict: true,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/valid-each-key/valid/expression-key02.s",
            "velte"
        ),
        document: "valid-each-key/valid/expression-key02.svelte",
        rules: &[RuleConfiguration::ValidEachKey(Severity::Error)],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/valid-each-key/valid/index-key01.svelte",
        document: "valid-each-key/valid/index-key01.svelte",
        rules: &[RuleConfiguration::ValidEachKey(Severity::Error)],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/valid-each-key/valid/member-key01.svelte",
        document: "valid-each-key/valid/member-key01.svelte",
        rules: &[RuleConfiguration::ValidEachKey(Severity::Error)],
        strict: true,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/valid-each-key/valid/svelte5-each-block",
            "s-without-an-item.svelte"
        ),
        document: "valid-each-key/valid/svelte5-each-blocks-without-an-item.svelte",
        rules: &[RuleConfiguration::ValidEachKey(Severity::Error)],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/button-has-type/matrix/0.svelte",
        document: "button-has-type/matrix/0.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: false,
                submit: false,
                reset: false,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/button-has-type/matrix/1.svelte",
        document: "button-has-type/matrix/1.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: true,
                submit: false,
                reset: false,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/button-has-type/matrix/2.svelte",
        document: "button-has-type/matrix/2.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: false,
                submit: true,
                reset: false,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/button-has-type/matrix/3.svelte",
        document: "button-has-type/matrix/3.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: true,
                submit: true,
                reset: false,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/button-has-type/matrix/4.svelte",
        document: "button-has-type/matrix/4.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: false,
                submit: false,
                reset: true,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/button-has-type/matrix/5.svelte",
        document: "button-has-type/matrix/5.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: true,
                submit: false,
                reset: true,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/button-has-type/matrix/6.svelte",
        document: "button-has-type/matrix/6.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: false,
                submit: true,
                reset: true,
            },
        }],
        strict: true,
    },
    CaseConfiguration {
        name: "eslint-plugin-svelte/button-has-type/matrix/7.svelte",
        document: "button-has-type/matrix/7.svelte",
        rules: &[RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed {
                button: true,
                submit: true,
                reset: true,
            },
        }],
        strict: true,
    },
];
