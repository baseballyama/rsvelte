//! Which `<svelte:options>` attributes Svelte surely accepts.

use rsvelte_typescript_syntax::NodeIdentifier;
use rsvelte_typescript_syntax::syntax_tree::Kind;

use super::{Attribute, AttributeKind, AttributeValue, Part, Printer};

impl Printer<'_, '_, '_> {
    /// Whether Svelte's `read_options` surely accepts `a`; the rest of what it accepts is refused.
    pub(super) fn is_valid_option(&self, a: &Attribute) -> bool {
        let (c, source_text) = (self.c, self.source_text);
        if a.kind != AttributeKind::Attribute {
            return false;
        }
        let parts = match a.value {
            AttributeValue::True => None,
            AttributeValue::Parts(r) => Some(r.get(&c.parts)),
        };
        // `get_static_value` as a string, for a text chunk or a plain string literal.
        let text = || -> Option<&str> {
            match parts? {
                [Part::Text(span)] => Some(span.text(source_text)),
                [Part::Expression { expression, .. }] => self.plain_string(*expression),
                _ => None,
            }
        };
        match a.name.text(source_text) {
            "runes" | "immutable" | "accessors" | "preserveWhitespace" => match parts {
                None => true,
                Some([Part::Expression { expression, .. }]) => {
                    matches!(c.javascript.kind(*expression), Kind::Boolean(_))
                }
                Some(_) => false,
            },
            "namespace" => matches!(
                text(),
                Some(
                    "html"
                        | "mathml"
                        | "svg"
                        | "http://www.w3.org/2000/svg"
                        | "http://www.w3.org/1998/Math/MathML"
                )
            ),
            "css" => text() == Some("injected"),
            "customElement" => match parts {
                Some([Part::Expression { expression, .. }])
                    if !matches!(c.javascript.kind(*expression), Kind::String) =>
                {
                    matches!(c.javascript.kind(*expression), Kind::Null)
                        || self.is_valid_custom_element(*expression)
                }
                _ => text().is_some_and(is_valid_tag),
            },
            _ => false,
        }
    }

    /// A string literal's value, when it has no escape.
    fn plain_string(&self, expression: NodeIdentifier) -> Option<&str> {
        let javascript = &self.c.javascript;
        if !matches!(javascript.kind(expression), Kind::String) {
            return None;
        }
        let raw = javascript
            .source_location(expression)
            .span()?
            .text(self.source_text);
        let inner = raw.get(1..raw.len() - 1)?;
        (!inner.contains('\\')).then_some(inner)
    }

    /// `read_options`' checks of a `customElement={{ … }}` object, for plain properties only.
    fn is_valid_custom_element(&self, object: NodeIdentifier) -> bool {
        let javascript = &self.c.javascript;
        let properties = |node| match javascript.kind(node) {
            Kind::Object(properties) => Some(
                properties
                    .iter()
                    .map(|&p| match javascript.kind(p) {
                        Kind::Property {
                            key,
                            value,
                            computed: false,
                            method: false,
                            getter: false,
                            setter: false,
                            ..
                        } if matches!(javascript.kind(key), Kind::Identifier(_)) => {
                            Some((javascript.name(key), value))
                        }
                        _ => None,
                    })
                    .collect::<Option<Vec<_>>>(),
            )
            .flatten(),
            _ => None,
        };
        let Some(options) = properties(object) else {
            return false;
        };
        // Svelte reads the first property of each name.
        let first = |name: &str| options.iter().find(|(n, _)| *n == name).map(|&(_, v)| v);
        if first("tag").is_some_and(|v| !self.plain_string(v).is_some_and(is_valid_tag)) {
            return false;
        }
        if first("shadow").is_some_and(|v| {
            !matches!(self.plain_string(v), Some("open" | "none"))
                && !matches!(javascript.kind(v), Kind::Object(_))
        }) {
            return false;
        }
        let Some(props) = first("props") else {
            return true;
        };
        properties(props).is_some_and(|props| {
            props.iter().all(|&(_, prop)| {
                properties(prop).is_some_and(|fields| {
                    fields.iter().all(|&(name, v)| match name {
                        "type" => matches!(
                            self.plain_string(v),
                            Some("String" | "Number" | "Boolean" | "Array" | "Object")
                        ),
                        "reflect" => matches!(javascript.kind(v), Kind::Boolean(_)),
                        "attribute" => self.plain_string(v).is_some(),
                        _ => false,
                    })
                })
            })
        })
    }
}

/// Svelte's `validate_tag`, for a name in ASCII; its own pattern also takes many other
/// characters.
fn is_valid_tag(tag: &str) -> bool {
    let mut chars = tag.chars();
    chars.next().is_some_and(|c| c.is_ascii_lowercase())
        && tag.contains('-')
        && tag
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || matches!(c, '_' | '.' | '-'))
        && !matches!(
            tag,
            "annotation-xml"
                | "color-profile"
                | "font-face"
                | "font-face-src"
                | "font-face-uri"
                | "font-face-format"
                | "font-face-name"
                | "missing-glyph"
        )
}
