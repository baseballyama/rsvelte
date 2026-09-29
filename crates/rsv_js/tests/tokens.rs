use rsv_js::ast::Ast;
use rsv_js::parser::parse_program;
use rsv_kernel::source::Span;

/// The gaps between consumed tokens hold only whitespace and exactly the recorded comments.
fn gaps_are_trivia(src: &str, ts: bool) {
    let mut ast = Ast::new();
    if let Err(e) = parse_program(&mut ast, src, Span::new(0, src.len() as u32), ts) {
        panic!("{src:?}: {} at {:?}", e.message, e.span);
    }
    let mut comments = ast.comments.iter().peekable();
    let mut at = 0u32;
    let mut check_gap = |lo: u32, hi: u32| {
        let mut i = lo;
        while i < hi {
            if let Some(c) = comments.peek().filter(|c| c.lo == i) {
                assert!(c.hi <= hi, "comment {c:?} crosses a token in {src:?}");
                i = c.hi;
                comments.next();
                continue;
            }
            let b = src.as_bytes()[i as usize];
            assert!(b.is_ascii_whitespace(), "untokenized {:?} at {i} in {src:?}", b as char);
            i += 1;
        }
    };
    for t in ast.tokens.iter() {
        check_gap(at, t.span.lo);
        at = t.span.hi;
    }
    check_gap(at, src.len() as u32);
    assert!(comments.next().is_none(), "a comment outside every gap in {src:?}");
}

#[test]
fn tokens_comments_and_whitespace_are_the_source() {
    for src in [
        "let a = 1; // one\n/* two */ const b = `x${a}y${ `z${b}` }w`;",
        "const r = s.test(t) ? a / 2 : (b);",
        "function f(x, ...rest) { return x?.y ?? rest[0]; }\nf(1)",
        "let { a = 1, b: [c] } = $props();",
    ] {
        gaps_are_trivia(src, false);
    }
    gaps_are_trivia("let x: Array<Array<number>> = []; const f = (a: number): number => a! as number;", true);
}
