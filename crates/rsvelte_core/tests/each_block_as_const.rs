//! Regression test for parsing `{#each ... as const as alias}` (and related
//! TypeScript-cast cases) in each-block headers.
//!
//! Bug: rsvelte's each-block header scanner stopped at the FIRST top-level
//! ` as `, treating `as const as item` as alias = `const as item`. Upstream
//! Svelte parses the iterable greedily so the alias separator is the LAST
//! top-level ` as `. We mirror that with a right-most-` as ` scan.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, convert_to_legacy, parse};

/// Compile-time invariant: `serialize_to_json` produces a JSON tree where the
/// each-block context (alias) is recognisable. We just check the rendered
/// JSON contains the alias name and the iterable expression text.
fn compile_each_alias(source: &str) -> String {
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
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
    //
    // The iterable `['a', 'b'] as const` is now preserved as a `TSAsExpression`
    // (mirroring svelte/compiler's parse AST), so its `typeAnnotation` carries a
    // `TSTypeReference` to `const` — i.e. `"name":"const"` legitimately appears
    // inside the iterable and can no longer be used as a proxy. Assert the
    // each-block CONTEXT (the alias) directly instead.
    let src = r#"{#each ['a', 'b'] as const as tab (tab)}<span>{tab}</span>{/each}"#;
    let out = compile_each_alias(src);
    let value: serde_json::Value = serde_json::from_str(&out).expect("valid JSON");

    fn find_each(v: &serde_json::Value) -> Option<&serde_json::Value> {
        match v {
            serde_json::Value::Object(m) => {
                if m.get("type").and_then(|t| t.as_str()) == Some("EachBlock") {
                    return Some(v);
                }
                m.values().find_map(find_each)
            }
            serde_json::Value::Array(a) => a.iter().find_map(find_each),
            _ => None,
        }
    }
    let each = find_each(&value).expect("EachBlock present");
    // The alias (`context`) is the identifier `tab`, not `const`.
    assert_eq!(
        each.pointer("/context/name").and_then(|n| n.as_str()),
        Some("tab"),
        "each-block alias should be `tab`:\n{out}"
    );
    // The iterable expression is preserved as a `TSAsExpression` (greedy parse
    // to the right-most ` as `).
    assert_eq!(
        each.pointer("/expression/type").and_then(|t| t.as_str()),
        Some("TSAsExpression"),
        "iterable should be preserved as TSAsExpression:\n{out}"
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
