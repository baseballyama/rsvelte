//! Svelte's `check_element` (`a11y/index.js`): the checks of an element's own attributes,
//! handlers and content.

use std::borrow::Cow;

use rustc_hash::FxHashMap;

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, Range, decode_attribute,
};

mod elements;
mod handlers;
mod roles;
mod tables;
mod values;

use elements::has_content;

use values::number;

/// An element and the attributes it must be named by: aria-query's `ARIARoleRelationConcept`.
type Schema = (
    &'static str,
    &'static [(&'static str, Option<&'static str>)],
);

/// The nearest enclosing element, as Svelte's `is_parent` sees it.
#[derive(Clone, Copy)]
pub(super) enum Parent<'a> {
    None,
    Regular(&'a str),
    /// `<svelte:element>`, whose name is unknown.
    Dynamic,
}

impl Parent<'_> {
    /// `is_parent`: an unknown parent counts as any.
    fn is(self, names: &[&str]) -> bool {
        match self {
            Self::None => false,
            Self::Regular(name) => names.contains(&name),
            Self::Dynamic => true,
        }
    }
}

/// One element's attributes, the way `check_element` collects them.
struct Attributes<'a> {
    /// `Attribute`s that are not event handlers, in order.
    list: Vec<&'a Attribute>,
    /// The same, last one of a name winning.
    map: FxHashMap<&'a str, &'a Attribute>,
    /// The events of `on…={…}` attributes and `on:` directives, first occurrence first.
    handlers: Vec<&'a str>,
    spread: bool,
    contenteditable_attribute: bool,
    contenteditable_binding: bool,
    source: &'a str,
    component: &'a Component,
}

impl<'a> Attributes<'a> {
    fn new(component: &'a Component, source: &'a str, range: Range) -> Self {
        let mut out = Self {
            list: Vec::new(),
            map: FxHashMap::default(),
            handlers: Vec::new(),
            spread: false,
            contenteditable_attribute: false,
            contenteditable_binding: false,
            source,
            component,
        };
        for attribute in component.attributes(range) {
            let directive = || {
                attribute
                    .directive_name(&component.modifiers)
                    .map(|n| n.text(source))
            };
            match attribute.kind {
                AttributeKind::Spread => out.spread = true,
                AttributeKind::Attribute => {
                    let name = attribute.name.text(source);
                    if let Some(event) = name.strip_prefix("on")
                        && is_expression(component, attribute)
                    {
                        out.handler(event);
                        continue;
                    }
                    out.list.push(attribute);
                    out.map.insert(name, attribute);
                    out.contenteditable_attribute |= name == "contenteditable";
                }
                AttributeKind::Bind => {
                    out.contenteditable_binding |=
                        matches!(directive(), Some("textContent" | "innerHTML" | "innerText"));
                }
                AttributeKind::On => {
                    if let Some(event) = directive() {
                        out.handler(event);
                    }
                }
                _ => {}
            }
        }
        out
    }

    fn handler(&mut self, event: &'a str) {
        if !self.handlers.contains(&event) {
            self.handlers.push(event);
        }
    }

    fn handles(&self, event: &str) -> bool {
        self.handlers.contains(&event)
    }

    fn get(&self, name: &str) -> Option<&'a Attribute> {
        self.map.get(name).copied()
    }

    fn has(&self, name: &str) -> bool {
        self.get(name).is_some()
    }

    /// `get_static_value`.
    fn value(&self, name: &str) -> Static<'a> {
        self.get(name).map_or(Static::Unknown, |attribute| {
            static_value(self.component, self.source, attribute)
        })
    }

    /// `get_static_text_value`: the text, or `None` for no attribute, no value or an expression.
    fn text(&self, name: &str) -> Option<Cow<'a, str>> {
        match self.value(name) {
            Static::Text(text) => Some(text),
            Static::Bare | Static::Unknown => None,
        }
    }

    /// `get_static_value` is truthy.
    fn truthy(&self, name: &str) -> bool {
        match self.value(name) {
            Static::Bare => true,
            Static::Text(text) => !text.is_empty(),
            Static::Unknown => false,
        }
    }

    /// `get_static_value(…) === 'true'`.
    fn is_true(&self, name: &str) -> bool {
        self.text(name).as_deref() == Some("true")
    }
}

