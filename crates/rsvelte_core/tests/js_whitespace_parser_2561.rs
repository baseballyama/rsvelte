//! Every whitespace decision in the parser reads the same set upstream reads:
//! ECMAScript `WhiteSpace + LineTerminator`, spelled out in `is_whitespace(cc)`
//! at `1-parse/index.js:15-30` and reached again through every `\s` regex and
//! `String.prototype.trim*` in that parser. Rust's `char::is_whitespace` is the
//! Unicode `White_Space` property, and `u8::is_ascii_whitespace` is a third set
//! again — it omits `U+000B`.
//!
//! Expected verdicts below were measured against `svelte@5.56.8`, not recalled.

use rsvelte_core::{Allocator, CompileOptions, GenerateMode, ParseOptions, compile, parse};

/// JS whitespace that Rust's ASCII fast paths used to miss (`U+000B`, `U+000C`)
/// or that Unicode `White_Space` omits (`U+FEFF`). Upstream accepts all three
/// wherever it accepts a space.
const JS_ONLY: [char; 3] = ['\u{b}', '\u{c}', '\u{feff}'];

/// Unicode `White_Space` that is *not* JS whitespace. Upstream never skips it.
const NEL: char = '\u{85}';

fn parse_ok(src: &str) -> Result<(), String> {
    let allocator = Allocator::default();
    match parse(src, &allocator, ParseOptions::default()) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("{e:?}")),
    }
}

