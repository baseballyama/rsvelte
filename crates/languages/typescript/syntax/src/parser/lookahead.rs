use super::{Lexer, Parser, R, Span, T};

impl Parser<'_, '_> {
    pub(super) fn lookahead_group(lex: &mut Lexer<'_>, comments: &mut Vec<Span>) -> R<()> {
        let mut depth = 1u32;
        let mut substitutions = Vec::new();
        let mut operand = true;
        loop {
            let mut token = lex.next(comments)?;
            if token.t == T::Op && operand && matches!(lex.text(token.span), "/" | "/=") {
                token = lex.regex(token.span)?.token;
            }
            if token.t == T::RBrace && substitutions.last() == Some(&(depth - 1)) {
                substitutions.pop();
                depth -= 1;
                token = lex.template_continue(token.span)?;
            }
            match token.t {
                T::LParen | T::LBracket | T::LBrace => depth += 1,
                T::RParen | T::RBracket | T::RBrace => {
                    depth -= 1;
                    if depth == 0 {
                        return Ok(());
                    }
                }
                T::Template { tail: false } => {
                    substitutions.push(depth);
                    depth += 1;
                }
                T::Eof => {
                    return Err(super::ParseError {
                        message: "unterminated parenthesized expression".into(),
                        span: token.span,
                    });
                }
                _ => {}
            }
            operand = match token.t {
                T::Identifier => matches!(
                    lex.text(token.span),
                    "return"
                        | "throw"
                        | "typeof"
                        | "void"
                        | "delete"
                        | "in"
                        | "instanceof"
                        | "new"
                        | "yield"
                        | "await"
                ),
                T::Number
                | T::String
                | T::Regex
                | T::Template { tail: true }
                | T::RParen
                | T::RBracket
                | T::RBrace
                | T::Dot
                | T::QuestionDot => false,
                T::Op if matches!(lex.text(token.span), "++" | "--") => operand,
                _ => true,
            };
        }
    }
}
