use oxc_ast::ast::{Expression, ObjectPropertyKind, PropertyKey};
use rsvelte_svelte_semantic::compiler_syntax_tree::AttributeValue;
use rsvelte_svelte_semantic::template::custom_element_tag;
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree};

use super::template::single_expression;
use super::{Attribute, CompileInput, Diagnostic, Span};

#[derive(Debug)]
pub(super) struct CustomElement {
    pub tag: Option<Tag>,
    /// The `customElement={{ … }}` object, whose `props`, `shadow` and `extend` the client reads.
    pub options: Option<ExpressionIdentifier>,
    pub shadow: Shadow,
}

#[derive(Debug)]
pub(super) enum Tag {
    Static(Box<str>),
    /// The options' `tag` string.
    Expression,
}

#[derive(Debug)]
pub(super) enum Shadow {
    Open,
    None,
    /// The options' `shadow` object.
    Expression,
}

impl CustomElement {
    /// The value of the option `name`, its first occurrence as `parse` read it.
    pub(super) fn option<'t>(&self, tree: &'t Tree, name: &str) -> Option<&'t Expression<'t>> {
        let Expression::ObjectExpression(object) =
            tree.get_expression(self.options?).get_inner_expression()
        else {
            return None;
        };
        object
            .properties
            .iter()
            .filter_map(option_property)
            .find_map(|(key, value)| (key == name).then_some(value))
    }
}

pub(super) fn parse(
    input: &CompileInput<'_>,
    attribute: &Attribute,
) -> Result<Option<CustomElement>, Diagnostic> {
    let tree = input.component.javascript;
    let mut result = CustomElement {
        tag: None,
        options: None,
        shadow: Shadow::Open,
    };
    if let AttributeValue::Static(value) = &attribute.value {
        validate_tag(value, attribute.span)?;
        result.tag = Some(Tag::Static(value.clone()));
        return Ok(Some(result));
    }
    let Some(expression) = single_expression(&attribute.value) else {
        return invalid("svelte_options_invalid_customelement", attribute.span);
    };
    let properties = match tree.get_expression(expression).get_inner_expression() {
        Expression::NullLiteral(_) => return Ok(None),
        Expression::ObjectExpression(object) => &object.properties,
        _ => return invalid("svelte_options_invalid_customelement", attribute.span),
    };
    result.options = Some(expression);
    let mut seen = 0_u8;
    for property in properties {
        let Some((name, value)) = option_property(property) else {
            return invalid("svelte_options_invalid_customelement", attribute.span);
        };
        let bit = match name {
            "tag" => 1,
            "props" => 2,
            "shadow" => 4,
            "extend" => 8,
            _ => continue,
        };
        if seen & bit != 0 {
            continue;
        }
        seen |= bit;
        match name {
            "tag" => {
                let Some(tag) = string(value) else {
                    return invalid("svelte_options_invalid_tagname", attribute.span);
                };
                validate_tag(tag, attribute.span)?;
                result.tag = Some(Tag::Expression);
            }
            "props" => validate_props(value, attribute.span)?,
            "shadow" => {
                result.shadow = match value {
                    Expression::StringLiteral(_) => match string(value) {
                        Some("open") => Shadow::Open,
                        Some("none") => Shadow::None,
                        _ => {
                            return invalid(
                                "svelte_options_invalid_customelement_shadow",
                                attribute.span,
                            );
                        }
                    },
                    Expression::ObjectExpression(_) => Shadow::Expression,
                    _ => {
                        return invalid(
                            "svelte_options_invalid_customelement_shadow",
                            attribute.span,
                        );
                    }
                };
            }
            "extend" => {}
            _ => unreachable!("a known option"),
        }
    }
    Ok(Some(result))
}

/// A string literal's value; a lone surrogate matches no option value.
fn string<'t>(e: &Expression<'t>) -> Option<&'t str> {
    match e {
        Expression::StringLiteral(literal) => literal.value.as_str(),
        _ => None,
    }
}

/// `name: value` with a plain name as its key.
pub(super) fn option_property<'t>(
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

fn validate_props(expression: &Expression<'_>, span: Span) -> Result<(), Diagnostic> {
    let Expression::ObjectExpression(object) = expression else {
        return invalid("svelte_options_invalid_customelement_props", span);
    };
    for property in &object.properties {
        let Some((_, Expression::ObjectExpression(fields))) = option_property(property) else {
            return invalid("svelte_options_invalid_customelement_props", span);
        };
        for field in &fields.properties {
            let valid = match option_property(field) {
                Some(("attribute", value)) => matches!(value, Expression::StringLiteral(_)),
                Some(("reflect", value)) => matches!(value, Expression::BooleanLiteral(_)),
                Some(("type", value)) => matches!(
                    string(value),
                    Some("String" | "Number" | "Boolean" | "Array" | "Object")
                ),
                _ => false,
            };
            if !valid {
                return invalid("svelte_options_invalid_customelement_props", span);
            }
        }
    }
    Ok(())
}

fn validate_tag(tag: &str, span: Span) -> Result<(), Diagnostic> {
    custom_element_tag(tag).map_or(Ok(()), |code| invalid(code, span))
}

fn invalid<T>(code: &'static str, span: Span) -> Result<T, Diagnostic> {
    let message = match code {
        "svelte_options_invalid_tagname" => "Tag name must be lowercase and hyphenated",
        "svelte_options_reserved_tagname" => "Tag name is reserved",
        "svelte_options_invalid_customelement_props" => "Invalid custom element property settings",
        "svelte_options_invalid_customelement_shadow" => "Invalid custom element shadow settings",
        _ => "Invalid custom element settings",
    };
    super::special::invalid(code, message, span)
}
