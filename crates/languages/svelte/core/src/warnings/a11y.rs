//! Svelte's `check_element` (`a11y/index.js`): the checks of an element's own attributes and
//! content. Only `a11y_autofocus`, `a11y_missing_attribute`, `a11y_no_noninteractive_tabindex`
//! and `a11y_label_has_associated_control` are ported.

use std::borrow::Cow;

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::names::is_component_name;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, Range, TemplateNode,
    decode_attribute,
};

mod tables;

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

/// One element's attributes, the way `check_element` collects them.
struct Attributes<'a> {
    /// `Attribute`s that are not event handlers, last one of a name winning.
    map: Vec<(&'a str, &'a Attribute)>,
    spread: bool,
    source: &'a str,
    component: &'a Component,
}

impl<'a> Attributes<'a> {
    fn new(component: &'a Component, source: &'a str, range: Range) -> Self {
        let mut map: Vec<(&str, &Attribute)> = Vec::new();
        let mut spread = false;
        for attribute in component.attributes(range) {
            match attribute.kind {
                AttributeKind::Spread => spread = true,
                AttributeKind::Attribute => {
                    let name = attribute.name.text(source);
                    if name.starts_with("on") && is_expression(component, attribute) {
                        continue;
                    }
                    map.retain(|(n, _)| *n != name);
                    map.push((name, attribute));
                }
                _ => {}
            }
        }
        Self {
            map,
            spread,
            source,
            component,
        }
    }

    fn get(&self, name: &str) -> Option<&'a Attribute> {
        self.map.iter().find(|(n, _)| *n == name).map(|(_, a)| *a)
    }

    fn has(&self, name: &str) -> bool {
        self.get(name).is_some()
    }

    /// `get_static_value`.
    fn value(&self, name: &str) -> Static<'a> {
        let Some(attribute) = self.get(name) else {
            return Static::Unknown;
        };
        match attribute.value {
            AttributeValue::True => Static::Bare,
            AttributeValue::Parts(parts) => match self.component.parts(parts) {
                [Part::Text(span)] => Static::Text(decode_attribute(span.text(self.source))),
                _ => Static::Unknown,
            },
        }
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
}

/// An attribute's value as `get_static_value` sees it.
enum Static<'a> {
    /// No attribute, or a value with an expression.
    Unknown,
    /// An attribute with no value.
    Bare,
    Text(Cow<'a, str>),
}

/// `is_expression_attribute`: `a={x}`, not `a="{x}"`.
fn is_expression(component: &Component, attribute: &Attribute) -> bool {
    !attribute.quoted
        && matches!(attribute.value, AttributeValue::Parts(parts)
            if matches!(component.parts(parts), [Part::Expression { .. }]))
}

#[derive(PartialEq, Eq)]
enum Interactivity {
    Interactive,
    NonInteractive,
    Static,
}

