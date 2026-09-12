//! A comment left behind by an erased TypeScript annotation lands INSIDE the
//! destructuring pattern the annotation was attached to, not ahead of the
//! initializer.
//!
//! acorn-typescript folds the annotation into the pattern node's own range, so
//! esrap flushes the pending comment before it writes the closing bracket — a
//! point that lies behind the annotation in the source. An identifier binding
//! has no closing token, so its comment waits for the next located node
//! instead, which is why `let a: T = init` and `let { a }: T = init` disagree.
//!
//! Every expected line below was read out of the oracle
//! (`submodules/svelte` `7bc0a70fe64d`, `VERSION 5.57.0`, `dev: false`) rather
//! than reasoned about, and the corpus gate cannot see any of it: `verify.mjs`
//! compares with `CommentPolicy::Ignore`, so a comment that moves scores
//! `match`. The guard has to be a test.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

fn assert_both(source: &str, expected: &str) {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = code(source, generate);
        assert!(
            code.contains(expected),
            "{generate:?} missing {expected:?}:\n{code}"
        );
    }
}

/// The shape #4398 reported. On the server the declaration survives and carries
/// the comments inside its pattern; on the client the props lowering deletes the
/// declaration, so they come out ahead of the first statement it kept.
#[test]
fn a_destructured_props_declaration_keeps_the_comments_inside_its_pattern() {
    const SOURCE: &str = "<script lang=\"ts\">\n\tlet { a }: { /* c */ a?: number } = $props();\n</script>\n<i>{a}</i>\n";
    assert!(
        code(SOURCE, GenerateMode::Server).contains("let { a /* c */ /* c */ } = $$props;"),
        "{}",
        code(SOURCE, GenerateMode::Server)
    );
    assert!(
        code(SOURCE, GenerateMode::Client).contains("var /* c */\n\t/* c */\n\ti = root();"),
        "{}",
        code(SOURCE, GenerateMode::Client)
    );
}

#[test]
fn the_bracket_is_the_pattern_s_own_whatever_it_contains() {
    assert_both(
        "<script lang=\"ts\">\n\tlet { a, b }: { /* c */ a?: number; b?: number } = { a: 1, b: 2 };\n</script>\n<i>{a}{b}</i>\n",
        "let { a, b /* c */ /* c */ } = { a: 1, b: 2 };",
    );
    assert_both(
        "<script lang=\"ts\">\n\tlet { a: { b } }: { /* c */ a: { b: number } } = { a: { b: 1 } };\n</script>\n<i>{b}</i>\n",
        "let { a: { b } /* c */ /* c */ } = { a: { b: 1 } };",
    );
    assert_both(
        "<script lang=\"ts\">\n\tlet { a = 1 }: { /* c */ a?: number } = {};\n</script>\n<i>{a}</i>\n",
        "let { a = 1 /* c */ /* c */ } = {};",
    );
    assert_both(
        "<script lang=\"ts\">\n\tlet [a]: { /* c */ b?: number }[] = [{ b: 1 }];\n</script>\n<i>{a.b}</i>\n",
        "let [a /* c */ /* c */] = [{ b: 1 }];",
    );
}

/// A parameter is the same rule: the pattern owns the flush point, and nothing
/// about a declarator's initializer is involved.
#[test]
fn a_destructured_parameter_uses_its_own_bracket_too() {
    assert_both(
        "<script lang=\"ts\">\n\tfunction f({ a }: { /* c */ a?: number }) { return a; }\n\tlet n = f({ a: 1 });\n</script>\n<i>{n}</i>\n",
        "function f({ a /* c */ /* c */ }) {",
    );
    assert_both(
        "<script lang=\"ts\">\n\tconst f = ([a]: { /* c */ b?: number }[]) => a.b;\n\tlet n = f([{ b: 1 }]);\n</script>\n<i>{n}</i>\n",
        "const f = ([a /* c */ /* c */]) => a.b;",
    );
}

/// Only a comment in the annotation's HEAD is doubled — the repeat is
/// acorn-typescript's speculation over the type literal's opening, not a
/// property of the flush point — so a trailing one must arrive once.
#[test]
fn a_trailing_comment_in_the_annotation_is_not_doubled() {
    assert_both(
        "<script lang=\"ts\">\n\tlet { a }: { a?: number /* c */ } = { a: 1 };\n</script>\n<i>{a}</i>\n",
        "let { a /* c */ } = { a: 1 };",
    );
}

/// The negative control, and the reason the rule is keyed on the pattern rather
/// than on "a declarator with an erased annotation": an identifier binding has
/// no bracket, so upstream holds the comment until the initializer and this
/// line must NOT move into the declaration.
#[test]
fn an_identifier_binding_still_flushes_at_its_initializer() {
    assert_both(
        "<script lang=\"ts\">\n\tlet a: { /* c */ b?: number } = { b: 1 };\n</script>\n<i>{a.b}</i>\n",
        "let a = /* c */ /* c */ { b: 1 };",
    );
}

/// A source with no comment at all must come back with no re-emission, so a
/// compiler that prints `/* c */` unconditionally cannot satisfy the rows above.
#[test]
fn the_assertions_read_a_real_axis() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = code(
            "<script lang=\"ts\">\n\tlet { a }: { a?: number } = { a: 1 };\n</script>\n<i>{a}</i>\n",
            generate,
        );
        assert!(!code.contains("/* c */"), "{code}");
        assert!(code.contains("let { a } = { a: 1 };"), "{code}");
    }
}

/// Residue: an IDENTIFIER parameter's annotation comment. Upstream holds it to
/// the end of the parameter list (`function f(a /* c */ /* c */) {`) because an
/// identifier has no closing token of its own; rsvelte re-emits it in place and
/// breaks the second copy onto its own line. Pinned rather than left
/// unexamined — when it is fixed this fails and the row moves above.
#[test]
fn an_identifier_parameter_is_still_wrong() {
    let source = "<script lang=\"ts\">\n\tfunction f(a: { /* c */ b?: number }) { return a.b; }\n\tlet n = f({ b: 1 });\n</script>\n<i>{n}</i>\n";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = code(source, generate);
        assert!(!code.contains("function f(a /* c */ /* c */) {"), "{code}");
        assert!(code.contains("function f(a /* c */\n"), "{code}");
    }
}
