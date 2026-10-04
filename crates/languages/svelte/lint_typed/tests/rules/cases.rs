use super::CaseConfiguration;
use rsvelte_kernel::diagnostics::diagnostic::Severity;

pub(crate) const CASES: &[CaseConfiguration] = &[
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/@typescript-eslint/no-unnecessary-condi",
            "tion/invalid/binary-expression01.svelte"
        ),
        document: concat!(
            "@typescript-eslint/no-unnecessary-condition/invalid/binary-e",
            "xpression01.svelte"
        ),
        severity: Severity::Error,
        strict: false,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/@typescript-eslint/no-unnecessary-condi",
            "tion/invalid/example.svelte"
        ),
        document: concat!(
            "@typescript-eslint/no-unnecessary-condition/invalid/example.",
            "svelte"
        ),
        severity: Severity::Error,
        strict: false,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/@typescript-eslint/no-unnecessary-condi",
            "tion/invalid/nullish-coalescing01.svelte"
        ),
        document: concat!(
            "@typescript-eslint/no-unnecessary-condition/invalid/nullish-",
            "coalescing01.svelte"
        ),
        severity: Severity::Error,
        strict: false,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/@typescript-eslint/no-unnecessary-condi",
            "tion/invalid/optional-chaining01.svelte"
        ),
        document: concat!(
            "@typescript-eslint/no-unnecessary-condition/invalid/optional",
            "-chaining01.svelte"
        ),
        severity: Severity::Error,
        strict: false,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/@typescript-eslint/no-unnecessary-condi",
            "tion/invalid/test01.svelte"
        ),
        document: concat!(
            "@typescript-eslint/no-unnecessary-condition/invalid/test01.s",
            "velte"
        ),
        severity: Severity::Error,
        strict: false,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/@typescript-eslint/no-unnecessary-condi",
            "tion/valid/reactive-statement01.svelte"
        ),
        document: concat!(
            "@typescript-eslint/no-unnecessary-condition/valid/reactive-s",
            "tatement01.svelte"
        ),
        severity: Severity::Error,
        strict: false,
    },
    CaseConfiguration {
        name: concat!(
            "eslint-plugin-svelte/@typescript-eslint/no-unnecessary-condi",
            "tion/valid/template01.svelte"
        ),
        document: concat!(
            "@typescript-eslint/no-unnecessary-condition/valid/template01",
            ".svelte"
        ),
        severity: Severity::Error,
        strict: false,
    },
    CaseConfiguration {
        name: "rsvelte/typed-true",
        document: "rsvelte/typed-true.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/typed-false",
        document: "rsvelte/typed-false.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/typed-number",
        document: "rsvelte/typed-number.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/typed-unknown",
        document: "rsvelte/typed-unknown.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/const-alias",
        document: "rsvelte/const-alias.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/mutable",
        document: "rsvelte/mutable.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/cyclic-alias",
        document: "rsvelte/cyclic-alias.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/asserted-literal",
        document: "rsvelte/asserted-literal.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/asserted-reference",
        document: "rsvelte/asserted-reference.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/asserted-alias",
        document: "rsvelte/asserted-alias.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/union",
        document: "rsvelte/union.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/forward-alias",
        document: "rsvelte/forward-alias.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/shadowed-alias",
        document: "rsvelte/shadowed-alias.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/typed-template",
        document: "rsvelte/typed-template.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/negation",
        document: "rsvelte/negation.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/asserted-condition",
        document: "rsvelte/asserted-condition.svelte",
        severity: Severity::Error,
        strict: true,
    },
    CaseConfiguration {
        name: "rsvelte/optional-parameter",
        document: "rsvelte/optional-parameter.svelte",
        severity: Severity::Error,
        strict: true,
    },
];
