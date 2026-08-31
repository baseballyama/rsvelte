//! `findNextVerbatimElement` (`utils/htmlxparser.ts:76-99`) matches a comment
//! before either verbatim tag and skips it, so a `<style>` written inside an
//! HTML comment never opens a style element. The fallback scanner in
//! `blank_style_tags` was the one scan here that did not, so it blanked from
//! the comment to the real `</style>` and took every attribute in between.

use rsvelte_projection::svelte2tsx::{
    Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion, svelte2tsx,
};

fn opts() -> Svelte2TsxOptions {
    Svelte2TsxOptions {
        filename: "a.svelte".to_string(),
        is_ts_file: true,
        mode: Svelte2TsxMode::Ts,
        namespace: Svelte2TsxNamespace::Html,
        version: SvelteVersion::V5,
        ..Svelte2TsxOptions::default()
    }
}

const ELEMENT: &str = "<li\n\tclass=\"hoverable\"\n\tonmousemove={() => { go() }}\n>x</li>\n";
const STYLE: &str = "<style>\n\t.hoverable { color: red }\n</style>\n";

#[test]
fn a_commented_style_tag_does_not_swallow_the_markup_after_it() {
    let source = format!("<!-- the rule is in <style>. -->\n{ELEMENT}{STYLE}");
    let out = svelte2tsx(&source, opts()).expect("svelte2tsx").code;
    assert!(
        out.contains("\"class\":`hoverable`"),
        "the element's attributes survive:\n{out}"
    );
    assert!(
        out.contains("\"onmousemove\""),
        "the event handler survives:\n{out}"
    );
}

#[test]
fn a_real_style_tag_is_still_blanked() {
    let source = format!("{ELEMENT}{STYLE}");
    let out = svelte2tsx(&source, opts()).expect("svelte2tsx").code;
    assert!(
        !out.contains("color: red"),
        "the CSS is not carried into the TSX:\n{out}"
    );
    assert!(
        out.contains("\"class\":`hoverable`"),
        "the element is unaffected:\n{out}"
    );
}

#[test]
fn a_commented_style_tag_with_no_real_style_block_is_inert() {
    let source = format!("<!-- see <style>. -->\n{ELEMENT}");
    let out = svelte2tsx(&source, opts()).expect("svelte2tsx").code;
    assert!(
        out.contains("\"class\":`hoverable`"),
        "the element's attributes survive:\n{out}"
    );
}
