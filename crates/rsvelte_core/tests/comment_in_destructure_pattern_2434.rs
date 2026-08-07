//! Regression tests for #2434 cause 1 — a comment inside a legacy destructuring
//! pattern became a binding.
//!
//! `split_top_level_commas` already skips comments when locating the separators,
//! so a `,` inside a comment never split a property. But the segments it returns
//! still carried the comment text, and every consumer treats a segment as pattern
//! text: a comment-only segment became a declarator whose name was `// c`, and a
//! `//` name comments out the rest of the emitted line — including its `;`.
//! The declaration then never terminates and the whole program stops parsing,
//! which is why this shows up as a miscompile rather than a wrong name.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("component should compile")
    .js
    .code
}

/// Parse the emitted program. A comment that swallows a `;` is a *syntax* error,
/// so the parser is the oracle here rather than an expected-text comparison —
/// "does not parse" is a stronger claim than "differs from a snapshot".
#[track_caller]
fn assert_parses(code: &str, what: &str) {
    let allocator = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "{what}: emitted JS does not parse: {:?}\n--- output ---\n{code}",
        ret.diagnostics
    );
}

/// A legacy component whose destructured `d` is reassigned, so it is legacy
/// state and the declaration goes through the `tmp` / `$$array` expansion.
fn legacy_component(decl: &str) -> String {
    format!(
        "<script>\n{decl}\n  function inc() {{ d++; }}\n</script>\n<button onclick={{inc}}>{{d}}</button>\n"
    )
}

fn check_both_modes(decl: &str, what: &str) {
    for dev in [false, true] {
        let code = compile_client(&legacy_component(decl), dev);
        assert_parses(&code, &format!("{what} (dev={dev})"));
        assert!(
            !code.contains("//"),
            "{what} (dev={dev}): a comment leaked into the emitted declaration\n--- output ---\n{code}"
        );
    }
}

// --- Controls: these pass before the fix and must keep passing. ---

#[test]
fn single_line_pattern_without_a_comment_is_unaffected() {
    check_both_modes("  let { c: [d] } = { c: [2] };", "single-line, no comment");
}

/// The control that isolates the trigger: identical to the repro but with the
/// comment removed. It passed before the fix, so multi-line-ness alone is not
/// the cause — the comment is.
#[test]
fn multi_line_pattern_without_a_comment_is_unaffected() {
    check_both_modes(
        "  let {\n    c: [d],\n  } = { c: [2] };",
        "multi-line, no comment",
    );
}

// --- Repros: these failed before the fix. ---

#[test]
fn line_comment_in_a_multi_line_object_pattern() {
    check_both_modes(
        "  let {\n    c: [d],\n  // c\n  } = { c: [2] };",
        "line comment in object pattern",
    );
}

#[test]
fn block_comment_in_a_multi_line_object_pattern() {
    check_both_modes(
        "  let {\n    c: [d],\n  /* c */\n  } = { c: [2] };",
        "block comment in object pattern",
    );
}

#[test]
fn comment_in_a_nested_object_pattern() {
    check_both_modes(
        "  let {\n    a: { d },\n    // c\n  } = { a: { d: 2 } };",
        "comment in nested object pattern",
    );
}

#[test]
fn comment_in_an_array_pattern() {
    check_both_modes(
        "  let [\n    d,\n    // c\n  ] = [2];",
        "comment in array pattern",
    );
}

/// A comment carrying a `,` must not be mistaken for a separator either. This
/// already held — `split_top_level_commas` skips comments when scanning — so it
/// pins the half of the behaviour the fix must not regress.
#[test]
fn comment_containing_a_comma_is_not_a_separator() {
    check_both_modes(
        "  let {\n    c: [d],\n  // x, y\n  } = { c: [2] };",
        "comment containing a comma",
    );
}

/// A default value may hold an arbitrary expression, so two tokens can be
/// separated by nothing but the comment. Removing it without leaving a
/// separator glues them into one identifier — which still *parses*, so the
/// parse oracle cannot see this one.
#[test]
fn stripping_a_comment_does_not_glue_the_tokens_around_it() {
    let code = compile_client(
        &legacy_component("  let { c: [d], e = typeof/*x*/window } = { c: [2] };"),
        false,
    );
    assert_parses(&code, "comment between two tokens");
    assert!(
        !code.contains("typeofwindow"),
        "stripping the comment glued the tokens around it\n--- output ---\n{code}"
    );
}

/// A regex default whose body contains `//`. The shared `skip_opaque` scanner
/// recognises the regex literal; a scanner that knows only strings and comments
/// reads the inner `//` as a line comment and eats the rest of the pattern.
#[test]
fn regex_default_containing_a_comment_marker_survives() {
    let code = compile_client(
        &legacy_component("  let { c: [d], e = /\\/\\// } = { c: [2] };"),
        false,
    );
    assert_parses(&code, "regex default");
    assert!(
        code.contains("/\\/\\//"),
        "the regex default was corrupted\n--- output ---\n{code}"
    );
}

/// The comment shares a segment with a real binding rather than occupying one
/// alone, so dropping comment-only segments is not sufficient — the comment has
/// to be stripped out of the segment.
#[test]
fn comment_preceding_a_binding_in_the_same_segment() {
    let code = compile_client(
        &legacy_component("  let {\n    a,\n    // note\n    c: [d],\n  } = { a: 1, c: [2] };"),
        false,
    );
    assert_parses(&code, "comment preceding a binding");
    assert!(
        !code.contains("//"),
        "a comment leaked into the emitted declaration\n--- output ---\n{code}"
    );
    // The binding that follows the comment must survive the strip.
    assert!(
        code.contains("d = "),
        "the binding after the comment was dropped\n--- output ---\n{code}"
    );
}
