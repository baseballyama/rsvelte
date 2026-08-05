//! Regression tests for issue #2256 — a `// svelte-ignore` comment was only
//! honored in front of a *statement*, because Phase 1 distributed comments to a
//! hand-maintained allowlist of statement-body fields. Upstream's rule
//! (`add_comments` in `phases/1-parse/acorn.js`) is positional and type-agnostic:
//! a comment belongs to the first node in pre-order that starts after it, and the
//! whole subtree of that node inherits the ignore — unless an earlier node claims
//! the comment as a *trailing* comment first.
//!
//! Both halves matter. Missing the general rule loses suppression inside object
//! and array literals; missing the trailing-comment rules over-suppresses
//! warnings that upstream still emits.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const CODE: &str = "state_referenced_locally";

fn warning_codes(src: &str) -> Vec<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: true,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
    .into_iter()
    .map(|w| w.code)
    .collect()
}

#[track_caller]
fn assert_suppressed(src: &str) {
    let codes = warning_codes(src);
    assert!(
        !codes.iter().any(|c| c == CODE),
        "expected {CODE} to be suppressed, got {codes:?}\n--- source ---\n{src}"
    );
}

#[track_caller]
fn assert_warns(src: &str) {
    let codes = warning_codes(src);
    assert!(
        codes.iter().any(|c| c == CODE),
        "expected {CODE} to still be emitted, got {codes:?}\n--- source ---\n{src}"
    );
}

/// Baseline: without any ignore comment the warning fires, so every
/// `assert_suppressed` below is testing suppression rather than an absent warning.
#[test]
fn baseline_warns_without_ignore() {
    assert_warns(
        "<script>\n\tconst { dims } = $props();\n\
         \tconst opts = $state([{ propertyLevel: dims.length > 0 }]);\n\
         </script>\n\n{opts.length}\n",
    );
}

#[test]
fn statement_level_ignore_suppresses() {
    assert_suppressed(
        "<script>\n\tconst { dims } = $props();\n\n\
         \t// svelte-ignore state_referenced_locally\n\
         \tconst statementLevel = dims.length > 0;\n\
         </script>\n\n{statementLevel}\n",
    );
}

/// The issue's repro: the ignore sits in front of an object-literal property.
#[test]
fn object_property_ignore_suppresses() {
    assert_suppressed(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tconst opts = $state([\n\t\t{\n\
         \t\t\t// svelte-ignore state_referenced_locally\n\
         \t\t\tpropertyLevel: dims.length > 0\n\t\t}\n\t]);\n\
         </script>\n\n{opts.length}\n",
    );
}

#[test]
fn array_element_ignore_suppresses() {
    assert_suppressed(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tconst opts = $state([\n\
         \t\t// svelte-ignore state_referenced_locally\n\
         \t\tdims.length > 0\n\t]);\n\
         </script>\n\n{opts.length}\n",
    );
}

#[test]
fn call_argument_ignore_suppresses() {
    assert_suppressed(
        "<script>\n\tconst { dims } = $props();\n\
         \tfunction id(a, b) { return a; }\n\n\
         \tconst opts = id(\n\
         \t\t// svelte-ignore state_referenced_locally\n\
         \t\tdims.length > 0,\n\t\t1\n\t);\n\
         </script>\n\n{opts}\n",
    );
}

#[test]
fn block_comment_form_suppresses() {
    assert_suppressed(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tconst opts = $state([\n\t\t{\n\
         \t\t\t/* svelte-ignore state_referenced_locally */\n\
         \t\t\tpropertyLevel: dims.length > 0\n\t\t}\n\t]);\n\
         </script>\n\n{opts.length}\n",
    );
}

#[test]
fn comma_separated_codes_suppress() {
    assert_suppressed(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tconst opts = $state([\n\t\t{\n\
         \t\t\t// svelte-ignore await_reactivity_loss, state_referenced_locally\n\
         \t\t\tpropertyLevel: dims.length > 0\n\t\t}\n\t]);\n\
         </script>\n\n{opts.length}\n",
    );
}