/// An attribute's value as `get_static_value` sees it.
enum Static<'a> {
    /// No attribute, or a value with an expression.
    Unknown,
    /// An attribute with no value.
    Bare,
    Text(Cow<'a, str>),
}

/// `get_static_value`.
fn static_value<'a>(component: &Component, source: &'a str, attribute: &Attribute) -> Static<'a> {
    match attribute.value {
        AttributeValue::True => Static::Bare,
        AttributeValue::Parts(parts) => match component.parts(parts) {
            [Part::Text(span)] => Static::Text(decode_attribute(span.text(source))),
            _ => Static::Unknown,
        },
    }
}

/// `is_expression_attribute`: one expression, quoted or not.
pub(super) fn is_expression(component: &Component, attribute: &Attribute) -> bool {
    matches!(attribute.value, AttributeValue::Parts(parts)
        if matches!(component.parts(parts), [Part::Expression { .. }]))
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Interactivity {
    Interactive,
    NonInteractive,
    Static,
}

/// `match_schema`: a schema compares an attribute's value only when it names one.
fn matches_schema(name: &str, attributes: &Attributes<'_>, (tag, required): &Schema) -> bool {
    *tag == name
        && required.iter().all(|(attribute, value)| {
            attributes.has(attribute)
                && value.is_none_or(|v| attributes.text(attribute).as_deref() == Some(v))
        })
}

fn interactivity(name: &str, attributes: &Attributes<'_>) -> Interactivity {
    let any = |schemas: &[Schema]| schemas.iter().any(|s| matches_schema(name, attributes, s));
    if any(tables::INTERACTIVE_ELEMENT_ROLES) {
        Interactivity::Interactive
    } else if name != "header" && any(tables::NON_INTERACTIVE_ELEMENT_ROLES) {
        Interactivity::NonInteractive
    } else if any(tables::INTERACTIVE_ELEMENT_AX_OBJECTS) {
        Interactivity::Interactive
    } else if any(tables::NON_INTERACTIVE_ELEMENT_AX_OBJECTS) {
        Interactivity::NonInteractive
    } else {
        Interactivity::Static
    }
}

/// One element being checked.
struct Element<'a, 'o> {
    component: &'a Component,
    source: &'a str,
    name: &'a str,
    span: Span,
    children: Range,
    dynamic: bool,
    parent: Parent<'a>,
    attributes: Attributes<'a>,
    interactivity: Interactivity,
    out: &'o mut Vec<Diagnostic>,
}

/// Checks a `RegularElement` or, with `dynamic`, a `<svelte:element>`.
#[expect(
    clippy::too_many_arguments,
    reason = "one element's parts, as the surface tree stores them"
)]
pub(super) fn check_element<'a>(
    component: &'a Component,
    source: &'a str,
    name: &'a str,
    span: Span,
    attributes: Range,
    children: Range,
    dynamic: bool,
    parent: Parent<'a>,
    out: &mut Vec<Diagnostic>,
) {
    let attributes = Attributes::new(component, source, attributes);
    let interactivity = interactivity(name, &attributes);
    let mut element = Element {
        component,
        source,
        name,
        span,
        children,
        dynamic,
        parent,
        attributes,
        interactivity,
        out,
    };
    element.check();
}

impl Element<'_, '_> {
    fn warn(&mut self, code: &'static str, message: &str, span: Span) {
        self.out.push(super::warning(code, message, span));
    }

    fn interactive(&self) -> bool {
        self.interactivity == Interactivity::Interactive
    }

