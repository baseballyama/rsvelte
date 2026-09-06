//! A diagnostic only the `(…)` expression wrapper produced is not acorn's
//! (#4083).
//!
//! `parse_expression_with_typescript` wraps a tag body as `(<body>\n)` so OXC
//! parses it as an expression. That `(`
//! can also open an arrow parameter list, and for `accessor satisfies string`
//! OXC takes it: it reports `TS(1090)` for a parameter modifier and then a
//! plain `Expected ',' or ')' but found 'string'`, aborting with an empty
//! program. Neither the rule table nor any diagnostic filter can reach that —
//! the second diagnostic carries no TS scope and there is no AST left.
//!
//! The retry replaces the `(` with a newline, which is the same one byte, so
//! every `-1` adjustment downstream stays correct. It is accepted only when the
//! result is one `ExpressionStatement` whose statement ends where its
//! expression ends, which is exactly what `parseExpressionAt` consumes — a `;`
//! is code, so `{a;}` keeps failing.
//!
//! The retry belongs on the conversion path and nowhere else. Ablating it
//! leaves every host rejected; putting the same retry in
//! `check_js_parse_error_with_pos` as well moves nothing — 200 generated cells
//! and 142,900 corpus units are byte-identical with and without it — so the
//! second copy is not shipped. The failure the conversion path alone prevents
//! is `$.set_attribute(p, 'title', );`, text no JS parser accepts.
//!
//! Every expectation is the line `svelte.compile` emits for that source, read
//! out of `submodules/svelte`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_with(src: &str, generate: GenerateMode) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|error| error.to_string())
}

fn client(src: &str) -> Result<String, String> {
    compile_with(src, GenerateMode::Client)
}

fn server(src: &str) -> Result<String, String> {
    compile_with(src, GenerateMode::Server)
}

