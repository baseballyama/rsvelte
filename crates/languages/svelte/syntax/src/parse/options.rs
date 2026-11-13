//! Upstream's `read_options` and `disallow_children` for `<svelte:options>`, which its parser runs
//! once the template is read, so every tool that parses a component sees these errors.

use std::borrow::Cow;

use oxc_ast::ast::{Expression, ObjectPropertyKind, PropertyKey};
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use super::svelte_error;
use crate::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TemplateNode, decode_attribute,
};

const NAMESPACE_SVG: &str = "http://www.w3.org/2000/svg";
const NAMESPACE_MATHML: &str = "http://www.w3.org/1998/Math/MathML";

/// Upstream's `get_static_value`.
enum Static<'a> {
    /// A bare attribute, or one without a value.
    Present,
    Boolean,
    String(Cow<'a, str>),
    /// Another literal, or no literal at all.
    Other,
}

/// The first error of the root's `<svelte:options>`, in upstream's order.
pub(super) fn read_options(component: &Component, source: &str) -> Result<(), Diagnostic> {
    let options =
        component
            .children(component.root)
            .iter()
            .find_map(|&node| match *component.node(node) {
                TemplateNode::Element {
                    name,
                    attributes,
                    children,
                    component: None,
                    ..
                } if name.text(source) == "svelte:options" => Some((attributes, children)),
                _ => None,
            });
    let Some((attributes, children)) = options else {
        return Ok(());
    };
    let reader = Reader { component, source };
    for attribute in component.attributes(attributes) {
        reader.attribute(attribute)?;
    }
    let children = component.children(children);
    if let (Some(&first), Some(&last)) = (children.first(), children.last()) {
        let span = Span::new(
            component.node(first).span().start_offset,
            component.node(last).span().end_offset,
        );
        return Err(svelte_error(
            "svelte_meta_invalid_content",
            "<svelte:options> cannot have children",
            span,
        ));
    }
    Ok(())
}

struct Reader<'c> {
    component: &'c Component,
    source: &'c str,
}

impl<'c> Reader<'c> {
    fn attribute(&self, attribute: &'c Attribute) -> Result<(), Diagnostic> {
        if attribute.kind != AttributeKind::Attribute {
            return Err(error(
                "svelte_options_invalid_attribute",
                "`<svelte:options>` can only receive static attributes",
                attribute,
            ));
        }
        let name = attribute.name.text(self.source);
        match name {
            "runes" | "immutable" | "preserveWhitespace" | "accessors" => {
                if !matches!(
                    self.static_value(attribute),
                    Static::Present | Static::Boolean
                ) {
                    return Err(invalid_value(attribute, "true or false"));
                }
            }
            "tag" => {
                return Err(error(
                    "svelte_options_deprecated_tag",
                    "\"tag\" option is deprecated \u{2014} use \"customElement\" instead",
                    attribute,
                ));
            }
            "customElement" => self.custom_element(attribute)?,
            "namespace" => {
                let value = self.static_string(attribute);
                let valid = matches!(
                    value.as_deref(),
                    Some(NAMESPACE_SVG | NAMESPACE_MATHML | "html" | "mathml" | "svg")
                );
                if !valid {
                    return Err(invalid_value(attribute, "\"html\", \"mathml\" or \"svg\""));
                }
            }
            "css" => {
                if self.static_string(attribute).as_deref() != Some("injected") {
                    return Err(invalid_value(attribute, "\"injected\""));
                }
            }
            _ => {
                return Err(error(
                    "svelte_options_unknown_attribute",
                    &format!("`<svelte:options>` unknown attribute '{name}'"),
                    attribute,
                ));
            }
        }
        Ok(())
    }