#[test]
fn class_member_ignore_suppresses() {
    assert_suppressed(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tclass Box {\n\
         \t\t// svelte-ignore state_referenced_locally\n\
         \t\tfield = dims.length > 0;\n\n\
         \t\t// svelte-ignore state_referenced_locally\n\
         \t\tmethod() {\n\t\t\treturn dims.length;\n\t\t}\n\t}\n\n\
         \tconst box = new Box();\n\
         </script>\n\n{box.field}\n",
    );
}

/// An ignore on the enclosing declaration covers the whole subtree.
#[test]
fn enclosing_declaration_ignore_covers_subtree() {
    assert_suppressed(
        "<script>\n\tconst { dims } = $props();\n\n\
         \t// svelte-ignore state_referenced_locally\n\
         \tconst opts = $state([\n\t\t{\n\
         \t\t\tdeep: dims.length > 0\n\t\t}\n\t]);\n\
         </script>\n\n{opts.length}\n",
    );
}

/// An ignore before an object method still covers the method's whole body.
#[test]
fn object_method_ignore_covers_body() {
    assert_suppressed(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tconst obj = {\n\
         \t\t// svelte-ignore state_referenced_locally\n\
         \t\tcompute() {\n\t\t\treturn dims.length > 0;\n\t\t}\n\t};\n\
         \tconst v = obj.compute();\n\
         </script>\n\n{v}\n",
    );
}

/// Negative: the ignore belongs to the statement that follows it, not the next one.
#[test]
fn ignore_does_not_leak_to_following_statement() {
    assert_warns(
        "<script>\n\tconst { dims } = $props();\n\n\
         \t// svelte-ignore state_referenced_locally\n\
         \tconst first = 1;\n\
         \tconst second = dims.length > 0;\n\
         </script>\n\n{first}{second}\n",
    );
}

/// Negative: the ignore belongs to property `a`, so `b` still warns.
#[test]
fn ignore_does_not_leak_to_sibling_property() {
    assert_warns(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tconst opts = $state([\n\t\t{\n\
         \t\t\t// svelte-ignore state_referenced_locally\n\
         \t\t\ta: 1,\n\t\t\tb: dims.length > 0\n\t\t}\n\t]);\n\
         </script>\n\n{opts.length}\n",
    );
}

/// Negative: a different code must not suppress this warning.
#[test]
fn unrelated_code_does_not_suppress() {
    assert_warns(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tconst opts = $state([\n\t\t{\n\
         \t\t\t// svelte-ignore await_reactivity_loss\n\
         \t\t\tpropertyLevel: dims.length > 0\n\t\t}\n\t]);\n\
         </script>\n\n{opts.length}\n",
    );
}

/// Negative (upstream trailing rule): only `,`/`)`/spaces/tabs separate the
/// previous argument from the comment, so the comment is a *trailing* comment of
/// `1` and never reaches the next argument.
#[test]
fn same_line_comment_after_comma_is_trailing_in_call() {
    assert_warns(
        "<script>\n\tconst { dims } = $props();\n\
         \tfunction id(a, b) { return b; }\n\n\
         \tconst opts = id(1, // svelte-ignore state_referenced_locally\n\
         \t\tdims.length > 0);\n\
         </script>\n\n{opts}\n",
    );
}

/// Same trailing rule inside an array literal.
#[test]
fn same_line_comment_after_comma_is_trailing_in_array() {
    assert_warns(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tconst opts = $state([1, // svelte-ignore state_referenced_locally\n\
         \t\tdims.length > 0]);\n\
         </script>\n\n{opts.length}\n",
    );
}

/// Negative (upstream `is_last_in_body` rule): a comment after the last statement
/// of a block belongs to that statement, not to whatever follows the block.
#[test]
fn comment_after_last_statement_in_block_does_not_leak_out() {
    assert_warns(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tfunction noop() {\n\t\tlet x = 1;\n\
         \t\t// svelte-ignore state_referenced_locally\n\t}\n\
         \tconst after = dims.length > 0;\n\
         </script>\n\n{after}\n",
    );
}

/// The same rule for the last element of an array literal.
#[test]
fn comment_after_last_array_element_does_not_leak_out() {
    assert_warns(
        "<script>\n\tconst { dims } = $props();\n\n\
         \tconst list = $state([\n\t\t1\n\
         \t\t// svelte-ignore state_referenced_locally\n\t]);\n\
         \tconst after = dims.length > 0;\n\
         </script>\n\n{list.length}{after}\n",
    );
}
