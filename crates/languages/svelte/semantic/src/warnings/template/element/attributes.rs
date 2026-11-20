//! The warnings and errors of an element's attributes and directives.

use oxc_ast::ast::Expression;
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part, Range};
use rsvelte_typescript_tree::{ExpressionIdentifier, document_span};

use super::super::super::{error, warning};
use super::super::Template;
use super::Tag;

impl Template<'_> {
    /// `check_global_event_reference`: `{onclick}` with no `onclick` declared, which reads the
    /// global handler.
    pub(in super::super) fn global_event_reference(&mut self, at: u32, attribute: &Attribute) {
        let component = self.context.component;
        let name = attribute.name.text(self.context.source);
        let global = expression(attribute, component).is_some_and(|e| {
            matches!(component.javascript.get_expression(e), Expression::Identifier(identifier)
                if identifier.name == name && self.context.resolution.symbol(identifier).is_none())
        });
        if global {
            let message = format!(
                "You are referencing `globalThis.{name}`. Did you forget to declare a variable \
                    with that name?"
            );
            self.warn(
                at,
                warning("attribute_global_event_reference", &message, attribute.span),
            );
        }
    }

    /// `validate_element`'s warnings, attribute by attribute.
    pub(super) fn validate_element(&mut self, at: u32, tag: Tag, name: &str, attributes: Range) {
        let component = self.context.component;
        let source = self.context.source;
        let custom = tag == Tag::Regular
            && (name.contains('-')
                || component
                    .attributes(attributes)
                    .iter()
                    .any(|a| a.kind == AttributeKind::Attribute && a.name.text(source) == "is"));
        for attribute in component.attributes(attributes) {
            if attribute.kind != AttributeKind::Attribute {
                continue;
            }
            let attribute_name = attribute.name.text(source);
            if self.context.runes && custom {
                self.quoted(at, attribute);
            }
            if attribute_name.len() > 2 && attribute_name.starts_with("on") {
                self.global_event_reference(at, attribute);
            }
            if attribute_name == "is" {
                self.warn(
                    at,
                    warning(
                        "attribute_avoid_is",
                        "The \"is\" attribute is not supported cross-browser and should be avoided",
                        attribute.span,
                    ),
                );
            }
            let right = match attribute_name {
                "className" => Some("class"),
                "htmlFor" => Some("for"),
                _ => None,
            };
            if let Some(right) = right {
                let message = format!(
                    "'{attribute_name}' is not a valid HTML attribute. Did you mean '{right}'?"
                );
                self.warn(
                    at,
                    warning("attribute_invalid_property_name", &message, attribute.span),
                );
            }
            self.colon(at, attribute);
        }
    }

    /// `visit_component`'s warnings of each attribute.
    pub(super) fn validate_component(&mut self, at: u32, name: &str, attributes: Range) {
        let component = self.context.component;
        for attribute in component.attributes(attributes) {
            // The parser takes `<svelte:component this>` out of the attributes.
            let this =
                name == "svelte:component" && attribute.name.text(self.context.source) == "this";
            if attribute.kind != AttributeKind::Attribute || this {
                continue;
            }
            if self.context.runes {
                self.quoted(at, attribute);
            }
            self.colon(at, attribute);
        }
    }

    /// `attribute_quoted`: a value that is one quoted expression.
    fn quoted(&mut self, at: u32, attribute: &Attribute) {
        if attribute.quoted && expression(attribute, self.context.component).is_some() {
            self.warn(
                at,
                warning(
                    "attribute_quoted",
                    "Quoted attributes on components and custom elements will be stringified in a \
                    future version of Svelte. If this isn't what you want, remove the quotes",
                    attribute.span,
                ),
            );
        }
    }

    /// `attribute_illegal_colon`.
    fn colon(&mut self, at: u32, attribute: &Attribute) {
        let name = attribute.name.text(self.context.source);
        if name.contains(':')
            && !["xmlns:", "xlink:", "xml:"]
                .iter()
                .any(|p| name.starts_with(p))
        {
            self.warn(
                at,
                warning(
                    "attribute_illegal_colon",
                    "Attributes should not contain ':' characters to prevent ambiguity with Svelte \
                    directives",
                    attribute.span,
                ),
            );
        }
    }

    /// The directives' own visitors: `on:` on an element, and `bind:`.
    pub(super) fn directives(&mut self, attributes: Range, element: bool) {
        let component = self.context.component;
        let source = self.context.source;
        for attribute in component.attributes(attributes) {
            let at = attribute.span.start_offset;
            if element {
                self.event_syntaxes(attribute);
            }
            match attribute.kind {
                AttributeKind::On if element && self.context.runes => {
                    let Some(name) = attribute.directive_name(&component.modifiers) else {
                        continue;
                    };
                    let name = name.text(source);
                    let message = format!(
                        "Using `on:{name}` to listen to the {name} event is deprecated. Use the \
                            event attribute `on{name}` instead"
                    );
                    self.warn(
                        at,
                        warning("event_directive_deprecated", &message, attribute.span),
                    );
                }
                AttributeKind::Bind => {
                    let Some(value) = expression(attribute, component) else {
                        continue;
                    };
                    let named = attribute
                        .directive_name(&component.modifiers)
                        .map(|n| n.text(source));
                    if named == Some("this") {
                        let at = component.javascript.get_expression(value).span();
                        self.bind_this.push((document_span(at), self.blocks > 0));
                    }
                    self.each_rest_binding(at, value);
                }
                _ => {}
            }
        }
    }

    /// The first attribute error upstream's `validate_element` (for an element) or
    /// `visit_component` raises: `attribute_invalid_sequence_expression` in runes mode, for a
    /// comma-separated value whose nearest `(` or `{` before it is the `{`, and on an element
    /// `transition_duplicate` or `transition_conflict`.
    pub(super) fn attribute_errors(&mut self, at: Span, attributes: Range, element: bool) {
        let component = self.context.component;
        let bytes = self.context.source.as_bytes();
        // The directions an earlier transition directive runs in, by their kind.
        let (mut intro, mut outro): (Option<&str>, Option<&str>) = (None, None);
        for attribute in component.attributes(attributes) {
            let found = match attribute.kind {
                AttributeKind::Attribute if self.context.runes => {
                    let Some(value) = expression(attribute, component) else {
                        continue;
                    };
                    let Expression::SequenceExpression(sequence) =
                        component.javascript.get_expression(value)
                    else {
                        continue;
                    };
                    let start = sequence.span.start as usize;
                    let opener = bytes[..start]
                        .iter()
                        .rev()
                        .find(|&&b| b == b'(' || b == b'{');
                    (opener == Some(&b'{')).then(|| {
                        error(
                            "attribute_invalid_sequence_expression",
                            "Comma-separated expressions are not allowed as attribute/directive \
                                values in runes mode, unless wrapped in parentheses",
                            document_span(sequence.span),
                        )
                    })
                }
                AttributeKind::Transition {
                    intro: is_intro,
                    outro: is_outro,
                } if element => {
                    let kind = match (is_intro, is_outro) {
                        (true, true) => "transition",
                        (true, false) => "in",
                        _ => "out",
                    };
                    let existing =
                        if is_intro { intro } else { None }.or(if is_outro { outro } else { None });
                    if is_intro {
                        intro = Some(kind);
                    }
                    if is_outro {
                        outro = Some(kind);
                    }
                    existing.map(|existing| {
                        if existing == kind {
                            let message = format!(
                                "Cannot use multiple `{kind}:` directives on a single element"
                            );
                            error("transition_duplicate", &message, attribute.span)
                        } else {
                            let message = format!(
                                "Cannot use `{existing}:` alongside existing `{kind}:` directive"
                            );
                            error("transition_conflict", &message, attribute.span)
                        }
                    })
                }
                _ => None,
            };
            if let Some(found) = found {
                self.error(at, found);
                return;
            }
        }
    }

    /// Upstream's `event_directive_node` and `uses_event_attributes`, on an element's attribute.
    fn event_syntaxes(&mut self, attribute: &Attribute) {
        let component = self.context.component;
        match attribute.kind {
            AttributeKind::On => {
                if self.event_directive.is_none()
                    && let Some(name) = attribute.directive_name(&component.modifiers)
                {
                    self.event_directive = Some((attribute.span, name));
                }
            }
            AttributeKind::Attribute
                if attribute.name.text(self.context.source).starts_with("on")
                    && matches!(attribute.value, AttributeValue::Parts(parts)
                        if matches!(component.parts(parts), [Part::Expression { .. }])) =>
            {
                self.event_attributes = true;
            }
            _ => {}
        }
    }

    /// `bind_invalid_each_rest`: a binding to a name an `{#each}` rest element declares.
    fn each_rest_binding(&mut self, at: u32, value: ExpressionIdentifier) {
        let mut object = self.context.component.javascript.get_expression(value);
        while let Some(member) = object.as_member_expression() {
            object = member.object();
        }
        let Expression::Identifier(identifier) = object else {
            return;
        };
        let resolution = self.context.resolution;
        let Some(symbol) = resolution.symbol(identifier) else {
            return;
        };
        if !self.each_rest.contains(&symbol) {
            return;
        }
        let scoping = resolution.scoping();
        let declared = scoping.symbol_span(symbol);
        let name = scoping.symbol_name(symbol);
        let message = format!(
            "The rest operator (...) will create a new object and binding '{name}' with the \
                original object will not work"
        );
        self.warn(
            at,
            warning("bind_invalid_each_rest", &message, document_span(declared)),
        );
    }
}

/// The expression of an attribute whose value is one expression.
fn expression(
    attribute: &Attribute,
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
) -> Option<ExpressionIdentifier> {
    match attribute.value {
        AttributeValue::Parts(parts) => match component.parts(parts) {
            [Part::Expression { expression, .. }] => Some(*expression),
            _ => None,
        },
        AttributeValue::True => None,
    }
}
