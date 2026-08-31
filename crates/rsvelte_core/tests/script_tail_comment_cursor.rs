//! Comments at the end of an instance script follow esrap's comment cursor.
//!
//! The cursor is one index over the whole comment list, so the fate of a comment
//! no emitted statement flushes is decided by what the printer meets next:
//!
//! * server — the next node upstream keeps a `loc` on is the template
//!   expression, so the comment lands inside it; with no such expression the
//!   component body's own end flushes it (`#3080`, `#3098`);
//! * client — a `$:` statement becomes `$.legacy_pre_effect(…, () => { … })`
//!   whose block is builder-made, which parks the cursor past the end of the
//!   list, so the comment is dropped instead (`#3251`).

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn build(source: &str, generate: GenerateMode) -> String {
    let code = compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("component should compile")
    .js
    .code;
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &code, SourceType::mjs()).parse();
    assert!(
        !parsed.panicked && parsed.diagnostics.is_empty(),
        "output must parse:\n{code}"
    );
    code
}

fn server(source: &str) -> String {
    build(source, GenerateMode::Server)
}

fn client(source: &str) -> String {
    build(source, GenerateMode::Client)
}

/// Everything from the namespace import on, which is what upstream's own output
/// starts with once the hoisted preamble is skipped.
fn body(code: &str) -> &str {
    code.find("export default")
        .map_or(code, |start| &code[start..])
        .trim_end()
}

#[test]
fn server_reactive_same_line_trailing_comment_lands_in_the_template_expression() {
    let out = server(
        "<script>\n\texport let a = 1;\n\t$: doubled = a * 2; // trailing\n</script>\n\n<p>{doubled}</p>",
    );
    assert_eq!(
        body(&out),
        "export default function A($$renderer, $$props) {\n\tlet doubled;\n\tlet a = $.fallback($$props['a'], 1);\n\n\t$: doubled = a * 2;\n\n\t$$renderer.push(`<p>${$.escape(\n\t\t// trailing\n\t\tdoubled\n\t)}</p>`);\n\n\t$.bind_props($$props, { a });\n}"
    );
}

#[test]
fn server_reactive_own_line_trailing_comment_lands_in_the_template_expression() {
    let out = server(
        "<script>\n\texport let a = 1;\n\tlet b;\n\t$: b = a * 2;\n\t// tail\n</script>\n<div>{b}</div>",
    );
    assert_eq!(
        body(&out),
        "export default function A($$renderer, $$props) {\n\tlet a = $.fallback($$props['a'], 1);\n\tlet b;\n\n\t$: b = a * 2;\n\n\t$$renderer.push(`<div>${$.escape(\n\t\t// tail\n\t\tb\n\t)}</div>`);\n\n\t$.bind_props($$props, { a });\n}"
    );
}

#[test]
fn server_runes_trailing_comment_falls_back_to_the_component_tail() {
    let out = server(
        "<script>\n\tlet n = $state(0);\n\t// trailing script comment\n</script>\n\n<p>{n}</p>",
    );
    assert_eq!(
        body(&out),
        "export default function A($$renderer) {\n\tlet n = 0;\n\n\t$$renderer.push(`<p>0</p>`);\n\t// trailing script comment\n}"
    );
}

#[test]
fn server_legacy_trailing_comment_falls_back_to_the_component_tail() {
    let out =
        server("<script>\n\texport let a = 1;\n\tlet b = a;\n\t// tail\n</script>\n<div>x</div>");
    assert_eq!(
        body(&out),
        "export default function A($$renderer, $$props) {\n\tlet a = $.fallback($$props['a'], 1);\n\tlet b = a;\n\n\t$$renderer.push(`<div>x</div>`);\n\t$.bind_props($$props, { a });\n\t// tail\n}"
    );
}

/// A comment trailing a statement upstream keeps a `loc` on is flushed there, so
/// it must NOT be deferred — the negative control for the two tests above.
#[test]
fn server_same_line_comment_on_a_located_statement_stays_put() {
    let out =
        server("<script>\n\texport let a = 1;\n\tlet b = a; // same\n</script>\n<div>{b}</div>");
    assert!(
        out.contains("let b = a; // same"),
        "the comment left its statement:\n{out}"
    );
}

#[test]
fn client_trailing_comment_after_the_last_reactive_statement_is_dropped() {
    let out = client(
        "<script>\n\texport let a = 1;\n\tlet b;\n\t$: b = a * 2;\n\t// tail\n</script>\n<div>{b}</div>",
    );
    assert!(
        !out.contains("// tail"),
        "the builder-made effect block should have killed the comment:\n{out}"
    );
}

#[test]
fn client_a_block_bodied_reactive_statement_drops_it_too() {
    let out = client(
        "<script>\n\texport let a = 1;\n\tlet b;\n\t$: { b = a * 2; }\n\t/* tail */\n</script>\n<div>{b}</div>",
    );
    assert!(!out.contains("tail"), "comment survived:\n{out}");
}

#[test]
fn client_a_nested_reactive_block_revives_the_tail_comment() {
    let out = client(
        "<script>\n\texport let a = 1;\n\tlet b = 0;\n\t$: if (b > 2) {\n\t\tconsole.log(b);\n\t}\n\t/* tail */\n</script>\n<p>{b}</p>",
    );
    assert!(
        out.contains("var /* tail */\n\tp = root();"),
        "the located consequent should leave the comment for the root node:\n{out}"
    );
    assert_eq!(
        out.matches("/* tail */").count(),
        1,
        "comment duplicated:\n{out}"
    );
}

#[test]
fn client_drops_svelte_ignore_before_rebuilt_reactive_statements() {
    for reactive in ["$: b = a * 2;", "$: if (b > 2) { console.log(b); }"] {
        let source = format!(
            "<script>\n\texport let a = 1;\n\tlet b = 0;\n\t// svelte-ignore a11y_no_static_element_interactions\n\t{reactive}\n</script>\n<p>{{b}}</p>"
        );
        let out = client(&source);
        assert!(
            !out.contains("svelte-ignore"),
            "the rebuilt statement retained its ignore comment:\n{out}"
        );
        assert!(
            out.contains("$.legacy_pre_effect("),
            "the comment cleanup lost the reactive effect:\n{out}"
        );
    }
}

#[test]
fn client_two_trailing_comments_after_a_reactive_statement_are_both_dropped() {
    let out = client(
        "<script>\n\texport let a = 1;\n\tlet b;\n\t$: b = a * 2;\n\t// one\n\t// two\n</script>\n<div>{b}</div>",
    );
    assert!(
        !out.contains("// one") && !out.contains("// two"),
        "comments survived:\n{out}"
    );
}

/// With a statement left after it the comment re-homes onto that statement, which
/// is printed before the effect kills the cursor.
#[test]
fn client_a_surviving_successor_keeps_the_comment() {
    let out = client(
        "<script>\n\texport let a = 1;\n\tlet b;\n\t$: b = a * 2;\n\t// tail\n\tlet z = 1;\n</script>\n<div>{b}{z}</div>",
    );
    assert!(
        out.contains("// tail\n\tlet z = 1;"),
        "the comment did not re-home onto its successor:\n{out}"
    );
}

/// Without a `$:` nothing kills the cursor, so the comment is kept.
#[test]
fn client_a_trailing_comment_without_a_reactive_statement_is_kept() {
    let out =
        client("<script>\n\texport let a = 1;\n\tlet b = a;\n\t// tail\n</script>\n<div>{b}</div>");
    assert!(out.contains("// tail"), "comment was dropped:\n{out}");
}
