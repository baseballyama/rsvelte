use oxc_ast::ast::{Expression, ObjectExpression, ObjectPropertyKind, PropertyKey};
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree};

use super::{Attribute, AttributeValue, R, unsupported};

mod custom_element;

/// `<svelte:options customElement={…}>`: the tag and the shadow root as read, the rest as the
/// options object, which the translation copies.
#[derive(Clone, Debug)]
pub(crate) struct CustomElement {
    pub tag: Option<String>,
    pub shadow_root: bool,
    pub options: Option<ExpressionIdentifier>,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub(crate) enum CssMode {
    #[default]
    External,
    Injected,
}

#[derive(Debug, Default)]
pub(crate) struct Options {
    pub preserve_whitespace: bool,
    pub css_mode: CssMode,
    pub custom_element: Option<CustomElement>,
}

/// A string literal's text; `None` for a lone surrogate, which no option names.
fn string<'a>(e: &'a Expression<'a>) -> Option<&'a str> {
    match e.get_inner_expression() {
        Expression::StringLiteral(s) => s.value.as_str(),
        _ => None,
    }
}

/// A plain key's name: `a` or `"a"`.
pub(super) fn key_name<'a>(key: &'a PropertyKey<'a>) -> Option<&'a str> {
    match key {
        PropertyKey::StaticIdentifier(id) => Some(id.name.as_str()),
        PropertyKey::StringLiteral(s) => s.value.as_str(),
        _ => None,
    }
}

/// The value of the plain property `name` of `object`.
pub(super) fn option<'a>(
    object: &'a ObjectExpression<'a>,
    name: &str,
) -> Option<&'a Expression<'a>> {
    object.properties.iter().find_map(|p| match p {
        ObjectPropertyKind::ObjectProperty(p) if !p.computed && key_name(&p.key) == Some(name) => {
            Some(&p.value)
        }
        _ => None,
    })
}

pub(super) fn read(tree: &Tree, attributes: &[Attribute], source_text: &str) -> R<Options> {
    let mut options = Options::default();
    for attribute in attributes {
        let name = attribute.name.text(source_text);
        let expression = match &attribute.value {
            AttributeValue::Expression { expression, .. } => Some(tree.get_expression(*expression)),
            _ => None,
        };
        let boolean = match (
            &attribute.value,
            expression.map(Expression::get_inner_expression),
        ) {
            (AttributeValue::Boolean, _) => Some(true),
            (_, Some(Expression::BooleanLiteral(b))) => Some(b.value),
            _ => None,
        };
        let text = match &attribute.value {
            AttributeValue::Static(value) => Some(value.as_ref()),
            _ => expression.and_then(string),
        };
        if name == "customElement" {
            options.custom_element = Some(custom_element(tree, attribute)?);
            continue;
        }
        match (name, boolean) {
            ("preserveWhitespace", Some(value)) => options.preserve_whitespace = value,
            ("runes", Some(true)) | ("immutable" | "accessors", Some(_)) => {}
            ("css", _) if text == Some("injected") => options.css_mode = CssMode::Injected,
            ("namespace", _)
                if text.is_some_and(|value| {
                    matches!(
                        value,
                        "html"
                            | "svg"
                            | "mathml"
                            | "http://www.w3.org/2000/svg"
                            | "http://www.w3.org/1998/Math/MathML"
                    )
                }) => {}
            _ => {
                return Err(unsupported(
                    format_args!("this `{name}` component option"),
                    attribute.span,
                ));
            }
        }
    }
    Ok(options)
}

fn custom_element(tree: &Tree, attribute: &Attribute) -> R<CustomElement> {
    let mut options = CustomElement {
        tag: None,
        shadow_root: true,
        options: None,
    };
    let refuse = || Err(unsupported("this custom element option", attribute.span));
    match &attribute.value {
        AttributeValue::Static(tag) => options.tag = Some(tag.to_string()),
        AttributeValue::Expression { expression, .. } => {
            let Expression::ObjectExpression(object) =
                tree.get_expression(*expression).get_inner_expression()
            else {
                return Err(unsupported("these custom element options", attribute.span));
            };
            options.options = Some(*expression);
            for property in &object.properties {
                let ObjectPropertyKind::ObjectProperty(p) = property else {
                    return refuse();
                };
                if p.computed || p.method {
                    return refuse();
                }
                let Some(name) = key_name(&p.key) else {
                    return refuse();
                };
                let value = p.value.get_inner_expression();
                match (name, value) {
                    ("tag", Expression::StringLiteral(_)) => {
                        options.tag = string(value).map(str::to_owned);
                    }
                    ("shadow", Expression::StringLiteral(_)) if string(value) == Some("none") => {
                        options.shadow_root = false;
                    }
                    ("props", Expression::ObjectExpression(props)) => {
                        check_properties(props, attribute)?;
                    }
                    ("shadow", Expression::ObjectExpression(_))
                    | (
                        "extend",
                        Expression::ArrowFunctionExpression(_)
                        | Expression::FunctionExpression(_)
                        | Expression::Identifier(_),
                    ) => {}
                    ("shadow", Expression::StringLiteral(_)) if string(value) == Some("open") => {}
                    _ => return refuse(),
                }
            }
        }
        _ => return Err(unsupported("these custom element options", attribute.span)),
    }
    Ok(options)
}

fn check_properties(props: &ObjectExpression<'_>, attribute: &Attribute) -> R<()> {
    let span = attribute.span;
    for property in &props.properties {
        let ObjectPropertyKind::ObjectProperty(p) = property else {
            return Err(unsupported("this custom element prop", span));
        };
        if p.computed || p.method {
            return Err(unsupported("this custom element prop", span));
        }
        if key_name(&p.key).is_none() {
            return Err(unsupported("this custom element prop name", span));
        }
        let Expression::ObjectExpression(fields) = p.value.get_inner_expression() else {
            return Err(unsupported("these custom element prop options", span));
        };
        for field in &fields.properties {
            let ObjectPropertyKind::ObjectProperty(f) = field else {
                return Err(unsupported("this custom element prop option", span));
            };
            let (false, false, Some(name)) = (f.computed, f.method, key_name(&f.key)) else {
                return Err(unsupported("this custom element prop option", span));
            };
            let value = f.value.get_inner_expression();
            let valid = match (name, value) {
                ("attribute", Expression::StringLiteral(_))
                | ("reflect", Expression::BooleanLiteral(_)) => true,
                ("type", Expression::StringLiteral(_)) => matches!(
                    string(value),
                    Some("String" | "Boolean" | "Number" | "Array" | "Object")
                ),
                _ => false,
            };
            if !valid {
                return Err(unsupported("this custom element prop option", span));
            }
        }
    }
    Ok(())
}
