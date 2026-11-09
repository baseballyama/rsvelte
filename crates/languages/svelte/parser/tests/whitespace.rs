use rsvelte_svelte_parser::parse::parse;
use rsvelte_svelte_syntax::syntax_tree::AttributeValue;

#[test]
fn boolean_attributes_exclude_trailing_whitespace() {
    for gap in [" ", "\t", "\n", "\r", "\u{c}", " \n\t "] {
        let source =
            format!("<input disabled{gap}class:active{gap}title{gap}={gap}\"日本語\"{gap}/>");
        let component = parse(&source).expect("attribute whitespace");
        component.tokens.check_lossless(&source).expect("all bytes");
        let attributes = &component.attributes;
        assert_eq!(attributes.len(), 3);
        assert_eq!(attributes[0].span.text(&source), "disabled");
        assert!(
            matches!(attributes[0].value, AttributeValue::True),
            "a boolean attribute"
        );
        assert_eq!(attributes[1].span.text(&source), "class:active");
        assert!(attributes[1].shorthand, "a shorthand class directive");
        assert_eq!(
            attributes[2].span.text(&source),
            format!("title{gap}={gap}\"日本語\"")
        );
    }
}

#[test]
fn whitespace_lookahead_keeps_blocks_expressions_and_comments() {
    for gap in ["", " ", "\t\n", "\u{c}"] {
        for source in [
            format!(
                "{{{gap}#if value}}<div title=\"{{{gap}value}}\"/>{{{gap}:else}}終わり{{{gap}/if}}"
            ),
            format!("{{{gap}/* comment */value}}"),
            format!("<textarea>日本語</TEXTAREA{gap}>"),
            format!("<script>let value = 1;</script{gap}>"),
        ] {
            let component = parse(&source).expect("whitespace lookahead");
            component.tokens.check_lossless(&source).expect("all bytes");
        }
    }
    let source = "<input disabled \n  \"value\"/>";
    let error = parse(source).expect_err("missing equals sign");
    assert_eq!(error.message, "expected `=`");
    assert_eq!(
        error.span.start_offset as usize,
        source.find('\"').expect("quote")
    );
}

/// What Svelte's `is_whitespace` (`/\s/`) accepts, checked character by character against
/// svelte 5.57.3's parser.
const WHITESPACE: &[char] = &[
    '\t', '\n', '\u{0B}', '\u{0C}', '\r', ' ', '\u{A0}', '\u{1680}', '\u{2000}', '\u{2001}',
    '\u{2002}', '\u{2003}', '\u{2004}', '\u{2005}', '\u{2006}', '\u{2007}', '\u{2008}', '\u{2009}',
    '\u{200A}', '\u{2028}', '\u{2029}', '\u{202F}', '\u{205F}', '\u{3000}', '\u{FEFF}',
];

fn attribute_names(source: &str) -> Vec<String> {
    let component = parse(source).expect("attributes");
    component.tokens.check_lossless(source).expect("all bytes");
    component
        .attributes
        .iter()
        .map(|attribute| attribute.name.text(source).to_owned())
        .collect()
}

#[test]
fn unicode_whitespace_separates_the_parts_of_a_tag() {
    for c in WHITESPACE {
        assert_eq!(
            attribute_names(&format!(
                "<div{c}a=\"1\"{c}b{c}={c}\"2\"{c}c=x{c}d{c}></div{c}>"
            )),
            ["a", "b", "c", "d"],
            "{c:?}"
        );
        assert_eq!(attribute_names(&format!("<input a{c}/>")), ["a"], "{c:?}");
        for source in [
            format!("{{#if{c}x}}{{:else{c}if{c}y}}{{/if{c}}}"),
            format!("{{{c}#each{c}xs{c}as{c}x,{c}i}}{{/each}}"),
            format!("{{@html{c}x}}"),
            format!("<textarea>日本語</textarea{c}>"),
            format!("<script>let x;</script{c}>"),
        ] {
            let component = parse(&source).unwrap_or_else(|e| panic!("{c:?} {source:?}: {e:?}"));
            component.tokens.check_lossless(&source).expect("all bytes");
        }
    }
}

#[test]
fn other_unicode_spaces_are_not_whitespace() {
    for c in ['\u{85}', '\u{180E}', '\u{200B}'] {
        assert_eq!(
            attribute_names(&format!("<div a=\"1\"{c}b=x{c}y></div>")),
            ["a".to_owned(), format!("{c}b")],
            "{c:?}"
        );
        assert!(parse(&format!("{{#if{c}x}}{{/if}}")).is_err(), "{c:?}");
        assert!(parse(&format!("<div{c}></div>")).is_err(), "{c:?}");
    }
}
