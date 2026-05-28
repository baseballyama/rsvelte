//! Edge cases for the async-body statement transform (issue #442, H-039..H-043):
//! orphan `else` continuation, regex-literal scanning, multi-declarator await
//! splitting, post-await class hoisting, and nested-destructure leaf hoisting.

use svelte_compiler_rust::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

fn ssr_async(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: false,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// H-039: an `else` following the consequent's closing brace must stay attached
/// to its `if` rather than being split into an orphan `else` block.
#[test]
fn else_stays_attached_after_await() {
    let out = ssr_async(
        "<script>\nlet a = await fetch('x');\nlet x;\nif (a) { x = 1; } else { x = 2; }\n</script>\n{x}",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("} else {"), "if/else split apart:\n{out}");
}

/// H-040: a `/await/` regex literal must not be scanned as a top-level `await`
/// nor split a statement at a `/`-delimited token.
#[test]
fn regex_literal_not_treated_as_await() {
    let out =
        ssr_async("<script>\nlet a = await fetch('x');\nconst r = /await/;\n</script>\n{a}{r}");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("r = /await/"), "regex literal lost:\n{out}");
}

/// H-041: in `const fn = () => {}, value = await ...` only the awaited
/// declarator is hoisted/awaited; the sync declarator stays a plain `const`.
#[test]
fn multi_declarator_splits_only_awaited() {
    let out =
        ssr_async("<script>\nconst fn = () => {}, value = await fetch('x');\n</script>\n{value}");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("const fn = () => {}"),
        "sync declarator lost:\n{out}"
    );
    assert!(
        out.contains("var value"),
        "awaited declarator not hoisted:\n{out}"
    );
}

/// H-042: a `class` declaration after a top-level await is hoisted to the outer
/// scope and rewritten to `Name = class Name {…}` inside the thunk.
#[test]
fn class_declaration_hoisted_after_await() {
    let out = ssr_async(
        "<script>\nlet a = await fetch('x');\nclass Thing {}\nconst t = new Thing();\n</script>\n{a}{t}",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("Thing = class Thing"),
        "class not hoisted:\n{out}"
    );
}

/// H-043: nested destructuring hoists the *leaf* identifiers, not the nested
/// pattern — `const { x: { y } } = a` must hoist `y`, never `{ y }`.
#[test]
fn nested_destructure_hoists_leaf_idents() {
    let out =
        ssr_async("<script>\nlet a = await fetch('x');\nconst { x: { y } } = a;\n</script>\n{y}");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("var a, y;"), "leaf ident not hoisted:\n{out}");
}
