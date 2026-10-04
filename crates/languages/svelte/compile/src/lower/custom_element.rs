use rsvelte_svelte::compilation::compiler_syntax_tree::AttributeValue;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::template::single_expression;
use super::{Attribute, CompileInput, Diagnostic, Span};

#[derive(Debug)]
pub(super) struct CustomElement {
    pub tag: Option<Tag>,
    pub props: Option<NodeIdentifier>,
    pub shadow: Shadow,
    pub extend: Option<NodeIdentifier>,
}

#[derive(Debug)]
pub(super) enum Tag {
    Static(Box<str>),
    Expression(NodeIdentifier),
}

#[derive(Debug)]
pub(super) enum Shadow {
    Open,
    None,
    Expression(NodeIdentifier),
}

pub(super) fn parse(
    input: &CompileInput<'_>,
    attribute: &Attribute,
) -> Result<Option<CustomElement>, Diagnostic> {
    let tree = input.component.javascript;
    let source = input.component.source_text;
    let mut result = CustomElement {
        tag: None,
        props: None,
        shadow: Shadow::Open,
        extend: None,
    };
    if let AttributeValue::Static(value) = &attribute.value {
        validate_tag(value, attribute.span)?;
        result.tag = Some(Tag::Static(value.clone()));
        return Ok(Some(result));
    }
    let Some(expression) = single_expression(&attribute.value) else {
        return invalid("svelte_options_invalid_customelement", attribute.span);
    };
    if matches!(tree.kind(expression), Kind::Null) {
        return Ok(None);
    }
    let Kind::Object(properties) = tree.kind(expression) else {
        return invalid("svelte_options_invalid_customelement", attribute.span);
    };
    let mut seen = 0_u8;
    for &property in properties {
        let Some((name, value)) = option_property(tree, property) else {
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
                if !matches!(tree.kind(value), Kind::String) {
                    return invalid("svelte_options_invalid_tagname", attribute.span);
                }
                validate_tag(tree.str_value(value, source), attribute.span)?;
                result.tag = Some(Tag::Expression(value));
            }
            "props" => {
                validate_props(tree, source, value, attribute.span)?;
                result.props = Some(value);
            }
            "shadow" => {
                result.shadow = match tree.kind(value) {
                    Kind::String => match tree.str_value(value, source) {
                        "open" => Shadow::Open,
                        "none" => Shadow::None,
                        _ => {
                            return invalid(
                                "svelte_options_invalid_customelement_shadow",
                                attribute.span,
                            );
                        }
                    },
                    Kind::Object(_) => Shadow::Expression(value),
                    _ => {
                        return invalid(
                            "svelte_options_invalid_customelement_shadow",
                            attribute.span,
                        );
                    }
                };
            }
            "extend" => result.extend = Some(value),
            _ => unreachable!("a known option"),
        }
    }
    Ok(Some(result))
}

pub(super) fn option_property(
    tree: &SyntaxTree,
    property: NodeIdentifier,
) -> Option<(&str, NodeIdentifier)> {
    let Kind::Property {
        key,
        value,
        computed: false,
        ..
    } = tree.kind(property)
    else {
        return None;
    };
    tree.is_identifier(key).then(|| (tree.name(key), value))
}

fn validate_props(
    tree: &SyntaxTree,
    source: &str,
    expression: NodeIdentifier,
    span: Span,
) -> Result<(), Diagnostic> {
    let Kind::Object(properties) = tree.kind(expression) else {
        return invalid("svelte_options_invalid_customelement_props", span);
    };
    for &property in properties {
        let Some((_, value)) = option_property(tree, property) else {
            return invalid("svelte_options_invalid_customelement_props", span);
        };
        let Kind::Object(fields) = tree.kind(value) else {
            return invalid("svelte_options_invalid_customelement_props", span);
        };
        for &field in fields {
            let valid = match option_property(tree, field) {
                Some(("attribute", value)) => matches!(tree.kind(value), Kind::String),
                Some(("reflect", value)) => matches!(tree.kind(value), Kind::Boolean(_)),
                Some(("type", value)) => {
                    matches!(tree.kind(value), Kind::String)
                        && matches!(
                            tree.str_value(value, source),
                            "String" | "Number" | "Boolean" | "Array" | "Object"
                        )
                }
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
    if !tag.is_empty()
        && (!tag.contains('-')
            || !tag.starts_with(|c: char| c.is_ascii_lowercase())
            || !tag.chars().all(is_tag_character))
    {
        return invalid("svelte_options_invalid_tagname", span);
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
        return invalid("svelte_options_reserved_tagname", span);
    }
    Ok(())
}

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
