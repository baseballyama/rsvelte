use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

use super::*;

/// The operators, longest first: the table the dispatch in [`Lexer::punct`] replaces.
const OPS: &[&str] = &[
    ">>>=", "...", "===", "!==", "**=", "<<=", ">>=", ">>>", "&&=", "||=", "??=", "=>", "==", "!=",
    "<=", ">=", "&&", "||", "??", "?.", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=",
    "<<", ">>", "**", "{", "}", "(", ")", "[", "]", ";", ",", "<", ">", "+", "-", "*", "/", "%",
    "&", "|", "^", "!", "~", "?", ":", "=", ".", "@",
];

fn by_table(s: &[u8]) -> Option<(usize, T)> {
    for op in OPS {
        if s.starts_with(op.as_bytes()) {
            if *op == "?." && s.get(2).is_some_and(u8::is_ascii_digit) {
                continue;
            }
            let t = match *op {
                "(" => T::LParen,
                ")" => T::RParen,
                "{" => T::LBrace,
                "}" => T::RBrace,
                "[" => T::LBracket,
                "]" => T::RBracket,
                ";" => T::Semi,
                "," => T::Comma,
                "." => T::Dot,
                "..." => T::Ellipsis,
                "?" => T::Question,
                "?." => T::QuestionDot,
                ":" => T::Colon,
                "=>" => T::Arrow,
                "@" => T::At,
                _ => T::Op,
            };
            return Some((op.len(), t));
        }
    }
    None
}

/// Every string of up to four bytes over the operators' bytes, a digit, a letter and
/// whitespace: the dispatch agrees with the table on each.
#[test]
fn punctuators_are_the_longest_match_of_the_operator_table() {
    fn all(s: &mut Vec<u8>, alphabet: &[u8], checked: &mut usize) {
        if let Some(&b) = s.first() {
            let source_text = std::str::from_utf8(s).expect("ASCII");
            let got = Lexer::new(source_text, 0, source_text.len()).punct(b);
            assert_eq!(got, by_table(s), "{source_text:?}");
            *checked += 1;
        }
        if s.len() < 4 {
            for &c in alphabet {
                s.push(c);
                all(s, alphabet, checked);
                s.pop();
            }
        }
    }
    let mut alphabet: Vec<u8> = OPS
        .iter()
        .flat_map(|o| o.bytes())
        .chain(*b"0a \n")
        .collect();
    alphabet.sort_unstable();
    alphabet.dedup();
    let mut checked = 0;
    all(&mut Vec::new(), &alphabet, &mut checked);
    assert_eq!(
        checked,
        (1..=4).map(|n| alphabet.len().pow(n)).sum::<usize>()
    );
}

// From Node: the cooked values of `a\x62`, `a<CR>b` and `a<CR><LF>b` written in a template.
#[test]
fn a_template_cooks_escapes_and_reads_a_carriage_return_as_a_line_feed() {
    assert_eq!(cook_template("a\\x62"), "ab");
    assert_eq!(cook_template("a\rb"), "a\nb");
    assert_eq!(cook_template("a\r\nb"), "a\nb");
    assert_eq!(cook_template("a\\\r\nb"), "ab");
}

#[test]
fn every_ecmascript_line_terminator_ends_a_line_comment_and_counts_as_a_newline() {
    for terminator in ["\n", "\r", "\r\n", "\u{2028}", "\u{2029}"] {
        for comment in ["// c", "/* \u{0} */"] {
            let comment = comment.replace('\u{0}', terminator);
            let source_text = format!("a {comment}{terminator}b");
            let mut lexer = Lexer::new(&source_text, 0, source_text.len());
            let mut comments = Vec::new();
            let a = lexer.next(&mut comments).expect("lexes");
            let b = lexer.next(&mut comments).expect("lexes");
            assert_eq!(lexer.text(b.span), "b", "{source_text:?}");
            assert!(b.newline_before, "{source_text:?}");
            assert!(!a.newline_before);
            assert_eq!(comments.len(), 1, "{source_text:?}");
        }
    }
}

#[test]
fn a_carriage_return_ends_a_string_unterminated() {
    let source_text = "'a\rb'";
    let mut lexer = Lexer::new(source_text, 0, source_text.len());
    lexer
        .next(&mut Vec::new())
        .expect_err("a string cannot cross a line break");
}

#[test]
fn every_ecmascript_whitespace_separates_tokens() {
    let spaces = ('\u{80}'..='\u{FFFF}')
        .filter(|&c| is_ecmascript_whitespace(c) && !matches!(c, '\u{2028}' | '\u{2029}'));
    let mut checked = 0;
    for space in spaces {
        let source_text = format!("a{space}b");
        let mut lexer = Lexer::new(&source_text, 0, source_text.len());
        let a = lexer.next(&mut Vec::new()).expect("lexes");
        let b = lexer.next(&mut Vec::new()).expect("lexes");
        assert_eq!(lexer.text(a.span), "a", "{space:?}");
        assert_eq!(
            b.span.start_offset as usize,
            1 + space.len_utf8(),
            "{space:?}"
        );
        assert!(!b.newline_before, "{space:?}");
        checked += 1;
    }
    // U+00A0, U+1680, U+2000 to U+200A, U+202F, U+205F, U+3000 and U+FEFF.
    assert_eq!(checked, 17);
}

#[test]
fn an_identifier_reads_unicode_escapes_and_its_name_decodes_them() {
    let source_text = concat!("\\", "u0061b c\\u{62}\\u{1F} d");
    let mut lexer = Lexer::new(source_text, 0, source_text.len());
    let first = lexer.next(&mut Vec::new()).expect("lexes");
    let second = lexer.next(&mut Vec::new()).expect("lexes");
    assert_eq!((first.t, first.span), (T::Identifier, Span::new(0, 7)));
    assert_eq!((second.t, second.span), (T::Identifier, Span::new(8, 21)));
    assert_eq!(identifier_name(lexer.text(first.span)), "ab");
    assert_eq!(identifier_name(lexer.text(second.span)), "cb\u{1F}");
    assert_eq!(identifier_name("plain"), "plain");
}

#[test]
fn a_malformed_identifier_escape_is_refused() {
    for source_text in [r"a\x41", r"a\u41", r"a\u{}", r"a\u{110000}", r"a\u{41"] {
        let mut lexer = Lexer::new(source_text, 0, source_text.len());
        lexer.next(&mut Vec::new()).expect_err(source_text);
    }
}
