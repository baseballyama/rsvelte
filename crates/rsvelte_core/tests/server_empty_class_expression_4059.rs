//! `class=""` is dropped by upstream and `class={""}` is not, so the elision
//! belongs to the pure-text branch alone. rsvelte applied it to all four
//! branches that inline a literal, and dropped an attribute official emits.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn markup(attribute: &str) -> String {
    compile(
        &format!("<div {attribute}>x</div>\n"),
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The three spellings that reach a literal through an *expression*: a bare
/// `{expr}`, a quoted single `{expr}`, and a multi-part value every part of
/// which folds. Each enters a different branch.
#[test]
fn an_empty_class_expression_still_emits_the_attribute() {
    for attribute in ["class={\"\"}", "class=\"{''}\"", "class=\"{''}{''}\""] {
        let out = markup(attribute);
        assert!(
            out.contains("<div class=\"\">"),
            "{attribute} must keep the attribute:\n{out}"
        );
    }
}

/// The control the elision exists for, and the one branch that keeps it.
#[test]
fn an_empty_static_class_is_still_dropped() {
    for attribute in ["class=\"\"", "class=\"  \""] {
        let out = markup(attribute);
        assert!(
            out.contains("<div>x</div>"),
            "{attribute} must drop the attribute:\n{out}"
        );
    }
}

/// The elision was only ever conditional on `class`; `style` has no such rule.
#[test]
fn a_non_class_attribute_is_unaffected() {
    assert!(markup("style={\"\"}").contains("<div style=\"\">"));
    assert!(markup("id={\"\"}").contains("<div id=\"\">"));
    assert!(markup("class={\"a\"}").contains("<div class=\"a\">"));
}
