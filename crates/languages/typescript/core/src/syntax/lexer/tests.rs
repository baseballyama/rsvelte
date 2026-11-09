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
