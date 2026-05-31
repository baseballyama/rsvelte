//! Regression test for parsing `{#each ... as const as alias}` (and related
//! TypeScript-cast cases) in each-block headers.
//!
//! Bug: rsvelte's each-block header scanner stopped at the FIRST top-level
//! ` as `, treating `as const as item` as alias = `const as item`. Upstream
//! Svelte parses the iterable greedily so the alias separator is the LAST
//! top-level ` as `. We mirror that with a right-most-` as ` scan.

use svelte_compiler_rust::ast::arena::with_serialize_arena;
use svelte_compiler_rust::{ParseOptions, convert_to_legacy, parse};

/// Compile-time invariant: `serialize_to_json` produces a JSON tree where the
/// each-block context (alias) is recognisable. We just check the rendered
/// JSON contains the alias name and the iterable expression text.
fn compile_each_alias(source: &str) -> String {
    let ast = parse(source, ParseOptions::default()).expect("parse");
    let arena_ptr = &ast.arena as *const _;
    // SAFETY: `ast` is owned for the duration of the closure; the raw
    // pointer just satisfies the borrow checker since we then move
    // `ast` into the closure via the `convert_to_legacy` call below.
    let arena_ref = unsafe { &*arena_ptr };
    with_serialize_arena(arena_ref, || {
        let legacy = convert_to_legacy(source, ast);
        serde_json::to_string(&legacy).expect("serialize")
    })
}

#[test]
fn each_block_with_as_const_alias() {
    // The TypeScript `as const` is part of the iterable expression; the alias
    // is `tab`. Prior to the fix the parser split at the first ` as ` and
    // produced `context = (const as tab)`.
    let src = r#"{#each ['a', 'b'] as const as tab (tab)}<span>{tab}</span>{/each}"#;
    let out = compile_each_alias(src);
    // Alias appears as `"name":"tab"` in the AST output.
    assert!(
        out.contains(r#""name":"tab""#),
        "alias should be `tab`, got:\n{out}"
    );
    // The stray `const` should NOT appear as an identifier — it would mean
    // the alias was parsed as `const as tab`.
    assert!(
        !out.contains(r#""name":"const""#),
        "`const` should not be parsed as an alias identifier:\n{out}"
    );
}

#[test]
fn each_block_with_as_typeannotation_alias() {
    // Same shape with a named TS type annotation instead of `const`.
    let src = r#"{#each items as readonly string[] as item}<p>{item}</p>{/each}"#;
    let out = compile_each_alias(src);
    assert!(
        out.contains(r#""name":"item""#),
        "alias should be `item`, got:\n{out}"
    );
}

#[test]
fn each_block_without_typescript_cast_still_works() {
    // Plain case — single ` as ` is the alias separator (no regression).
    let src = r#"{#each items as item}<p>{item}</p>{/each}"#;
    let out = compile_each_alias(src);
    assert!(
        out.contains(r#""name":"item""#),
        "alias should be `item`, got:\n{out}"
    );
}

#[test]
fn each_block_destructured_alias_still_works() {
    // Object-pattern alias.
    let src = r#"{#each items as { name, age }}<p>{name}</p>{/each}"#;
    let out = compile_each_alias(src);
    assert!(out.contains(r#""name":"name""#));
    assert!(out.contains(r#""name":"age""#));
}
