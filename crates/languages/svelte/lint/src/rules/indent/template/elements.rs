//! Elements and their attributes.

use rsvelte_kernel::source::characters::trim_ecmascript;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Part, Range, TemplateNode, TokenType,
};

use super::Template;
use crate::rules::indent::layout::Item;

const PREFORMATTED: [&str; 3] = ["pre", "textarea", "template"];

impl Template<'_, '_> {
    pub(super) fn element(
        &mut self,
        span: Span,
        name: Span,
        attributes: Range,
        children: Range,
        start_tag: Span,
        has_end_tag: bool,
    ) {
        let component = self.component;
        let source = self.source();
        let name_text = name.text(source);
        let open = self.first(span);
        let end_tag = has_end_tag.then(|| self.end_tag_span(span)).flatten();
        if PREFORMATTED.contains(&name_text) || name_text == "style" {
            if name_text != "style" {
                let end_open = end_tag.and_then(|s| self.first(s));
                self.offset(end_open, 0, open);
            }
            for &child in self.children(children) {
                self.script.layout.ignore(component.node(child).span());
            }
        } else if let Some(end_tag) = end_tag {
            let items: Vec<Option<Item>> = self
                .children(children)
                .iter()
                .map(|&c| component.node(c))
                .filter(|n| !matches!(n, TemplateNode::Text { span } if trim_ecmascript(span.text(source)).is_empty()))
                .map(|n| Some(Item::Node(n.span())))
                .collect();
            self.script.layout.list(
                &items,
                Item::Node(start_tag),
                Some(Item::Node(end_tag)),
                1,
                false,
            );
        }
        let attributes = component.attributes(attributes);
        let spans: Vec<(Span, Span, Option<Span>)> =
            attributes.iter().map(|a| (a.span, a.name, None)).collect();
        self.start_tag(start_tag, &spans);
        for attribute in attributes {
            self.element_attribute(attribute);
        }
        let skip_children = PREFORMATTED.contains(&name_text) || name_text == "style";
        if !skip_children {
            self.visit_children(children);
        }
        if let Some(end_tag) = end_tag {
            self.end_tag(end_tag);
        }
    }

    /// `</name>`, the last tokens of an element that has its own end tag.
    pub(super) fn end_tag_span(&self, span: Span) -> Option<Span> {
        let tokens = self.tokens();
        let t = tokens.last_matching(span, |t| tokens.kind(t) == TokenType::EndTagOpen)?;
        Some(Span::new(tokens.span(t).start_offset, span.end_offset))
    }

    pub(super) fn element_attribute(&mut self, attribute: &Attribute) {
        let component = self.component;
        let parts: &[Part] = match attribute.value {
            AttributeValue::Parts(range) => component.parts(range),
            AttributeValue::True => &[],
        };
        match attribute.kind {
            AttributeKind::Attach => {
                self.script.layout.ignore(attribute.span);
                return;
            }
            AttributeKind::Spread => {
                self.shorthand(attribute.span);
            }
            AttributeKind::Attribute if attribute.shorthand => self.shorthand(attribute.span),
            AttributeKind::Attribute | AttributeKind::Style => {
                let values: Vec<Option<Item>> = parts
                    .iter()
                    .map(|p| {
                        Some(Item::Node(match *p {
                            Part::Text(span) | Part::Expression { span, .. } => span,
                        }))
                    })
                    .collect();
                self.attribute(attribute.span, attribute.name, &values, true);
            }
            _ => self.attribute(attribute.span, attribute.name, &[], false),
        }
        for part in parts {
            match *part {
                Part::Text(span) => self.text(span, None),
                Part::Expression { expression, span } => {
                    if matches!(
                        attribute.kind,
                        AttributeKind::Attribute | AttributeKind::Style
                    ) && !attribute.shorthand
                    {
                        let tokens = self.tokens();
                        let (open, close) = (tokens.first(span), tokens.last(span));
                        let item = Some(crate::rules::indent::script::Script::item(
                            self.expression_span(expression),
                        ));
                        if let Some(o) = open {
                            self.script.layout.list(
                                &[item],
                                Item::Token(o),
                                close.map(Item::Token),
                                1,
                                false,
                            );
                        }
                    }
                    self.visit_expression(expression);
                }
            }
        }
    }

    /// `{name}` and `{...spread}`.
    pub(super) fn shorthand(&mut self, span: Span) {
        let tokens = self.tokens();
        if let (Some(open), Some(close)) = (tokens.first(span), tokens.last(span)) {
            self.script
                .layout
                .list(&[], Item::Token(open), Some(Item::Token(close)), 1, false);
        }
    }
}
