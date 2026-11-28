//! Elements, their attributes and directives.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Part, Range, decode_attribute,
};

use super::{Place, Printer};

impl Printer<'_> {
    pub(super) fn tag(&mut self, kind: &str, span: Span, fields: impl FnOnce(&mut Self)) {
        self.out.object();
        self.out.key("type").string(kind);
        self.span(span);
        fields(self);
        self.out.end();
    }

    pub(super) fn element(
        &mut self,
        name: Span,
        attributes: Range,
        children: Range,
        span: Span,
        place: Place,
    ) {
        let name_text = self.text(name);
        let kind = match name_text {
            "svelte:head" => "SvelteHead",
            "svelte:options" => "SvelteOptions",
            "svelte:window" => "SvelteWindow",
            "svelte:document" => "SvelteDocument",
            "svelte:body" => "SvelteBody",
            "svelte:element" => "SvelteElement",
            "svelte:component" => "SvelteComponent",
            "svelte:self" => "SvelteSelf",
            "svelte:fragment" => "SvelteFragment",
            "svelte:boundary" => "SvelteBoundary",
            _ if rsvelte_svelte_syntax::names::is_component_name(name_text) => "Component",
            "title" if place.in_head => "TitleElement",
            "slot" if !place.in_shadow_root => "SlotElement",
            _ => "RegularElement",
        };
        let mut inner = place;
        match kind {
            "SvelteHead" => inner.in_head = true,
            "RegularElement" | "Component" => inner.in_head = false,
            _ => {}
        }
        if kind == "RegularElement"
            && self.component.attributes(attributes).iter().any(|a| {
                a.kind == AttributeKind::Attribute && self.text(a.name) == "shadowrootmode"
            })
        {
            inner.in_shadow_root = true;
        }
        let this = matches!(kind, "SvelteElement" | "SvelteComponent")
            .then(|| {
                self.component
                    .attributes(attributes)
                    .iter()
                    .position(|a| a.kind == AttributeKind::Attribute && self.text(a.name) == "this")
            })
            .flatten();
        self.out.object();
        self.out.key("type").string(kind);
        self.span(span);
        self.out.key("name").string(name_text);
        self.name_location(name);
        self.out.key("attributes");
        self.attributes_except(attributes, this);
        self.out.key("fragment");
        let text = self.text(span);
        let raw_text = matches!(name_text, "script" | "style") && !text.ends_with("/>");
        match text.rfind("</") {
            // svelte reads a nested script or style as one text, empty or not.
            Some(close) if raw_text && self.component.children(children).is_empty() => {
                let at = span.start_offset + close as u32;
                self.out.object();
                self.out.key("type").string("Fragment");
                self.out.key("nodes").array().element().object();
                self.out.key("type").string("Text");
                self.span(Span::new(at, at));
                self.out.key("raw").string("");
                self.out.key("data").string("");
                self.out.end().end_array().end();
            }
            _ => self.range(children, inner),
        }
        if let Some(this) = this {
            let attribute = &self.component.attributes(attributes)[this];
            self.out.key(if kind == "SvelteElement" {
                "tag"
            } else {
                "expression"
            });
            self.this_value(attribute);
        }
        self.out.end();
    }

    pub(super) fn this_value(&mut self, attribute: &Attribute) {
        let AttributeValue::Parts(parts) = attribute.value else {
            self.out.null();
            return;
        };
        match self.component.parts(parts).first() {
            Some(&Part::Expression { expression, .. }) => self.expression(expression),
            Some(&Part::Text(span)) => {
                self.out.object();
                self.out.key("type").string("Literal");
                let raw = self.text(span);
                self.out.key("value").string(&decode_attribute(raw));
                self.out.key("raw").string(&format!("'{raw}'"));
                self.span(span);
                self.out.end();
            }
            None => self.out.null(),
        }
    }

    pub(super) fn attributes(&mut self, attributes: Range, _element: &str) {
        self.attributes_except(attributes, None);
    }

    pub(super) fn attributes_except(&mut self, attributes: Range, except: Option<usize>) {
        self.out.array();
        let list = self.component.attributes(attributes);
        for (index, attribute) in list.iter().enumerate() {
            if Some(index) == except {
                continue;
            }
            self.out.element();
            self.attribute(attribute);
        }
        self.out.end_array();
    }

    pub(super) fn attribute(&mut self, attribute: &Attribute) {
        match attribute.kind {
            AttributeKind::Spread | AttributeKind::Attach => {
                let kind = if attribute.kind == AttributeKind::Spread {
                    "SpreadAttribute"
                } else {
                    "AttachTag"
                };
                self.out.object();
                self.out.key("type").string(kind);
                self.span(attribute.span);
                self.out.key("expression");
                match self.value_expression(attribute) {
                    Some(expression) => self.expression(expression),
                    None => self.out.null(),
                }
                self.out.end();
            }
            AttributeKind::Attribute if attribute.shorthand => {
                // `{name}`: svelte reads the name itself, so the tag is just the identifier.
                let name = attribute.name;
                self.out.object();
                self.out.key("type").string("Attribute");
                self.span(attribute.span);
                self.out.key("name").string(name.text(self.source));
                self.name_location(name);
                self.out.key("value").object();
                self.out.key("type").string("ExpressionTag");
                self.span(name);
                self.out.key("expression");
                self.identifier(name, None);
                self.out.end();
                self.out.end();
            }
            AttributeKind::Attribute => {
                self.out.object();
                self.out.key("type").string("Attribute");
                self.span(attribute.span);
                self.out
                    .key("name")
                    .string(attribute.name.text(self.source));
                self.name_location(attribute.name);
                self.out.key("value");
                self.attribute_value(attribute);
                self.out.end();
            }
            kind => self.directive(attribute, kind),
        }
    }

    /// A directive: `bind:`, `class:`, `on:`, `use:`, a transition, `animate:`, `style:` or `let:`.
    pub(super) fn directive(&mut self, attribute: &Attribute, kind: AttributeKind) {
        let component = self.component;
        let directive = match kind {
            AttributeKind::Bind => "BindDirective",
            AttributeKind::Class => "ClassDirective",
            AttributeKind::On => "OnDirective",
            AttributeKind::Use => "UseDirective",
            AttributeKind::Transition { .. } => "TransitionDirective",
            AttributeKind::Animate => "AnimateDirective",
            AttributeKind::Style => "StyleDirective",
            AttributeKind::Let => "LetDirective",
            _ => unreachable!("matched above"),
        };
        self.out.object();
        self.span(attribute.span);
        self.out.key("type").string(directive);
        let name = attribute
            .directive_name(&component.modifiers)
            .map_or("", |name| self.text(name));
        self.out.key("name").string(name);
        self.name_location(attribute.name);
        if kind == AttributeKind::Style {
            self.modifiers(attribute);
            self.out.key("value");
            if attribute.shorthand {
                // `style:color` has no value of its own.
                self.out.boolean(true);
            } else {
                self.attribute_value(attribute);
            }
        } else {
            self.out.key("expression");
            // `bind:value` and `class:active` name their expression.
            let named =
                attribute.shorthand && matches!(kind, AttributeKind::Bind | AttributeKind::Class);
            if named {
                let name = attribute
                    .directive_name(&component.modifiers)
                    .unwrap_or(attribute.name);
                self.out.object();
                self.span(Span::new(name.start_offset, attribute.span.end_offset));
                self.out.key("type").string("Identifier");
                self.out.key("name").string(name.text(self.source));
                self.out.end();
            } else {
                match self.value_expression(attribute) {
                    Some(expression) => self.expression(expression),
                    None => self.out.null(),
                }
            }
            self.modifiers(attribute);
            if let AttributeKind::Transition { intro, outro } = kind {
                self.out.key("intro").boolean(intro);
                self.out.key("outro").boolean(outro);
            }
        }
        self.out.end();
    }

    /// The one expression of a directive's or a spread's value.
    pub(super) fn value_expression(
        &self,
        attribute: &Attribute,
    ) -> Option<rsvelte_typescript_tree::ExpressionIdentifier> {
        let AttributeValue::Parts(parts) = attribute.value else {
            return None;
        };
        match self.component.parts(parts).first() {
            Some(&Part::Expression { expression, .. }) => Some(expression),
            _ => None,
        }
    }

    pub(super) fn modifiers(&mut self, attribute: &Attribute) {
        self.out.key("modifiers").array();
        for &modifier in self.component.modifiers(attribute.modifiers) {
            self.out.element().string(modifier.text(self.source));
        }
        self.out.end_array();
    }

    pub(super) fn attribute_value(&mut self, attribute: &Attribute) {
        let AttributeValue::Parts(range) = attribute.value else {
            self.out.boolean(true);
            return;
        };
        let parts = self.component.parts(range);
        let single_expression = !attribute.quoted && matches!(parts, [Part::Expression { .. }]);
        if single_expression {
            self.part(parts[0]);
            return;
        }
        self.out.array();
        if parts.is_empty() {
            // `a=""`: one empty text, at the closing quote.
            let at = attribute.span.end_offset - 1;
            self.out.element().object();
            self.span(Span::new(at, at));
            self.out.key("type").string("Text");
            self.out.key("raw").string("");
            self.out.key("data").string("");
            self.out.end();
        }
        for &part in parts {
            self.out.element();
            self.part(part);
        }
        self.out.end_array();
    }

    pub(super) fn part(&mut self, part: Part) {
        match part {
            Part::Text(span) => {
                self.out.object();
                self.span(span);
                self.out.key("type").string("Text");
                let raw = self.text(span);
                self.out.key("raw").string(raw);
                self.out.key("data").string(&decode_attribute(raw));
                self.out.end();
            }
            Part::Expression { expression, span } => {
                self.out.object();
                self.out.key("type").string("ExpressionTag");
                self.span(span);
                self.out.key("expression");
                self.expression(expression);
                self.out.end();
            }
        }
    }
}
