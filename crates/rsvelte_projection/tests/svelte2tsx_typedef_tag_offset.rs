//! `getLastLeadingDoc` strips a declarator's `@typedef` tags with a
//! SourceFile-absolute span indexed into a node-relative slice, so the removal
//! is shifted by `node.pos` — three outcomes, of which rsvelte reproduces two.
//!
//! | statement ahead of the comment | shifted slice occurs in it? | official |
//! |---|---|---|
//! | none (`node.pos == 0`) | — | the tag is removed |
//! | long | no | `replace` no-ops, the tag survives |
//! | short | yes | **the wrong text is deleted** |
//!
//! Rows 1 and 2 are parity assertions. Row 3 is the recorded deliberate
//! divergence (`compatibility/GATES.md#deliberate-divergences`): reproducing it
//! would mean emitting a JSDoc comment truncated in the middle of a type name.
//! Reported in
//! `upstream_issues/svelte2tsx-getlastleadingdoc-mixes-absolute-and-relative-offsets.md`.
//!
//! Every `official` value below is the pinned `submodules/language-tools`
//! svelte2tsx's own output on the same source.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

const DOC: &str = "/**\n * @typedef {import('./X.svelte').T} T\n * @slot {{ a: 1 }}\n */";
const PAD: &str = "const pad = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';";

fn props_of(script: &str) -> String {
    let source = format!("<script>\n{script}\n</script>\n<p>x</p>\n");
    let code = svelte2tsx(&source, Svelte2TsxOptions::default())
        .expect("svelte2tsx")
        .code;
    let start = code.find("return { props: ").expect("props object") + "return { props: ".len();
    let rest = &code[start..];
    rest[..rest.find(", exports:").expect("exports")].to_string()
}

#[test]
fn the_tag_is_removed_only_where_upstreams_offset_is_zero() {
    assert_eq!(
        props_of(&format!("{DOC}\nexport let a = 1;")),
        "{\n/**\n * \n * @slot {{ a: 1 }}\n */a: a}"
    );
    assert_eq!(
        props_of(&format!("{PAD}\n{DOC}\nexport let a = 1;")),
        format!("{{\n{DOC}a: a}}")
    );
}

#[test]
fn a_shift_that_lands_inside_the_comment_is_a_known_divergence() {
    // Official emits `{\n/**\n * @typedef {i{ a: 1 }}\n */a: a}` here — the
    // slice it deletes starts inside the comment and runs past the `@slot` tag.
    assert_eq!(
        props_of(&format!("let z = 1;\n{DOC}\nexport let a = z;")),
        format!("{{\n{DOC}a: a}}")
    );
}
