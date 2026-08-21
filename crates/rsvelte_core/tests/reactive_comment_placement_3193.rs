//! A comment written inside a legacy `$:` statement is flushed at the next
//! LOCATED node the server prints, not kept where the source put it: upstream
//! reorders `$:` statements after the declarations, so the comment's own
//! statement has already lost it by the time it is printed.
//!
//! Both shapes need a declaration the transform SYNTHESIZES after the reactive
//! statement — `export let p` (→ `$.fallback(…)`) and the implicit declaration
//! an undeclared `$: e2 = …` creates. A verbatim `let` / `const` / `function`
//! after it already matched.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code
}

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code
}

#[test]
fn comment_flushes_at_a_synthesized_prop_fallback() {
    let output = server(
        "<script>\n\texport let a = 1;\n\tlet d = 0;\n\t$: d = a /* c */ + 1;\n\texport let p = 0;\n</script>\n<b>{d}</b>\n",
    );

    assert!(
        output.contains("/* c */\n\tlet p = $.fallback($$props['p'], 0);"),
        "the comment must flush at the synthesized prop declaration:\n{output}"
    );
    assert!(
        output.contains("$: d = a + 1;"),
        "the reactive statement must no longer carry it:\n{output}"
    );
}

#[test]
fn comment_flushes_at_a_hoisted_legacy_reactive_declarator() {
    let output = server(
        "<script>\n\texport let a = 1;\n\tlet d = 0;\n\t$: d = a /* c */ + 1;\n\t$: e2 = d + 1;\n</script>\n<b>{d}{e2}</b>\n",
    );

    assert!(
        output.contains("let /* c */\n\te2;"),
        "the comment must split the hoisted declaration open:\n{output}"
    );
    assert!(
        output.contains("$: d = a + 1;"),
        "the reactive statement must no longer carry it:\n{output}"
    );
}

/// The hoisted declarator is printed FIRST, so it is the flush point for every
/// comment written before its `$: x = …` target — including one that precedes
/// the reactive statement entirely.
#[test]
fn hoisted_declarator_flushes_an_earlier_script_comment() {
    let output =
        server("<script>\n\t/* c */\n\tlet d = 0;\n\t$: e2 = d + 1;\n</script>\n<b>{e2}</b>\n");

    assert!(
        output.contains("let /* c */\n\te2;"),
        "the comment must flush at the hoisted declaration:\n{output}"
    );
    assert!(
        !output.contains("/* c */\n\tlet d = 0;"),
        "and must not also stay on its source statement:\n{output}"
    );
}

/// The client reorders too (`$.legacy_pre_effect` is emitted after the props),
/// and already agreed with upstream — pinned so a server-side change to the
/// shared comment machinery cannot move it.
#[test]
fn client_flushes_at_the_prop_declaration_too() {
    let output = client(
        "<script>\n\texport let a = 1;\n\tlet d = 0;\n\t$: d = a /* c */ + 1;\n\texport let p = 0;\n</script>\n<b>{d}</b>\n",
    );

    assert!(
        output.contains("/* c */\n\tlet p = $.prop($$props, 'p', 8, 0);"),
        "client output must be unchanged:\n{output}"
    );
}
