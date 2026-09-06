//! Upstream renames `$$props` from `Identifier.js`, which runs only where
//! `is_reference` is true. A byte scan cannot answer that question: it sees the
//! same seven bytes in a member property, an object key, a class member name and
//! a label, none of which upstream touches, and it sees a shorthand property as
//! one token where upstream has to expand it into two.
//!
//! Every expected string below is the oracle's own output
//! (`submodules/svelte/packages/svelte/src/compiler/index.js` `VERSION 5.56.10`,
//! `generate: 'client'`, `dev: false`), not a paraphrase of the rule.
//!
//! The two EQ rows are the controls that keep this from being a test that the
//! rename never fires: a plain read still becomes `$$sanitized_props`, and a
//! spread still does. Without them a port that renames nothing passes every
//! other row.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The generated lines that mention either spelling, minus the three
/// builder-made calls, which take the unsanitized object on both sides.
fn carrier_lines(body: &str) -> Vec<String> {
    let src = format!(
        "<script>\n\texport let a = 1;\n{body}\n</script>\n<div {{...$$restProps}}>{{a}}</div>\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .map(str::trim)
        .filter(|l| l.contains("$$props") || l.contains("$$sanitized_props"))
        .filter(|l| {
            !l.contains("$.legacy_rest_props(")
                && !l.contains("$.prop(")
                && !l.contains("$.push(")
                && !l.contains("function X(")
        })
        .map(str::to_string)
        .collect()
}

#[test]
fn only_a_reference_is_renamed_and_a_shorthand_is_expanded() {
    let cells: [(&str, &str, &str); 14] = [
        // --- positions upstream's `is_reference` answers false for ---
        (
            "member property",
            "\tconst o = {};\n\tconst m = o.$$props;",
            "const m = o.$$props;",
        ),
        (
            "optional member property",
            "\tconst o = {};\n\tconst n = o?.$$props;",
            "const n = o?.$$props;",
        ),
        (
            "object literal key",
            "\tconst k = { $$props: 1 };",
            "const k = { $$props: 1 };",
        ),
        (
            "binding pattern key",
            "\tconst { $$props: q } = { $$props: 1 };",
            "const { $$props: q } = { $$props: 1 };",
        ),
        (
            "class method name",
            "\tclass C { $$props() { return 1; } }",
            "$$props() {",
        ),
        (
            "class field name",
            "\tclass C { $$props = 1; }",
            "$$props = 1;",
        ),
        (
            "accessor name",
            "\tconst g = { get $$props() { return 1; } };",
            "get $$props() {",
        ),
        ("label", "\t$$props: { }", "$$props: {}"),
        // --- shorthands, which upstream expands rather than replaces ---
        (
            "object shorthand",
            "\tconst h = { $$props };",
            "const h = { $$props: $$sanitized_props };",
        ),
        (
            "nested object shorthand",
            "\tconst n = { deep: { $$props } };",
            "const n = { deep: { $$props: $$sanitized_props } };",
        ),
        (
            "parameter pattern shorthand",
            "\tfunction f({ $$props }) { return $$props; }\n\tf({});",
            "function f({ $$props: $$sanitized_props }) {",
        ),
        (
            "assignment target shorthand with a default",
            "\tconst o = {};\n\t({ $$props = 5 } = o);",
            "({ $$props: $$sanitized_props = 5 } = o);",
        ),
        // --- controls: the rename still fires where it must ---
        (
            "control: a plain read is renamed",
            "\tconst c = $$props.y;",
            "const c = $$sanitized_props.y;",
        ),
        (
            "control: a spread is renamed",
            "\tconst s = { ...$$props };",
            "const s = { ...$$sanitized_props };",
        ),
    ];

    let mut failures = Vec::new();
    for (name, body, expected) in cells {
        let lines = carrier_lines(body);
        if !lines.iter().any(|l| l == expected) {
            failures.push(format!("{name}: want {expected:?}, got {lines:?}"));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

#[test]
fn a_string_holding_the_token_is_not_a_reference_either() {
    // The occurrence scan already answered this one through `opaque_runs`; it is
    // here so a port that stops consulting the AST cannot pass by accident.
    let lines = carrier_lines("\tconst s = '$$props';\n\tconst t = `x $$props y`;");
    assert!(
        lines.iter().any(|l| l == "const s = '$$props';"),
        "a string literal must keep the token: {lines:?}"
    );
    assert!(
        lines.iter().any(|l| l == "const t = `x $$props y`;"),
        "a template literal must keep the token: {lines:?}"
    );
}
