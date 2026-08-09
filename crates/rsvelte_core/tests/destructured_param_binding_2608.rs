//! A prop name in a binding slot of a destructuring parameter is a declaration.
//!
//! The client prop-read rewriter decided "shorthand object-literal property"
//! from the two characters around the identifier, so a name inside a parameter
//! pattern was expanded (`({ id: id() }) =>`) or wrapped (`([id(), n]) =>`) —
//! binding patterns no JS parser accepts. Only the legacy `$:` statement routes
//! an expression through that rewriter, which is why the same shapes in a
//! function body or a template expression were already correct.
//!
//! The second half is the harder one: a name that only *looks* like it sits in a
//! pattern — a default value, a computed key, an object literal defaulting a
//! parameter — is a read and must keep its `id()`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(statement: &str) -> String {
    let source = format!(
        "<script>\n  export let id;\n  export let items;\n  {statement}\n</script>\n\n<p>{{out}}</p>\n"
    );
    compile(
        &source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

#[track_caller]
fn assert_emits(statement: &str, expected: &str) {
    let out = client(statement);
    assert!(
        out.contains(expected),
        "expected `{expected}` from `{statement}`:\n{out}"
    );
}

#[test]
fn a_pattern_slot_is_never_wrapped() {
    for (statement, expected) in [
        (
            "$: out = items.find(({ id }) => id);",
            "items().find(({ id }) => id)",
        ),
        (
            "$: out = items.map(([id, n]) => n);",
            "items().map(([id, n]) => n)",
        ),
        (
            "$: out = items.map(({ a: { id } }) => id);",
            "items().map(({ a: { id } }) => id)",
        ),
        (
            "$: out = items.map(({ ...id }) => id);",
            "items().map(({ ...id }) => id)",
        ),
        (
            "$: out = items.map(([...id]) => id);",
            "items().map(([...id]) => id)",
        ),
        (
            "$: out = items.map(({ items: id }) => id);",
            "items().map(({ items: id }) => id)",
        ),
        (
            "$: out = items.map(function pick({ id }) { return id; });",
            "function pick({ id })",
        ),
    ] {
        assert_emits(statement, expected);
    }
}

#[test]
fn a_read_that_sits_inside_a_pattern_still_wraps() {
    for (statement, expected) in [
        (
            "$: out = items.map(({ n = id }) => n);",
            "items().map(({ n = id() }) => n)",
        ),
        (
            "$: out = items.map(([n = id]) => n);",
            "items().map(([n = id()]) => n)",
        ),
        (
            "$: out = items.map(({ [id]: n }) => n);",
            "items().map(({ [id()]: n }) => n)",
        ),
        (
            "$: out = items.map((o = { id }) => o);",
            "items().map((o = { id: id() }) => o)",
        ),
        ("$: out = ({ id });", "$.set(out, { id: id() })"),
    ] {
        assert_emits(statement, expected);
    }
}
