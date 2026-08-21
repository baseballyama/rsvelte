//! Issue #3261: a template expression must be parsed with the component's one
//! language mode, and a failure must be classified the way upstream classifies it.
//!
//! Upstream picks the acorn variant once per component from `parser.ts` — set
//! when *any* script declares `lang="ts"` — so a component with no such script
//! never reaches the TypeScript grammar. rsvelte parsed the component's mode
//! first and then retried in the *other* mode on failure, which accepted
//! TypeScript-only syntax in a plain component's template.
//!
//! The second half is the classification. Upstream reads ONE maximal expression
//! and then `eat(close, true)`, so leftover input after a *complete* expression
//! is `expected_token` and everything else is `js_parse_error`. rsvelte decided
//! that from OXC's first error label alone, which is not the same question — see
//! `plain_javascript_failures_are_classified_like_upstream`, whose inputs carry
//! no TypeScript at all.
//!
//! Three slots are deliberately absent: `{#await}`, `{@const}` and a `{@render}`
//! argument swallow a template-expression parse error outright, which is a
//! separate pre-existing defect (they also accept plain-JS `{#await y +}`).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// `Ok` when the component compiles, otherwise the Svelte error code.
fn verdict(src: &str) -> Result<(), String> {
    match compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    ) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.diagnostic().code.unwrap_or_default()),
    }
}

/// Slots whose whole content is the expression, so leftover input after a
/// complete expression is a missing close token.
const TOP_LEVEL_SLOTS: &[&str] = &[
    "mustache",
    "attribute",
    "each_body",
    "if_test",
    "key",
    "style_directive",
    "class_directive",
];

/// TypeScript-only expressions, split by where acorn stops. A postfix operator
/// (`as`, `satisfies`, `!`) leaves a complete expression behind it; the rest
/// break the expression from the inside.
const TS_POSTFIX: &[&str] = &[
    "y as string",
    "y as const",
    "y as unknown as string",
    "y satisfies string",
    "y!",
    "y!.k",
];
const TS_INNER: &[&str] = &[
    "<string>y",
    "f<string>()",
    "((a: string) => a)(\"\")",
    "((): string => \"\")()",
    "(<T,>(a: T) => a)(1)",
];

fn slots(expr: &str) -> Vec<(&'static str, String)> {
    vec![
        ("mustache", format!("<p>{{{expr}}}</p>")),
        ("attribute", format!("<p title={{{expr}}}>x</p>")),
        ("spread", format!("<p {{...{{ a: {expr} }}}}>x</p>")),
        (
            "each_collection",
            format!("{{#each [{expr}] as q}}<p>{{q}}</p>{{/each}}"),
        ),
        (
            "each_body",
            format!("{{#each [1] as q}}<p>{{{expr}}}</p>{{/each}}"),
        ),
        ("if_test", format!("{{#if {expr}}}<p>x</p>{{/if}}")),
        ("key", format!("{{#key {expr}}}<p>x</p>{{/key}}")),
        ("html_tag", format!("{{@html String({expr})}}")),
        (
            "event_handler",
            format!("<button onclick={{() => sink({expr})}}>x</button>"),
        ),
        (
            "style_directive",
            format!("<p style:color={{{expr}}}>x</p>"),
        ),
        ("class_directive", format!("<p class:on={{{expr}}}>x</p>")),
        (
            "transition_parameter",
            format!("<p transition:fade={{{{ d: {expr} }}}}>x</p>"),
        ),
    ]
}

const DECLS: &str = "\tlet y = 1;\n\tlet z = 2;\n\tfunction f() {}\n\tfunction sink() {}\n\tconst fade = () => {};\n";

/// Hosts with no `lang="ts"` anywhere — the population official parses as
/// plain JavaScript.
fn plain_hosts(template: &str) -> Vec<(&'static str, String)> {
    vec![
        ("no_script", format!("{template}\n")),
        (
            "plain_script",
            format!("<script>\n{DECLS}</script>\n{template}\n"),
        ),
    ]
}

/// Hosts where some script declares `lang="ts"`, so the whole component is
/// TypeScript — including a module-only declaration.
fn ts_hosts(template: &str) -> Vec<(&'static str, String)> {
    vec![
        (
            "instance_ts",
            format!("<script lang=\"ts\">\n{DECLS}</script>\n{template}\n"),
        ),
        (
            "module_ts",
            format!("<script module lang=\"ts\">\n\texport const m = 1;\n</script>\n{template}\n"),
        ),
    ]
}

#[track_caller]
fn assert_grid(cases: &[(&str, &str)]) {
    let mut failures = Vec::new();
    for (expr, expected) in cases {
        for (slot, template) in slots(expr) {
            for (host, src) in plain_hosts(&template) {
                match verdict(&src) {
                    Ok(()) => failures.push(format!("{expr} / {slot} / {host}: compiled")),
                    Err(code) if code == *expected => {}
                    Err(code) => {
                        failures.push(format!("{expr} / {slot} / {host}: {code} != {expected}"));
                    }
                }
            }
        }
    }
    assert!(
        failures.is_empty(),
        "{} divergent cells:\n{}",
        failures.len(),
        failures.join("\n")
    );
}

