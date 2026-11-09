use super::*;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum K {
    Word,
    Space,
}

impl TokenKind for K {
    fn is_trivia(self) -> bool {
        self == Self::Space
    }
}

fn words(source_text: &str) -> Tokens<K> {
    let mut t = Tokens::new();
    let mut start_offset = 0;
    for (i, c) in source_text.char_indices().chain([(source_text.len(), ' ')]) {
        let space = c == ' ';
        let prev_space = i > 0 && source_text.as_bytes()[i - 1] == b' ';
        if i > start_offset && (space != prev_space || i == source_text.len()) {
            t.push(
                if prev_space { K::Space } else { K::Word },
                Span::new(start_offset as u32, i as u32),
            );
            start_offset = i;
        }
    }
    t
}

#[test]
fn lookups_skip_trivia() {
    let source_text = "ab  cd e";
    let t = words(source_text);
    assert_eq!(t.check_lossless(source_text), Ok(()));
    let text =
        |identifier: Option<TokenIdentifier>| identifier.map(|i| t.get(i).span.text(source_text));
    assert_eq!(text(t.at(3)), Some("  "));
    assert_eq!(text(t.before(4)), Some("ab"));
    assert_eq!(text(t.after(2)), Some("cd"));
    assert_eq!(text(t.after(8)), None);
    assert_eq!(text(t.before(0)), None);
}

#[test]
fn slices_by_offset() {
    let source_text = "ab  cd e";
    let t = words(source_text);
    let texts = |tokens: &[Token<K>]| {
        tokens
            .iter()
            .map(|token| token.span.text(source_text))
            .collect::<Vec<_>>()
    };
    assert_eq!(texts(t.from_offset(3)), ["cd", " ", "e"]);
    assert_eq!(texts(t.until_offset(5)), ["ab", "  "]);
    assert_eq!(texts(t.within(Span::new(2, 7))), ["  ", "cd", " "]);
    assert_eq!(texts(t.within(Span::new(3, 3))), Vec::<&str>::new());
}

#[test]
fn a_gap_or_a_short_table_is_reported() {
    let mut t = Tokens::new();
    t.push(K::Word, Span::new(0, 2));
    t.push(K::Word, Span::new(3, 4));
    assert_eq!(t.check_lossless("ab c"), Err(Span::new(2, 3)));
    assert_eq!(words("ab").check_lossless("ab "), Err(Span::new(2, 3)));
}

#[test]
#[should_panic(expected = "overlaps")]
fn tokens_cannot_overlap() {
    let mut t = Tokens::new();
    t.push(K::Word, Span::new(0, 2));
    t.push(K::Word, Span::new(1, 3));
}
