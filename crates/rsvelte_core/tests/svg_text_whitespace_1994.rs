//! Regression tests for issue #1994 — whitespace between the children of an SVG
//! `<text>` element was dropped.
//!
//! Upstream `clean_nodes` excludes `<text>` from the "SVG namespace ⇒ drop
//! whitespace-only text" rule twice: once for the direct parent
//! (`parent.name !== 'text'`) and once for every ancestor
//! (`!path.some((n) => n.type === 'RegularElement' && n.name === 'text')`). The
//! client static-template builder implemented neither, and the shared
//! `clean_nodes` / server `clean_whitespace` only implemented the direct-parent
//! half. Expected strings are taken from the official compiler.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn code(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn assert_both(src: &str, client: &str, server: &str) {
    let out = code(src, GenerateMode::Client);
    assert!(
        out.contains(client),
        "client: expected\n{client}\ngot:\n{out}"
    );
    let out = code(src, GenerateMode::Server);
    assert!(
        out.contains(server),
        "server: expected\n{server}\ngot:\n{out}"
    );
}

/// Nested `<svg>` goes through the static-template builder.
#[test]
fn whitespace_between_text_children_survives_when_nested() {
    assert_both(
        "<div>\n\t<svg>\n\t\t<text><tspan>a</tspan> <tspan>b</tspan></text>\n\t</svg>\n</div>\n",
        "<div><svg><text><tspan>a</tspan> <tspan>b</tspan></text></svg></div>",
        "<div><svg><text><tspan>a</tspan> <tspan>b</tspan></text></svg></div>",
    );
}

/// The same markup with `<svg>` as the fragment root.
#[test]
fn whitespace_between_text_children_survives_at_root() {
    assert_both(
        "<svg>\n\t<text><tspan>a</tspan> <tspan>b</tspan></text>\n</svg>\n",
        "$.from_svg(`<svg><text><tspan>a</tspan> <tspan>b</tspan></text></svg>`)",
        "<svg><text><tspan>a</tspan> <tspan>b</tspan></text></svg>",
    );
}

/// The ancestor half of the exclusion: the whitespace sits between grandchildren
/// of `<text>`, so the direct parent is `<tspan>`.
#[test]
fn whitespace_survives_below_a_text_descendant() {
    assert_both(
        "<svg>\n\t<text><tspan><tspan>a</tspan> <tspan>b</tspan></tspan></text>\n</svg>\n",
        "$.from_svg(`<svg><text><tspan><tspan>a</tspan> <tspan>b</tspan></tspan></text></svg>`)",
        "<svg><text><tspan><tspan>a</tspan> <tspan>b</tspan></tspan></text></svg>",
    );
}

/// A block fragment inside `<text>` gets its own template, which must inherit the
/// ancestor flag.
#[test]
fn whitespace_survives_in_a_block_inside_text() {
    assert_both(
        "<script>let { x } = $props();</script>\n<svg>\n\t<text>{#if x}<tspan>a</tspan> <tspan>b</tspan>{/if}</text>\n</svg>\n",
        "$.from_svg(`<tspan>a</tspan> <tspan>b</tspan>`, 1)",
        "<tspan>a</tspan> <tspan>b</tspan>",
    );
}

/// Control: without a `<text>` ancestor the SVG rule still drops the whitespace.
#[test]
fn whitespace_between_plain_svg_children_is_still_dropped() {
    assert_both(
        "<svg>\n\t<g><circle /> <circle /></g>\n</svg>\n",
        "$.from_svg(`<svg><g><circle></circle><circle></circle></g></svg>`)",
        "<svg><g><circle></circle><circle></circle></g></svg>",
    );
}

/// Dynamic children take the shared `clean_nodes` path instead of the static
/// builder — direct parent `<text>`.
#[test]
fn whitespace_survives_in_text_with_dynamic_children() {
    assert_both(
        "<script>let { x } = $props();</script>\n<svg>\n\t<text><tspan>{x}</tspan> <tspan>b</tspan></text>\n</svg>\n",
        "$.from_svg(`<svg><text><tspan> </tspan> <tspan>b</tspan></text></svg>`)",
        "<svg><text><tspan>${$.escape(x)}</tspan> <tspan>b</tspan></text></svg>",
    );
}

/// Same, one level deeper: `clean_nodes` sees `<tspan>` as the parent and must
/// consult the ancestor flag.
#[test]
fn whitespace_survives_below_text_with_dynamic_children() {
    assert_both(
        "<script>let { x } = $props();</script>\n<svg>\n\t<text><tspan><tspan>{x}</tspan> <tspan>b</tspan></tspan></text>\n</svg>\n",
        "$.from_svg(`<svg><text><tspan><tspan> </tspan> <tspan>b</tspan></tspan></text></svg>`)",
        "<svg><text><tspan><tspan>${$.escape(x)}</tspan> <tspan>b</tspan></tspan></text></svg>",
    );
}

/// Control for the dynamic path.
#[test]
fn whitespace_between_plain_svg_dynamic_children_is_still_dropped() {
    assert_both(
        "<script>let { x } = $props();</script>\n<svg>\n\t<g><circle /><tspan>{x}</tspan> <circle /></g>\n</svg>\n",
        "$.from_svg(`<svg><g><circle></circle><tspan> </tspan><circle></circle></g></svg>`)",
        "<svg><g><circle></circle><tspan>${$.escape(x)}</tspan><circle></circle></g></svg>",
    );
}
