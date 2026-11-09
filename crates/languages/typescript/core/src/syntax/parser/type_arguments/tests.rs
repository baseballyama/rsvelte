use rsvelte_kernel::source::positions::Span;

use super::super::{Lexer, Parser, T};
use crate::syntax_tree::SyntaxTree;

/// The definition the shared reads must agree with: one read per `<`, counting angles and
/// brackets until the angles close or a token no type argument list holds appears.
fn read_from(p: &Parser<'_, '_>, mut l: Lexer<'_>) -> bool {
    let mut scratch = Vec::new();
    let (mut angle, mut nest) = (1i32, 0i32);
    loop {
        let Ok(t) = l.next(&mut scratch) else {
            return false;
        };
        match t.t {
            T::Eof => return false,
            T::LParen | T::LBracket | T::LBrace => nest += 1,
            T::RParen | T::RBracket | T::RBrace => {
                nest -= 1;
                if nest < 0 {
                    return false;
                }
            }
            T::Op => {
                angle -= match p.text(t) {
                    "<" => -1,
                    ">" => 1,
                    ">>" => 2,
                    ">>>" => 3,
                    "|" | "&" | "-" => 0,
                    _ if nest > 0 => 0,
                    _ => return false,
                };
                if angle < 0 || (angle == 0 && nest != 0) {
                    return false;
                }
                if angle == 0 {
                    return l
                        .next(&mut scratch)
                        .is_ok_and(|next| p.follows_type_arguments(next));
                }
            }
            T::Identifier
            | T::String
            | T::Number
            | T::Dot
            | T::Comma
            | T::Question
            | T::Colon
            | T::Arrow
            | T::Ellipsis => {}
            _ if nest > 0 => {}
            _ => return false,
        }
    }
}

struct Random(u64);

impl Random {
    fn below(&mut self, n: usize) -> usize {
        self.0 = self
            .0
            .wrapping_mul(6_364_136_223_846_793_005)
            .wrapping_add(1);
        ((self.0 >> 33) % n as u64) as usize
    }
}

const TOKENS: [&str; 26] = [
    "a", "<", "<", "<", ">", ">", ">>", ">>>", "(", ")", "[", "]", "{", "}", ",", ".", "?", ":",
    "=>", "|", "-", "+", "!", ";", "\n", "1",
];

/// The positions just after each `<` token of `source_text`.
fn after_each_angle(source_text: &str) -> Vec<usize> {
    let mut l = Lexer::new(source_text, 0, source_text.len());
    let mut scratch = Vec::new();
    let mut positions = Vec::new();
    while let Ok(t) = l.next(&mut scratch) {
        match t.t {
            T::Eof => break,
            T::Op if t.span.text(source_text) == "<" => positions.push(l.position),
            _ => {}
        }
    }
    positions
}

#[test]
fn shared_reads_answer_as_one_read_per_angle_does() {
    let mut random = Random(11);
    let mut compared = 0;
    for _ in 0..5_000 {
        let length = 1 + random.below(40);
        let source_text: String = (0..length)
            .map(|_| TOKENS[random.below(TOKENS.len())])
            .collect::<Vec<_>>()
            .join(" ");
        let mut tree = SyntaxTree::new();
        let range = Span::new(0, source_text.len() as u32);
        let Ok(mut p) = Parser::new(&mut tree, &source_text, range, true) else {
            continue;
        };
        let mut positions = after_each_angle(&source_text);
        // Later `<`s first as well, so some are answered by a read that began before them.
        if random.below(2) == 0 {
            positions.reverse();
        }
        for position in positions {
            let mut l = p.lex;
            l.position = position;
            let expected = read_from(&p, l);
            p.lex = l;
            assert_eq!(
                p.type_arguments_before_call(),
                expected,
                "{source_text:?} at {position}"
            );
            compared += 1;
        }
    }
    assert!(compared > 10_000, "{compared}");
}
