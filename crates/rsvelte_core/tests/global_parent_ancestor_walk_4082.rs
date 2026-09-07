//! A parent prelude that opens with `:global(...)` constrains nothing above the
//! component, so the nested rule's ancestor walk must continue from the first
//! local compound instead of abandoning the level. Upstream reaches the same
//! answer through `apply_combinator`'s BACKWARD `every_is_global` escape.
//!
//! Every expected value below is the official compiler's own output
//! (`svelte@5.57.0`, the source entry point the gates use), not a hand-written
//! prediction. The scope hash is normalised on both sides.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const MARKUP: &str = "<svg class=\"p q\"><path class=\"a\"><i class=\"b\"></i></path></svg>";

/// `(name, parent prelude, child, expected warning codes, expected css)`.
const CELLS: &[(&str, &str, &str, &str, &str)] = &[
    (
        "global_parent_trailing",
        ":global(.x) .p",
        ".a &",
        "css_unused_selector",
        "/* (empty) :global(.x) .p { .a & { opacity: 1; } }*/",
    ),
    (
        "global_parent_leading_desc",
        ":global(.x) .p",
        "& .a",
        "",
        ".x .p.svelte-1lj1c1s { & .a:where(.svelte-1lj1c1s) { opacity: 1; } }",
    ),
    (
        "global_parent_compound",
        ":global(.x) .p",
        "&.a",
        "css_unused_selector",
        "/* (empty) :global(.x) .p { &.a { opacity: 1; } }*/",
    ),
    (
        "global_parent_leading_child",
        ":global(.x) .p",
        "& > .a",
        "",
        ".x .p.svelte-1lj1c1s { & > .a:where(.svelte-1lj1c1s) { opacity: 1; } }",
    ),
    (
        "global_parent_trailing_child",
        ":global(.x) .p",
        ".a > &",
        "css_unused_selector",
        "/* (empty) :global(.x) .p { .a > & { opacity: 1; } }*/",
    ),
    (
        "global_parent_bare",
        ":global(.x) .p",
        "&",
        "",
        ".x .p.svelte-1lj1c1s { & { opacity: 1; } }",
    ),
    (
        "global_parent_decl",
        ":global(.x) .p",
        "color: red;",
        "",
        ".x .p.svelte-1lj1c1s { color: red; }",
    ),
    (
        "local_parent_trailing",
        ".p",
        ".a &",
        "css_unused_selector",
        "/* (empty) .p { .a & { opacity: 1; } }*/",
    ),
    (
        "local_parent_leading_desc",
        ".p",
        "& .a",
        "",
        ".p.svelte-1lj1c1s { & .a:where(.svelte-1lj1c1s) { opacity: 1; } }",
    ),
    (
        "local_parent_compound",
        ".p",
        "&.a",
        "css_unused_selector",
        "/* (empty) .p { &.a { opacity: 1; } }*/",
    ),
    (
        "local_parent_leading_child",
        ".p",
        "& > .a",
        "",
        ".p.svelte-1lj1c1s { & > .a:where(.svelte-1lj1c1s) { opacity: 1; } }",
    ),
    (
        "local_parent_trailing_child",
        ".p",
        ".a > &",
        "css_unused_selector",
        "/* (empty) .p { .a > & { opacity: 1; } }*/",
    ),
    (
        "local_parent_bare",
        ".p",
        "&",
        "",
        ".p.svelte-1lj1c1s { & { opacity: 1; } }",
    ),
    (
        "local_parent_decl",
        ".p",
        "color: red;",
        "",
        ".p.svelte-1lj1c1s { color: red; }",
    ),
    (
        "only_global_parent_trailing",
        ":global(.x)",
        ".a &",
        "",
        ".x { .a.svelte-1lj1c1s & { opacity: 1; } }",
    ),
    (
        "only_global_parent_leading_desc",
        ":global(.x)",
        "& .a",
        "",
        ".x { & .a.svelte-1lj1c1s { opacity: 1; } }",
    ),
    (
        "only_global_parent_compound",
        ":global(.x)",
        "&.a",
        "",
        ".x { &.a { opacity: 1; } }",
    ),
    (
        "only_global_parent_leading_child",
        ":global(.x)",
        "& > .a",
        "",
        ".x { & > .a.svelte-1lj1c1s { opacity: 1; } }",
    ),
    (
        "only_global_parent_trailing_child",
        ":global(.x)",
        ".a > &",
        "",
        ".x { .a.svelte-1lj1c1s > & { opacity: 1; } }",
    ),
    (
        "only_global_parent_bare",
        ":global(.x)",
        "&",
        "",
        ".x { & { opacity: 1; } }",
    ),
    (
        "only_global_parent_decl",
        ":global(.x)",
        "color: red;",
        "",
        ".x { color: red; }",
    ),
];

fn normalise(s: &str) -> String {
    let collapsed = s.split_whitespace().collect::<Vec<_>>().join(" ");
    let mut out = String::with_capacity(collapsed.len());
    let mut rest = collapsed.as_str();
    while let Some(i) = rest.find("svelte-") {
        out.push_str(&rest[..i]);
        out.push_str("svelte-HASH");
        rest = &rest[i + "svelte-".len()..];
        let end = rest
            .find(|c: char| !c.is_ascii_alphanumeric())
            .unwrap_or(rest.len());
        rest = &rest[end..];
    }
    out.push_str(rest);
    out
}

#[test]
fn every_cell_matches_the_official_compiler() {
    for (name, parent, child, warns, css) in CELLS {
        let body = if child.contains('&') {
            format!("{child} {{ opacity: 1; }}")
        } else {
            (*child).to_string()
        };
        let src = format!("{MARKUP}<style>\n\t{parent} {{\n\t\t{body}\n\t}}\n</style>");
        let out = compile(
            &src,
            CompileOptions {
                filename: Some("X.svelte".to_string()),
                generate: GenerateMode::Server,
                dev: false,
                ..Default::default()
            },
        )
        .unwrap_or_else(|e| panic!("{name}: compile failed: {e:?}"));
        let got_css = normalise(&out.css.map(|c| c.code).unwrap_or_default());
        let got_warns = out
            .warnings
            .iter()
            .map(|w| w.code.clone())
            .collect::<Vec<_>>()
            .join(",");
        assert_eq!(got_warns, *warns, "{name}: warning codes");
        assert_eq!(got_css, normalise(css), "{name}: css");
    }
}

/// The grid is only evidence about pruning if some cell is pruned and some cell
/// is kept — a predicate that never prunes and one that always does are both
/// caught here.
#[test]
fn the_grid_holds_both_verdicts() {
    let pruned = CELLS
        .iter()
        .filter(|c| c.3 == "css_unused_selector")
        .count();
    let kept = CELLS.iter().filter(|c| c.3.is_empty()).count();
    assert!(pruned >= 2, "expected pruned cells, got {pruned}");
    assert!(kept >= 2, "expected kept cells, got {kept}");
    assert_eq!(pruned + kept, CELLS.len());
}