fn server_js(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

/// The predicate itself: exactly the 25 code points ECMA-262 lists, which is not
/// what either Rust set contains. Counting members alone cannot tell them apart
/// — `White_Space` also has 25.
#[test]
fn the_parser_whitespace_set_is_the_js_one() {
    // Only whitespace is skipped between `{` and a close marker: anything else
    // makes the braces an expression tag, which fails to parse. So "parses" is
    // exactly "the parser called this character whitespace".
    let is_skipped = |c: char| {
        parse_ok(&format!(
            "<script>let x = 1;</script>{{#if x}}<p>a</p>{{{c}/if}}"
        ))
        .is_ok()
    };

    let expected: Vec<char> = "\u{9}\u{a}\u{b}\u{c}\u{d}\u{20}\u{a0}\u{1680}\u{2000}\u{2001}\u{2002}\u{2003}\u{2004}\u{2005}\u{2006}\u{2007}\u{2008}\u{2009}\u{200a}\u{2028}\u{2029}\u{202f}\u{205f}\u{3000}\u{feff}".chars().collect();
    assert_eq!(expected.len(), 25);

    // Scanning the BMP is exhaustive for this question: the highest member of
    // either candidate set is `U+FEFF`, asserted rather than assumed.
    assert!(expected.iter().all(|c| (*c as u32) <= 0xFFFF));
    assert!(
        char::from_u32(0x10000)
            .into_iter()
            .chain((0x10000u32..=0x10FFFF).filter_map(char::from_u32))
            .all(|c| !c.is_whitespace())
    );

    let unexpected: Vec<String> = (0u32..=0xFFFF)
        .filter_map(char::from_u32)
        .filter(|c| is_skipped(*c) != expected.contains(c))
        .map(|c| format!("U+{:04X}", c as u32))
        .collect();
    assert!(
        unexpected.is_empty(),
        "characters classified against the wrong set: {unexpected:?}"
    );
    assert!(!is_skipped(NEL), "U+0085 is not JS whitespace");
}

/// `{ WS #if }`, `{ WS :else }`, `{ WS /if }` — upstream runs `allow_whitespace()`
/// between `{` and the marker, so all three accept any JS whitespace.
#[test]
fn block_markers_accept_js_whitespace() {
    for c in JS_ONLY {
        for src in [
            format!("<script>let x = 1;</script>{{{c}#if x}}<p>a</p>{{/if}}"),
            format!("<script>let x = 1;</script>{{#if x}}<p>a</p>{{{c}:else}}<p>b</p>{{/if}}"),
            format!("<script>let x = 1;</script>{{#if x}}<p>a</p>{{{c}/if}}"),
        ] {
            assert!(
                parse_ok(&src).is_ok(),
                "U+{:04X} rejected in a block marker: {:?}",
                c as u32,
                parse_ok(&src)
            );
        }
    }
}

/// The other direction, which a fix that merely widened the set would miss:
/// `U+0085` is not whitespace, so it must not be skipped before the marker.
#[test]
fn block_markers_reject_a_nel() {
    let src = format!("<script>let x = 1;</script>{{#if x}}<p>a</p>{{{NEL}/if}}");
    assert!(
        parse_ok(&src).is_err(),
        "U+0085 was skipped before a close marker; upstream raises js_parse_error"
    );
}

/// A tag name ends at whitespace — upstream `read_until(/(\s|\/|>)/)`.
#[test]
fn a_tag_name_ends_at_js_whitespace() {
    for c in JS_ONLY {
        let src = format!("<p{c}a=\"1\">t</p>");
        assert!(
            parse_ok(&src).is_ok(),
            "U+{:04X} did not end the tag name: {:?}",
            c as u32,
            parse_ok(&src)
        );
    }
    let src = format!("<p{NEL}a=\"1\">t</p>");
    assert!(
        parse_ok(&src).is_err(),
        "U+0085 ended the tag name; upstream raises tag_invalid_name"
    );
}

/// The same scan runs on closing tags.
#[test]
fn a_closing_tag_name_ends_at_js_whitespace() {
    for c in JS_ONLY {
        let src = format!("<textarea>t</textarea{c}>");
        assert!(
            parse_ok(&src).is_ok(),
            "U+{:04X} did not end the closing tag name: {:?}",
            c as u32,
            parse_ok(&src)
        );
    }
}

/// `{#snippet WS name()}` — the header separator.
#[test]
fn a_snippet_header_accepts_js_whitespace() {
    for c in JS_ONLY {
        let src = format!("{{#snippet{c}s()}}<p>a</p>{{/snippet}}");
        assert!(
            parse_ok(&src).is_ok(),
            "U+{:04X} rejected in a snippet header: {:?}",
            c as u32,
            parse_ok(&src)
        );
    }
}

/// The `{#each … as …}` alias separator was found by a byte-level
/// `is_ascii_whitespace` trigger, so a line separator never fired it.
#[test]
fn the_each_as_separator_accepts_a_line_separator() {
    for c in ['\u{2028}', '\u{2029}'] {
        let src = format!("<script>let a = [1];</script>{{#each a{c}as x}}<p>{{x}}</p>{{/each}}");
        assert!(
            parse_ok(&src).is_ok(),
            "U+{:04X} did not separate the `as` alias: {:?}",
            c as u32,
            parse_ok(&src)
        );
    }
}

/// Not an error-code difference but an emitted-code one: upstream reports
/// `then != null` for every JS whitespace before the keyword. rsvelte used to
/// compile `{#await p<ZWNBSP>then v}` cleanly *without* the then branch.
#[test]
fn the_await_then_keyword_is_recognised_after_a_zwnbsp() {
    let space = server_js("<script>let p = null;</script>{#await p then v}<p>{v}</p>{/await}")
        .expect("ascii control must compile");
    assert!(
        space.contains("(v) =>"),
        "ascii control lost its then branch: {space}"
    );

    let zwnbsp =
        server_js("<script>let p = null;</script>{#await p\u{feff}then v}<p>{v}</p>{/await}")
            .expect("zwnbsp variant must compile");
    assert!(
        zwnbsp.contains("(v) =>"),
        "the then branch was dropped after U+FEFF: {zwnbsp}"
    );
}

/// The CSS reader shares the parser's `allow_whitespace`, so its set must match
/// too: upstream raises `css_expected_identifier` on a NEL before the block.
#[test]
fn the_css_reader_does_not_treat_a_nel_as_whitespace() {
    let src = format!("<p class=\"a\">t</p><style>.a{NEL}{{ color: red; }}</style>");
    assert!(
        parse_ok(&src).is_err(),
        "U+0085 was skipped in a selector; upstream raises css_expected_identifier"
    );

    let ok = "<p class=\"a\">t</p><style>.a\u{feff}{ color: red; }</style>";
    assert!(
        parse_ok(ok).is_ok(),
        "U+FEFF rejected in a selector: {:?}",
        parse_ok(ok)
    );
}

/// Control: the 24 members both sets share must behave exactly like a space in
/// every slot above, so a predicate that accepted or rejected everything fails.
#[test]
fn the_shared_members_behave_like_a_space() {
    let shared: Vec<char> = (0u32..=0x10FFFF)
        .filter_map(char::from_u32)
        .filter(|c| c.is_whitespace() && *c != NEL)
        .collect();
    assert_eq!(shared.len(), 24);

    for c in shared {
        for template in [
            "<script>let x = 1;</script>{#if x}<p>a</p>{{C}/if}",
            "<p{C}a=\"1\">t</p>",
            "{#snippet{C}s()}<p>a</p>{/snippet}",
        ] {
            let src = template.replace("{C}", &c.to_string());
            assert!(
                parse_ok(&src).is_ok(),
                "U+{:04X} rejected where a space is accepted: {:?}",
                c as u32,
                parse_ok(&src)
            );
        }
    }
}
