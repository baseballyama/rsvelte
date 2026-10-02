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
