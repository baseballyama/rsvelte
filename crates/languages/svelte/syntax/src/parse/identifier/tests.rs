use super::match_bracket;

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
            match_bracket(text, b'{', b'}').or_else(|| match_bracket(text, b'[', b']')),
            Some(matched.len()),
            "{text}"
        );
    }
}

#[test]
fn a_template_literal_inside_generics_uses_the_default_brackets() {
    let text = "<T extends `${'>'}`>(x: T)";
    assert_eq!(
        match_bracket(text, b'<', b'>'),
        Some("<T extends `${'>'}`>".len())
    );
}

#[test]
fn a_bracket_that_does_not_match_or_an_end_first_is_none() {
    assert_eq!(match_bracket("{ a ]", b'{', b'}'), None);
    assert_eq!(match_bracket("{ a = `${b}", b'{', b'}'), None);
}
