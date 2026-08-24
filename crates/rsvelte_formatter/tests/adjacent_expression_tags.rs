//! A run of expression tags glued together shares one width budget.
//!
//! The oracle prints a fragment's children as a plain concatenation, so a tag's
//! group is measured against the rest of the line — and adjacent mustaches offer
//! no break opportunity of their own, so the first breakable one absorbs the
//! whole run. Every expectation below was measured against the
//! oxfmt(`svelte: true`) oracle.

use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

fn fmt(src: &str) -> String {
    let opts = FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(80u16).expect("valid line width"),
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    };
    let out = format(src, &opts).expect("format ok");
    out.strip_suffix('\n').map(str::to_string).unwrap_or(out)
}

#[test]
fn a_long_run_breaks_the_first_breakable_tag() {
    let src = "<button>\n\t{z.plain}{z.raw.a}{z.derived}{z.byDerived}{z.priv}{z['quoted key']}{Zoo.staticPlain}{w.inCtor}\n</button>";
    assert_eq!(
        fmt(src),
        "<button>\n  {z.plain}{z.raw.a}{z.derived}{z.byDerived}{z.priv}{z[\n    \"quoted key\"\n  ]}{Zoo.staticPlain}{w.inCtor}\n</button>"
    );
}

#[test]
fn whitespace_in_the_run_ends_the_shared_budget() {
    // A space is a break opportunity, so the trailing tags stop counting: the
    // line wraps there instead of breaking inside the computed member.
    let src = "<button>\n\t{z.plain}{z.raw.a}{z.derived}{z.byDerived}{z.priv}{z['quoted key']} {Zoo.staticPlain}{w.inCtor}\n</button>";
    assert_eq!(
        fmt(src),
        "<button>\n  {z.plain}{z.raw.a}{z.derived}{z.byDerived}{z.priv}{z[\"quoted key\"]}\n  {Zoo.staticPlain}{w.inCtor}\n</button>"
    );
}

#[test]
fn a_run_that_fits_is_left_alone() {
    let src = "<div>\n  {a[\"k1\"]}{b[\"k2\"]}{c[\"k3\"]}{d[\"k4\"]}{e[\"k5\"]}{f[\"k6\"]}{g[\"k7\"]}{h[\"k8\"]}\n</div>";
    assert_eq!(fmt(src), src);
}

#[test]
fn an_unbreakable_run_never_breaks() {
    // Every tag is a bare identifier, so there is nothing to break no matter how
    // far the line overflows.
    let src = "<div>\n  {aaa}{bbb}{ccc}{ddd}{eee}{fff}{ggg}{hhh}{iii}{jjj}{kkk}{lll}{mmm}{nnn}{ooo}{ppp}{qqq}\n</div>";
    assert_eq!(fmt(src), src);
}

#[test]
fn the_run_stops_at_the_first_breakable_follower() {
    // `{z.raw.a}` can break, but the fit test that decides it walks only as far
    // as `{z[`, where the computed member offers a break — so it stays flat.
    let src = "{z.plain}{z.raw.a}{z.derived}{z.byDerived}{z.priv}{z['quoted key']}{Zoo.staticPlain}{w.inCtor}";
    assert_eq!(
        fmt(src),
        "{z.plain}{z.raw.a}{z.derived}{z.byDerived}{z.priv}{z[\n  \"quoted key\"\n]}{Zoo.staticPlain}{w.inCtor}"
    );
}

#[test]
fn an_unbreakable_follower_is_charged_in_full() {
    let tail = "Z".repeat(70);
    assert_eq!(
        fmt(&format!("{{z.raw.a}}{{{tail}}}")),
        format!("{{z.raw\n  .a}}{{{tail}}}")
    );
    // One column shorter and the run still fits, so nothing breaks.
    let tail = "Z".repeat(60);
    let src = format!("{{z.raw.a}}{{{tail}}}");
    assert_eq!(fmt(&src), src);
}

#[test]
fn a_broken_tag_breaks_only_at_its_outermost_group() {
    // The run decides only THAT the tag breaks; how deep it breaks is settled by
    // the tag's own content, so a huge trailing run must not over-break it.
    let tail = "Z".repeat(140);
    assert_eq!(
        fmt(&format!("{{z.raw.a}}{{{tail}}}")),
        format!("{{z.raw\n  .a}}{{{tail}}}")
    );
}