fn interactivity(name: &str, attributes: &Attributes<'_>) -> Interactivity {
    let any = |schemas: &[Schema]| {
        schemas.iter().any(|(tag, required)| {
            *tag == name
                && required.iter().all(|(attribute, value)| {
                    attributes.has(attribute)
                        && value.is_none_or(|v| attributes.text(attribute).as_deref() == Some(v))
                })
        })
    };
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

/// JavaScript's `Number(text) >= 0`.
fn non_negative(text: &str) -> bool {
    let text = text.trim_matches(|c: char| c.is_whitespace() || c == '\u{feff}');
    if text.is_empty() {
        return true;
    }
    let unsigned = text.strip_prefix('+').unwrap_or(text);
    if ["0x", "0X", "0o", "0O", "0b", "0B"]
        .iter()
        .any(|p| text.starts_with(p))
    {
        let radix = match text.as_bytes()[1] {
            b'x' | b'X' => 16,
            b'o' | b'O' => 8,
            _ => 2,
        };
        return u128::from_str_radix(&text[2..], radix).is_ok();
    }
    if unsigned == "Infinity" {
        return true;
    }
    let numeric = !text.is_empty()
        && text
            .bytes()
            .all(|b| b.is_ascii_digit() || matches!(b, b'+' | b'-' | b'.' | b'e' | b'E'));
    numeric && text.parse::<f64>().is_ok_and(|n| n >= 0.0)
}

const REQUIRED: &[(&str, &[&str])] = &[
    ("area", &["alt", "aria-label", "aria-labelledby"]),
    ("html", &["lang"]),
    ("iframe", &["title"]),
    ("img", &["alt"]),
    ("object", &["title", "aria-label", "aria-labelledby"]),
];

const LABELABLE: &[&str] = &[
    "button", "input", "keygen", "meter", "output", "progress", "select", "textarea",
];

/// Checks a `RegularElement` or, with `dynamic`, a `<svelte:element>`.
#[expect(
    clippy::too_many_arguments,
    reason = "one element's parts, as the surface tree stores them"
)]
pub(super) fn check_element(
    component: &Component,
    source: &str,
    name: &str,
    span: Span,
    attributes: Range,
    children: Range,
    dynamic: bool,
    parent: Parent<'_>,
    out: &mut Vec<Diagnostic>,
) {
    let map = Attributes::new(component, source, attributes);
    let interactivity = interactivity(name, &map);
    for attribute in component.attributes(attributes) {
        if attribute.kind != AttributeKind::Attribute {
            continue;
        }
        if attribute
            .name
            .text(source)
            .eq_ignore_ascii_case("autofocus")
        {
            let in_dialog = match parent {
                Parent::None => false,
                Parent::Regular(parent) => parent == "dialog",
                Parent::Dynamic => true,
            };
            if name != "dialog" && !in_dialog {
                out.push(warning(
                    "a11y_autofocus",
                    "Avoid using autofocus",
                    attribute.span,
                ));
            }
        }
    }
    let role = map.text("role");
    let interactive_role = role
        .as_deref()
        .is_some_and(|role| tables::INTERACTIVE_ROLES.contains(&role));
    if !dynamic
        && interactivity != Interactivity::Interactive
        && !interactive_role
        && map.has("tabindex")
        && map
            .text("tabindex")
            .is_none_or(|value| non_negative(&value))
    {
        out.push(warning(
            "a11y_no_noninteractive_tabindex",
            "noninteractive element cannot have nonnegative tabIndex value",
            span,
        ));
    }
    match name {
        "a" => {
            if !map.has("href") && !map.has("xlink:href") && !map.spread {
                let id = map.truthy("id");
                let named = map.truthy("name");
                let disabled = map.text("aria-disabled").as_deref() == Some("true");
                if !id && !named && !disabled {
                    missing(name, &["href"], span, out);
                }
            }
        }
        "input" => {
            let required = ["alt", "aria-label", "aria-labelledby"];
            if map.text("type").as_deref() == Some("image")
                && !map.spread
                && !required.iter().any(|r| map.has(r))
            {
                missing("input type=\"image\"", &required, span, out);
            }
        }
        "label"
            if !map.spread && !map.has("for") && !has_input_child(component, source, children) =>
        {
            out.push(warning(
                "a11y_label_has_associated_control",
                "A form label must be associated with a control",
                span,
            ));
        }
        _ => {}
    }
    if !map.spread
        && let Some((_, required)) = REQUIRED.iter().find(|(tag, _)| *tag == name)
        && !required.iter().any(|r| map.has(r))
    {
        missing(name, required, span, out);
    }
}

fn missing(name: &str, attributes: &[&str], span: Span, out: &mut Vec<Diagnostic>) {
    let first = attributes[0];
    let article = if first.starts_with(['a', 'e', 'i', 'o', 'u']) || first == "href" {
        "an"
    } else {
        "a"
    };
    let sequence = match attributes {
        [only] => (*only).to_owned(),
        [init @ .., last] => format!("{} or {last}", init.join(", ")),
        [] => unreachable!("an element requires at least one attribute"),
    };
    out.push(warning(
        "a11y_missing_attribute",
        &format!("`<{name}>` element should have {article} {sequence} attribute"),
        span,
    ));
}

/// Whether a label holds something that can be its control.
fn has_input_child(component: &Component, source: &str, children: Range) -> bool {
    component
        .children(children)
        .iter()
        .any(|&child| match *component.node(child) {
            TemplateNode::Render { .. } => true,
            TemplateNode::Element { name, children, .. } => {
                let name = name.text(source);
                let control = name == "svelte:element"
                    || name == "slot"
                    || (is_component_name(name) && !name.starts_with("svelte:"))
                    || LABELABLE.contains(&name);
                control || has_input_child(component, source, children)
            }
            TemplateNode::If {
                consequent,
                alternate,
                ..
            } => {
                has_input_child(component, source, consequent)
                    || alternate.is_some_and(|a| has_input_child(component, source, a))
            }
            TemplateNode::Each { body, fallback, .. } => {
                has_input_child(component, source, body)
                    || has_input_child(component, source, fallback)
            }
            TemplateNode::Key { body, .. } | TemplateNode::Snippet { body, .. } => {
                has_input_child(component, source, body)
            }
            TemplateNode::Await {
                pending,
                then,
                catch,
                ..
            } => [pending, then, catch].into_iter().any(|branch| {
                branch
                    .present()
                    .is_some_and(|b| has_input_child(component, source, b))
            }),
            _ => false,
        })
}

fn warning(code: &'static str, message: &str, span: Span) -> Diagnostic {
    super::warning(code, message, span)
}
