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
//! (`submodules/svelte` `636eaaaa6`, `VERSION 5.57.1`, `dev: false`) rather
//! than reasoned about, and the corpus gate cannot see any of it: `verify.mjs`
//! compares with `CommentPolicy::Ignore`, so a comment that moves scores
//! `match`. The guard has to be a test.
//!
//! Through Svelte 5.57.0 every head comment here arrived twice, because
//! `@sveltejs/acorn-typescript@1.0.10`'s `tsLookAhead` fired `onComment` during
//! the speculative parse as well as after the rewind; 1.0.13 fixed it, so each
//! row now carries exactly one copy.

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
/// the comment inside its pattern; on the client the props lowering deletes the
/// declaration, so it comes out ahead of the first statement it kept.
#[test]
fn a_destructured_props_declaration_keeps_the_comment_inside_its_pattern() {
    const SOURCE: &str = "<script lang=\"ts\">\n\tlet { a }: { /* c */ a?: number } = $props();\n</script>\n<i>{a}</i>\n";
    assert!(
        code(SOURCE, GenerateMode::Server).contains("let { a /* c */ } = $$props;"),
        "{}",
        code(SOURCE, GenerateMode::Server)
    );
    assert!(
        code(SOURCE, GenerateMode::Client).contains("var /* c */\n\ti = root();"),
        "{}",
        code(SOURCE, GenerateMode::Client)
    );
}

#[test]
fn the_bracket_is_the_pattern_s_own_whatever_it_contains() {
    assert_both(
        "<script lang=\"ts\">\n\tlet { a, b }: { /* c */ a?: number; b?: number } = { a: 1, b: 2 };\n</script>\n<i>{a}{b}</i>\n",
        "let { a, b /* c */ } = { a: 1, b: 2 };",
    );
    assert_both(
        "<script lang=\"ts\">\n\tlet { a: { b } }: { /* c */ a: { b: number } } = { a: { b: 1 } };\n</script>\n<i>{b}</i>\n",
        "let { a: { b } /* c */ } = { a: { b: 1 } };",
    );
    assert_both(
        "<script lang=\"ts\">\n\tlet { a = 1 }: { /* c */ a?: number } = {};\n</script>\n<i>{a}</i>\n",
        "let { a = 1 /* c */ } = {};",
    );
    assert_both(
        "<script lang=\"ts\">\n\tlet [a]: { /* c */ b?: number }[] = [{ b: 1 }];\n</script>\n<i>{a.b}</i>\n",
        "let [a /* c */] = [{ b: 1 }];",
    );
}

/// A parameter is the same rule: the pattern owns the flush point, and nothing
/// about a declarator's initializer is involved.
#[test]
fn a_destructured_parameter_uses_its_own_bracket_too() {
    assert_both(
        "<script lang=\"ts\">\n\tfunction f({ a }: { /* c */ a?: number }) { return a; }\n\tlet n = f({ a: 1 });\n</script>\n<i>{n}</i>\n",
        "function f({ a /* c */ }) {",
    );
    assert_both(
        "<script lang=\"ts\">\n\tconst f = ([a]: { /* c */ b?: number }[]) => a.b;\n\tlet n = f([{ b: 1 }]);\n</script>\n<i>{n}</i>\n",
        "const f = ([a /* c */]) => a.b;",
    );
}

/// The flush point is the bracket, not the comment's offset inside the erased
/// annotation, so a comment at the annotation's tail lands where a comment at
/// its head does.
#[test]
fn a_trailing_comment_in_the_annotation_lands_at_the_same_bracket() {
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
        "let a = /* c */ { b: 1 };",
    );
    // The parameter form of the same rule: `a` has no bracket, so the comment
    // waits for the next located node — here the following parameter.
    assert_both(
        "<script lang=\"ts\">\n\tfunction f(a: { /* c */ b?: number }, z: number) { return a.b + z; }\n\tlet n = f({ b: 1 }, 2);\n</script>\n<i>{n}</i>\n",
        "function f(a, /* c */ z) {",
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

/// A sole identifier parameter has no following node, so the comment reaches
/// the parameter list's own closing token. This row was a pinned residue until
/// 5.57.1 removed the doubling; it is a matched cell now.
#[test]
fn a_sole_identifier_parameter_flushes_at_the_closing_paren() {
    assert_both(
        "<script lang=\"ts\">\n\tfunction f(a: { /* c */ b?: number }) { return a.b; }\n\tlet n = f({ b: 1 });\n</script>\n<i>{n}</i>\n",
        "function f(a /* c */) {",
    );
}
