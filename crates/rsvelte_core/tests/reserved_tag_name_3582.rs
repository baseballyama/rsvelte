//! Regression tests for #3582 — an element whose tag name is a JS reserved word
//! became a generated variable of that name, so `<var>x</var>` emitted
//! `var var = root();`.
//!
//! Upstream's `Scope.unique` (`phases/scope.js:728-734`) advances past a
//! candidate name while any of FOUR tests hold: the scope's references, its
//! declarations, the root conflict set, and `is_reserved`. rsvelte's
//! `Memoizer::generate_id` had the first three, so the first `<var>` in a
//! component took the free-name fast path and returned `var` verbatim.
//!
//! What makes it worth a test rather than a one-line diff is the failure mode:
//! `compile()` returns successfully and the output is not JavaScript, so the
//! error surfaces at bundle time or as a blank page. The server is unaffected
//! — it never names a variable after the tag — and `<svelte:element this="var">`
//! is unaffected because its variable comes from a different path, which is
//! what says this is the allocator and not the parser.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(markup: &str, dev: bool) -> String {
    let src = format!("<script>\n\tlet v = $state(1);\n\tlet el;\n</script>\n{markup}\n");
    compile(
        &src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The `var <name> = ` declarations the component body opens with.
fn declared_names(code: &str) -> Vec<String> {
    code.lines()
        .filter_map(|line| line.trim().strip_prefix("var "))
        .filter_map(|rest| rest.split(" =").next())
        .map(|name| name.to_string())
        .collect()
}

/// A reserved word never becomes a generated name; it takes the suffix path.
#[test]
fn a_reserved_tag_name_is_suffixed() {
    for tag in [
        "var",
        "switch",
        "class",
        "function",
        "if",
        "this",
        "null",
        "true",
        "await",
        "yield",
        "static",
        "enum",
        "eval",
        "arguments",
        "implements",
        "package",
    ] {
        for dev in [false, true] {
            let code = compile_client(&format!("<{tag}>x</{tag}>"), dev);
            let names = declared_names(&code);
            assert!(
                names.iter().any(|n| n == &format!("{tag}_1")),
                "expected {tag}_1 for <{tag}> (dev={dev}) in:\n{code}"
            );
            assert!(
                !names.iter().any(|n| n == tag),
                "expected no bare `var {tag}` (dev={dev}) in:\n{code}"
            );
        }
    }
}

/// The other direction, and the reason `is_reserved` is a table rather than a
/// "looks like a keyword" test: these four are contextual keywords, not
/// reserved words, so they keep the bare identifier.
#[test]
fn a_contextual_keyword_tag_keeps_the_bare_name() {
    for tag in ["async", "of", "get", "set", "div", "template"] {
        let code = compile_client(&format!("<{tag}>x</{tag}>"), false);
        assert!(
            declared_names(&code).iter().any(|n| n == tag),
            "expected a bare `var {tag}` in:\n{code}"
        );
    }
}

/// A hyphenated tag reaches `generate_id_slow`'s sanitizer instead of the fast
/// path — the second allocator the same omission sat in — and its sanitized
/// form is not reserved, so it must not be suffixed either.
#[test]
fn a_sanitized_tag_name_is_unchanged() {
    let code = compile_client("<my-tag>x</my-tag>", false);
    assert!(
        declared_names(&code).iter().any(|n| n == "my_tag"),
        "expected a bare `var my_tag` in:\n{code}"
    );
}

/// Two siblings of the same reserved name take the next two suffixes, which is
/// the row that says the suffix counter is shared with the rejected base rather
/// than restarted.
#[test]
fn two_reserved_siblings_take_successive_suffixes() {
    // Both need an expression: a purely static element needs no variable at all.
    let code = compile_client("<var>{v}</var>\n<var>{v}</var>", false);
    let names = declared_names(&code);
    assert!(
        names.iter().any(|n| n == "var_1") && names.iter().any(|n| n == "var_2"),
        "expected var_1 and var_2 in:\n{code}"
    );
}

/// `<svelte:element this="var">` names its variable from a different path and
/// was always correct. Recorded so the next reader does not read the fix as
/// "the tag name is sanitized somewhere central".
#[test]
fn svelte_element_was_never_affected() {
    let code = compile_client("<svelte:element this=\"var\">{v}</svelte:element>", false);
    assert!(
        code.contains("$.element("),
        "expected the dynamic-element path in:\n{code}"
    );
    assert!(
        !declared_names(&code).iter().any(|n| n == "var"),
        "unexpected bare `var var` in:\n{code}"
    );
}

/// The server never names a variable after the tag, so its output is the
/// positive control that this is a client allocator decision.
#[test]
fn the_server_output_is_unchanged() {
    let src = "<script>\n\tlet v = $state(1);\n</script>\n<var>{v}</var>\n";
    let code = compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    assert!(code.contains("<var>1</var>"), "in:\n{code}");
}
