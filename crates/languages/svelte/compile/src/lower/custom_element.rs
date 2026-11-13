use oxc_ast::ast::{Expression, ObjectPropertyKind, PropertyKey};
use rsvelte_svelte_semantic::compiler_syntax_tree::AttributeValue;
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree};

use super::template::single_expression;
use super::{Attribute, CompileInput};

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

/// The custom element `customElement` asks for; `None` for `customElement={null}`.
pub(super) fn read(input: &CompileInput<'_>, attribute: &Attribute) -> Option<CustomElement> {
    let tree = input.component.javascript;
    let mut result = CustomElement {
        tag: None,
        options: None,
        shadow: Shadow::Open,
    };
    if let AttributeValue::Static(value) = &attribute.value {
        result.tag = Some(Tag::Static(value.clone()));
        return Some(result);
    }
    let expression = single_expression(&attribute.value)?;
    let Expression::ObjectExpression(object) =
        tree.get_expression(expression).get_inner_expression()
    else {
        return None;
    };
    result.options = Some(expression);
    let mut seen = 0_u8;
    for (name, value) in object.properties.iter().filter_map(option_property) {
        let bit = match name {
            "tag" => 1,
            "shadow" => 2,
            _ => continue,
        };
        if seen & bit != 0 {
            continue;
        }
        seen |= bit;
        if name == "tag" {
            result.tag = Some(Tag::Expression);
        } else {
            result.shadow = match string(value) {
                Some("none") => Shadow::None,
                Some(_) => Shadow::Open,
                None => Shadow::Expression,
            };
        }
    }
    Some(result)
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
