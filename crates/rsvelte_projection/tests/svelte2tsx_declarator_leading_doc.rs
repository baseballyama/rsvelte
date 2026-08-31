//! Which comment does an exported declarator carry into the props object?
//!
//! Official `getDoc` asks TWO nodes, in order: the DECLARATOR's own leading
//! trivia (`getLastLeadingDoc(target.parent)`), then the statement's
//! (`target.parent.parent.parent`). rsvelte only implemented the fallback, so
//! `export let /* c */ g = 8` dropped the comment entirely. TypeScript starts a
//! node's trivia at the previous token, which is why the declarator walk must
//! not cross `let` — `export /* x */ let a = 1` carries nothing on either side.
//!
//! Only block comments count (`getLastLeadingDoc` filters to
//! `MultiLineCommentTrivia`), so a `// line` comment attaches to nothing.
//!
//! Every expectation was read off the pinned `submodules/language-tools`
//! svelte2tsx. Official spells the same attachment with different INTERNAL
//! whitespace (`{ /* c */g: g` where rsvelte emits `{/* c */ g: g`); that
//! difference predates this test, and the corpus gate normalizes both sides
//! with oxfmt before comparing, so it is invisible there. These assertions pin
//! the attachment — which comment lands on which name — not the spacing.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn props_of(decl: &str) -> String {
    let source = format!("<script>\n{decl}\n</script>\n");
    let code = svelte2tsx(
        &source,
        Svelte2TsxOptions {
            filename: "C.svelte".into(),
            is_ts_file: false,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    let start = code.find("return { props: ").expect("props object") + "return { props: ".len();
    let rest = &code[start..];
    let end = rest.find(", exports:").expect("exports");
    rest[..end].to_string()
}

#[test]
fn a_comment_after_the_keyword_attaches_to_the_first_declarator_only() {
    // official: `{ /* same line */g: g , h: h}`
    assert_eq!(
        props_of("export let /* same line */ g = 8, h = 9;"),
        "{/* same line */ g: g , h: h}"
    );
}

#[test]
fn a_comment_before_a_later_declarator_attaches_to_that_declarator() {
    // official: `{a: a , /* mid */b: b}`
    assert_eq!(
        props_of("export let a = 1,\n\t/* mid */ b = 2;"),
        "{a: a , /* mid */ b: b}"
    );
}

#[test]
fn a_line_comment_between_a_block_comment_and_the_declarator_is_skipped() {
    // official: `{a: a , /* blk */b: b}` — `getLastLeadingDoc` keeps only
    // `MultiLineCommentTrivia`, so the `// line` between them is not a barrier.
    assert_eq!(
        props_of("export let a = 1,\n\t/* blk */\n\t// line\n\tb = 2;"),
        "{a: a , /* blk */ b: b}"
    );
}

#[test]
fn a_declarator_comment_wins_over_the_statements_and_the_rest_fall_back() {
    // official: `{ /* inner */p: p , /* outer */q: q}` — `p` finds its own,
    // `q` has none of its own and takes the statement's.
    assert_eq!(
        props_of("/* outer */\nexport let /* inner */ p = 1, q = 2;"),
        "{/* inner */ p: p , /* outer */ q: q}"
    );
}

#[test]
fn a_jsdoc_written_after_the_keyword_reaches_the_props_object() {
    // official: `{ /** @type {boolean} */v: v}`
    assert_eq!(
        props_of("export let /** @type {boolean} */ v = true;"),
        "{/** @type {boolean} */ v: v}"
    );
}

// ---- controls: shapes this change must NOT move -----------------------------

#[test]
fn control_a_comment_before_the_let_keyword_attaches_to_nothing() {
    // official: `{a: a}`. TypeScript's declarator trivia starts after `let`, so
    // this comment is out of reach; without the floor the walk would take it.
    assert_eq!(props_of("export /* x */ let a = 1;"), "{a: a}");
}

#[test]
fn control_a_statement_comment_still_reaches_every_declarator() {
    // official: `{ /* lead block */c: c , /* lead block */d: d}`
    assert_eq!(
        props_of("/* lead block */\nexport let c = 3,\n\td = 4;"),
        "{/* lead block */ c: c , /* lead block */ d: d}"
    );
}

#[test]
fn control_a_line_comment_attaches_to_nothing() {
    // official: `{a: a , b: b}`
    assert_eq!(
        props_of("// lead line\nexport let a = [],\n\tb = 2;"),
        "{a: a , b: b}"
    );
}