    fn check(&mut self) {
        let attributes = self.attributes.list.clone();
        for attribute in attributes {
            self.attribute(attribute);
        }
        self.handlers();
        if self.element_specific() {
            return;
        }
        let a = &self.attributes;
        let name = self.name;
        if !a.spread
            && name != "a"
            && let Some((_, required)) =
                tables::REQUIRED_ATTRIBUTES.iter().find(|(t, _)| *t == name)
            && !required.iter().any(|r| a.has(r))
        {
            self.missing(name, required);
        }
        if tables::DISTRACTING_ELEMENTS.contains(&name) {
            let message = format!("Avoid `<{name}>` elements");
            self.warn("a11y_distracting_elements", &message, self.span);
        }
        let a = &self.attributes;
        if !a.spread
            && !self.labelled()
            && !a.contenteditable_binding
            && tables::REQUIRED_CONTENT.contains(&name)
            && !has_content(self.component, self.source, self.children)
        {
            let message = format!("`<{name}>` element should contain text");
            self.warn("a11y_missing_content", &message, self.span);
        }
    }

    fn labelled(&self) -> bool {
        let a = &self.attributes;
        a.has("aria-label") || a.has("aria-labelledby") || a.has("title")
    }

    /// The checks of one attribute, in the order the attributes are written.
    fn attribute(&mut self, attribute: &Attribute) {
        let name = attribute.name.text(self.source).to_ascii_lowercase();
        let element = self.name;
        let span = attribute.span;
        if let Some(property) = name.strip_prefix("aria-") {
            if tables::INVISIBLE_ELEMENTS.contains(&element) {
                let message = format!("`<{element}>` should not have aria-* attributes");
                self.warn("a11y_aria_attributes", &message, span);
            }
            if !tables::ARIA_ATTRIBUTES.contains(&property) {
                let message = super::fuzzymatch::fuzzymatch(property, tables::ARIA_ATTRIBUTES)
                    .map_or_else(
                        || format!("Unknown aria attribute 'aria-{property}'"),
                        |suggestion| {
                            format!(
                                "Unknown aria attribute 'aria-{property}'. Did you mean '{suggestion}'?"
                            )
                        },
                    );
                self.warn("a11y_unknown_aria_attribute", &message, span);
            }
            let heading = matches!(element.as_bytes(), [b'h', b'1'..=b'6']);
            if name == "aria-hidden" && heading {
                let message = format!("`<{element}>` element should not be hidden");
                self.warn("a11y_hidden", &message, span);
            }
            let value = static_value(self.component, self.source, attribute);
            if let Some(&(_, kind, allowed)) = tables::PROPERTIES.iter().find(|(p, ..)| *p == name)
                && let Some(found) = values::aria_value(&name, kind, allowed, &value, span)
            {
                self.out.push(found);
            }
            if name == "aria-activedescendant"
                && !self.dynamic
                && !self.interactive()
                && !self.attributes.has("tabindex")
                && !self.attributes.spread
            {
                self.warn(
                    "a11y_aria_activedescendant_has_tabindex",
                    "An element with an aria-activedescendant attribute should have a tabindex value",
                    span,
                );
            }
        }
        match name.as_str() {
            "role" => self.role_attribute(attribute),
            "accesskey" => self.warn("a11y_accesskey", "Avoid using accesskey", span),
            "autofocus" if element != "dialog" && !self.parent.is(&["dialog"]) => {
                self.warn("a11y_autofocus", "Avoid using autofocus", span);
            }
            "scope" if !self.dynamic && element != "th" => self.warn(
                "a11y_misplaced_scope",
                "The scope attribute should only be used with `<th>` elements",
                span,
            ),
            "tabindex" => {
                // `!isNaN(value) && +value > 0`, where a valueless attribute's value is `true`.
                let positive = match static_value(self.component, self.source, attribute) {
                    Static::Bare => true,
                    Static::Text(text) => number(&text) > 0.0,
                    Static::Unknown => false,
                };
                if positive {
                    self.warn(
                        "a11y_positive_tabindex",
                        "Avoid tabindex values above zero",
                        span,
                    );
                }
            }
            _ => {}
        }
    }
}
