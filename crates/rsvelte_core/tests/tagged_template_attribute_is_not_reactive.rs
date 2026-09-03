//! `TaggedTemplateExpression.js` gives a tagged template `has_state` (and
//! `has_call`) only when its TAG is not pure — `is_pure` calls any identifier
//! with no binding a global, so `String.raw`…`` is inert and an attribute
//! holding one is written once at init rather than from a `$.template_effect`.
//!
//! rsvelte's `has_reactive_state_json` had no arm for the node type at all, so
//! it fell into the conservative `_ => true` and wrapped every tagged template.
//!
//! Every expected verdict was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `"wrap"` when the attribute is written from a `$.template_effect`, `"plain"`
/// when it is written once at init.
fn attribute_shape(script: &str, expr: &str) -> &'static str {
    let src = format!(
        "<script>\n\t{script}\n\tfunction ltag(x) {{ return x[0]; }}\n</script>\n<input pattern={{{expr}}} />\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("M.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    if js.contains("$.template_effect") {
        "wrap"
    } else if js.contains("$.set_attribute") {
        "plain"
    } else {
        "neither"
    }
}

/// `(name, script, attribute expression, official's shape)`.
const CELLS: &[(&str, &str, &str, &str)] = &[
    (
        "pure tag, no interpolation",
        "let n = 0;",
        "String.raw`a`",
        "plain",
    ),
    ("bare global tag", "let n = 0;", "globalTag`a`", "plain"),
    (
        // A local binding is not pure, so this one must STAY wrapped — it is
        // what separates the fix from \"never wrap a tagged template\".
        "local tag",
        "let n = 0;",
        "ltag`a`",
        "wrap",
    ),
    (
        // The tag is pure but the quasi reads a real state source, which the
        // ordinary walk reaches: this cell fails if the arm returns `false`
        // without recursing.
        "pure tag, mutated state in the quasi",
        "let n = $state(0);\n\texport function go() { n++; }",
        "String.raw`${n}`",
        "wrap",
    ),
    (
        // A member tag rooted at a local binding is not pure either.
        "member tag rooted at a local",
        "let o = { f: (x) => x[0] };",
        "o.f`a`",
        "wrap",
    ),
    (
        // The sibling node type, already correct: a pure callee is inert.
        "pure call (control)",
        "let n = 0;",
        "Math.max(1, 2)",
        "plain",
    ),
    (
        "local call (control)",
        "function lf() { return 1; }",
        "lf()",
        "wrap",
    ),
];

#[test]
fn a_tagged_template_with_a_pure_tag_is_written_once() {
    // Both verdicts occur, so a rule that answers one of them everywhere fails.
    assert!(CELLS.iter().any(|(_, _, _, w)| *w == "plain"));
    assert!(CELLS.iter().any(|(_, _, _, w)| *w == "wrap"));

    for (name, script, expr, want) in CELLS {
        assert_eq!(attribute_shape(script, expr), *want, "cell `{name}`");
    }
}