    fn parts(&self, attribute: &Attribute) -> &'c [Part] {
        match attribute.value {
            AttributeValue::True => &[],
            AttributeValue::Parts(parts) => self.component.parts(parts),
        }
    }

    fn static_value(&self, attribute: &'c Attribute) -> Static<'c> {
        match self.parts(attribute) {
            [] => Static::Present,
            [Part::Text(text)] => Static::String(decode_attribute(text.text(self.source))),
            [Part::Expression { expression, .. }] => {
                match self
                    .component
                    .javascript
                    .get_expression(*expression)
                    .without_parentheses()
                {
                    Expression::BooleanLiteral(_) => Static::Boolean,
                    Expression::StringLiteral(literal) => literal
                        .value
                        .as_str()
                        .map_or(Static::Other, |value| Static::String(Cow::Borrowed(value))),
                    _ => Static::Other,
                }
            }
            _ => Static::Other,
        }
    }

    fn static_string(&self, attribute: &'c Attribute) -> Option<Cow<'c, str>> {
        match self.static_value(attribute) {
            Static::String(value) => Some(value),
            _ => None,
        }
    }

    fn custom_element(&self, attribute: &'c Attribute) -> Result<(), Diagnostic> {
        let invalid = || {
            error(
                "svelte_options_invalid_customelement",
                "\"customElement\" must be a string literal defining a valid custom element name \
                 or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | \
                 `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: \
                 boolean; type: .. } } }",
                attribute,
            )
        };
        let expression = match self.parts(attribute) {
            [Part::Text(_), ..] => {
                return validate_tag(self.static_string(attribute).as_deref(), attribute.span);
            }
            [Part::Expression { expression, .. }, ..] => self
                .component
                .javascript
                .get_expression(*expression)
                .without_parentheses(),
            [] => return Err(invalid()),
        };
        let properties = match expression {
            Expression::ObjectExpression(object) => &object.properties,
            Expression::NullLiteral(_) => return Ok(()),
            _ => return Err(invalid()),
        };
        let mut options = Vec::with_capacity(properties.len());
        for property in properties {
            options.push(option_property(property).ok_or_else(invalid)?);
        }
        let find = |name: &str| {
            options
                .iter()
                .find(|(key, _)| *key == name)
                .map(|&(_, v)| v)
        };
        if let Some(property) = properties
            .iter()
            .find(|p| option_property(p).is_some_and(|(key, _)| key == "tag"))
        {
            let tag = match option_property(property) {
                Some((_, Expression::StringLiteral(literal))) => literal.value.as_str(),
                _ => None,
            };
            // Upstream passes the property as a tuple without a position; it means the property.
            let span = property.span();
            validate_tag(tag, Span::new(span.start, span.end))?;
        }
        if let Some(props) = find("props") {
            validate_props(props, attribute)?;
        }
        if let Some(shadow) = find("shadow") {
            let valid = match shadow {
                Expression::StringLiteral(literal) => {
                    matches!(literal.value.as_str(), Some("open" | "none"))
                }
                Expression::ObjectExpression(_) => true,
                _ => false,
            };
            if !valid {
                return Err(error(
                    "svelte_options_invalid_customelement_shadow",
                    "\"shadow\" must be either \"open\", \"none\" or `ShadowRootInit` object.",
                    attribute,
                ));
            }
        }
        Ok(())
    }
}

/// `name: value` with a plain name as its key, as upstream requires of every option.
fn option_property<'t>(
    property: &'t ObjectPropertyKind<'t>,
) -> Option<(&'t str, &'t Expression<'t>)> {
    let ObjectPropertyKind::ObjectProperty(property) = property else {
        return None;
    };
    match &property.key {
        PropertyKey::StaticIdentifier(key) if !property.computed => {
            Some((key.name.as_str(), &property.value))
        }
        _ => None,
    }
}

fn validate_props(props: &Expression<'_>, attribute: &Attribute) -> Result<(), Diagnostic> {
    let invalid = || {
        error(
            "svelte_options_invalid_customelement_props",
            "\"props\" must be a statically analyzable object literal of the form \"{ [key: \
             string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \
             \"Number\" | \"Array\" | \"Object\" }\"",
            attribute,
        )
    };
    let Expression::ObjectExpression(object) = props else {
        return Err(invalid());
    };
    for property in &object.properties {
        let Some((_, Expression::ObjectExpression(fields))) = option_property(property) else {
            return Err(invalid());
        };
        for field in &fields.properties {
            let valid = match option_property(field) {
                Some(("type", Expression::StringLiteral(literal))) => matches!(
                    literal.value.as_str(),
                    Some("String" | "Number" | "Boolean" | "Array" | "Object")
                ),
                Some(
                    ("reflect", Expression::BooleanLiteral(_))
                    | ("attribute", Expression::StringLiteral(_)),
                ) => true,
                _ => false,
            };
            if !valid {
                return Err(invalid());
            }
        }
    }
    Ok(())
}

/// Upstream's `validate_tag`: a valid custom element name that is not reserved, or empty.
fn validate_tag(tag: Option<&str>, span: Span) -> Result<(), Diagnostic> {
    let invalid = || {
        svelte_error(
            "svelte_options_invalid_tagname",
            "Tag name must be lowercase and hyphenated",
            span,
        )
    };
    let tag = tag.ok_or_else(invalid)?;
    if tag.is_empty() {
        return Ok(());
    }
    let valid = tag.starts_with(|c: char| c.is_ascii_lowercase())
        && tag.contains('-')
        && tag.chars().all(is_tag_character);
    if !valid {
        return Err(invalid());
    }
    if matches!(
        tag,
        "annotation-xml"
            | "color-profile"
            | "font-face"
            | "font-face-src"
            | "font-face-uri"
            | "font-face-format"
            | "font-face-name"
            | "missing-glyph"
    ) {
        return Err(svelte_error(
            "svelte_options_reserved_tagname",
            "Tag name is reserved",
            span,
        ));
    }
    Ok(())
}

/// The HTML standard's `PCENChar`, and `-`.
const fn is_tag_character(c: char) -> bool {
    matches!(
        c,
        'a'..='z'
            | '0'..='9'
            | '_'
            | '.'
            | '-'
            | '\u{b7}'
            | '\u{c0}'..='\u{d6}'
            | '\u{d8}'..='\u{f6}'
            | '\u{f8}'..='\u{37d}'
            | '\u{37f}'..='\u{1fff}'
            | '\u{200c}'..='\u{200d}'
            | '\u{203f}'..='\u{2040}'
            | '\u{2070}'..='\u{218f}'
            | '\u{2c00}'..='\u{2fef}'
            | '\u{3001}'..='\u{d7ff}'
            | '\u{f900}'..='\u{fdcf}'
            | '\u{fdf0}'..='\u{fffd}'
            | '\u{10000}'..='\u{effff}'
    )
}

fn invalid_value(attribute: &Attribute, list: &str) -> Diagnostic {
    error(
        "svelte_options_invalid_attribute_value",
        &format!("Value must be {list}, if specified"),
        attribute,
    )
}

fn error(code: &'static str, message: &str, attribute: &Attribute) -> Diagnostic {
    svelte_error(code, message, attribute.span)
}