/// `(host, source, the line upstream emits)`. One host per row, because a fix
/// that reaches the reported host and one neighbour looks exactly like a fix
/// that reaches all of them.
const CLIENT_HOSTS: &[(&str, &str, &str)] = &[
    (
        "mustache_accessor",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script><p>{accessor satisfies string}</p>",
        "$.template_effect(() => $.set_text(text, accessor));",
    ),
    (
        "mustache_declare",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script><p>{declare satisfies string}</p>",
        "$.template_effect(() => $.set_text(text, declare));",
    ),
    (
        "attribute",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script><p title={accessor satisfies string}>x</p>",
        "$.template_effect(() => $.set_attribute(p, 'title', accessor));",
    ),
    (
        "if_header",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script>{#if accessor satisfies string}y{/if}",
        "if (accessor) $$render(consequent);",
    ),
    (
        "const_tag",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script>{#if 1}{@const c = accessor satisfies string}{c}{/if}",
        "const c = $.derived_safe_equal(() => accessor);",
    ),
    (
        "each_collection",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script>{#each accessor satisfies string[] as z}{z}{/each}",
        "$.each(node, 1, () => accessor, $.index, ($$anchor, z) => {",
    ),
    (
        "render_arg",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script>{#snippet s(q)}{q}{/snippet}{@render s(declare satisfies string)}",
        "s($$anchor, () => declare);",
    ),
];

const SERVER_HOSTS: &[(&str, &str, &str)] = &[
    (
        "mustache_accessor",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script><p>{accessor satisfies string}</p>",
        "$$renderer.push(`<p>${$.escape(accessor)}</p>`);",
    ),
    (
        "mustache_declare",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script><p>{declare satisfies string}</p>",
        "$$renderer.push(`<p>${$.escape(declare)}</p>`);",
    ),
    (
        "attribute",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script><p title={accessor satisfies string}>x</p>",
        "$$renderer.push(`<p${$.attr('title', accessor)}>x</p>`);",
    ),
    (
        "if_header",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script>{#if accessor satisfies string}y{/if}",
        "if (accessor) {",
    ),
    (
        "const_tag",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script>{#if 1}{@const c = accessor satisfies string}{c}{/if}",
        "const c = accessor;",
    ),
    (
        "each_collection",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script>{#each accessor satisfies string[] as z}{z}{/each}",
        "const each_array = $.ensure_array_like(accessor);",
    ),
    (
        "render_arg",
        "<script lang=\"ts\">let accessor: any; let declare: any;</script>{#snippet s(q)}{q}{/snippet}{@render s(declare satisfies string)}",
        "s($$renderer, declare);",
    ),
];

#[test]
fn every_host_accepts_what_upstream_accepts() {
    for (host, source, expected) in CLIENT_HOSTS {
        let code = client(source).unwrap_or_else(|e| panic!("client {host}: rejected — {e}"));
        assert!(
            code.lines().any(|line| line.trim() == *expected),
            "client {host}: expected {expected:?}\n--- got ---\n{code}"
        );
    }
    for (host, source, expected) in SERVER_HOSTS {
        let code = server(source).unwrap_or_else(|e| panic!("server {host}: rejected — {e}"));
        assert!(
            code.lines().any(|line| line.trim() == *expected),
            "server {host}: expected {expected:?}\n--- got ---\n{code}"
        );
    }
}

/// The retry only fires when the `(…)` parse already failed, so the only
/// behaviour it can change is a rejection. These are what must not change with
/// it: each is a body upstream also rejects, and each fails a different half of
/// the acceptance test — a leftover token gives two statements, a `;` gives a
/// statement wider than its expression, and a genuinely broken body gives a
/// diagnostic the retry sees too.
const STILL_REJECTED: &[(&str, &str)] = &[
    ("leftover_identifier", "<script>let a;</script><p>{a b}</p>"),
    ("leftover_bracket", "<script>let a;</script><p>{a]}</p>"),
    ("trailing_semicolon", "<script>let a;</script><p>{a;}</p>"),
    ("trailing_operator", "<script>let a;</script><p>{a +}</p>"),
    ("broken_body", "<script>let a;</script><p>{(;}</p>"),
    ("two_lines", "<script>let a; let b;</script><p>{a\nb}</p>"),
    (
        "ts_in_plain_script",
        "<script>let accessor;</script><p>{accessor satisfies string}</p>",
    ),
];

#[test]
fn the_retry_widens_nothing_upstream_rejects() {
    for (case, source) in STILL_REJECTED {
        assert!(
            client(source).is_err(),
            "{case}: accepted, but upstream rejects it"
        );
        assert!(
            server(source).is_err(),
            "{case}: accepted on the server, but upstream rejects it"
        );
    }
}

/// The residue, pinned so it is not mistaken for this fix's scope: OXC cannot
/// parse `(accessor satisfies T)` at all — the source's own parenthesis
/// reproduces the arrow-parameter speculation the retry removes from ours, and
/// it aborts with an empty program, so a `<script>` carrying it is rejected too.
/// Reported upstream; every host below is the parenthesized twin of a row above.
#[test]
fn the_source_s_own_parenthesis_is_still_rejected() {
    for (case, source) in [
        (
            "plain_script",
            "<script lang=\"ts\">let accessor: any; const q = (accessor satisfies string);</script><p>{q}</p>",
        ),
        (
            "mustache",
            "<script lang=\"ts\">let accessor: any;</script><p>{(accessor satisfies string)}</p>",
        ),
        (
            "each_collection",
            "<script lang=\"ts\">let accessor: any;</script>{#each (accessor satisfies string) as z}{z}{/each}",
        ),
    ] {
        assert!(
            client(source).is_err(),
            "{case}: now accepted — if OXC has been fixed, move this row into CLIENT_HOSTS"
        );
    }
    // The same shape with any other name parses, so the rejection is OXC's
    // modifier speculation and not "a parenthesized `satisfies`".
    assert!(
        client(
            "<script lang=\"ts\">let foo: any; const q = (foo satisfies string);</script><p>{q}</p>"
        )
        .is_ok(),
        "a parenthesized `satisfies` on an ordinary name must still compile"
    );
}

/// A body the `(…)` wrapper already parses must reach the same output — the row
/// that fails if the retry is entered unconditionally rather than only after a
/// diagnostic.
#[test]
fn an_already_parsing_body_is_untouched() {
    for (case, source, expected) in [
        (
            "sequence",
            "<script>let a; let b;</script><p>{(a, b)}</p>",
            "$.template_effect(() => $.set_text(text, (a, b)));",
        ),
        (
            "object",
            "<script>let a;</script><p title={{ v: a }}>x</p>",
            "$.template_effect(() => $.set_attribute(p, 'title', { v: a }));",
        ),
        (
            "as_cast",
            "<script lang=\"ts\">let accessor: any;</script><p>{accessor as string}</p>",
            "$.template_effect(() => $.set_text(text, accessor));",
        ),
    ] {
        let code = client(source).unwrap_or_else(|e| panic!("{case}: rejected — {e}"));
        assert!(
            code.lines().any(|line| line.trim() == expected),
            "{case}: expected {expected:?}\n--- got ---\n{code}"
        );
    }
}
