use oxc_allocator::ArenaVec;
use oxc_ast::ast::{
    Expression, Statement, VariableDeclaration, VariableDeclarationKind, VariableDeclarator,
};
use oxc_parser::Kind;
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::DeclarationIdentifier;

use super::identifier::is_identifier_continue;
use super::{ParseResult, Parser, javascript_error};
use crate::syntax_tree::{Range, TemplateNode, TemplateNodeIdentifier, TokenType};

impl Parser<'_, '_> {
    pub(super) fn tag(&mut self) -> ParseResult<TemplateNodeIdentifier> {
        let start_offset = self.position;
        let inner = super::whitespace::trim_whitespace_start(&self.rest()[1..]);
        if inner.starts_with('#') {
            return self.block();
        }
        if inner.starts_with('@') {
            return self.special_tag(start_offset);
        }
        self.eat_token(TokenType::MustacheOpen, 1);
        self.skip_ws();
        // The declaration takes its `;`, and upstream reads `}` right after it.
        if let Some(declaration) = self.declaration()? {
            self.close_mustache()?;
            let span = Span::new(start_offset as u32, self.position as u32);
            return Ok(self.push_node(TemplateNode::Declaration { declaration, span }));
        }
        let expression = self.expression()?;
        self.close_mustache()?;
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push_node(TemplateNode::Expression { expression, span }))
    }

    fn declaration(&mut self) -> ParseResult<Option<DeclarationIdentifier>> {
        let rest = self.rest();
        // Upstream's `/(?:var|interface|enum)\b/y`, whose `\b` is an ASCII word boundary.
        if let Some(word) = ["var", "interface", "enum"].into_iter().find(|w| {
            rest.starts_with(w)
                && !rest
                    .as_bytes()
                    .get(w.len())
                    .is_some_and(|&b| b.is_ascii_alphanumeric() || b == b'_')
        }) {
            let at = self.position as u32;
            return Self::err_at(
                Span::new(at, at + word.len() as u32),
                "declaration_tag_invalid_type",
                "Declaration tags must be `let` or `const` declarations",
            );
        }
        let keyword = ["let", "const"].into_iter().any(|k| {
            rest.starts_with(k)
                && !rest[k.len()..]
                    .chars()
                    .next()
                    .is_some_and(is_identifier_continue)
        });
        if !keyword {
            return Ok(None);
        }
        let start_offset = self.position as u32;
        let source_type = self.source_type();
        let mark = self.builder.mark();
        let (statement, next) = self
            .builder
            .read_statement_at(start_offset, source_type)
            .map_err(javascript_error)?;
        let declaration = match statement {
            Statement::VariableDeclaration(declaration) => declaration,
            // `{let}` or `{constant + 1}` is an expression, as upstream reads it.
            Statement::ExpressionStatement(_) => {
                self.builder.rewind(mark);
                return Ok(None);
            }
            _ => {
                return Self::err_at(
                    Span::new(start_offset, next),
                    "parse_error",
                    "expected a `let` or `const` declaration",
                );
            }
        };
        self.javascript_region(start_offset, next);
        Ok(Some(self.builder.keep_declaration(declaration.unbox())))
    }

    fn special_tag(&mut self, start_offset: usize) -> ParseResult<TemplateNodeIdentifier> {
        if self.eat_marker('@', "html") {
            self.require_ws()?;
            let expression = self.expression()?;
            self.close_mustache()?;
            let span = Span::new(start_offset as u32, self.position as u32);
            return Ok(self.push_node(TemplateNode::Html { expression, span }));
        }
        if self.eat_marker('@', "render") {
            self.require_ws()?;
            let expression = self.read_expression()?;
            let call = match &expression {
                Expression::CallExpression(_) => true,
                Expression::ChainExpression(chain) => {
                    matches!(
                        chain.expression,
                        oxc_ast::ast::ChainElement::CallExpression(_)
                    )
                }
                _ => false,
            };
            if !call {
                let at = expression.span();
                return Self::err_at(
                    Span::new(at.start, at.end),
                    "render_tag_invalid_expression",
                    "`{@render ...}` tags can only contain call expressions",
                );
            }
            let expression = self.builder.keep_expression(expression);
            self.close_mustache()?;
            let span = Span::new(start_offset as u32, self.position as u32);
            return Ok(self.push_node(TemplateNode::Render { expression, span }));
        }
        if self.eat_marker('@', "const") {
            return self.const_tag(start_offset);
        }
        if self.eat_marker('@', "debug") {
            let list_start = self.component.debug_identifiers.len();
            self.skip_ws();
            if self.peek() != Some(b'}') {
                let identifiers = match self.read_expression()? {
                    Expression::SequenceExpression(sequence) => sequence.unbox().expressions,
                    expression => ArenaVec::from_value_in(expression, &self.builder.nodes()),
                };
                for identifier in identifiers {
                    if !matches!(identifier, Expression::Identifier(_)) {
                        let at = identifier.span();
                        return Self::err_at(
                            Span::new(at.start, at.start),
                            "debug_tag_invalid_arguments",
                            "{@debug ...} arguments must be identifiers, not arbitrary expressions",
                        );
                    }
                    let identifier = self.builder.keep_expression(identifier);
                    self.component.debug_identifiers.push(identifier);
                }
            }
            self.close_mustache()?;
            let span = Span::new(start_offset as u32, self.position as u32);
            let identifiers = Range {
                start: list_start as u32,
                len: (self.component.debug_identifiers.len() - list_start) as u32,
            };
            return Ok(self.push_node(TemplateNode::Debug { identifiers, span }));
        }
        let at = self.sigil().start_offset + 1;
        Self::err_at(
            Span::new(at, at),
            "expected_tag",
            "Expected 'html', 'render', 'attach', 'const', or 'debug'",
        )
    }

    fn const_tag(&mut self, start_offset: usize) -> ParseResult<TemplateNodeIdentifier> {
        self.require_ws()?;
        let pattern = self.read_pattern()?;
        self.skip_ws();
        if self.peek() != Some(b'=') {
            return self.expected_token("=");
        }
        self.eat_token(TokenType::JavaScript(Kind::Eq), 1);
        let expression_start = self.position;
        let initializer = self.read_expression()?;
        let at = initializer.span();
        // Upstream allows `a = (b, c)` but not `a = b, c = d`.
        if matches!(initializer, Expression::SequenceExpression(_))
            && !self.source_text[expression_start..at.start as usize].contains('(')
        {
            return Self::err_at(
                Span::new(at.start, at.end),
                "const_tag_invalid_expression",
                "{@const ...} must consist of a single variable declaration",
            );
        }
        let declarator_end = self.position as u32;
        self.close_mustache()?;
        let nodes = self.builder.nodes();
        let declarator = VariableDeclarator::new(
            oxc_span::Span::new(pattern.span.start, declarator_end),
            pattern.pattern,
            pattern.type_annotation,
            Some(initializer),
            false,
            &nodes,
        );
        // Upstream's declaration starts at `const`, after the `{@`.
        let declaration = VariableDeclaration::new(
            oxc_span::Span::new(start_offset as u32 + 2, self.position as u32 - 1),
            VariableDeclarationKind::Const,
            ArenaVec::from_value_in(declarator, &nodes),
            false,
            &nodes,
        );
        let declaration = self.builder.keep_declaration(declaration);
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push_node(TemplateNode::Const { declaration, span }))
    }
}
