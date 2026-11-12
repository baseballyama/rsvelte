//! Which `<svelte:options>` attributes Svelte surely accepts.

use oxc_ast::ast::{Expression, ObjectPropertyKind, PropertyKey, PropertyKind};
use oxc_span::GetSpan;
use rsvelte_typescript_tree::ExpressionIdentifier;

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
                Some([Part::Expression { expression, .. }]) => matches!(
                    c.javascript.get_expression(*expression),
                    Expression::BooleanLiteral(_)
                ),
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
                    if !matches!(
                        c.javascript.get_expression(*expression),
                        Expression::StringLiteral(_)
                    ) =>
                {
                    let e = c.javascript.get_expression(*expression);
                    matches!(e, Expression::NullLiteral(_)) || self.is_valid_custom_element(e)
                }
                _ => text().is_some_and(is_valid_tag),
            },
            _ => false,
        }
    }

    /// A string literal's value, when it has no escape.
    fn plain_string(&self, expression: ExpressionIdentifier) -> Option<&str> {
        self.plain_string_of(self.c.javascript.get_expression(expression))
    }

    fn plain_string_of(&self, e: &Expression<'_>) -> Option<&str> {
        if !matches!(e, Expression::StringLiteral(_)) {
            return None;
        }
        let at = e.span();
        let raw = &self.source_text[at.start as usize..at.end as usize];
        let inner = raw.get(1..raw.len() - 1)?;
        (!inner.contains('\\')).then_some(inner)
    }

    /// `read_options`' checks of a `customElement={{ … }}` object, for plain properties only.
    fn is_valid_custom_element(&self, object: &Expression<'_>) -> bool {
        fn properties<'e>(node: &'e Expression<'e>) -> Option<Vec<(&'e str, &'e Expression<'e>)>> {
            let Expression::ObjectExpression(object) = node else {
                return None;
            };
            object
                .properties
                .iter()
                .map(|p| match p {
                    ObjectPropertyKind::ObjectProperty(p)
                        if !p.computed && !p.method && p.kind == PropertyKind::Init =>
                    {
                        match &p.key {
                            PropertyKey::StaticIdentifier(key) => {
                                Some((key.name.as_str(), &p.value))
                            }
                            _ => None,
                        }
                    }
                    _ => None,
                })
                .collect()
        }
        let Some(options) = properties(object) else {
            return false;
        };
        // Svelte reads the first property of each name.
        let first = |name: &str| options.iter().find(|(n, _)| *n == name).map(|&(_, v)| v);
        if first("tag").is_some_and(|v| !self.plain_string_of(v).is_some_and(is_valid_tag)) {
            return false;
        }
        if first("shadow").is_some_and(|v| {
            !matches!(self.plain_string_of(v), Some("open" | "none"))
                && !matches!(v, Expression::ObjectExpression(_))
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
                            self.plain_string_of(v),
                            Some("String" | "Number" | "Boolean" | "Array" | "Object")
                        ),
                        "reflect" => matches!(v, Expression::BooleanLiteral(_)),
                        "attribute" => self.plain_string_of(v).is_some(),
                        _ => false,
                    })
                })
            })
        })
    }
}

/// Whether Svelte's `validate_tag` accepts `tag`.
fn is_valid_tag(tag: &str) -> bool {
    rsvelte_svelte_semantic::template::custom_element_tag(tag).is_none()
}
