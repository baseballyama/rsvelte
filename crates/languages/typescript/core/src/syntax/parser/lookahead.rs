use super::{Lexer, Parser, R, Span, T};

impl Parser<'_, '_> {
    /// With `lex` just after an opening bracket, moves it past the matching closing one.
    ///
    /// Where each group ends depends only on where it starts, so every group a scan closes is
    /// remembered in [`Parser::groups`] and skipped by later scans: asking at each of `n` nested
    /// `(` costs `O(n)` in total, not `O(n²)`.
    pub(super) fn lookahead_group(&self, lex: &mut Lexer<'_>, comments: &mut Vec<Span>) -> R<()> {
        let mut groups = self.groups.borrow_mut();
        let start = lex.position as u32;
        if let Some(&end) = groups.get(&start) {
            lex.position = end as usize;
            return Ok(());
        }
        let mut depth = 1u32;
        let mut substitutions = Vec::new();
        // The open brackets, with the lexer position after each and the depth it opened.
        let mut brackets: Vec<(u32, u32)> = Vec::new();
        // A closing token that matches no opening one breaks the nesting the cache relies on.
        let mut nested = true;
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
                T::LParen | T::LBracket | T::LBrace => {
                    let after = lex.position as u32;
                    if let Some(&end) = groups.get(&after) {
                        lex.position = end as usize;
                        operand = false;
                        continue;
                    }
                    depth += 1;
                    brackets.push((after, depth));
                }
                T::RParen | T::RBracket | T::RBrace => {
                    match brackets.last() {
                        Some(&(after, opened)) if opened == depth => {
                            brackets.pop();
                            if nested {
                                groups.insert(after, lex.position as u32);
                            }
                        }
                        None if depth == 1 => {}
                        _ => nested = false,
                    }
                    depth -= 1;
                    if depth == 0 {
                        if nested {
                            groups.insert(start, lex.position as u32);
                        }
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
