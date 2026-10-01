use rsvelte_javascript::parser::parse_program;
use rsvelte_javascript::syntax_tree::SyntaxTree;
use rsvelte_kernel::source::positions::Span;

/// The gaps between consumed tokens hold only whitespace and exactly the recorded comments.
fn gaps_are_trivia(source_text: &str, typescript: bool) {
    let mut syntax_tree = SyntaxTree::new();
    if let Err(e) = parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        typescript,
    ) {
        panic!("{source_text:?}: {} at {:?}", e.message, e.span);
    }
    let mut comments = syntax_tree.comments.iter().peekable();
    let mut at = 0u32;
    let mut check_gap = |start_offset: u32, end_offset: u32| {
        let mut i = start_offset;
        while i < end_offset {
            if let Some(c) = comments.peek().filter(|c| c.start_offset == i) {
                assert!(
                    c.end_offset <= end_offset,
                    "comment {c:?} crosses a token in {source_text:?}"
                );
                i = c.end_offset;
                comments.next();
                continue;
            }
            let b = source_text.as_bytes()[i as usize];
            assert!(
                b.is_ascii_whitespace(),
                "untokenized {:?} at {i} in {source_text:?}",
                b as char
            );
            i += 1;
        }
    };
    for t in syntax_tree.tokens.iter() {
        check_gap(at, t.span.start_offset);
        at = t.span.end_offset;
    }
    check_gap(at, source_text.len() as u32);
    assert!(
        comments.next().is_none(),
        "a comment outside every gap in {source_text:?}"
    );
}

#[test]
fn tokens_comments_and_whitespace_are_the_source() {
    for source_text in [
        "let a = 1; // one\n/* two */ const b = `x${a}y${ `z${b}` }w`;",
        "const r = s.test(t) ? a / 2 : (b);",
        "function f(x, ...rest) { return x?.y ?? rest[0]; }\nf(1)",
        "let { a = 1, b: [c] } = $props();",
    ] {
        gaps_are_trivia(source_text, false);
    }
    gaps_are_trivia(
        "let x: Array<Array<number>> = []; const f = (a: number): number => a! as number;",
        true,
    );
}
