//! `MustacheTag.ts` and `RawMustacheTag.ts` rewrite *positions*, not
//! expressions: the brace becomes `` / `;` and everything between the braces is
//! kept verbatim. rsvelte instead rebuilt the range around the parsed
//! expression, which drops a wrapping paren the parser does not record and
//! loses the space `{@html ` is replaced with.
//!
//! Both divergences are invisible to the corpus gate whenever oxfmt can parse
//! the TSX, because formatting absorbs a paren and a leading space. They only
//! surface once the file is unparseable and the comparison falls back to raw
//! text — so the gate has been green over them, not clean.

use rsvelte_projection::svelte2tsx::{
    Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion, svelte2tsx,
};

fn opts() -> Svelte2TsxOptions {
    Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: false,
        mode: Svelte2TsxMode::Ts,
        accessors: false,
        namespace: Svelte2TsxNamespace::Html,
        version: SvelteVersion::V5,
        runes: None,
        emit_jsdoc: false,
        rewrite_external_imports: None,
    }
}

fn tsx(input: &str) -> String {
    svelte2tsx(input, opts()).expect("svelte2tsx").code
}

/// `handleMustacheTag` overwrites `node.start..node.start+1` and
/// `node.end-1..node.end` and nothing else, so a wrapping paren survives.
#[test]
fn a_wrapping_paren_survives_an_expression_tag() {
    let out = tsx("<div>{(b ?? '')}</div>");
    assert!(out.contains("(b ?? '');"), "paren dropped:\n{out}");
}

/// `handleRawHtml` overwrites `node.start..node.expression.start` with a single
/// space, so the expression keeps its column minus one.
#[test]
fn a_raw_html_tag_leaves_one_space_where_the_opener_was() {
    let out = tsx("<div>{@html a}</div>");
    assert!(out.contains(" a;"), "no space where `{{@html ` was:\n{out}");
}

/// The two together — the shape `powertable` hits.
#[test]
fn a_raw_html_tag_around_a_parenthesized_expression() {
    let out = tsx("<div>{@html (a ?? '')}</div>");
    assert!(out.contains(" a ?? '';"), "got:\n{out}");
}

/// Control: an ordinary tag is unchanged, so the fix is about what sits between
/// the braces and not about the braces themselves.
#[test]
fn a_plain_expression_tag_is_still_a_bare_statement() {
    let out = tsx("<div>{count}</div>");
    assert!(out.contains("count;"), "got:\n{out}");
    assert!(!out.contains("(count)"), "unexpected paren:\n{out}");
}

/// A leading `{` still gets the object-literal parenthesization, which is the
/// one case upstream rewrites the braces to something other than `` / `;`.
#[test]
fn an_object_literal_tag_is_still_parenthesized() {
    let out = tsx("<div>{{ a: 1 }}</div>");
    assert!(out.contains(";({ a: 1 });"), "got:\n{out}");
}

/// A TS postfix between the expression and the `}` is kept, because nothing
/// between the braces is touched.
#[test]
fn a_ts_postfix_is_kept() {
    let out = tsx("<div>{a as string}</div>");
    assert!(out.contains("a as string;"), "got:\n{out}");
}

/// A comment between the braces is kept for the same reason.
#[test]
fn a_comment_between_the_braces_is_kept() {
    let out = tsx("<div>{a /* c */}</div>");
    assert!(out.contains("a /* c */;"), "got:\n{out}");
}
