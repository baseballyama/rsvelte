//! #4077: `--mode dts` rewrites `interface X extends Y { … }` into
//! `type X = Y & { … }` with three raw text scans, and a comment defeats every
//! one of them — producing TypeScript that does not parse.
//!
//! Upstream (`processInstanceScriptContent.ts::transformInterfacesToTypes`) is
//! entirely span-based: the keyword position comes from `heritageClauses[0]`
//! (a TypeScript heritage clause starts AT `extends`), the gap between two
//! entries is overwritten whole, and ` & ` is appended at the clause's end.
//! OXC's `TSInterfaceHeritage` span starts at the type instead, which is why
//! rsvelte reconstructed those positions by scanning — a backward walk that
//! skips whitespace but not comments, a `find(',')` and a `find('{')`.
//!
//! Each test below is the discriminating case for ONE of those three scans, so
//! reverting one does not turn the others red. Each expectation is official's
//! own output, captured from the pinned `submodules/language-tools` build.

use rsvelte_projection::svelte2tsx::{Svelte2TsxMode, Svelte2TsxOptions, svelte2tsx};

/// The rewritten declaration line, which is where all three scans land.
fn dts_line(declaration: &str) -> String {
    let src = format!(
        "<script lang=\"ts\">\n  interface B {{ a: string }}\n  interface C {{ c: string }}\n  {declaration}\n  export let x: Iface;\n</script>\n\n{{x}}\n"
    );
    let opts = Svelte2TsxOptions {
        filename: "Comp.svelte".to_string(),
        is_ts_file: true,
        mode: Svelte2TsxMode::Dts,
        ..Default::default()
    };
    let code = svelte2tsx(&src, opts)
        .expect("svelte2tsx should not fail")
        .code;
    code.lines()
        .find(|line| line.contains("Iface") && !line.contains("InstanceType"))
        .unwrap_or_else(|| panic!("no Iface line in:\n{code}"))
        .to_string()
}

/// Scan 1 — the `extends` keyword. A comment between `extends` and the entry
/// stopped the backward walk, so `extends` survived and `type X extends …` is
/// not TypeScript.
#[test]
fn a_comment_before_the_heritage_entry_still_rewrites_extends() {
    assert_eq!(
        dts_line("interface Iface extends /*c*/B { b: string }"),
        "  type Iface = /*c*/B &  { b: string }"
    );
}

/// Same scan, line comment: the walk stops one character earlier and the
/// keyword is equally invisible to it.
#[test]
fn a_line_comment_before_the_heritage_entry_still_rewrites_extends() {
    assert_eq!(
        dts_line("interface Iface extends //c\n  B { b: string }"),
        "  type Iface = //c"
    );
}

/// Scan 2 — the separator between two entries. `find(',')` over the raw gap
/// takes a comma written inside a comment, splicing ` &` into the comment body.
#[test]
fn a_comma_inside_a_comment_between_entries_is_not_the_separator() {
    assert_eq!(
        dts_line("interface Iface extends B /*,*/, C { b: string }"),
        "  type Iface = B & C &  { b: string }"
    );
}

/// Scan 3 — the anchor for the trailing ` & `. `find('{')` from the last entry
/// takes a brace written inside a comment, splicing ` & ` into the comment.
#[test]
fn a_brace_inside_a_trailing_comment_is_not_the_body() {
    assert_eq!(
        dts_line("interface Iface extends B /*{*/ { b: string }"),
        "  type Iface = B &  /*{*/ { b: string }"
    );
}

/// The comment-free controls. Every scan above fires here too, so these are
/// what say a fix repaired the comment cases rather than moving the common one
/// — and the two-entry row is the one that pins the separator's spacing.
mod controls {
    use super::dts_line;

    #[test]
    fn single_heritage_entry() {
        assert_eq!(
            dts_line("interface Iface extends B { b: string }"),
            "  type Iface = B &  { b: string }"
        );
    }

    #[test]
    fn two_heritage_entries() {
        assert_eq!(
            dts_line("interface Iface extends B, C { b: string }"),
            "  type Iface = B & C &  { b: string }"
        );
    }

    #[test]
    fn no_heritage_clause() {
        assert_eq!(
            dts_line("interface Iface { b: string }"),
            "  type Iface ={ b: string }"
        );
    }

    /// rsvelte is deliberately NOT byte-equal here. Upstream reaches the body's
    /// `{` with `str.original.indexOf('{', …)`, which a comment holding a brace
    /// sends into the comment's text — official emits `type Iface /*={*/ {`,
    /// which does not parse. The body span is the same position with no scan,
    /// so rsvelte emits `/*{*/ ={`. Matching would mean reproducing the bug.
    #[test]
    fn a_brace_in_a_comment_does_not_move_the_equals_of_a_bodyless_rewrite() {
        assert_eq!(
            dts_line("interface Iface /*{*/ { b: string }"),
            "  type Iface /*{*/ ={ b: string }"
        );
    }
}
