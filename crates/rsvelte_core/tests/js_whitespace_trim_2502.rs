//! The template's trailing trim decides what is whitespace with the same set
//! upstream uses: ECMAScript `WhiteSpace + LineTerminator`, the predicate behind
//! `template.trimEnd()` in `1-parse/index.js`. Rust's `char::is_whitespace` is
//! the Unicode `White_Space` property instead, and the two sets have the same
//! size (25) while differing on exactly two members, in opposite directions:
//! `U+0085` NEL is Unicode whitespace but not JS whitespace, and `U+FEFF`
//! ZWNBSP is JS whitespace but not Unicode whitespace.

use rsvelte_core::{Allocator, CompileOptions, GenerateMode, ParseOptions, compile, parse};

/// `U+0085` NEL — Unicode `White_Space`, category `Cc`, so JS's `Zs`-based
/// `WhiteSpace` excludes it. Upstream keeps a trailing one.
const NEL: char = '\u{85}';

/// `U+FEFF` ZWNBSP — category `Cf`, so Unicode `White_Space` excludes it, while
/// ECMA-262 names `<ZWNBSP>` in `WhiteSpace` explicitly. Upstream drops it.
const ZWNBSP: char = '\u{feff}';

fn trailing_nodes(trailer: &str) -> Vec<String> {
    let src = format!("<script>\n</script>\n{trailer}");
    let allocator = Allocator::default();
    let ast = parse(&src, &allocator, ParseOptions::default()).expect("component should parse");
    ast.fragment
        .nodes
        .iter()
        .map(|node| format!("{node:?}"))
        .collect()
}

fn client_template(trailer: &str) -> String {
    compile(
        &format!("<p>hi</p>{trailer}"),
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The two sets, derived rather than recalled: the symmetric difference is
/// exactly `{U+0085, U+FEFF}`, so those two characters are the whole of this
/// bug. A test that only counted members would report the sets identical.
#[test]
fn the_two_whitespace_sets_differ_by_exactly_two_members() {
    let unicode: Vec<char> = (0u32..=0x10FFFF)
        .filter_map(char::from_u32)
        .filter(|c| c.is_whitespace())
        .collect();
    let js: Vec<char> = (0u32..=0x10FFFF)
        .filter_map(char::from_u32)
        .filter(|c| {
            matches!(
                c,
                '\u{9}'..='\u{d}'
                    | '\u{20}'
                    | '\u{a0}'
                    | '\u{1680}'
                    | '\u{2000}'..='\u{200a}'
                    | '\u{2028}'
                    | '\u{2029}'
                    | '\u{202f}'
                    | '\u{205f}'
                    | '\u{3000}'
                    | '\u{feff}'
            )
        })
        .collect();

    assert_eq!(unicode.len(), 25);
    assert_eq!(js.len(), 25);

    let only_unicode: Vec<char> = unicode
        .iter()
        .copied()
        .filter(|c| !js.contains(c))
        .collect();
    let only_js: Vec<char> = js
        .iter()
        .copied()
        .filter(|c| !unicode.contains(c))
        .collect();
    assert_eq!(only_unicode, vec![NEL]);
    assert_eq!(only_js, vec![ZWNBSP]);
}

/// Upstream, on `<script>\n</script>\n\u{85}`: `nodes=1`, the surviving text is
/// `[U+000A U+0085]`. rsvelte trimmed it away.
#[test]
fn a_trailing_nel_survives_the_trim() {
    let nodes = trailing_nodes(&NEL.to_string());
    assert_eq!(
        nodes.len(),
        1,
        "U+0085 was trimmed as whitespace; upstream keeps it: {nodes:?}"
    );
    assert!(
        nodes[0].contains("\\u{85}"),
        "the surviving node lost the NEL: {nodes:?}"
    );
}

/// The opposite direction: upstream reports `nodes=0` for a trailing ZWNBSP.
#[test]
fn a_trailing_zwnbsp_is_trimmed() {
    let nodes = trailing_nodes(&ZWNBSP.to_string());
    assert!(
        nodes.is_empty(),
        "U+FEFF survived; upstream trims it as whitespace: {nodes:?}"
    );
}

/// The public entry point, not the predicate: both characters reach the emitted
/// template, so a fix verified only at parse level is not enough. Upstream emits
/// `` `<p>hi</p>\u{85}` `` for NEL and `` `<p>hi</p>` `` for ZWNBSP.
#[test]
fn the_emitted_client_template_matches_upstream() {
    let nel = client_template(&NEL.to_string());
    assert!(
        nel.contains("<p>hi</p>\u{85}"),
        "NEL missing from the emitted template: {nel}"
    );

    let zwnbsp = client_template(&ZWNBSP.to_string());
    assert!(
        !zwnbsp.contains(ZWNBSP),
        "ZWNBSP leaked into the emitted template: {zwnbsp}"
    );
}

/// The 18 characters both sets agree on must not move, and a non-whitespace
/// trailer must still be kept — a predicate that trimmed nothing, or everything,
/// fails here.
#[test]
fn the_agreed_members_and_a_non_whitespace_trailer_are_unchanged() {
    for c in (0u32..=0x10FFFF)
        .filter_map(char::from_u32)
        .filter(|c| c.is_whitespace() && !c.is_ascii() && *c != NEL)
    {
        assert!(
            trailing_nodes(&c.to_string()).is_empty(),
            "U+{:04X} survived as a trailing text node",
            c as u32
        );
    }

    for trailer in [" ", "\t", "\n", "\r", "\u{b}", "\u{c}", " \t\r\n  "] {
        assert!(
            trailing_nodes(trailer).is_empty(),
            "ASCII whitespace trailer {trailer:?} survived"
        );
    }

    assert_eq!(trailing_nodes("x").len(), 1);
    assert_eq!(trailing_nodes("\u{540d}").len(), 1);
}
