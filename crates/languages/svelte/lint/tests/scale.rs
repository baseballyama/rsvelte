//! Rules do no per-item work over the whole file, and deep expressions do not exhaust the
//! stack.

use std::fmt::Write as _;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_lint::{Configuration, LintSettings};

/// Lints `source` with one rule and returns the number of findings and the fastest of three runs.
fn lint(rule: &str, path: &str, source: &str) -> (usize, Duration) {
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule(rule, Severity::Error, &[], &[])
        .expect("the rule exists");
    let document = Document::new(path.to_owned(), source.to_owned()).expect("small enough");
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register_artifacts(&mut registry);
    let mut best = Duration::MAX;
    let mut found = 0;
    for _ in 0..3 {
        let context = DocumentContext::new(&document, registry.artifacts());
        let start = Instant::now();
        found = rsvelte_svelte_lint::lint(&context, &configuration)
            .expect("lints")
            .len();
        best = best.min(start.elapsed());
    }
    (found, best)
}

static SERIAL: Mutex<()> = Mutex::new(());

/// Asserts that `rule` on `make(n)` reports `per_unit` findings per unit and takes at most twenty
/// times as long as `svelte/button-has-type`, which only parses: building the scopes takes a few
/// times as long at this size, and per-unit work over all references fifty times and more.
fn near_baseline(
    rule: &str,
    path: &str,
    n: usize,
    per_unit: usize,
    make: impl Fn(usize) -> String,
) {
    // One measurement at a time, so that another test's load does not slow only one side.
    let _serial = SERIAL
        .lock()
        .unwrap_or_else(std::sync::PoisonError::into_inner);
    let source = make(n);
    let (found, time) = lint(rule, path, &source);
    let (_, baseline) = lint("svelte/button-has-type", path, &source);
    assert_eq!(found, n * per_unit, "{rule}: findings");
    assert!(
        time < baseline * 20,
        "{rule}: {time:?}, svelte/button-has-type {baseline:?}"
    );
}

fn component(script: impl Fn(&mut String, usize), n: usize) -> String {
    let mut out = String::from("<script>\n");
    for i in 0..n {
        script(&mut out, i);
    }
    out.push_str("</script>\n");
    out
}

#[test]
fn infinite_reactive_loop_is_near_baseline() {
    near_baseline("svelte/infinite-reactive-loop", "a.svelte", 4000, 1, |n| {
        component(
            |out, i| {
                if i == 0 {
                    out.push_str("let a = 0;\n");
                }
                out.push_str("$: { setTimeout(() => { a = a + 1; }); }\n");
            },
            n,
        )
    });
}

#[test]
fn no_immutable_reactive_statements_is_near_baseline() {
    near_baseline(
        "svelte/no-immutable-reactive-statements",
        "a.svelte",
        4000,
        1,
        |n| {
            component(
                |out, i| {
                    writeln!(out, "const c{i} = 1; let x{i}; $: x{i} = c{i};").expect("a string");
                },
                n,
            )
        },
    );
}

#[test]
fn require_store_callbacks_use_set_param_is_near_baseline() {
    near_baseline(
        "svelte/require-store-callbacks-use-set-param",
        "a.svelte",
        4000,
        1,
        |n| {
            component(
                |out, i| {
                    if i == 0 {
                        out.push_str("import { readable } from 'svelte/store';\n");
                    }
                    writeln!(out, "const r{i} = readable(0, (v{i}) => v{i});").expect("a string");
                },
                n,
            )
        },
    );
}

#[test]
fn derived_has_same_inputs_outputs_is_near_baseline() {
    near_baseline(
        "svelte/derived-has-same-inputs-outputs",
        "a.svelte",
        4000,
        1,
        |n| {
            component(
                |out, i| {
                    if i == 0 {
                        out.push_str("import { derived } from 'svelte/store';\n");
                    }
                    writeln!(out, "const d{i} = derived(a, (b{i}) => b{i});").expect("a string");
                },
                n,
            )
        },
    );
}

/// `a + a + … + a`, nested `terms` deep.
fn deep(terms: usize) -> String {
    let mut out = String::from("a");
    for _ in 1..terms {
        out.push_str(" + a");
    }
    out
}

#[test]
fn deep_expressions_do_not_exhaust_the_stack() {
    let module = format!("const a = 1;\nexport const b = {};\n", deep(100_000));
    assert_eq!(
        lint("svelte/prefer-destructured-store-props", "a.js", &module).0,
        0
    );
}

#[test]
fn no_add_event_listener_is_near_baseline() {
    near_baseline("svelte/no-add-event-listener", "a.svelte", 4000, 1, |n| {
        let mut out = String::from("<script lang=\"ts\">\n");
        for i in 0..n {
            writeln!(out, "el{i}!.addEventListener('x', f as any);").expect("a string");
        }
        out.push_str("</script>\n");
        out
    });
}
