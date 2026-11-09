//! `state_referenced_locally` asks `!should_proxy(initial.arguments[0])`, and
//! that is upstream's DENY-list — it defaults to proxied and names the shapes
//! that are not. Phase 2 spelled it as an allow-list of four node types, so an
//! arrow, a function expression and a bare `undefined` initializer produced no
//! warning at all: the same allow-list-for-deny-list swap #4212 fixes in the
//! phase-3 module lowering, at a third site that no gate compares to the other
//! two.
//!
//! Every expectation below is the official compiler's answer for the same
//! source, taken from `submodules/svelte`'s own `compileModule` / `compile`.
//! Both hosts are here because the visitor is shared and only the module host
//! carried a corpus carrier.

use rsvelte_core::compiler::{CompileOptions, ModuleCompileOptions};
use rsvelte_core::{GenerateMode, compile, compile_module};

fn body(init: &str) -> String {
    format!(
        "const literal = 1;\nconst undef = undefined;\nexport function f(x) {{\n\tlet v = $state({init});\n\treturn v;\n}}\n"
    )
}

fn module_warnings(init: &str) -> Vec<String> {
    compile_module(
        &body(init),
        ModuleCompileOptions {
            filename: Some("x.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compileModule")
    .warnings
    .iter()
    .map(|w| w.code.to_string())
    .collect()
}

fn component_warnings(init: &str) -> Vec<String> {
    compile(
        &format!("<script>\n{}</script>\n", body(init)),
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
    .iter()
    .map(|w| w.code.to_string())
    .collect()
}

/// (initializer, does official warn)
#[rustfmt::skip]
const CELLS: &[(&str, bool)] = &[
    // Not proxied, so the reference only captures the initial value.
    ("1", true),
    ("'x'", true),
    ("`t`", true),
    ("x + 1", true),
    ("!x", true),
    // The four the allow-list had no predicate for.
    ("() => 1", true),
    ("function () {}", true),
    ("(function () {})", true),
    ("undefined", true),
    // `should_proxy` resolves an identifier through its binding to that
    // binding's own initializer.
    ("literal", true),
    ("undef", true),
    // Proxied, so upstream deliberately stays quiet — these are what an
    // over-wide deny-list would break, and none of them may move.
    ("{}", false),
    ("[]", false),
    ("new Map()", false),
    ("x", false),
    // A logical or conditional expression is absent from upstream's list on
    // purpose: either branch may produce a proxyable value.
    ("x ? 1 : {}", false),
    ("x || {}", false),
    ("x ?? {}", false),
];

#[test]
fn a_module_matches_upstreams_deny_list() {
    let mut wrong = Vec::new();
    for (init, warns) in CELLS {
        let got = module_warnings(init);
        let want: Vec<String> = if *warns {
            vec!["state_referenced_locally".to_string()]
        } else {
            vec![]
        };
        if got != want {
            wrong.push(format!("{init}: got {got:?}, want {want:?}"));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}

/// The visitor is shared, so the component host has to answer identically —
/// a fix keyed on the module entry point alone would pass the table above.
#[test]
fn a_component_instance_script_answers_the_same_way() {
    let mut wrong = Vec::new();
    for (init, warns) in CELLS {
        let got = component_warnings(init);
        let want: Vec<String> = if *warns {
            vec!["state_referenced_locally".to_string()]
        } else {
            vec![]
        };
        if got != want {
            wrong.push(format!("{init}: got {got:?}, want {want:?}"));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}

/// Liveness: the table above is only a measurement while it carries cells on
/// both sides of the predicate.
#[test]
fn the_table_carries_both_answers() {
    assert!(CELLS.iter().any(|(_, w)| *w), "no warning cell");
    assert!(CELLS.iter().any(|(_, w)| !*w), "no silent cell");
}
