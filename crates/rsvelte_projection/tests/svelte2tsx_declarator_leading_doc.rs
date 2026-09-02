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
//! Every expectation is the pinned `submodules/language-tools` svelte2tsx's
//! own output, generated rather than transcribed — `createReturnElements`
//! writes `\n${doc}${name}`, so the comment is preceded by a newline and
//! followed by nothing, which a hand-written expectation had as a space on
//! both sides. The corpus gate normalizes with oxfmt, so it cannot see the
//! spacing; these assertions can, and they pin the attachment as well.

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
    assert_eq!(
        props_of("export let /* same line */ g = 8, h = 9;"),
        "{\n/* same line */g: g , h: h}"
    );
}

#[test]
fn a_comment_before_a_later_declarator_attaches_to_that_declarator() {
    assert_eq!(
        props_of("export let a = 1,\n\t/* mid */ b = 2;"),
        "{a: a , \n/* mid */b: b}"
    );
}

#[test]
fn a_line_comment_between_a_block_comment_and_the_declarator_is_skipped() {
    // `getLastLeadingDoc` keeps only `MultiLineCommentTrivia`, so the
    // `// line` between them is not a barrier.
    assert_eq!(
        props_of("export let a = 1,\n\t/* blk */\n\t// line\n\tb = 2;"),
        "{a: a , \n/* blk */b: b}"
    );
}

#[test]
fn a_declarator_comment_wins_over_the_statements_and_the_rest_fall_back() {
    // `p` finds its own, `q` has none of its own and takes the statement's.
    assert_eq!(
        props_of("/* outer */\nexport let /* inner */ p = 1, q = 2;"),
        "{\n/* inner */p: p , \n/* outer */q: q}"
    );
}

#[test]
fn a_jsdoc_written_after_the_keyword_reaches_the_props_object() {
    assert_eq!(
        props_of("export let /** @type {boolean} */ v = true;"),
        "{\n/** @type {boolean} */v: v}"
    );
}

// ---- controls: shapes this change must NOT move -----------------------------

#[test]
fn control_a_comment_before_the_let_keyword_attaches_to_nothing() {
    // TypeScript's declarator trivia starts after `let`, so
    // this comment is out of reach; without the floor the walk would take it.
    assert_eq!(props_of("export /* x */ let a = 1;"), "{a: a}");
}

#[test]
fn control_a_statement_comment_still_reaches_every_declarator() {
    assert_eq!(
        props_of("/* lead block */\nexport let c = 3,\n\td = 4;"),
        "{\n/* lead block */c: c , \n/* lead block */d: d}"
    );
}

#[test]
fn control_a_line_comment_attaches_to_nothing() {
    assert_eq!(
        props_of("// lead line\nexport let a = [],\n\tb = 2;"),
        "{a: a , b: b}"
    );
}
