use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Range, TemplateNode, TemplateNodeIdentifier, TokenType};
use rsvelte_typescript::parser::parse_declaration_prefix;
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::identifier::is_identifier_continue;
use super::{ParseResult, Parser, javascript_error};

impl Parser<'_> {
    pub(super) fn tag(&mut self) -> ParseResult<TemplateNodeIdentifier> {
        let start_offset = self.position;
        let inner = super::whitespace::trim_ascii_start(&self.rest()[1..]);
        if inner.starts_with('#') {
            return self.block();
        }
        if inner.starts_with('@') {
            return self.special_tag(start_offset);
        }
        self.eat_token(TokenType::MustacheOpen, 1);
        self.skip_ws();
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

    fn declaration(&mut self) -> ParseResult<Option<NodeIdentifier>> {
        let rest = self.rest();
        let keyword = ["let", "const", "var"].into_iter().find(|k| {
            rest.starts_with(k)
                && !rest[k.len()..]
                    .chars()
                    .next()
                    .is_some_and(is_identifier_continue)
        });
        match keyword {
            None => Ok(None),
            Some("var") => {
                self.err("`{var …}` is not a valid declaration tag; use `let` or `const`")
            }
            Some(_) => {
                let (tokens, comments) = (
                    self.component.javascript.tokens.len(),
                    self.component.javascript.comments.len(),
                );
                let start_offset = self.position as u32;
                let (declaration, next) = parse_declaration_prefix(
                    &mut self.component.javascript,
                    self.source_text,
                    start_offset,
                    self.source_text.len() as u32,
                    self.typescript,
                )
                .map_err(javascript_error)?;
                self.javascript_region(start_offset, next, tokens, comments);
                self.position = next as usize;
                self.component.template_expressions.push(declaration);
                Ok(Some(declaration))
            }
        }
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
            let expression = self.expression()?;
            if !matches!(
                self.component.javascript.kind(expression),
                Kind::Call { .. }
            ) {
                let at = self
                    .component
                    .javascript
                    .source_location(expression)
                    .span()
                    .expect("parsed from source");
                return Self::err_at(at, "`{@render …}` tags can only contain call expressions");
            }
            self.close_mustache()?;
            let span = Span::new(start_offset as u32, self.position as u32);
            return Ok(self.push_node(TemplateNode::Render { expression, span }));
        }
        if self.eat_marker('@', "const") {
            return self.const_tag(start_offset);
        }
        if self.eat_marker('@', "debug") {
            let list_start = self.component.javascript_lists.len();
            self.skip_ws();
            if self.peek() != Some(b'}') {
                let expression = self.expression()?;
                self.component.template_expressions.pop();
                let identifiers = match self.component.javascript.kind(expression) {
                    Kind::Sequence(items) => items,
                    _ => std::slice::from_ref(&expression),
                };
                for &i in identifiers {
                    if self.component.javascript.atom(i).is_none() {
                        let at = self
                            .component
                            .javascript
                            .source_location(i)
                            .span()
                            .expect("parsed from source");
                        return Self::err_at(
                            at,
                            "`{@debug …}` arguments must be identifiers, not arbitrary expressions",
                        );
                    }
                    self.component.template_expressions.push(i);
                }
                self.component
                    .javascript_lists
                    .extend_from_slice(identifiers);
            }
            self.close_mustache()?;
            let span = Span::new(start_offset as u32, self.position as u32);
            let identifiers = Range {
                start: list_start as u32,
                len: (self.component.javascript_lists.len() - list_start) as u32,
            };
            return Ok(self.push_node(TemplateNode::Debug { identifiers, span }));
        }
        self.err("expected `html`, `render`, `const` or `debug`")
    }

    fn const_tag(&mut self, start_offset: usize) -> ParseResult<TemplateNodeIdentifier> {
        self.require_ws()?;
        let pattern = self.pattern()?;
        self.skip_ws();
        if self.peek() != Some(b'=') {
            return self.err("expected `=`");
        }
        self.eat_token(TokenType::JavaScript(rsvelte_typescript::lexer::T::Op), 1);
        let expression_start = self.position;
        let initializer = self.expression()?;
        self.component.template_expressions.pop();
        let initializer_start = self
            .component
            .javascript
            .source_location(initializer)
            .span()
            .expect("parsed from source")
            .start_offset as usize;
        // Upstream allows `a = (b, c)` but not `a = b, c = d`.
        if matches!(
            self.component.javascript.kind(initializer),
            Kind::Sequence(_)
        ) && !self.source_text[expression_start..initializer_start].contains('(')
        {
            return self.err("`{@const …}` must be one declaration, like `{@const a = b}`");
        }
        let declarator_end = self.position as u32;
        let pattern_start = self
            .component
            .javascript
            .source_location(pattern)
            .span()
            .expect("parsed from source")
            .start_offset;
        self.close_mustache()?;
        let javascript = &mut self.component.javascript;
        let declarator = javascript.declarator(
            pattern,
            Some(initializer),
            Span::new(pattern_start, declarator_end),
        );
        // Upstream's declaration starts at `const`, after the `{@`.
        let declaration = javascript.var_declaration(
            flag::CONST,
            &[declarator],
            Span::new(start_offset as u32 + 2, self.position as u32 - 1),
        );
        self.component.template_expressions.push(declaration);
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push_node(TemplateNode::Const { declaration, span }))
    }
}
