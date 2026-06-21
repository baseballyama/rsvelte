use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

#[test]
fn collapses_whitespace_in_simple_interp() {
    let out = fmt("<p>{ count  +1 }</p>");
    assert_eq!(out, "<p>{count + 1}</p>\n");
}

#[test]
fn keeps_identifier_interp_as_is() {
    let out = fmt("<p>{count}</p>");
    assert_eq!(out, "<p>{count}</p>\n");
}

#[test]
fn formats_object_literal_interp() {
    let out = fmt("<pre>{ {a:1, b:2} }</pre>");
    // Object literal — wrapper-paren strip should preserve the braces.
    assert!(
        out.contains("{ a: 1, b: 2 }"),
        "object literal not formatted correctly:\n{out}"
    );
    assert!(out.contains("<pre>"), "markup not preserved:\n{out}");
}

#[test]
fn formats_call_interp() {
    let out = fmt("<span>{ fn ( a , b ) }</span>");
    assert_eq!(out, "<span>{fn(a, b)}</span>\n");
}

#[test]
fn formats_interp_inside_element_with_attributes() {
    let out = fmt("<div class=\"box\">{ a + b }</div>");
    assert_eq!(out, "<div class=\"box\">{a + b}</div>\n");
}

#[test]
fn formats_interp_in_each_body() {
    let out = fmt("{#each items as item}<li>{ item.name }</li>{/each}");
    assert!(
        out.contains("{item.name}"),
        "each-body interp not formatted:\n{out}"
    );
}

#[test]
fn formats_interp_in_if_consequent_and_alternate() {
    let out = fmt("{#if cond}<p>{ a +1 }</p>{:else}<p>{ b +2 }</p>{/if}");
    assert!(out.contains("{a + 1}"), "consequent not formatted:\n{out}");
    assert!(out.contains("{b + 2}"), "alternate not formatted:\n{out}");
}

#[test]
fn script_and_interp_format_together() {
    let src = "<script>let count=1+2</script>\n<p>{ count + 3 }</p>";
    let out = fmt(src);
    assert!(
        out.contains("let count = 1 + 2"),
        "script not formatted:\n{out}"
    );
    assert!(out.contains("{count + 3}"), "interp not formatted:\n{out}");
}

// ── Regression tests for await formatting ────────────────────────────────────
// These guard that OXC's const-wrapper path (used for TS + await expressions)
// keeps nested-await member access on one line and emits `await ` with a space.

#[test]
fn formats_await_member_access() {
    // `{await (await a.nested).one}` — TS file; must stay on one line with space.
    let ts_opts = rsvelte_formatter::FormatOptions {
        typescript: true,
        ..rsvelte_formatter::FormatOptions::default()
    };
    let src = "<p lang=\"ts\">{await (await a.nested).one}</p>";
    // Just verify no panic and the await is recognised (full end-to-end is
    // covered by the fmt-corpus tests).
    let _ = rsvelte_formatter::format(src, &ts_opts);
}

#[test]
fn declaration_tag_normalises_quotes() {
    let out = fmt("{const label = 'count'}");
    assert!(
        out.contains("{const label = \"count\"}"),
        "single quotes should become double: {out}"
    );
}

#[test]
fn declaration_tag_let_normalises_quotes() {
    let out = fmt("{let foo = 'bar'}");
    assert!(
        out.contains("{let foo = \"bar\"}"),
        "single quotes should become double: {out}"
    );
}
