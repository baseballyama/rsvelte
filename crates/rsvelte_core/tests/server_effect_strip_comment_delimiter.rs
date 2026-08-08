//! A delimiter inside a comment ended the `$effect(…)` the server module path
//! deletes, so the deletion cut the call in half.
//!
//! `strip_effects_from_source` locates the end of `$effect(` with
//! `client::find_matching_paren`, which counts every `)` byte. A `)` inside a
//! comment in the effect body closed the count early; the text removed then
//! stopped mid-body and everything after the phantom `)` — including the tail of
//! the comment itself — was emitted as code. `// ) c` left a bare `c` statement
//! followed by the rest of the block, which no JS parser accepts. The #2253
//! class, at a site the #2434 sweep did not reach because it counts through a
//! different helper.
//!
//! Found by the corpus mutation sweep (#2601) on
//! `bits-ui/…/scroll-area/scroll-area.svelte.ts`, whose mutant is exactly this
//! shape.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn compile_server(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            generate: GenerateMode::Server,
            filename: Some("m.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .expect("module should compile")
    .js
    .code
}

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

/// The reported shape: a line comment carrying `)` inside the effect body.
#[test]
fn a_close_paren_in_a_line_comment_does_not_end_the_effect() {
    let out = compile_server(
        "export function make() {\n  let n = $state(0);\n  $effect(() => {\n    // ) c\n    n += 1;\n  });\n  return () => n;\n}\n",
    );
    assert_parses(&out, "line comment with `)`");
    assert!(!out.contains("n += 1"), "effect body survived:\n{out}");
}

/// The same through a block comment, and with the delimiter after real text so
/// a fix that only skipped a comment *starting* with `)` would not cover it.
#[test]
fn a_close_paren_in_a_block_comment_does_not_end_the_effect() {
    let out = compile_server(
        "export function make() {\n  let n = $state(0);\n  $effect(() => {\n    /* keep ) going */\n    n += 1;\n  });\n  return () => n;\n}\n",
    );
    assert_parses(&out, "block comment with `)`");
    assert!(!out.contains("n += 1"), "effect body survived:\n{out}");
}

/// A string literal is the other opaque region the byte counter walked into.
#[test]
fn a_close_paren_in_a_string_does_not_end_the_effect() {
    let out = compile_server(
        "export function make() {\n  let n = $state(0);\n  $effect(() => {\n    log(\")\");\n    n += 1;\n  });\n  return () => n;\n}\n",
    );
    assert_parses(&out, "string with `)`");
    assert!(!out.contains("n += 1"), "effect body survived:\n{out}");
}

/// `$effect.pre` and `$effect.root` are deleted by the same helper with their
/// own needles, so each needs its own case — fixing one call site would leave
/// the other two counting bytes.
#[test]
fn effect_pre_and_root_are_covered_too() {
    let pre = compile_server(
        "export function make() {\n  let n = $state(0);\n  $effect.pre(() => {\n    // ) c\n    n += 1;\n  });\n  return () => n;\n}\n",
    );
    assert_parses(&pre, "$effect.pre");
    assert!(!pre.contains("n += 1"), "$effect.pre body survived:\n{pre}");

    let root = compile_server(
        "export function make() {\n  let n = $state(0);\n  $effect.root(() => {\n    // ) c\n    n += 1;\n  });\n  return () => n;\n}\n",
    );
    assert_parses(&root, "$effect.root");
    assert!(
        !root.contains("n += 1"),
        "$effect.root body survived:\n{root}"
    );
}

/// The control: with no delimiter in the comment the effect was already deleted
/// correctly, so this pins that the fix did not change the working case — and
/// it is the case a fix that deleted too much would break.
#[test]
fn a_plain_comment_in_the_effect_body_still_deletes_exactly_the_effect() {
    let out = compile_server(
        "export function make() {\n  let n = $state(0);\n  $effect(() => {\n    // plain\n    n += 1;\n  });\n  return () => n;\n}\n",
    );
    assert_parses(&out, "plain comment");
    assert!(!out.contains("n += 1"), "effect body survived:\n{out}");
    assert!(
        out.contains("return () => n;"),
        "the statement after the effect was consumed:\n{out}"
    );
}

/// The other direction: the statement *after* the effect must survive when the
/// body carries a delimiter too. Without this, a matcher that ran past the real
/// `)` would pass every assertion above by deleting more than the effect.
#[test]
fn the_statement_after_the_effect_survives_a_delimiter_comment() {
    let out = compile_server(
        "export function make() {\n  let n = $state(0);\n  $effect(() => {\n    // ) c\n    n += 1;\n  });\n  const after = 7;\n  return () => n + after;\n}\n",
    );
    assert_parses(&out, "statement after the effect");
    assert!(out.contains("const after = 7;"), "over-deleted:\n{out}");
}
