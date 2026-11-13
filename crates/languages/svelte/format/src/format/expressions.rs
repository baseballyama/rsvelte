//! Template expressions and statements, each formatted from the text the plugin gives Prettier.

use oxc_ast::ast::Expression;
use oxc_ast_visit::Visit;
use oxc_parser::Kind;
use oxc_span::GetSpan;
use rsvelte_kernel::source::tokens::{Token, TokenKind};
use rsvelte_typescript_tree::{DeclarationIdentifier, ExpressionIdentifier};

use super::javascript::{Adjust, Part, trim_semicolon};
use super::patterns::{has_typescript, span};
use super::{LayoutInstructionIdentifier, Printer, R, Span, TokenType, Unsupported};
use crate::options::EmbeddedLanguageFormatting;

/// Which comments around a template expression the output keeps.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Comments {
    /// Those the plugin's `getText` takes: the ones before it.
    AsThePlugin,
    /// None: one the printer would lose is refused.
    Refused,
}

impl Printer<'_, '_, '_> {
    /// `{@html …}` and `{@render …}`.
    pub(super) fn tag(
        &mut self,
        open: &'static str,
        expression: ExpressionIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let open = self.lit(open);
        let e = self.expression(expression, false, false)?;
        let close = self.lit("}");
        Ok(self.cat(&[open, e, close]))
    }

    /// An embedded expression (`printJS`), optionally forced onto one line or into single quotes.
    pub(super) fn expression(
        &mut self,
        e: ExpressionIdentifier,
        single_line: bool,
        single_quote: bool,
    ) -> R<LayoutInstructionIdentifier> {
        self.expression_with(e, single_line, single_quote, false, Comments::AsThePlugin)
    }

    /// The plugin parses each expression wrapped as `(expression\n)`, and Prettier then keeps the
    /// parentheses around an assignment or a sequence at the root; `bind:` removes them from a
    /// sequence (`removeParentheses`).
    /// With `embeddedLanguageFormatting: "off"`, Prettier does not call the plugin's `embed`, and
    /// its printer knows only a name and a literal (`JSON.stringify(value)`); anything else throws.
    fn unformatted_expression(
        &mut self,
        e: ExpressionIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let e = self.c.javascript.get_expression(e);
        let span = span(e.span());
        let raw = span.text(self.source_text);
        let text = match e {
            Expression::Identifier(identifier) => identifier.name.as_str().to_owned(),
            Expression::BooleanLiteral(_) | Expression::NullLiteral(_) => raw.to_owned(),
            // Written the way `JSON.stringify` writes the value, which prints a double of up to 15
            // digits as written.
            Expression::NumericLiteral(_)
                if raw == "0"
                    || (!raw.starts_with('0')
                        && raw.len() <= 15
                        && raw.bytes().all(|b| b.is_ascii_digit())) =>
            {
                raw.to_owned()
            }
            Expression::StringLiteral(_)
                if !raw[1..raw.len() - 1].contains(|c: char| c == '\\' || c == '"' || c < ' ') =>
            {
                format!("\"{}\"", &raw[1..raw.len() - 1])
            }
            _ => {
                return Err(Unsupported::at(
                    "an expression that `embeddedLanguageFormatting: off` cannot print",
                    span,
                ));
            }
        };
        Ok(self.d().text(&text))
    }

    /// The plugin throws, or drops code, for this construct when `embed` does not run.
    pub(super) fn refuse_unembedded(&self, span: Span) -> R<()> {
        if self.options.embedded_language_formatting == EmbeddedLanguageFormatting::Off {
            return Err(Unsupported::at(
                "this construct with `embeddedLanguageFormatting: off`",
                span,
            ));
        }
        Ok(())
    }

    pub(super) fn expression_with(
        &mut self,
        e: ExpressionIdentifier,
        single_line: bool,
        single_quote: bool,
        bare_sequence: bool,
        comments: Comments,
    ) -> R<LayoutInstructionIdentifier> {
        if self.options.embedded_language_formatting == EmbeddedLanguageFormatting::Off {
            return self.unformatted_expression(e);
        }
        let expression = self.c.javascript.get_expression(e);
        let adjust = Adjust {
            single_quote,
            single_line,
            remove_parentheses: bare_sequence
                && matches!(expression, Expression::SequenceExpression(_)),
        };
        // The parentheses come off only when the text starts with them.
        let span = if comments == Comments::AsThePlugin && !adjust.remove_parentheses {
            self.with_leading_comments(span(expression.span()))
        } else {
            span(expression.span())
        };
        let d = self.embed(span, Part::Expression, adjust)?;
        // The plugin parses `(a = b\n)`, and Prettier keeps those parentheses; oxc keeps them
        // around a sequence only.
        if !matches!(expression, Expression::AssignmentExpression(_)) {
            return Ok(d);
        }
        let open = self.lit("(");
        let close = self.lit(")");
        Ok(self.cat(&[open, d, close]))
    }

    /// The plugin's `getText` of a template expression: from its first leading comment to its
    /// end. The comments after it, and those outside its parentheses, which Svelte attaches to no
    /// node, are in no text the plugin prints: it deletes them, so they are refused.
    fn with_leading_comments(&mut self, expression: Span) -> Span {
        let c = self.c;
        let comment = |t: &&Token<TokenType>| t.kind == TokenType::JavaScriptComment;
        let mut before = (c.tokens.until_offset(expression.start_offset).iter().rev())
            .take_while(|t| t.kind.is_trivia() || t.kind == TokenType::JavaScript(Kind::LParen))
            .peekable();
        let mut first = expression.start_offset;
        while let Some(t) = before.next_if(|t| t.kind.is_trivia()) {
            if t.kind == TokenType::JavaScriptComment {
                first = t.span.start_offset;
            }
        }
        let outside = before.filter(comment).map(|t| {
            (
                t.span,
                "a comment outside a template expression's parentheses, which the plugin deletes",
            )
        });
        self.embedder.dropped.extend(outside);
        let trailing = (c.tokens.from_offset(expression.end_offset).iter())
            .take_while(|t| t.kind.is_trivia() || t.kind == TokenType::JavaScript(Kind::RParen))
            .filter(comment)
            .map(|t| {
                (
                    t.span,
                    "a comment after a template expression, which the plugin deletes",
                )
            });
        self.embedder.dropped.extend(trailing);
        Span::new(first, expression.end_offset)
    }

    /// The source of `e`.
    pub(super) fn javascript_span(&self, e: ExpressionIdentifier) -> Span {
        span(self.c.javascript.get_expression(e).span())
    }

    /// `{@const a = b}`'s declarator, which the plugin formats as the expression `a = b`.
    pub(super) fn const_tag(
        &mut self,
        declaration: DeclarationIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let declaration = self.c.javascript.get_declaration(declaration);
        let [declarator] = declaration.declarations.as_slice() else {
            return Err(Unsupported::at(
                "a {@const} with other than one declarator",
                span(declaration.span),
            ));
        };
        let span = span(declarator.span);
        // `(a: T = b)` is no expression: the plugin's parse fails and it prints the source.
        if declarator.type_annotation.is_some() {
            let source = span.text(self.source_text);
            if source.contains(['\n', '\r']) {
                return Err(Unsupported::at(
                    "a typed {@const} on more than one line",
                    span,
                ));
            }
            return Ok(self.d().text(source));
        }
        self.embed(span, Part::Expression, Adjust::default())
    }

    /// A statement in the template (`{let a = 1}`), without the `;` it ends with, as the plugin
    /// trims it. The trim misses a `;` that Prettier's doc cleanup has merged into the text before
    /// it, which happens when the statement prints as plain text (`let a;`).
    pub(super) fn template_statement(
        &mut self,
        statement: DeclarationIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let statement = self.c.javascript.get_declaration(statement);
        let plain = matches!(statement.declarations.as_slice(), [only] if only.init.is_none());
        let span = span(statement.span);
        // Whether Prettier merges `let a: T;` into one text is not known.
        if plain && has_typescript(|f| f.visit_variable_declaration(statement)) {
            return Err(Unsupported::at(
                "a typed declaration without a value in the template",
                span,
            ));
        }
        let text = oxc_formatter_core::normalize_newlines(span.text(self.source_text), ['\r']);
        let mut ir = self.format_javascript(&text, span, Part::Statement, false)?;
        if !plain {
            trim_semicolon(&mut ir);
        }
        Ok(self.keep(ir))
    }
}
