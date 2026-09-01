//! `transform_state_reads_ast` decides whether a `{ … }` body is an object
//! literal or a statement block by scanning for a top-level `;`. Semicolon-free
//! source (`standard` style) has none, so a `$: { void x }` block was wrapped in
//! `(`…`)` to force the expression goal, the parse then failed, and the whole
//! state-read pass was skipped — the dependency thunk still read `$.get(x)`
//! while the body read the bare variable.
//!
//! Both directions are asserted: an object-literal body must keep taking the
//! expression goal, or the fix would be "never wrap" rather than "let the
//! parser decide".

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

#[test]
fn a_semicolon_free_reactive_block_wraps_its_state_reads() {
    let code = client(
        "<script>\n  let w = 0\n  $: {\n    void w\n  }\n  function f (n) {\n    w = n\n  }\n</script>\n",
    );
    assert!(
        code.contains("void $.get(w);"),
        "expected the block body to read through `$.get`:\n{code}"
    );
}

/// The same block with an explicit `;` was always correct; without this row a
/// fix that stopped wrapping everything would still look green above.
#[test]
fn a_semicolon_terminated_reactive_block_is_unchanged() {
    let code = client(
        "<script>\n  let w = 0;\n  $: {\n    void w;\n  }\n  function f (n) {\n    w = n;\n  }\n</script>\n",
    );
    assert!(
        code.contains("void $.get(w);"),
        "expected the block body to read through `$.get`:\n{code}"
    );
}

/// A `$: obj = { a: w }` right-hand side is a real object literal reaching the
/// same predicate, and it has no top-level `;` either.
#[test]
fn an_object_literal_body_keeps_the_expression_goal() {
    let code = client(
        "<script>\n  let w = 0\n  let obj = {}\n  $: obj = { a: w }\n  function f (n) {\n    w = n\n  }\n</script>\n<p>{obj.a}</p>\n",
    );
    assert!(
        code.contains("$.set(obj, { a: $.get(w) })"),
        "expected the object literal to keep its key and wrap only the value:\n{code}"
    );
}