#[test]
fn typescript_only_expressions_are_rejected_without_lang_ts() {
    let mut cases: Vec<(&str, &str)> = Vec::new();
    for expr in TS_INNER {
        cases.push((expr, "js_parse_error"));
    }
    assert_grid(&cases);

    // The postfix operators leave a complete expression behind them, so the
    // code depends on whether the expression is the whole slot.
    let mut failures = Vec::new();
    for expr in TS_POSTFIX {
        for (slot, template) in slots(expr) {
            let expected = if TOP_LEVEL_SLOTS.contains(&slot) {
                "expected_token"
            } else {
                "js_parse_error"
            };
            for (host, src) in plain_hosts(&template) {
                match verdict(&src) {
                    Ok(()) => failures.push(format!("{expr} / {slot} / {host}: compiled")),
                    Err(code) if code == expected => {}
                    Err(code) => {
                        failures.push(format!("{expr} / {slot} / {host}: {code} != {expected}"));
                    }
                }
            }
        }
    }
    assert!(
        failures.is_empty(),
        "{} divergent cells:\n{}",
        failures.len(),
        failures.join("\n")
    );
}

#[test]
fn typescript_only_expressions_are_accepted_with_lang_ts() {
    // The other direction of the same check: a `lang="ts"` script anywhere
    // turns the grammar on for the whole component, module-only included.
    let mut failures = Vec::new();
    for expr in TS_POSTFIX.iter().chain(TS_INNER) {
        for (slot, template) in slots(expr) {
            for (host, src) in ts_hosts(&template) {
                if let Err(code) = verdict(&src) {
                    failures.push(format!("{expr} / {slot} / {host}: {code}"));
                }
            }
        }
    }
    assert!(
        failures.is_empty(),
        "{} divergent cells:\n{}",
        failures.len(),
        failures.join("\n")
    );
}

#[test]
fn plain_javascript_is_unaffected() {
    // Negative control on the construct axis: an ordinary expression compiles
    // in every slot and every host.
    let mut failures = Vec::new();
    for (slot, template) in slots("y") {
        for (host, src) in plain_hosts(&template)
            .into_iter()
            .chain(ts_hosts(&template))
        {
            if let Err(code) = verdict(&src) {
                failures.push(format!("y / {slot} / {host}: {code}"));
            }
        }
    }
    assert!(
        failures.is_empty(),
        "{} divergent cells:\n{}",
        failures.len(),
        failures.join("\n")
    );
}

#[test]
fn plain_javascript_failures_are_classified_like_upstream() {
    // The classification half, with no TypeScript anywhere: `y z` is a complete
    // expression followed by leftover input, `y +` and `y ===` are broken.
    let mut failures = Vec::new();
    for (slot, template) in slots("y z") {
        let expected = if TOP_LEVEL_SLOTS.contains(&slot) {
            "expected_token"
        } else {
            "js_parse_error"
        };
        for (host, src) in plain_hosts(&template) {
            match verdict(&src) {
                Ok(()) => failures.push(format!("y z / {slot} / {host}: compiled")),
                Err(code) if code == expected => {}
                Err(code) => failures.push(format!("y z / {slot} / {host}: {code} != {expected}")),
            }
        }
    }
    assert!(
        failures.is_empty(),
        "{} divergent cells:\n{}",
        failures.len(),
        failures.join("\n")
    );

    assert_grid(&[("y +", "js_parse_error"), ("y ===", "js_parse_error")]);
}

#[test]
fn snippet_type_parameters_follow_the_component_mode() {
    // The same defect in the block-header parser.
    for template in [
        "{#snippet s<T>(a)}<p>{a}</p>{/snippet}",
        "{#snippet s<T>()}<p>x</p>{/snippet}",
    ] {
        for (host, src) in plain_hosts(template) {
            assert_eq!(
                verdict(&src),
                Err("expected_token".to_string()),
                "{template} / {host}"
            );
        }
        for (host, src) in ts_hosts(template) {
            assert_eq!(verdict(&src), Ok(()), "{template} / {host}");
        }
    }
    // A parameter annotation is a `js_parse_error` on both sides; this row
    // already agreed and pins that the fix did not move it.
    let annotated = "{#snippet s(a: string)}<p>{a}</p>{/snippet}";
    for (host, src) in plain_hosts(annotated) {
        assert_eq!(
            verdict(&src),
            Err("js_parse_error".to_string()),
            "{annotated} / {host}"
        );
    }
    for (host, src) in ts_hosts(annotated) {
        assert_eq!(verdict(&src), Ok(()), "{annotated} / {host}");
    }
}

#[test]
fn snippet_default_parameter_agrees_in_both_modes() {
    // The one slot the issue records as already clean, kept as a discriminating
    // control: both compilers reject here without `lang="ts"` and accept with it.
    let template = "{#snippet s(a = y as string)}<p>{a}</p>{/snippet}";
    for (host, src) in plain_hosts(template) {
        assert_eq!(
            verdict(&src),
            Err("js_parse_error".to_string()),
            "{template} / {host}"
        );
    }
    for (host, src) in ts_hosts(template) {
        assert_eq!(verdict(&src), Ok(()), "{template} / {host}");
    }
}
