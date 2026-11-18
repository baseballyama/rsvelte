//! The `<script>` element: its tags, its attributes and its program.

use oxc_ast_visit::Visit;
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Script as ScriptElement, TokenType};

use super::Template;
use crate::rules::indent::layout::Item;
use crate::rules::indent::script::Script;

impl Template<'_, '_> {
    pub(super) fn script_element(&mut self, script: &ScriptElement) {
        let start_tag = Span::new(script.span.start_offset, script.content.start_offset);
        let end_tag = Span::new(script.content.end_offset, script.span.end_offset);
        let program = self.tree().get_program(script.program);
        let directives = program.directives.iter().map(|d| d.span);
        let items = Script::items(directives.chain(program.body.iter().map(GetSpan::span)));
        let offset = u32::from(self.script.layout.options.indent_script);
        self.script.layout.list(
            &items,
            Item::Node(start_tag),
            Some(Item::Node(end_tag)),
            offset,
            false,
        );
        let attributes: Vec<(Span, Span, Option<Span>)> = script
            .attributes
            .iter()
            .map(|&(name, value)| (self.tag_attribute_span(name, value), name, value))
            .collect();
        self.start_tag(start_tag, &attributes);
        for (span, name, _) in &attributes {
            self.attribute(*span, *name, &[], true);
            // svelte-eslint-parser turns parsed generics into a node upstream does not know.
            if script.generics.is_some() && name.text(self.source()) == "generics" {
                self.script.layout.ignore(*span);
            }
        }
        for directive in &program.directives {
            self.script.visit_directive(directive);
        }
        for statement in &program.body {
            self.script.visit_statement(statement);
        }
        self.end_tag(end_tag);
    }

    /// A `<script>` attribute from its name to its closing quote.
    fn tag_attribute_span(&self, name: Span, value: Option<Span>) -> Span {
        let tokens = self.tokens();
        let Some(name_token) = tokens.first(name) else {
            return name;
        };
        let Some(eq) = tokens
            .after(name_token)
            .filter(|&t| tokens.kind(t) == TokenType::Eq)
        else {
            return name;
        };
        let Some(next) = tokens.after(eq) else {
            return name;
        };
        if matches!(
            tokens.kind(next),
            TokenType::DoubleQuote | TokenType::SingleQuote
        ) {
            let close = (next + 1..tokens.count())
                .take_while(|&t| {
                    tokens.kind(t) == TokenType::AttributeText
                        || matches!(
                            tokens.kind(t),
                            TokenType::DoubleQuote | TokenType::SingleQuote
                        )
                })
                .find(|&t| {
                    matches!(
                        tokens.kind(t),
                        TokenType::DoubleQuote | TokenType::SingleQuote
                    )
                });
            if let Some(close) = close {
                return Span::new(name.start_offset, tokens.span(close).end_offset);
            }
        }
        Span::new(
            name.start_offset,
            value.map_or(name.end_offset, |v| v.end_offset),
        )
    }
}
