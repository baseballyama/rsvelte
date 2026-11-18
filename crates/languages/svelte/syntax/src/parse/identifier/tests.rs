use super::{Unmatched, match_bracket};

#[test]
fn brackets_in_strings_and_template_literals_do_not_count() {
    for (text, matched) in [
        ("{ y = '{' }} rest", "{ y = '{' }"),
        ("{ y = ']' } rest", "{ y = ']' }"),
        ("{ y = `${`\"`}` } rest", "{ y = `${`\"`}` }"),
        ("{ y = `${`John`}` } rest", "{ y = `${`John`}` }"),
        ("[a, { b = `}${[1]}` }] rest", "[a, { b = `}${[1]}` }]"),
    ] {
        assert_eq!(
            match_bracket(text, b'{', b'}').or_else(|_| match_bracket(text, b'[', b']')),
            Ok(matched.len()),
            "{text}"
        );
    }
}

#[test]
fn a_template_literal_inside_generics_uses_the_default_brackets() {
    let text = "<T extends `${'>'}`>(x: T)";
    assert_eq!(
        match_bracket(text, b'<', b'>'),
        Ok("<T extends `${'>'}`>".len())
    );
}

#[test]
fn a_bracket_that_does_not_match_an_end_or_an_open_string_is_an_error() {
    assert_eq!(
        match_bracket("{ a ]", b'{', b'}'),
        Err(Unmatched::Bracket {
            at: 4,
            expected: b'}'
        })
    );
    assert_eq!(
        match_bracket("{ a = `${b}", b'{', b'}'),
        Err(Unmatched::Quote(7))
    );
    assert_eq!(
        match_bracket("{ a = \"b }", b'{', b'}'),
        Err(Unmatched::Quote(7))
    );
    assert_eq!(match_bracket("{ a = [b] ", b'{', b'}'), Err(Unmatched::End));
}
